-- ============================================================
-- ExpenseFlow Database Schema (Supabase / PostgreSQL)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  monthly_budget DECIMAL DEFAULT 0,
  head_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Regular', 'Manager', 'HR', 'Finance', 'SuperAdmin')) DEFAULT 'Regular',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  bank_name TEXT,
  bank_account TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'departments_head_id_fkey'
  ) THEN
    ALTER TABLE departments
      ADD CONSTRAINT departments_head_id_fkey
      FOREIGN KEY (head_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  max_limit DECIMAL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Settled')) DEFAULT 'Pending',
  receipt_url TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Approvals
CREATE TABLE IF NOT EXISTS approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  comment TEXT,
  step INT DEFAULT 1,
  actioned_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Settlements
CREATE TABLE IF NOT EXISTS settlements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE NOT NULL,
  paid_by UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  amount_paid DECIMAL NOT NULL,
  payment_method TEXT,
  reference_no TEXT,
  settled_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role_active
  ON profiles(role, is_active);

CREATE INDEX IF NOT EXISTS idx_expenses_user_date
  ON expenses(user_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_status_date
  ON expenses(status, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_approvals_expense_id
  ON approvals(expense_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read);

-- ============================================================
-- Auth helper functions for RLS
-- ============================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_role(allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.current_user_role() = ANY (allowed_roles), false);
$$;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    public.current_user_has_role(ARRAY['Manager', 'HR', 'Finance', 'SuperAdmin'])
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage profiles" ON profiles
  FOR UPDATE USING (
    public.current_user_has_role(ARRAY['HR', 'Finance', 'SuperAdmin'])
  );

DROP POLICY IF EXISTS "Authenticated users can view departments" ON departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON departments;

CREATE POLICY "Authenticated users can view departments" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage departments" ON departments
  FOR ALL USING (
    public.current_user_has_role(ARRAY['HR', 'Finance', 'SuperAdmin'])
  );

DROP POLICY IF EXISTS "Authenticated users can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    public.current_user_has_role(ARRAY['HR', 'Finance', 'SuperAdmin'])
  );

DROP POLICY IF EXISTS "Users can view own expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can view all expenses" ON expenses;
DROP POLICY IF EXISTS "Users can create own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own pending expenses" ON expenses;
DROP POLICY IF EXISTS "Admins can update any expense" ON expenses;
DROP POLICY IF EXISTS "Users can delete own pending expenses" ON expenses;

CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all expenses" ON expenses
  FOR SELECT USING (
    public.current_user_has_role(ARRAY['Manager', 'HR', 'Finance', 'SuperAdmin'])
  );

CREATE POLICY "Users can create own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id AND status = 'Pending');

CREATE POLICY "Admins can update any expense" ON expenses
  FOR UPDATE USING (
    public.current_user_has_role(ARRAY['Manager', 'HR', 'Finance', 'SuperAdmin'])
  );

CREATE POLICY "Users can delete own pending expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id AND status = 'Pending');

DROP POLICY IF EXISTS "Users can view approvals for own expenses" ON approvals;
DROP POLICY IF EXISTS "Admins can manage approvals" ON approvals;

CREATE POLICY "Users can view approvals for own expenses" ON approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM expenses
      WHERE id = expense_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage approvals" ON approvals
  FOR ALL USING (
    public.current_user_has_role(ARRAY['Manager', 'HR', 'Finance', 'SuperAdmin'])
  );

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view settlements for own expenses" ON settlements;
DROP POLICY IF EXISTS "Admins can manage settlements" ON settlements;

CREATE POLICY "Users can view settlements for own expenses" ON settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM expenses
      WHERE id = expense_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage settlements" ON settlements
  FOR ALL USING (
    public.current_user_has_role(ARRAY['Finance', 'SuperAdmin'])
  );

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    public.current_user_has_role(ARRAY['Finance', 'SuperAdmin'])
  );

-- ============================================================
-- Storage: receipts bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
SELECT 'receipts', 'receipts', false
WHERE NOT EXISTS (
  SELECT 1
  FROM storage.buckets
  WHERE id = 'receipts'
);

DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own receipts or admins can read all receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;

CREATE POLICY "Authenticated users can upload receipts" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own receipts or admins can read all receipts" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.current_user_has_role(ARRAY['Manager', 'HR', 'Finance', 'SuperAdmin'])
    )
  );

CREATE POLICY "Users can update own receipts" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own receipts" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO departments (id, name, monthly_budget)
VALUES
  ('a1b2c3d4-1111-4aaa-bbbb-111111111111', 'Engineering', 50000),
  ('a1b2c3d4-2222-4aaa-bbbb-222222222222', 'Marketing', 30000),
  ('a1b2c3d4-3333-4aaa-bbbb-333333333333', 'Operations', 20000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO categories (name, icon, max_limit)
VALUES
  ('Travel', 'Plane', 5000),
  ('Food', 'UtensilsCrossed', 2000),
  ('Equipment', 'Monitor', 10000),
  ('Software', 'Code', 3000),
  ('Training', 'GraduationCap', 4000),
  ('Miscellaneous', 'Package', 1000)
ON CONFLICT DO NOTHING;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
DROP TRIGGER IF EXISTS set_expense_updated_at ON expenses;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_expense_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
