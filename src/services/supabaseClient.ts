import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface ResumeRow {
  id: string;
  user_id: string;
  file_name: string;
  extracted_text: string | null;
  created_at: string;
}

export interface AnalysisRow {
  id: string;
  user_id: string;
  resume_id: string | null;
  company_name: string;
  job_role: string;
  job_description: string;
  location: string | null;
  ats_score: number;
  skills_score: number;
  keyword_score: number;
  experience_score: number;
  education_score: number;
  completeness_score: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_keywords: string[];
  missing_keywords: string[];
  experience_analysis: any;
  education_analysis: any;
  completeness_details: any;
  ai_suggestions: any;
  created_at: string;
}
