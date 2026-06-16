-- Migration: 000000_enterprise_foundation.sql
-- Description: Foundation schema for the overall enterprise ASAS OS. Initializes core extensions, trigger functions, and the root Organization tenant table.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable pgcrypto for advanced hashing if needed later
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Standardized timestamp trigger for updated_at
CREATE OR REPLACE FUNCTION set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new.updated_at = NOW();
  RETURN _new;
END;
$$ LANGUAGE plpgsql;

-- 1. Foundation: Organizations (Tenant Root)
-- Note: This is the ONLY business table without an organization_id column.
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'enterprise',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Apply Updated At trigger
DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Row Level Security (RLS) Enablement
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Note: Specific RLS Policies for 'organizations' will be fully defined once the 'iam' boundary (users/roles) is established in migration 000001 to prevent circular references.
