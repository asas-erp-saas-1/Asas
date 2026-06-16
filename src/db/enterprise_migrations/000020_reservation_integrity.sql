-- Integrity check: A unit can only have ONE 'active' reservation at any given time.
CREATE UNIQUE INDEX isolate_active_reservations ON reservations (unit_id) WHERE status = 'active';

-- Integrity check: A unit can only have ONE 'active' or 'signed' contract at any given time.
CREATE UNIQUE INDEX isolate_active_contracts ON contracts (unit_id) WHERE status IN ('draft', 'signed', 'active');
