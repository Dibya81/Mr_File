-- ============================================================
-- 001_public_community.sql
-- DocumentVault: Public file/folder system, community requests,
-- and reports.
--
-- Run: psql $DATABASE_URL -f 001_public_community.sql
-- ============================================================

-- 1. Document visibility
ALTER TABLE documents ADD COLUMN IF NOT EXISTS visibility
  VARCHAR(20) NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'password', 'public'));
COMMENT ON COLUMN documents.visibility IS 'private | password | public';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS public_password_hash VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS public_title VARCHAR(500);
CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);

-- 2. Folder visibility
ALTER TABLE folders ADD COLUMN IF NOT EXISTS visibility
  VARCHAR(20) NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'password', 'public'));
COMMENT ON COLUMN folders.visibility IS 'private | password | public';
CREATE INDEX IF NOT EXISTS idx_folders_visibility ON folders(visibility);

-- 3. Community Requests
CREATE TABLE IF NOT EXISTS community_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  document_type VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'filled', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_requests_requester ON community_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_community_requests_status ON community_requests(status);
CREATE INDEX IF NOT EXISTS idx_community_requests_created ON community_requests(created_at DESC);

-- 4. Community Offers
CREATE TABLE IF NOT EXISTS community_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES community_requests(id) ON DELETE CASCADE,
  offerer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (request_id, document_id)
);
CREATE INDEX IF NOT EXISTS idx_community_offers_request ON community_offers(request_id);
CREATE INDEX IF NOT EXISTS idx_community_offers_offerer ON community_offers(offerer_id);

-- 5. Community Transfers
CREATE TABLE IF NOT EXISTS community_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES community_offers(id) ON DELETE CASCADE,
  original_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  transferred_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offerer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'received', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_transfers_requester ON community_transfers(requester_id);
CREATE INDEX IF NOT EXISTS idx_community_transfers_offerer ON community_transfers(offerer_id);
CREATE INDEX IF NOT EXISTS idx_community_transfers_offer ON community_transfers(offer_id);

-- 6. Community Reports
CREATE TABLE IF NOT EXISTS community_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reported_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  reason VARCHAR(50) NOT NULL
    CHECK (reason IN ('inappropriate', 'copyright', 'spam', 'malware', 'other')),
  details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  resolution TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_created ON community_reports(created_at DESC);
