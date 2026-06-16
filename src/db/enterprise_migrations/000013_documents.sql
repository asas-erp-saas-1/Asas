-- Migration: 000013_documents.sql
-- Description: Document management, generation templates, and e-signature tracking.

-- 1. Document Templates (For generation of VSPs, contracts, receipts)
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'contract', 'invoice', 'receipt', 'reservation'
    body TEXT NOT NULL, -- The HTML/Handlebars/Markdown template content
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_document_templates_updated_at
    BEFORE UPDATE ON document_templates
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 2. Documents (Stored files or generated PDFs)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'contract', 'contact', 'project' (polymorphic relation)
    entity_id UUID NOT NULL, -- The ID of the related entity
    name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- Pointer to S3 / Cloud Storage
    file_type VARCHAR(100), -- MIME type (e.g., 'application/pdf')
    file_size INT, -- Byes
    version INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'superseded'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- 3. Signatures (E-signature tracking for legal documents)
CREATE TABLE IF NOT EXISTS signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE, -- The external signer
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'signed', 'declined', 'expired'
    signed_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    signature_data JSONB, -- Stores certificate details, audit trail, cryptographic hashes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id), -- The user who requested the signature
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TRIGGER trg_signatures_updated_at
    BEFORE UPDATE ON signatures
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Specific Indexes for fast polymorphic lookups and status checks
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_signatures_document ON signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_signatures_contact ON signatures(contact_id);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_document_templates ON document_templates USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_documents ON documents USING (organization_id = get_current_tenant_id());
CREATE POLICY isolate_tenant_signatures ON signatures USING (organization_id = get_current_tenant_id());
