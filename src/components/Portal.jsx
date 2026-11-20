import { useEffect, useState } from 'react';
import {
  approveLead,
  fetchAdminLeads,
  fetchAdminPayments,
  fetchSession,
  fetchStudentDashboard,
  login,
  logout,
  resetStudentPassword,
  reviewPayment,
  addStudentPayment,
} from '../api/api';

function LoginForm({ mode, onLoggedIn }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(identifier.trim(), password);
      onLoggedIn(result.role);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="portal-page">
      <div className="portal-login card">
        <a href="/" className="logo portal-logo"><span>NT</span> Najot Ta’lim</a>
        <p className="course-tag">{mode === 'admin' ? 'Administrator' : 'Talaba kabineti'}</p>
        <h1>{mode === 'admin' ? 'Admin panelga kirish' : 'Kabinetga kirish'}</h1>
        <p className="portal-muted">
          {mode === 'admin'
            ? 'Admin login va parolini loyiha .env faylidan oling.'
            : 'Tasdiqlangan arizangizdagi telefon raqami va admin bergan vaqtinchalik parolni kiriting.'}
        </p>
        {mode !== 'admin' && <p className="portal-demo-hint">Demo rejimda istalgan login va parol bilan kabinetni ochishingiz mumkin.</p>}
        <form onSubmit={handleSubmit}>
          <label className="portal-field">
            {mode === 'admin' ? 'Admin login' : 'Telefon raqam yoki admin login'}
            <input
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={mode === 'admin' ? 'admin' : '+998 90 123 45 67'}
              required
            />
          </label>
          <label className="portal-field">
            Parol
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="portal-error">{error}</p>}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Tekshirilmoqda…' : 'Kirish'}
          </button>
        </form>
        {mode !== 'admin' && <a className="portal-back" href="/">Bosh sahifaga qaytish</a>}
        {mode === 'login' && <a className="portal-back" href="/admin">Administrator kirishi</a>}
      </div>
    </main>
  );
}

function CredentialNotice({ credentials, onDismiss }) {
  if (!credentials) return null;
  return (
    <div className="credential-notice" role="status">
      <button type="button" className="credential-close" onClick={onDismiss} aria-label="Yopish">×</button>
      <h2>Talaba akkaunti yaratildi</h2>
      <p>Ushbu vaqtinchalik parol faqat hozir ko‘rsatiladi. Talabaga xavfsiz yo‘l bilan yetkazing.</p>
      <div><strong>Login:</strong> {credentials.login}</div>
      <div><strong>Vaqtinchalik parol:</strong> <code>{credentials.password}</code></div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [leads, setLeads] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('leads');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [credentials, setCredentials] = useState(null);

  async function refresh() {
    try {
      const [newLeads, newPayments] = await Promise.all([fetchAdminLeads(), fetchAdminPayments()]);
      setLeads(newLeads);
      setPayments(newPayments);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([fetchAdminLeads(), fetchAdminPayments()])
      .then(([items, records]) => { if (active) { setLeads(items); setPayments(records); } })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, []);

  async function handleApprove(lead) {
    setBusyId(lead.id);
    setError('');
    try {
      const result = await approveLead(lead.id);
      setCredentials({ login: result.student.phone, password: result.temporaryPassword });
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  async function handleReset(lead) {
    setBusyId(lead.id);
    setError('');
    try {
      const result = await resetStudentPassword(lead.id);
      setCredentials({ login: result.phone, password: result.temporaryPassword });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  async function handlePaymentReview(payment, status) {
    setBusyId(payment.id);
    setError('');
    try {
      await reviewPayment(payment.id, status);
      await refresh();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId('');
    }
  }

  const pendingPayments = payments.filter((payment) => payment.status === 'pending').length;

  return (
    <main className="portal-page portal-wide">
      <header className="portal-topbar">
        <a href="/" className="logo"><span>NT</span> Najot Ta’lim <small>Admin panel</small></a>
        <button className="btn btn-outline" onClick={onLogout}>Chiqish</button>
      </header>
      <section className="portal-content">
        <div className="portal-heading">
          <div><p className="course-tag">Boshqaruv paneli</p><h1>{activeTab === 'leads' ? 'Arizalar va talabalar' : 'To‘lovlar'}</h1></div>
          <button className="btn btn-outline" onClick={refresh}>Yangilash</button>
        </div>
        <div className="portal-admin-tabs">
          <button className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`} onClick={() => setActiveTab('leads')}>Arizalar <span>{leads.filter((lead) => lead.status !== 'approved').length}</span></button>
          <button className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>To‘lovlar <span>{pendingPayments}</span></button>
        </div>
        {activeTab === 'leads' && <p className="portal-muted">Arizani tasdiqlasangiz, telefon raqam login bo‘ladi va bir martalik vaqtinchalik parol yaratiladi.</p>}
        {activeTab === 'payments' && <p className="portal-muted">Talabalar yuborgan to‘lov yozuvlarini tekshiring. Tasdiqlash pulni yechmaydi yoki o‘tkazmaydi.</p>}
        {error && <p className="portal-error">{error}</p>}
        <CredentialNotice credentials={credentials} onDismiss={() => setCredentials(null)} />
        {activeTab === 'leads' && <div className="portal-list">
          {leads.map((lead) => (
            <article className="portal-lead card" key={lead.id}>
              <div>
                <span className={`portal-status ${lead.status}`}>{lead.status === 'approved' ? 'Tasdiqlangan' : 'Kutilmoqda'}</span>
                <h2>{lead.fullName}</h2>
                <p>{lead.phone} · {lead.course}</p>
                <p className="portal-muted">Filial: {lead.branch} · {new Date(lead.createdAt).toLocaleDateString('uz-UZ')}</p>
              </div>
              {lead.status === 'approved' ? (
                <button className="btn btn-outline" disabled={busyId === lead.id} onClick={() => handleReset(lead)}>
                  {busyId === lead.id ? 'Tayyorlanmoqda…' : 'Yangi parol berish'}
                </button>
              ) : (
                <button className="btn btn-primary" disabled={busyId === lead.id} onClick={() => handleApprove(lead)}>
                  {busyId === lead.id ? 'Tasdiqlanmoqda…' : 'Tasdiqlash va akkaunt ochish'}
                </button>
              )}
            </article>
          ))}
          {leads.length === 0 && !error && <div className="card portal-empty">Hozircha arizalar yo‘q.</div>}
        </div>}
        {activeTab === 'payments' && <div className="portal-list">
          {payments.map((payment) => <article className="portal-lead card" key={payment.id}>
            <div>
              <span className={`portal-status ${payment.status === 'approved' ? 'approved' : ''}`}>{payment.status === 'approved' ? 'Tasdiqlangan' : payment.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}</span>
              <h2>{payment.student?.fullName || 'Talaba'} · {Number(payment.amount).toLocaleString('uz-UZ')} so‘m</h2>
              <p>{payment.student?.phone} · {payment.student?.course}</p>
              <p className="portal-muted">{payment.method === 'bank-transfer' ? 'Bank o‘tkazmasi' : payment.method === 'card' ? 'Karta orqali' : 'Naqd'} · {payment.reference || 'Chek/izoh kiritilmagan'} · {new Date(payment.createdAt).toLocaleDateString('uz-UZ')}</p>
            </div>
            {payment.status === 'pending' && <div className="portal-review-actions"><button className="btn btn-primary" disabled={busyId === payment.id} onClick={() => handlePaymentReview(payment, 'approved')}>Tasdiqlash</button><button className="btn btn-outline" disabled={busyId === payment.id} onClick={() => handlePaymentReview(payment, 'rejected')}>Rad etish</button></div>}
          </article>)}
          {payments.length === 0 && !error && <div className="card portal-empty">Hozircha to‘lov yozuvlari yo‘q.</div>}
        </div>}
      </section>
    </main>
  );
}

function EmptyRealContent({ title }) {
  return <article className="card portal-empty-state"><div className="portal-empty-icon">▤</div><h2>{title} hali joylanmagan</h2><p>Guruhingiz uchun ma’lumot administrator tomonidan kiritilgach, shu bo‘limda ko‘rinadi.</p></article>;
}

function StudentDashboard({ student, onLogout }) {
  const [section, setSection] = useState('overview');
  const storageKey = `najot-demo-tasks-${student.phone || 'demo'}`;
  const paymentStorageKey = `najot-demo-payments-${student.phone || 'demo'}`;
  const [payments, setPayments] = useState(() => {
    if (!student.demo) return student.payments || [];
    const sample = [{ id: 'sample-payment', amount: 1_800_000, method: 'card', reference: 'Demo to‘lov', status: 'approved', createdAt: new Date().toISOString() }];
    try { return [...sample, ...JSON.parse(localStorage.getItem(paymentStorageKey) || '[]')]; } catch { return sample; }
  });
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('1800000');
  const [paymentMethod, setPaymentMethod] = useState('bank-transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });
  const [activeLesson, setActiveLesson] = useState(0);
  const isDemo = student.demo === true;
  const sections = [
    { id: 'overview', label: 'Bosh sahifa', icon: '⌂' },
    { id: 'course', label: 'Kurs dasturi', icon: '▤' },
    { id: 'tasks', label: 'Uy vazifalari', icon: '✓' },
    { id: 'exams', label: 'Imtihonlar va natijalar', icon: '◉' },
    { id: 'schedule', label: 'Dars jadvali', icon: '▦' },
    { id: 'attendance', label: 'Davomat', icon: '◷' },
    { id: 'payments', label: 'To‘lovlar', icon: '＄' },
    { id: 'news', label: 'Yangiliklar', icon: '◈' },
    { id: 'rewards', label: 'Yutuqlar va XP', icon: '☆' },
    { id: 'profile', label: 'Profil', icon: '◎' },
  ];
  const lessons = [
    { title: 'Kursga kirish va ish muhiti', duration: '1 soat 40 daqiqa', status: 'Bajarildi', description: 'Kurs tuzilishi, o‘quv muhiti va kerakli dasturlar bilan tanishuv.' },
    { title: 'HTML hujjatining tuzilishi', duration: '2 soat', status: 'Davom etmoqda', description: 'HTML elementlari, teglar va semantik sahifa tuzilishini o‘rganish.' },
    { title: 'Matn va havolalar bilan ishlash', duration: '2 soat', status: 'Qulflangan', description: 'Matn elementlari, havolalar va ro‘yxatlar.' },
    { title: 'Rasmlar va jadvallar', duration: '2 soat', status: 'Qulflangan', description: 'Rasm, jadval va ularning sahifadagi joylashuvi.' },
  ];
  const tasks = [
    { id: 'task-1', title: 'Shaxsiy sahifa maketi', due: 'Juma, 18:00', points: 100 },
    { id: 'task-2', title: 'Semantik HTML sahifasi', due: 'Keyingi hafta', points: 120 },
    { id: 'task-3', title: 'Havola va ro‘yxatlar', due: 'Keyingi hafta', points: 100 },
  ];
  const schedule = [
    { day: 'Dushanba', date: '18:30 – 20:30', title: 'HTML va web asoslari', room: '3-xona · Chilonzor' },
    { day: 'Chorshanba', date: '18:30 – 20:30', title: 'Amaliy mashg‘ulot', room: '3-xona · Chilonzor' },
    { day: 'Shanba', date: '10:00 – 12:00', title: 'Mustaqil loyiha', room: 'Coworking' },
  ];
  const announcements = [
    { date: 'Bugun', title: 'Yangi hafta rejasi', text: 'Darsga noutbuk va oldingi vazifa natijasini olib keling.' },
    { date: 'Kecha', title: 'Coworking vaqti', text: 'Mustaqil ishlash uchun filial coworkingidan foydalanishingiz mumkin.' },
  ];
  const doneCount = completedTasks.length;
  const xp = 240 + doneCount * 100;

  function completeTask(id) {
    const updated = completedTasks.includes(id) ? completedTasks : [...completedTasks, id];
    setCompletedTasks(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  async function submitPayment(event) {
    event.preventDefault();
    setPaymentMessage('');
    setPaymentSubmitting(true);
    try {
      const payload = { amount: Number(paymentAmount), method: paymentMethod, reference: paymentReference.trim() };
      let record;
      if (isDemo) {
        record = { ...payload, id: `demo-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), demo: true };
        const next = [record, ...payments.filter((item) => item.id !== 'sample-payment')];
        setPayments(next);
        localStorage.setItem(paymentStorageKey, JSON.stringify(next.filter((item) => item.demo)));
      } else {
        record = await addStudentPayment(payload);
        setPayments((current) => [record, ...current]);
      }
      setPaymentMessage('To‘lov ma’lumoti yuborildi. Administrator tekshirgach holati yangilanadi.');
      setPaymentFormOpen(false);
      setPaymentReference('');
    } catch (error) {
      setPaymentMessage(error.message || 'To‘lov ma’lumotini yuborib bo‘lmadi.');
    } finally {
      setPaymentSubmitting(false);
    }
  }

  return (
    <main className="portal-shell">
      <aside className="portal-sidebar">
        <a href="/" className="logo portal-logo"><span>NT</span><b>Najot Ta’lim</b></a>
        <div className="portal-side-label">O‘QUV PORTALI</div>
        <nav aria-label="Kabinet bo‘limlari">
          {sections.map((item) => <button key={item.id} className={`portal-nav-item ${section === item.id ? 'active' : ''}`} onClick={() => setSection(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
        <div className="portal-side-user"><div className="portal-avatar">{student.fullName?.charAt(0)?.toUpperCase() || 'T'}</div><div><strong>{student.fullName}</strong><small>{isDemo ? 'Demo talaba' : 'Talaba'}</small></div></div>
      </aside>
      <div className="portal-workspace">
        <header className="portal-topbar">
          <div><span className="portal-muted">{student.course}</span><strong className="portal-group">{student.branch}</strong></div>
          <div className="portal-top-actions"><a href="/" className="portal-home-link">Saytga qaytish</a><button className="btn btn-outline" onClick={onLogout}>Chiqish</button></div>
        </header>
        <section className="portal-content">
          {isDemo && <p className="portal-demo-hint">Demo kabinet: bu kirish arizani tasdiqlamaydi. Ko‘rsatilgan dars va jadval ma’lumotlari namuna sifatida berilgan.</p>}
          <div className="portal-page-title"><div><span className="course-tag">Shaxsiy kabinet</span><h1>{section === 'overview' ? `Xush kelibsiz, ${student.fullName}` : sections.find((item) => item.id === section)?.label}</h1></div><div className="portal-xp"><span>☆</span><strong>{isDemo ? xp : 0} XP</strong><small>O‘quv ballari</small></div></div>

          {section === 'overview' && <>
            <div className="portal-metrics">
              <article className="portal-metric"><span>📚</span><small>Faol kurs</small><strong>{student.course}</strong><em>{isDemo ? '1 ta kurs' : 'Tasdiqlangan'}</em></article>
              <article className="portal-metric"><span>✓</span><small>Vazifalar</small><strong>{isDemo ? `${doneCount}/${tasks.length}` : '—'}</strong><em>Bajarilgan</em></article>
              <article className="portal-metric"><span>◷</span><small>Davomat</small><strong>{isDemo ? '92%' : '—'}</strong><em>{isDemo ? '12 darsdan 11 ta' : 'Guruh ma’lumoti kutilmoqda'}</em></article>
              <article className="portal-metric"><span>☆</span><small>Natija</small><strong>{isDemo ? `${xp} XP` : '—'}</strong><em>Umumiy ball</em></article>
            </div>
            <div className="portal-dashboard-grid">
              <article className="portal-panel"><div className="portal-panel-head"><div><h2>Keyingi dars</h2><p>Guruhingizdagi yaqin mashg‘ulot</p></div><button className="portal-text-button" onClick={() => setSection('schedule')}>Jadvalni ko‘rish</button></div>
                {isDemo ? <div className="portal-next-class"><span className="portal-date-chip">DU<br /><b>18</b></span><div><strong>{schedule[0].title}</strong><p>{schedule[0].date} · {schedule[0].room}</p></div></div> : <p className="portal-empty-note">Dars jadvali administrator tomonidan kiritiladi.</p>}
              </article>
              <article className="portal-panel"><div className="portal-panel-head"><div><h2>Uy vazifasi</h2><p>Bajarish navbatidagi vazifa</p></div><button className="portal-text-button" onClick={() => setSection('tasks')}>Barchasi</button></div>
                {isDemo ? <div className="portal-task-preview"><strong>{tasks.find((task) => !completedTasks.includes(task.id))?.title || 'Barcha vazifalar bajarildi'}</strong><p>{tasks.find((task) => !completedTasks.includes(task.id))?.due || 'Ajoyib natija!'}</p></div> : <p className="portal-empty-note">Hozircha vazifa biriktirilmagan.</p>}
              </article>
              <article className="portal-panel"><div className="portal-panel-head"><div><h2>Kurs davomiyligi</h2><p>{isDemo ? 'Foundation · 4 oy' : student.course}</p></div><button className="portal-text-button" onClick={() => setSection('course')}>Dastur</button></div>
                {isDemo ? <><div className="portal-progress-track"><i style={{ width: `${Math.min(100, 25 + doneCount * 8)}%` }} /></div><p className="portal-muted">1-modul · Web asoslari</p></> : <p className="portal-empty-note">Kurs rejasi administrator tomonidan biriktiriladi.</p>}
              </article>
              <article className="portal-panel"><div className="portal-panel-head"><div><h2>Yangiliklar</h2><p>O‘quv markazidan xabarlar</p></div><button className="portal-text-button" onClick={() => setSection('news')}>Barchasi</button></div>
                {isDemo ? <div className="portal-news-mini"><b>{announcements[0].title}</b><p>{announcements[0].text}</p></div> : <p className="portal-empty-note">Yangiliklar hozircha yo‘q.</p>}
              </article>
            </div>
          </>}

          {section === 'course' && (isDemo ? <div className="portal-course-layout"><article className="portal-panel portal-course-summary"><span className="course-tag">1-modul · 4 ta dars</span><h2>Web dasturlash asoslari</h2><p>HTML yordamida sahifa tuzilishi, matn, havola va media elementlar bilan ishlash.</p><div className="portal-progress-track"><i style={{ width: `${25 + doneCount * 8}%` }} /></div><small>{25 + doneCount * 8}% yakunlandi</small></article><div className="portal-lesson-list">{lessons.map((lesson, index) => { const unlocked = index === 0 || (index === 1 ? completedTasks.length > 0 : completedTasks.length >= index); return <article className={`portal-lesson ${activeLesson === index ? 'selected' : ''}`} key={lesson.title}><button className="portal-lesson-button" onClick={() => unlocked && setActiveLesson(index)} disabled={!unlocked}><span className={`portal-lesson-number ${lesson.status === 'Bajarildi' ? 'done' : ''}`}>{lesson.status === 'Bajarildi' ? '✓' : String(index + 1).padStart(2, '0')}</span><span><strong>{lesson.title}</strong><small>{lesson.duration} · {unlocked ? lesson.status : 'Oldingi vazifani bajaring'}</small></span><b>{unlocked ? '›' : '🔒'}</b></button>{activeLesson === index && unlocked && <div className="portal-lesson-detail"><p>{lesson.description}</p><button className="btn btn-primary btn-sm" onClick={() => setSection('tasks')}>Mavzuga vazifa</button></div>}</article>; })}</div></div> : <EmptyRealContent title="Kurs dasturi" />)}

          {section === 'tasks' && (isDemo ? <div className="portal-task-list">{tasks.map((task, index) => { const locked = index > 0 && !completedTasks.includes(tasks[index - 1].id); const done = completedTasks.includes(task.id); return <article className="portal-panel portal-task-row" key={task.id}><div className="portal-task-status">{done ? '✓' : locked ? '🔒' : '!'}</div><div className="portal-task-copy"><span className="portal-muted">{locked ? 'Oldingi vazifadan keyin ochiladi' : `Topshirish: ${task.due}`}</span><h2>{task.title}</h2><p>{task.points} XP · Amaliy topshiriq</p></div><button className={`btn ${done ? 'btn-outline' : 'btn-primary'}`} disabled={locked || done} onClick={() => completeTask(task.id)}>{done ? 'Bajarildi' : locked ? 'Qulflangan' : 'Bajardim'}</button></article>; })}<p className="portal-muted">Demo vazifalar holati shu qurilmada saqlanadi. Haqiqiy vazifalarni admin/guruh ma’lumotlari kiritilgandan keyin bog‘lash mumkin.</p></div> : <EmptyRealContent title="Uy vazifalari" />)}

          {section === 'exams' && (isDemo ? <div className="portal-panel"><h2>Imtihonlar va natijalar</h2><div className="portal-table-wrap"><table className="portal-table"><thead><tr><th>Imtihon</th><th>Sana</th><th>Natija</th><th>Holat</th></tr></thead><tbody><tr><td>HTML asoslari</td><td>12-noyabr</td><td>86 / 100</td><td><span className="portal-status approved">O‘tdi</span></td></tr><tr><td>Web yakuniy loyiha</td><td>Rejada</td><td>—</td><td><span className="portal-status">Kutilmoqda</span></td></tr></tbody></table></div></div> : <EmptyRealContent title="Imtihonlar va natijalar" />)}

          {section === 'schedule' && (isDemo ? <div className="portal-schedule-list">{schedule.map((item, index) => <article className="portal-panel portal-schedule-row" key={item.day}><div className="portal-date-chip">{item.day.slice(0, 2).toUpperCase()}<br /><b>{18 + index * 2}</b></div><div><small>{item.day} · {item.date}</small><h2>{item.title}</h2><p>{item.room}</p></div><span className="portal-status approved">Rejada</span></article>)}</div> : <EmptyRealContent title="Dars jadvali" />)}

          {section === 'attendance' && (isDemo ? <div className="portal-panel portal-attendance"><div><span className="portal-muted">Umumiy davomat</span><strong>92%</strong><p>12 ta darsdan 11 tasida qatnashgansiz.</p></div><div className="portal-progress-track"><i style={{ width: '92%' }} /></div><h2>Oxirgi darslar</h2><p>18-noyabr · HTML asoslari <span className="portal-status approved">Qatnashdi</span></p><p>16-noyabr · Web amaliyoti <span className="portal-status approved">Qatnashdi</span></p><p>14-noyabr · HTML hujjat tuzilishi <span className="portal-status">Sababli</span></p></div> : <EmptyRealContent title="Davomat" />)}

          {section === 'payments' && <div className="portal-panel">
            <div className="portal-panel-head"><div><span className="portal-muted">To‘lovlar tarixi</span><h2>{student.course}</h2></div><button className="btn btn-primary" onClick={() => setPaymentFormOpen((open) => !open)}>{paymentFormOpen ? 'Yopish' : 'To‘lov qo‘shish'}</button></div>
            <div className="portal-payment-summary"><div><small>Jami tasdiqlangan</small><strong>{payments.filter((item) => item.status === 'approved').reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString('uz-UZ')} so‘m</strong></div><div><small>Kutilayotgan</small><strong>{payments.filter((item) => item.status === 'pending').length} ta yozuv</strong></div></div>
            {paymentFormOpen && <form className="portal-payment-form" onSubmit={submitPayment}>
              <label>Summa (so‘m)<input type="number" min="1" max="100000000" step="1" required value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label>
              <label>To‘lov turi<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option value="bank-transfer">Bank o‘tkazmasi</option><option value="card">Karta orqali</option><option value="cash">Naqd</option></select></label>
              <label>Chek raqami yoki izoh (ixtiyoriy)<input maxLength="100" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="Masalan: chek raqami" /></label>
              <p className="portal-muted">Bu forma to‘lov yozuvini tekshiruvga yuboradi; karta ma’lumotlari olinmaydi va pul yechilmaydi.</p>
              <button className="btn btn-primary" type="submit" disabled={paymentSubmitting}>{paymentSubmitting ? 'Yuborilmoqda…' : 'Tekshiruvga yuborish'}</button>
            </form>}
            {paymentMessage && <p className="portal-payment-message">{paymentMessage}</p>}
            <div className="portal-payment-records">
              <h3>Amaliyotlar</h3>
              {payments.map((payment) => <div className="portal-payment-record" key={payment.id}><div><strong>{Number(payment.amount).toLocaleString('uz-UZ')} so‘m</strong><small>{payment.method === 'bank-transfer' ? 'Bank o‘tkazmasi' : payment.method === 'card' ? 'Karta orqali' : 'Naqd'} · {payment.reference || 'Izoh yo‘q'} · {new Date(payment.createdAt).toLocaleDateString('uz-UZ')}</small></div><span className={`portal-status ${payment.status === 'approved' ? 'approved' : ''}`}>{payment.status === 'approved' ? 'Tasdiqlangan' : payment.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}</span></div>)}
              {payments.length === 0 && <p className="portal-empty-note">Hozircha to‘lov yozuvi yo‘q.</p>}
            </div>
          </div>}

          {section === 'news' && (isDemo ? <div className="portal-news-list">{announcements.map((item) => <article className="portal-panel" key={item.title}><span className="portal-muted">{item.date} · Markaz yangiliklari</span><h2>{item.title}</h2><p>{item.text}</p></article>)}</div> : <EmptyRealContent title="Yangiliklar" />)}

          {section === 'rewards' && (isDemo ? <div className="portal-reward-grid"><article className="portal-panel portal-xp-card"><span>☆</span><strong>{xp} XP</strong><p>Topshiriqlarni bajaring va yangi bosqichlarni oching.</p></article><article className="portal-panel"><h2>Yutuqlar</h2><div className="portal-badges"><span>🌱<small>Birinchi qadam</small></span><span>📚<small>Faol o‘quvchi</small></span><span>⚡<small>Topshiriq ustasi</small></span></div></article><article className="portal-panel"><h2>Haftalik faollik</h2><p>Bu hafta 3 kun o‘qish faoliyati qayd etildi.</p><div className="portal-week-bars">{[40, 70, 48, 90, 55, 30, 15].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div></article></div> : <EmptyRealContent title="Yutuqlar va XP" />)}

          {section === 'profile' && <article className="portal-panel portal-profile"><div className="portal-avatar portal-avatar-large">{student.fullName?.charAt(0)?.toUpperCase() || 'T'}</div><div><span className="portal-muted">Talaba profili</span><h2>{student.fullName}</h2><p><strong>Telefon:</strong> {student.phone}</p><p><strong>Kurs:</strong> {student.course}</p><p><strong>Filial:</strong> {student.branch}</p><p><strong>Holat:</strong> {isDemo ? 'Demo rejim' : 'Tasdiqlangan talaba'}</p></div></article>}
        </section>
      </div>
    </main>
  );
}

export default function Portal({ mode }) {
  const [session, setSession] = useState(null);
  const [student, setStudent] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchSession()
      .then(async (current) => {
        setSession(current);
        if (current.role === 'student') setStudent(await fetchStudentDashboard());
      })
      .catch(() => setSession(null))
      .finally(() => setChecking(false));
  }, []);

  function moveForRole(role) {
    window.location.assign(role === 'admin' ? '/admin' : '/cabinet');
  }

  async function handleLogout() {
    await logout().catch(() => {});
    setSession(null);
    setStudent(null);
  }

  if (checking) return <main className="portal-page"><p className="portal-muted">Tekshirilmoqda…</p></main>;
  if (session?.role === 'admin' && mode !== 'student') return <AdminDashboard onLogout={handleLogout} />;
  if (session?.role === 'student' && mode !== 'admin' && student) return <StudentDashboard student={student} onLogout={handleLogout} />;
  return <LoginForm mode={mode} onLoggedIn={moveForRole} />;
}
