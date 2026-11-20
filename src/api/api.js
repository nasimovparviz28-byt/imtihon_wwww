const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function readResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

export async function fetchCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`);
  return readResponse(response, 'Kurslarni yuklashda xatolik yuz berdi.');
}

export async function createLead(leadData) {
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });
  return readResponse(response, 'Arizani yuborishda xatolik yuz berdi.');
}

export async function login(loginName, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ login: loginName, password }),
  });
  return readResponse(response, 'Tizimga kirishda xatolik yuz berdi.');
}

export async function logout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
  return readResponse(response, 'Tizimdan chiqishda xatolik yuz berdi.');
}

export async function fetchSession() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
  return readResponse(response, 'Tizimga kiring.');
}

export async function fetchAdminLeads() {
  const response = await fetch(`${API_BASE_URL}/admin/leads`, { credentials: 'include' });
  return readResponse(response, 'Arizalarni yuklab bo‘lmadi.');
}

export async function fetchAdminPayments() {
  const response = await fetch(`${API_BASE_URL}/admin/payments`, { credentials: 'include' });
  return readResponse(response, 'To‘lovlarni yuklab bo‘lmadi.');
}

export async function reviewPayment(id, status) {
  const response = await fetch(`${API_BASE_URL}/admin/payments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return readResponse(response, 'To‘lov holatini o‘zgartirib bo‘lmadi.');
}

export async function approveLead(id) {
  const response = await fetch(`${API_BASE_URL}/admin/leads/${id}/approve`, {
    method: 'POST',
    credentials: 'include',
  });
  return readResponse(response, 'Arizani tasdiqlab bo‘lmadi.');
}

export async function resetStudentPassword(id) {
  const response = await fetch(`${API_BASE_URL}/admin/leads/${id}/reset-password`, {
    method: 'POST',
    credentials: 'include',
  });
  return readResponse(response, 'Vaqtinchalik parol yaratilmadi.');
}

export async function fetchStudentDashboard() {
  const response = await fetch(`${API_BASE_URL}/student/dashboard`, { credentials: 'include' });
  return readResponse(response, 'Kabinetni yuklab bo‘lmadi.');
}

export async function addStudentPayment(payment) {
  const response = await fetch(`${API_BASE_URL}/student/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payment),
  });
  return readResponse(response, 'To‘lov ma’lumotini yuborib bo‘lmadi.');
}
