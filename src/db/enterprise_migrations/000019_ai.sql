-- Migration: 000019_ai.sql
-- Description: AI infrastructure including Vector DB embeddings for Semantic Search, document understanding, and copilot context.

-- Ensure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. AI Embeddings (Semantic Search and Knowledge Base Context)
CREATE TABLE IF NOT EXISTS ai_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'document', 'project', 'unit', 'historical_contract'
    entity_id UUID NOT NULL,
    content_text TEXT NOT NULL, -- The chunk of text encoded
    embedding vector(768), -- Assumes usage of a 768-dimension model. Adjust size if needed (e.g., using OpenAI requires 1536).
    metadata JSONB, -- Supplemental tags (e.g., { "language": "fr", "category": "sales" })
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
    -- Ephemeral index tracking table, no soft delete needed. Usually managed by CDC or scheduled syncs.
);

CREATE TRIGGER trg_ai_embeddings_updated_at
    BEFORE UPDATE ON ai_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION set_current_timestamp_updated_at();

-- Provide heavily optimized vector index for similarity search.
-- HNSW (Hierarchical Navigable Small World) index is recommended over IVFFlat for performance
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_vector ON ai_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_org_entity ON ai_embeddings(organization_id, entity_type, entity_id);

-- Enable RLS
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;

-- Apply Tenant Isolation Policies
CREATE POLICY isolate_tenant_ai_embeddings ON ai_embeddings USING (organization_id = get_current_tenant_id());
