// HACK: Minimal interfaces for validation POC
export interface Persona {
  id: string;
  name: string;
  description: string;
  behavioral_profile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  question: string;
  text: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Questionnaire {
  id: string;
  name: string;
  questions: string[];
  createdAt?: string;
  updated_at?: string;
}