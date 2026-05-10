-- =====================================================================
-- Migration: 2026-05-10  Split `users.roles` (array) into `users.role`
--                       (single value) so one email can have separate
--                       attendee + organizer accounts.
--
-- Run this ONCE against the production database BEFORE deploying the
-- backend code that drops the `roles` column.
--
-- Postgres only.  Wrap in a transaction; rolls back cleanly on error.
-- =====================================================================

BEGIN;

-- 1. Add the new single-role column (nullable for now so we can fill it)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(32);

-- 2. For every existing user, set `role` = first element of the legacy
--    `roles` simple-array column.  `roles` is stored as comma-separated
--    text by TypeORM's simple-array type, e.g. 'attendee' or
--    'attendee,organizer'.
UPDATE users
SET    role = split_part(COALESCE(roles, 'attendee'), ',', 1)
WHERE  role IS NULL;

-- 3. For every user that previously had MORE than one role (e.g.
--    'attendee,organizer'), create a duplicate row for each extra role.
--    The duplicate keeps the same passwordHash, name, phone, etc., so
--    the user can log into either role with the same credentials.
INSERT INTO users (
    id,
    name,
    email,
    password_hash,
    phone,
    role,
    bio,
    avatar_url,
    oauth_provider,
    social_links,
    interested_event_categories,
    hosting_event_types,
    organization_id,
    email_verified,
    email_verification_token,
    email_verified_at,
    phone_verified,
    phone_verified_at,
    password_reset_token,
    password_reset_expires,
    email_opt_in,
    locale,
    metadata,
    created_at,
    updated_at
)
SELECT
    gen_random_uuid()                                    AS id,
    u.name,
    u.email,
    u.password_hash,
    u.phone,
    extra_role                                           AS role,
    u.bio,
    u.avatar_url,
    u.oauth_provider,
    u.social_links,
    u.interested_event_categories,
    u.hosting_event_types,
    u.organization_id,
    u.email_verified,
    NULL                                                 AS email_verification_token,
    u.email_verified_at,
    u.phone_verified,
    u.phone_verified_at,
    NULL                                                 AS password_reset_token,
    NULL                                                 AS password_reset_expires,
    u.email_opt_in,
    u.locale,
    u.metadata,
    NOW()                                                AS created_at,
    NOW()                                                AS updated_at
FROM   users u
CROSS JOIN LATERAL unnest(string_to_array(u.roles, ','))  AS extra_role
WHERE  string_to_array(u.roles, ',') IS NOT NULL
  AND  array_length(string_to_array(u.roles, ','), 1) > 1
  AND  extra_role <> split_part(u.roles, ',', 1);

-- 4. Make `role` NOT NULL with a sensible default
UPDATE users SET role = 'attendee' WHERE role IS NULL OR role = '';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'attendee';

-- 5. Swap the unique constraint: drop unique-on-email, add unique-on-(email,role)
--    The exact constraint/index name varies; both forms are tried.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'UQ_users_email' OR conname = 'users_email_key'
    ) THEN
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS "UQ_users_email"';
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS "users_email_key"';
    END IF;
END $$;

DROP INDEX IF EXISTS "IDX_users_email";

CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email_role"
    ON users (email, role);

-- 6. Drop the legacy `roles` column. (Comment this line out if you want
--    a rollback window — you can drop it after a successful deploy.)
ALTER TABLE users DROP COLUMN IF EXISTS roles;

COMMIT;

-- =====================================================================
-- Verification queries (run after migration to sanity-check):
--
--   SELECT email, role, COUNT(*) FROM users GROUP BY 1,2 HAVING COUNT(*) > 1;
--     -- should return 0 rows
--
--   SELECT email, COUNT(*) FROM users GROUP BY 1 HAVING COUNT(*) > 1;
--     -- shows users that now have BOTH attendee + organizer accounts
-- =====================================================================
