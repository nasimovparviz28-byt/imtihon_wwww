import 'dotenv/config';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import Lead from './models/Lead.js';
import Payment from './models/Payment.js';
import Student from './models/Student.js';
import { DEFAULT_COURSES } from '../src/data/mockData.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '10kb' }));

const cookieName = 'najot_session';
const sessionSecret = process.env.AUTH_SECRET;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
}

function createSession(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function readSession(req) {
  if (!sessionSecret) return null;
  const cookie = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  const token = cookie?.slice(cookieName.length + 1);
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = createHmac('sha256', sessionSecret).update(body).digest();
  let actual;
  try { actual = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const session = readSession(req);
  if (session?.role !== 'admin') return res.status(401).json({ message: 'Admin sifatida tizimga kiring.' });
  req.session = session;
  return next();
}

async function requireStudent(req, res, next) {
  const session = readSession(req);
  if (session?.role !== 'student') return res.status(401).json({ message: 'Talaba sifatida tizimga kiring.' });
  if (session.demo === true) {
    req.student = {
      fullName: session.displayName || 'Demo talaba',
      phone: session.loginName || 'Demo rejim',
      course: 'Demo kurs',
      branch: 'Demo filial',
    };
    return next();
  }
  const student = await Student.findById(session.sub).lean();
  if (!student) return res.status(401).json({ message: 'Talaba akkaunti topilmadi.' });
  req.student = student;
  return next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.get('/api/courses', (_req, res) => res.json(DEFAULT_COURSES));

app.post('/api/leads', async (req, res, next) => {
  try {
    const { fullName, phone, course, branch } = req.body ?? {};
    if (![fullName, phone, course, branch].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: 'Barcha maydonlarni toldiring.' });
    }

    const cleanPhone = phone.trim();
    const digitCount = cleanPhone.replace(/\D/g, '').length;
    if (cleanPhone.length > 20 || digitCount < 9 || digitCount > 15) {
      return res.status(400).json({ message: 'Telefon raqamini togri kiriting.' });
    }
    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      return res.status(400).json({ message: 'Ism 2-100 belgi oraligida bolishi kerak.' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'MongoDB ulanmagan. Ulanish sozlamasini tekshiring.' });
    }

    const lead = await Lead.create({
      fullName: fullName.trim(),
      phone: cleanPhone,
      course: course.trim(),
      branch: branch.trim(),
      status: 'pending',
    });
    return res.status(201).json({
      message: 'Ariza qabul qilindi.',
      lead: {
        id: lead.id,
        fullName: lead.fullName,
        phone: lead.phone,
        course: lead.course,
        branch: lead.branch,
        status: lead.status,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    if (!sessionSecret) return res.status(503).json({ message: 'AUTH_SECRET sozlanmagan. .env faylini tekshiring.' });
    const { login, password } = req.body ?? {};
    if (typeof login !== 'string' || typeof password !== 'string' || !login.trim() || !password) {
      return res.status(400).json({ message: 'Login va parolni kiriting.' });
    }

    if (adminUsername && adminPassword && safeEqual(login.trim(), adminUsername) && safeEqual(password, adminPassword)) {
      res.setHeader('Set-Cookie', `${cookieName}=${createSession({ sub: adminUsername, role: 'admin' })}; ${cookieOptions}`);
      return res.json({ role: 'admin' });
    }

    if (process.env.ALLOW_ANY_LOGIN === 'true' && process.env.NODE_ENV !== 'production') {
      res.setHeader('Set-Cookie', `${cookieName}=${createSession({
        sub: 'demo',
        role: 'student',
        demo: true,
        displayName: login.trim().slice(0, 80),
        loginName: login.trim().slice(0, 80),
      })}; ${cookieOptions}`);
      return res.json({ role: 'student', demo: true });
    }

    const phone = login.replace(/\D/g, '');
    const student = await Student.findOne({ phoneDigits: phone });
    if (!student) return res.status(401).json({ message: 'Login yoki parol notoвЂgвЂri, yoki ariza hali tasdiqlanmagan.' });
    const candidate = hashPassword(password, student.passwordSalt).hash;
    if (!safeEqual(candidate, student.passwordHash)) return res.status(401).json({ message: 'Login yoki parol notoвЂgвЂri.' });

    res.setHeader('Set-Cookie', `${cookieName}=${createSession({ sub: student.id, role: 'student' })}; ${cookieOptions}`);
    return res.json({ role: 'student' });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res.json({ message: 'Tizimdan chiqildi.' });
});

app.get('/api/auth/me', async (req, res, next) => {
  try {
    const session = readSession(req);
    if (session?.role === 'admin') return res.json({ role: 'admin', fullName: 'Administrator' });
    if (session?.role !== 'student') return res.status(401).json({ message: 'Tizimga kiring.' });
    if (session.demo === true) {
      return res.json({
        role: 'student',
        demo: true,
        fullName: session.displayName || 'Demo talaba',
        phone: session.loginName || 'Demo rejim',
        course: 'Demo kurs',
        branch: 'Demo filial',
      });
    }
    const student = await Student.findById(session.sub).select('fullName phone course branch').lean();
    if (!student) return res.status(401).json({ message: 'Akkaunt topilmadi.' });
    return res.json({ role: 'student', ...student });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/leads', requireAdmin, async (_req, res, next) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();
    return res.json(leads.map(({ _id, fullName, phone, course, branch, status, createdAt, approvedAt }) => ({
      id: _id, fullName, phone, course, branch, status: status || 'pending', createdAt, approvedAt,
    })));
  } catch (error) {
    return next(error);
  }
});

app.get('/api/admin/payments', requireAdmin, async (_req, res, next) => {
  try {
    const payments = await Payment.find().populate('studentId', 'fullName phone course').sort({ createdAt: -1 }).lean();
    return res.json(payments.map(({ _id, studentId, amount, method, reference, status, createdAt }) => ({
      id: _id,
      student: studentId ? { fullName: studentId.fullName, phone: studentId.phone, course: studentId.course } : null,
      amount,
      method,
      reference,
      status,
      createdAt,
    })));
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/admin/payments/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'ToвЂlov holati notoвЂgвЂri.' });
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status, reviewedAt: new Date() },
      { new: true, runValidators: true },
    );
    if (!payment) return res.status(404).json({ message: 'ToвЂlov yozuvi topilmadi.' });
    return res.json({ id: payment.id, status: payment.status });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/leads/:id/approve', requireAdmin, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Ariza topilmadi.' });
    if (await Student.exists({ leadId: lead.id })) return res.status(409).json({ message: 'Bu ariza uchun akkaunt avval yaratilgan.' });
    const password = randomBytes(12).toString('base64url');
    const { salt, hash } = hashPassword(password);
    const student = await Student.create({
      leadId: lead.id,
      fullName: lead.fullName,
      phone: lead.phone,
      phoneDigits: lead.phone.replace(/\D/g, ''),
      course: lead.course,
      branch: lead.branch,
      passwordHash: hash,
      passwordSalt: salt,
    });
    lead.status = 'approved';
    lead.approvedAt = new Date();
    await lead.save();
    return res.status(201).json({ student: { id: student.id, fullName: student.fullName, phone: student.phone }, temporaryPassword: password });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/admin/leads/:id/reset-password', requireAdmin, async (req, res, next) => {
  try {
    const student = await Student.findOne({ leadId: req.params.id });
    if (!student) return res.status(404).json({ message: 'Tasdiqlangan talaba topilmadi.' });
    const temporaryPassword = randomBytes(12).toString('base64url');
    const { salt, hash } = hashPassword(temporaryPassword);
    student.passwordSalt = salt;
    student.passwordHash = hash;
    await student.save();
    return res.json({ phone: student.phone, temporaryPassword });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/student/dashboard', requireStudent, async (req, res, next) => {
  try {
    const payments = req.student._id
      ? await Payment.find({ studentId: req.student._id }).sort({ createdAt: -1 }).lean()
      : [];
    return res.json({
      fullName: req.student.fullName,
      phone: req.student.phone,
      course: req.student.course,
      branch: req.student.branch,
      demo: !req.student._id,
      payments: payments.map(({ _id, amount, method, reference, status, createdAt }) => ({ id: _id, amount, method, reference, status, createdAt })),
    });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/student/payments', requireStudent, async (req, res, next) => {
  try {
    if (!req.student._id) return res.status(409).json({ message: 'Demo toвЂlovlar faqat shu qurilmada saqlanadi.' });
    const { amount, method, reference = '' } = req.body ?? {};
    const parsedAmount = Number(amount);
    if (!Number.isInteger(parsedAmount) || parsedAmount < 1 || parsedAmount > 100_000_000) {
      return res.status(400).json({ message: 'Summani 1 dan 100 000 000 soвЂmgacha kiriting.' });
    }
    if (!['card', 'bank-transfer', 'cash'].includes(method)) return res.status(400).json({ message: 'ToвЂlov turini tanlang.' });
    if (typeof reference !== 'string' || reference.trim().length > 100) return res.status(400).json({ message: 'Izoh yoki chek raqami 100 belgidan oshmasin.' });
    const payment = await Payment.create({
      studentId: req.student._id,
      amount: parsedAmount,
      method,
      reference: reference.trim(),
    });
    return res.status(201).json({
      id: payment.id,
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference,
      status: payment.status,
      createdAt: payment.createdAt,
    });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'Sorov JSON formatida bolishi kerak.' });
  }
  return res.status(500).json({ message: 'Serverda xatolik yuz berdi.' });
});

export default app;
