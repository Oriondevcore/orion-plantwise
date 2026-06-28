export interface Plant {
  id: string;
  name: string;
  species: string | null;
  nickname: string | null;
  imageUrl: string | null;
  location: string | null;
  healthStatus: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  diagnoses: Diagnosis[];
  careReminders: CareReminder[];
  _count: { diagnoses: number; careActivities: number };
}

export interface Diagnosis {
  id: string;
  plantId: string;
  imageUrl: string;
  species: string | null;
  issues: string;
  confidence: number;
  description: string;
  fixes: string;
  speciesInfo: string;
  ragContext: string | null;
  createdAt: string;
  // Enriched fields from API
  vlmRaw?: {
    species: string;
    speciesConfidence: number;
    issues: Array<{
      name: string;
      severity: string;
      description: string;
      causes: string;
    }>;
    overallHealth: string;
    overallConfidence: number;
    description: string;
    leafDetails: string;
    environmentalFactors: string;
  };
  enrichment?: {
    description: string;
    fixes: string;
    speciesInfo: string;
    ragSources: string;
  };
}

export interface CareReminder {
  id: string;
  plantId: string;
  type: string;
  frequency: string;
  lastDone: string | null;
  nextDue: string | null;
  enabled: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareActivity {
  id: string;
  plantId: string;
  type: string;
  notes: string | null;
  createdAt: string;
}

export type ViewType = 'home' | 'diagnose' | 'guide' | 'settings' | 'plant-detail';