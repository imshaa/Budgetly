const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ── Media URL ──────────────────────────────────────────────────────────────────
export const MEDIA_BASE_URL = BASE_URL.replace('/api', '');

// ── helpers ──────────────────────────────────────────────────────────────────

function getTokens() {
  return {
    access: localStorage.getItem('access_token'),
    refresh: localStorage.getItem('refresh_token'),
  };
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

async function refreshAccessToken(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;

  const res = await fetch(`${BASE_URL}/accounts/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { access } = getTokens();

  const makeRequest = (token: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await makeRequest(access);

  // If 401, try refreshing once
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await makeRequest(newAccess);
    }
  }

  return res;
}

async function authFetchMultipart(url: string, options: RequestInit = {}): Promise<Response> {
  const { access } = getTokens();

  const makeRequest = (token: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

  let res = await makeRequest(access);

  // If 401, try refreshing once
  if (res.status === 401) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await makeRequest(newAccess);
    }
  }

  return res;
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export const authAPI = {
  async signup(email: string, password: string, confirmPassword: string, username?: string) {
    const res = await fetch(`${BASE_URL}/accounts/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirm_password: confirmPassword, username }),
    });
    return res.json();
  },

  async verifyEmail(email: string, otp: string) {
    const res = await fetch(`${BASE_URL}/accounts/verify-email/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/accounts/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.access && data.refresh) {
      setTokens(data.access, data.refresh);
    }
    return data;
  },

  async forgotPassword(email: string) {
    const res = await fetch(`${BASE_URL}/accounts/forgot-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(email: string, otp: string, password: string, confirmPassword: string) {
    const res = await fetch(`${BASE_URL}/accounts/reset-password/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, password, confirm_password: confirmPassword }),
    });
    return res.json();
  },

  logout() {
    clearTokens();
  },

  isLoggedIn() {
    return !!getTokens().access;
  },
};

// ── Profile API ───────────────────────────────────────────────────────────────

export const profileAPI = {
  async getProfile() {
    const res = await authFetch(`${BASE_URL}/profiles/me/`);
    return res.json();
  },

  async createProfile(formData: FormData) {
    const res = await authFetchMultipart(`${BASE_URL}/profiles/create/`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async updateProfile(formData: FormData) {
    const res = await authFetchMultipart(`${BASE_URL}/profiles/update/`, {
      method: 'PATCH',
      body: formData,
    });
    return res.json();
  },
};