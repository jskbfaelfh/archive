-- =========================================================================
-- Al-Zahrawi University - Central Hierarchy Integration & Facilities
-- Created: 2026-10-25
-- Target: Self-Hosted Supabase / PostgreSQL
-- =========================================================================

-- 1. Facilities (المختبرات والقاعات الدراسية)
CREATE TABLE IF NOT EXISTS core_university.facilities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    college_id TEXT NOT NULL REFERENCES core_university.colleges(id) ON DELETE CASCADE,
    department_id TEXT REFERENCES core_university.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    type TEXT NOT NULL CHECK (type IN ('hall', 'lab')),
    building TEXT,
    capacity INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Integration Settings (إعدادات التكامل والربط مع نظام الهيكلية المركزي)
CREATE TABLE IF NOT EXISTS core_university.integration_settings (
    id TEXT PRIMARY KEY DEFAULT 'central_hierarchy_settings',
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    api_url TEXT NOT NULL DEFAULT 'https://hierarchy-central.alzahrawi.edu.iq/api/v1',
    api_key TEXT,
    webhook_secret TEXT,
    sync_interval_minutes INT NOT NULL DEFAULT 30,
    mappings JSONB NOT NULL DEFAULT '{}'::jsonb,
    last_synced_at TIMESTAMPTZ,
    last_sync_status TEXT DEFAULT 'idle',
    last_sync_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Sync Logs (سجل عمليات المزامنة والتكامل)
CREATE TABLE IF NOT EXISTS core_university.sync_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source TEXT NOT NULL DEFAULT 'central_hierarchy',
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'automatic', 'webhook')),
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running')),
    synced_items_count INT NOT NULL DEFAULT 0,
    details TEXT,
    payload_summary JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Security: RLS
ALTER TABLE core_university.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_university.sync_logs ENABLE ROW LEVEL SECURITY;

-- Read policies
CREATE POLICY "Public read for facilities" ON core_university.facilities FOR SELECT USING (true);
CREATE POLICY "Public read for integration settings" ON core_university.integration_settings FOR SELECT USING (true);
CREATE POLICY "Public read for sync logs" ON core_university.sync_logs FOR SELECT USING (true);
