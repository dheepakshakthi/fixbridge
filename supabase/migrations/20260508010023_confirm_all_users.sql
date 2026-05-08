-- Automatically confirm all users in the local database
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email_confirmed_at IS NULL;
