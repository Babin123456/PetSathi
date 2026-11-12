-- ============================================================
-- PetSathi Pet Walk Safety & Handover Checklist
-- Additive schema for issue #105
--
-- Run this after the platform's bookings table is available.
-- The booking_id column matches the booking reference used by the
-- frontend (for example: PS-1042). It is unique per booking so an
-- owner and walker share one checklist record.
-- ============================================================

CREATE TABLE IF NOT EXISTS pet_walk_handovers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,

  -- Booking association
  booking_id VARCHAR(40) NOT NULL,
  owner_id INT UNSIGNED NULL,
  walker_id INT UNSIGNED NULL,

  -- Step 1: pre-walk information supplied by the owner
  pet_name VARCHAR(80) NOT NULL,
  pet_identification VARCHAR(160) NOT NULL,
  behaviour_notes TEXT NOT NULL,
  special_requirements TEXT NOT NULL,
  emergency_contact_name VARCHAR(100) NOT NULL,
  emergency_contact_phone VARCHAR(30) NOT NULL,
  precautions TEXT NULL,
  owner_confirmed TINYINT(1) NOT NULL DEFAULT 0,

  -- Step 2: walker acknowledgement
  ack_identity TINYINT(1) NOT NULL DEFAULT 0,
  ack_equipment TINYINT(1) NOT NULL DEFAULT 0,
  ack_instructions TINYINT(1) NOT NULL DEFAULT 0,
  ack_emergency_contact TINYINT(1) NOT NULL DEFAULT 0,
  ack_pet_pickup TINYINT(1) NOT NULL DEFAULT 0,

  -- Step 3: post-walk confirmation
  walk_status ENUM('completed', 'partially_completed', 'not_completed') NULL,
  walk_duration_minutes SMALLINT UNSIGNED NULL,
  pet_behaviour ENUM('calm', 'energetic', 'anxious', 'reactive', 'other') NULL,
  incidents TEXT NULL,
  handover_confirmed TINYINT(1) NOT NULL DEFAULT 0,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_handover_booking (booking_id),
  KEY idx_handover_owner (owner_id),
  KEY idx_handover_walker (walker_id),
  CONSTRAINT chk_handover_duration
    CHECK (walk_duration_minutes IS NULL OR walk_duration_minutes BETWEEN 1 AND 480)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Access rules for the PHP layer that will use this table:
--   * owners may insert/update the pre-walk fields only for their own bookings;
--   * assigned walkers may read the pre-walk fields and update only the
--     acknowledgement and post-walk fields;
--   * walkers and owners must be matched against the booking before an update.
