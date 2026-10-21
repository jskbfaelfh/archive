-- =========================================================================
-- Al-Zahrawi University Architecture - Core Schema & Security Policies (RLS)
-- Created: 2026-10-21
-- Target: Self-Hosted Supabase / PostgreSQL
-- =========================================================================

CREATE SCHEMA IF NOT EXISTS core_university;

-- 1. Colleges (الكليات)
CREATE TABLE IF NOT EXISTS core_university.colleges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Departments (الأقسام العلمية)
CREATE TABLE IF NOT EXISTS core_university.departments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    college_id TEXT NOT NULL REFERENCES core_university.colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    stages_count INT NOT NULL DEFAULT 4,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Sections (الشعب الدراسية)
CREATE TABLE IF NOT EXISTS core_university.sections (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    college_id TEXT NOT NULL REFERENCES core_university.colleges(id) ON DELETE CASCADE,
    department_id TEXT NOT NULL REFERENCES core_university.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Subjects (المواد والمقررات الدراسية)
CREATE TABLE IF NOT EXISTS core_university.subjects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    college_id TEXT NOT NULL REFERENCES core_university.colleges(id) ON DELETE CASCADE,
    department_id TEXT NOT NULL REFERENCES core_university.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage INT NOT NULL DEFAULT 1,
    semester INT NOT NULL DEFAULT 1,
    doctor_id TEXT,
    doctor_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Staff Profiles (ملفات الكادر)
CREATE TABLE IF NOT EXISTS core_university.staff_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('college_admin', 'department_admin', 'doctor', 'student')),
    title TEXT,
    college_id TEXT REFERENCES core_university.colleges(id),
    department_id TEXT REFERENCES core_university.departments(id),
    stage INT,
    section_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Lectures (أرشيف المحاضرات الأكاديمية)
CREATE TABLE IF NOT EXISTS core_university.lectures (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    college_id TEXT NOT NULL REFERENCES core_university.colleges(id) ON DELETE CASCADE,
    department_id TEXT NOT NULL REFERENCES core_university.departments(id) ON DELETE CASCADE,
    stage INT NOT NULL,
    section_target TEXT NOT NULL DEFAULT 'all',
    subject_id TEXT NOT NULL REFERENCES core_university.subjects(id) ON DELETE CASCADE,
    subject_name TEXT,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'pdf',
    file_size TEXT NOT NULL DEFAULT '0 MB',
    file_name TEXT NOT NULL,
    file_url TEXT,
    description TEXT,
    downloads_count INT NOT NULL DEFAULT 0,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Audit Logs (سجل العمليات والرقابة)
CREATE TABLE IF NOT EXISTS core_university.audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- Security: Row Level Security (RLS)
-- =========================================================================
ALTER TABLE core_university.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.audit_logs ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Public read for colleges" ON core_university.colleges FOR SELECT USING (true);
CREATE POLICY "Public read for departments" ON core_university.departments FOR SELECT USING (true);
CREATE POLICY "Public read for sections" ON core_university.sections FOR SELECT USING (true);
CREATE POLICY "Public read for subjects" ON core_university.subjects FOR SELECT USING (true);
CREATE POLICY "Read lectures policy" ON core_university.lectures FOR SELECT USING (true);
