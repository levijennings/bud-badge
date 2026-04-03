-- Bud Badge: Cannabis Dispensary Training & Certification Platform
-- Initial Database Schema
-- Created: 2026-04-03

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get the current user's organization ID
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM org_members
  WHERE user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to get the current user's role in their organization
CREATE OR REPLACE FUNCTION get_user_org_role()
RETURNS TEXT AS $$
  SELECT role FROM org_members
  WHERE user_id = auth.uid() AND org_id = get_user_org_id()
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to check if current user is member of given organization
CREATE OR REPLACE FUNCTION is_org_member(org_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM org_members
    WHERE user_id = auth.uid() AND org_id = org_uuid AND is_active = TRUE
  );
$$ LANGUAGE sql STABLE;

-- Function to generate certificate numbers (BB-2026-XXXXX format)
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT;
  random_suffix TEXT;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  random_suffix := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT), 1, 5));
  RETURN 'BB-' || year || '-' || random_suffix;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation (called by auth trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLES
-- ============================================================================

-- Organizations (Multi-tenant)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  license_number TEXT,
  license_state TEXT,
  city TEXT,
  state TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  max_employees INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Organization Members (User-Org Junction)
CREATE TABLE IF NOT EXISTS org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'budtender' CHECK (role IN ('owner', 'manager', 'budtender')),
  hire_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org_user ON org_members(org_id, user_id);
CREATE INDEX idx_org_members_user_id ON org_members(user_id);

-- Training Modules
CREATE TABLE IF NOT EXISTS training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('compliance', 'product_knowledge', 'customer_service', 'safety', 'operations')),
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER NOT NULL,
  content JSONB NOT NULL DEFAULT '[]',
  passing_score INTEGER NOT NULL DEFAULT 70 CHECK (passing_score >= 0 AND passing_score <= 100),
  state_requirements TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_training_modules_updated_at
  BEFORE UPDATE ON training_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training Progress
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  last_content_index INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, user_id, module_id)
);

CREATE TRIGGER update_training_progress_updated_at
  BEFORE UPDATE ON training_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_training_progress_org_user ON training_progress(org_id, user_id);
CREATE INDEX idx_training_progress_org_module ON training_progress(org_id, module_id);

-- Quiz Attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]',
  time_taken_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_org_user ON quiz_attempts(org_id, user_id);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES training_modules(id),
  quiz_attempt_id UUID REFERENCES quiz_attempts(id),
  certificate_number TEXT NOT NULL UNIQUE,
  score INTEGER NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_certifications_org_user ON certifications(org_id, user_id);
CREATE INDEX idx_certifications_number ON certifications(certificate_number);

-- Compliance Records
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('training_completion', 'certification_expiry', 'state_requirement', 'audit')),
  status TEXT NOT NULL CHECK (status IN ('compliant', 'warning', 'non_compliant')),
  title TEXT NOT NULL,
  details TEXT,
  due_date DATE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_records_org_status ON compliance_records(org_id, status);

-- ============================================================================
-- ROW-LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS RLS POLICIES
-- ============================================================================

-- Anyone can read their own organization
CREATE POLICY "users_read_own_organization"
  ON organizations FOR SELECT
  USING (is_org_member(id));

-- Only owners can update their organization
CREATE POLICY "owners_update_organization"
  ON organizations FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM org_members
      WHERE org_members.org_id = organizations.id
      AND org_members.user_id = auth.uid()
      AND org_members.role = 'owner'
      AND org_members.is_active = TRUE
    )
  );

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

-- Authenticated users can read all profiles
CREATE POLICY "authenticated_read_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can update only their own profile
CREATE POLICY "users_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- ORG_MEMBERS RLS POLICIES
-- ============================================================================

-- Users can read members of their own organization
CREATE POLICY "users_read_org_members"
  ON org_members FOR SELECT
  USING (is_org_member(org_id));

-- Managers and owners can insert new members
CREATE POLICY "managers_insert_org_members"
  ON org_members FOR INSERT
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM org_members om
      WHERE om.org_id = org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'manager')
      AND om.is_active = TRUE
    )
  );

-- Managers and owners can update members in their org
CREATE POLICY "managers_update_org_members"
  ON org_members FOR UPDATE
  USING (
    EXISTS(
      SELECT 1 FROM org_members om
      WHERE om.org_id = org_members.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'manager')
      AND om.is_active = TRUE
    )
  );

-- ============================================================================
-- TRAINING_MODULES RLS POLICIES
-- ============================================================================

-- Authenticated users can read published modules
CREATE POLICY "authenticated_read_published_modules"
  ON training_modules FOR SELECT
  TO authenticated
  USING (is_published = TRUE);

-- Authenticated users can read premium modules if org has professional+ plan
CREATE POLICY "authenticated_read_premium_modules"
  ON training_modules FOR SELECT
  TO authenticated
  USING (
    is_premium = FALSE OR (
      is_premium = TRUE AND EXISTS(
        SELECT 1 FROM org_members om
        JOIN organizations o ON o.id = om.org_id
        WHERE om.user_id = auth.uid()
        AND om.is_active = TRUE
        AND o.plan IN ('professional', 'enterprise')
      )
    )
  );

-- ============================================================================
-- QUIZZES RLS POLICIES
-- ============================================================================

-- Same as training_modules - read published/premium based on plan
CREATE POLICY "authenticated_read_published_quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM training_modules tm
      WHERE tm.id = quizzes.module_id
      AND tm.is_published = TRUE
    )
  );

CREATE POLICY "authenticated_read_premium_quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS(
      SELECT 1 FROM training_modules tm
      WHERE tm.id = quizzes.module_id
      AND (
        tm.is_premium = FALSE OR (
          tm.is_premium = TRUE AND EXISTS(
            SELECT 1 FROM org_members om
            JOIN organizations o ON o.id = om.org_id
            WHERE om.user_id = auth.uid()
            AND om.is_active = TRUE
            AND o.plan IN ('professional', 'enterprise')
          )
        )
      )
    )
  );

-- ============================================================================
-- TRAINING_PROGRESS RLS POLICIES
-- ============================================================================

-- Users can read/update their own progress
CREATE POLICY "users_read_own_progress"
  ON training_progress FOR SELECT
  USING (auth.uid() = user_id AND is_org_member(org_id));

CREATE POLICY "users_update_own_progress"
  ON training_progress FOR UPDATE
  USING (auth.uid() = user_id AND is_org_member(org_id));

CREATE POLICY "users_insert_own_progress"
  ON training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_org_member(org_id));

-- Managers can read all progress in their org
CREATE POLICY "managers_read_org_progress"
  ON training_progress FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM org_members om
      WHERE om.org_id = training_progress.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'manager')
      AND om.is_active = TRUE
    )
  );

-- ============================================================================
-- QUIZ_ATTEMPTS RLS POLICIES
-- ============================================================================

-- Users can read their own attempts
CREATE POLICY "users_read_own_attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id AND is_org_member(org_id));

CREATE POLICY "users_insert_own_attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_org_member(org_id));

-- Managers can read all attempts in their org
CREATE POLICY "managers_read_org_attempts"
  ON quiz_attempts FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM org_members om
      WHERE om.org_id = quiz_attempts.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'manager')
      AND om.is_active = TRUE
    )
  );

-- ============================================================================
-- CERTIFICATIONS RLS POLICIES
-- ============================================================================

-- Users can read their own certifications
CREATE POLICY "users_read_own_certifications"
  ON certifications FOR SELECT
  USING (auth.uid() = user_id AND is_org_member(org_id));

CREATE POLICY "users_insert_own_certifications"
  ON certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_org_member(org_id));

-- Managers can read all certifications in their org
CREATE POLICY "managers_read_org_certifications"
  ON certifications FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM org_members om
      WHERE om.org_id = certifications.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'manager')
      AND om.is_active = TRUE
    )
  );

-- System can create certifications (used by backend)
CREATE POLICY "system_create_certifications"
  ON certifications FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================================
-- COMPLIANCE_RECORDS RLS POLICIES
-- ============================================================================

-- Managers and owners can read compliance records for their org
CREATE POLICY "managers_read_compliance"
  ON compliance_records FOR SELECT
  USING (
    EXISTS(
      SELECT 1 FROM org_members om
      WHERE om.org_id = compliance_records.org_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'manager')
      AND om.is_active = TRUE
    )
  );

-- System can create compliance records (used by backend)
CREATE POLICY "system_create_compliance"
  ON compliance_records FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================================
-- TRIGGERS FOR AUTH INTEGRATION
-- ============================================================================

-- Note: This trigger assumes you have an auth trigger set up in Supabase
-- This should be created in the auth schema, but we include it here for reference
-- Uncomment and adjust if needed in your Supabase setup

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- SEED DATA PLACEHOLDER
-- ============================================================================

-- Seed data is stored in a separate seed.sql file
-- Run this after applying the migration

COMMIT;
