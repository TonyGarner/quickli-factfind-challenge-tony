// Core types for the Fact Find challenge

export type FieldType = 'text' | 'number' | 'email' | 'date' | 'select' | 'textarea';

export interface Field {
  id: string;           // e.g. "full_name", "annual_income", "custom_1"
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];   // for select / Yes-No
  placeholder?: string;
  helpText?: string;
}

export interface Section {
  id: string;           // "personal" | "employment"
  title: string;
  description?: string;
  fields: Field[];
}

export interface FactFindConfig {
  sections: Section[];
  // Future: version, templateId, conditionalRules, etc.
}

export interface FactFind {
  _id: string;
  brokerId: string;
  slug: string;                    // unique public identifier e.g. "qf_abc123def"
  title: string;                   // "Sarah Thompson - Home Purchase Fact Find"
  clientName?: string;
  clientEmail?: string;
  config: FactFindConfig;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  submissionCount?: number;        // populated in queries
}

export interface Submission {
  _id: string;
  factFindId: string;
  slug: string;                    // denormalized for easy lookup
  answers: Record<string, any>;    // { "full_name": "John Doe", "annual_income": 125000, ... }
  applicantName?: string;          // convenience from answers
  submittedAt: string;
  reviewed: boolean;
  reviewedAt?: string;
  brokerNotes?: string;
}

// For Redux store
export interface FactFindState {
  factFinds: FactFind[];
  submissions: Submission[];
  selectedFactFind: FactFind | null;
  selectedSubmission: Submission | null;
  isLoading: boolean;
  error: string | null;
  createModalOpen: boolean;
  submissionsModalOpen: boolean;
}
