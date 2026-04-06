-- SQL Script to Update Ticket Type Enum
-- Run this directly on your PostgreSQL database

-- Step 1: Convert the column to VARCHAR temporarily
ALTER TABLE ticket_types 
ALTER COLUMN type TYPE VARCHAR(50);

-- Step 2: Drop the old enum type
DROP TYPE IF EXISTS ticket_types_type_enum CASCADE;

-- Step 3: Create the new enum type with updated values
CREATE TYPE ticket_types_type_enum AS ENUM (
  'General Admission',
  'VIP',
  'Early Bird',
  'Student',
  'Group',
  'Premium',
  'Standard',
  'Other'
);

-- Step 4: Update existing data to new enum values
UPDATE ticket_types
SET type = CASE 
  WHEN type = 'general' THEN 'General Admission'
  WHEN type = 'vip' THEN 'VIP'
  WHEN type = 'early-bird' THEN 'Early Bird'
  ELSE 'General Admission'
END;

-- Step 5: Convert the column back to the new enum type
ALTER TABLE ticket_types 
ALTER COLUMN type TYPE ticket_types_type_enum 
USING type::ticket_types_type_enum;

-- Step 6: Set the default value
ALTER TABLE ticket_types 
ALTER COLUMN type SET DEFAULT 'General Admission'::ticket_types_type_enum;

-- Verify the changes
SELECT DISTINCT type FROM ticket_types;
