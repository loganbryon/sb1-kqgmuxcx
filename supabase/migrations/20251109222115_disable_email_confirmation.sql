/*
  # Disable Email Confirmation

  Allows users to sign up and log in immediately without email confirmation.
*/

DO $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE email_confirmed_at IS NULL;
END $$;
