/*
# Create resumes and analyses tables for CareerMatch AI

1. New Tables
- `resumes` — stores uploaded resume metadata and extracted text
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users, defaults to auth.uid())
  - `file_name` (text, not null)
  - `extracted_text` (text, nullable — null until extraction completes)
  - `created_at` (timestamptz, default now())
- `analyses` — stores ATS analysis results
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to auth.users, defaults to auth.uid())
  - `resume_id` (uuid, FK to resumes, cascade delete)
  - `company_name` (text, not null)
  - `job_role` (text, not null)
  - `job_description` (text, not null)
  - `location` (text, nullable)
  - `ats_score` (numeric, not null)
  - `skills_score` (numeric, not null)
  - `keyword_score` (numeric, not null)
  - `experience_score` (numeric, not null)
  - `education_score` (numeric, not null)
  - `completeness_score` (numeric, not null)
  - `matched_skills` (jsonb, not null)
  - `missing_skills` (jsonb, not null)
  - `matched_keywords` (jsonb, not null)
  - `missing_keywords` (jsonb, not null)
  - `experience_analysis` (jsonb, nullable)
  - `education_analysis` (jsonb, nullable)
  - `completeness_details` (jsonb, nullable)
  - `ai_suggestions` (jsonb, nullable)
  - `created_at` (timestamptz, default now())

2. Indexes
- `idx_resumes_user_id` on resumes(user_id)
- `idx_analyses_user_id` on analyses(user_id)
- `idx_analyses_resume_id` on analyses(resume_id)

3. Security
- RLS enabled on both tables
- Owner-scoped CRUD: authenticated users can only access their own rows
- `user_id` defaults to `auth.uid()` so inserts that omit it still succeed
*/

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  extracted_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resumes" ON resumes;
CREATE POLICY "select_own_resumes" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resumes" ON resumes;
CREATE POLICY "insert_own_resumes" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_resumes" ON resumes;
CREATE POLICY "update_own_resumes" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resumes" ON resumes;
CREATE POLICY "delete_own_resumes" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  job_role text NOT NULL,
  job_description text NOT NULL,
  location text,
  ats_score numeric NOT NULL,
  skills_score numeric NOT NULL,
  keyword_score numeric NOT NULL,
  experience_score numeric NOT NULL,
  education_score numeric NOT NULL,
  completeness_score numeric NOT NULL,
  matched_skills jsonb NOT NULL DEFAULT '[]',
  missing_skills jsonb NOT NULL DEFAULT '[]',
  matched_keywords jsonb NOT NULL DEFAULT '[]',
  missing_keywords jsonb NOT NULL DEFAULT '[]',
  experience_analysis jsonb,
  education_analysis jsonb,
  completeness_details jsonb,
  ai_suggestions jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
CREATE POLICY "select_own_analyses" ON analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
CREATE POLICY "insert_own_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON analyses;
CREATE POLICY "update_own_analyses" ON analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON analyses;
CREATE POLICY "delete_own_analyses" ON analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_resume_id ON analyses(resume_id);
