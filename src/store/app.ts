import { create } from 'zustand';
import type { Plant, Diagnosis, CareReminder, CareActivity, ViewType } from '@/types';

interface AppState {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedPlantId: string | null;
  selectPlant: (id: string | null) => void;

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

export const useAppStore = create<AppState>((set) => ({
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
  selectedPlantId: null,
  selectPlant: (id) => set({ selectedPlantId: id }),

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