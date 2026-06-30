import { create } from 'zustand';
import type { Plant, Diagnosis, CareReminder, CareActivity, ViewType } from '@/types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedPlantId: string | null;
  selectPlant: (id: string | null) => void;

  // Auth
  user: AuthUser | null;
  token: string | null;
  isAuthLoading: boolean;
  showAuth: boolean;
  setShowAuth: (v: boolean) => void;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, name: string) => Promise<string | null>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Plants
  plants: Plant[];
  setPlants: (plants: Plant[]) => void;
  currentPlant: Plant | null;
  setCurrentPlant: (plant: Plant | null) => void;

  // Diagnosis
  isDiagnosing: boolean;
  setIsDiagnosing: (v: boolean) => void;
  currentDiagnosis: Diagnosis | null;
  setCurrentDiagnosis: (d: Diagnosis | null) => void;
  diagnosisPreview: string | null;
  setDiagnosisPreview: (url: string | null) => void;

  // Guide
  guideResult: string | null;
  setGuideResult: (r: string | null) => void;
  isSearchingGuide: boolean;
  setIsSearchingGuide: (v: boolean) => void;

  // Reminders
  reminders: CareReminder[];
  setReminders: (r: CareReminder[]) => void;

  // Activities
  activities: CareActivity[];
  setActivities: (a: CareActivity[]) => void;

  // Add Plant Dialog
  showAddPlant: boolean;
  setShowAddPlant: (v: boolean) => void;
  showLogActivity: boolean;
  setShowLogActivity: (v: boolean) => void;
  showAddReminder: boolean;
  setShowAddReminder: (v: boolean) => void;
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('pw_token');
  } catch { return null; }
}

function storeToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) localStorage.setItem('pw_token', token);
    else localStorage.removeItem('pw_token');
  } catch {}
}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('pw_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function storeUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) localStorage.setItem('pw_user', JSON.stringify(user));
    else localStorage.removeItem('pw_user');
  } catch {}
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  selectedPlantId: null,
  selectPlant: (id) => set({ selectedPlantId: id }),

  user: getStoredUser(),
  token: getStoredToken(),
  isAuthLoading: true,
  showAuth: false,
  setShowAuth: (v) => set({ showAuth: v }),

  login: async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.status !== 'ok') return data.message || 'Login failed';
      storeToken(data.token);
      storeUser(data.user);
      set({ user: data.user, token: data.token, showAuth: false });
      return null;
    } catch {
      return 'Auth service unavailable';
    }
  },

  register: async (email, password, name) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data.status !== 'ok') return data.message || 'Registration failed';
      storeToken(data.token);
      storeUser(data.user);
      set({ user: data.user, token: data.token, showAuth: false });
      return null;
    } catch {
      return 'Auth service unavailable';
    }
  },

  logout: () => {
    storeToken(null);
    storeUser(null);
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ isAuthLoading: false, showAuth: true });
      return;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'ok') {
        storeUser(data.user);
        set({ user: data.user, token, isAuthLoading: false, showAuth: false });
      } else {
        storeToken(null);
        storeUser(null);
        set({ user: null, token: null, isAuthLoading: false, showAuth: true });
      }
    } catch {
      set({ isAuthLoading: false });
    }
  },

  plants: [],
  setPlants: (plants) => set({ plants }),
  currentPlant: null,
  setCurrentPlant: (plant) => set({ currentPlant: plant }),

  isDiagnosing: false,
  setIsDiagnosing: (v) => set({ isDiagnosing: v }),
  currentDiagnosis: null,
  setCurrentDiagnosis: (d) => set({ currentDiagnosis: d }),
  diagnosisPreview: null,
  setDiagnosisPreview: (url) => set({ diagnosisPreview: url }),

  guideResult: null,
  setGuideResult: (r) => set({ guideResult: r }),
  isSearchingGuide: false,
  setIsSearchingGuide: (v) => set({ isSearchingGuide: v }),

  reminders: [],
  setReminders: (r) => set({ reminders: r }),
  activities: [],
  setActivities: (a) => set({ activities: a }),

  showAddPlant: false,
  setShowAddPlant: (v) => set({ showAddPlant: v }),
  showLogActivity: false,
  setShowLogActivity: (v) => set({ showLogActivity: v }),
  showAddReminder: false,
  setShowAddReminder: (v) => set({ showAddReminder: v }),
}));