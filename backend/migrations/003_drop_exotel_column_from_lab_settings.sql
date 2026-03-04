-- 003_drop_exotel_column_from_lab_settings.sql
-- Cleanup legacy Exotel-specific column now that Twilio is the primary
-- telephony provider. Safe to run multiple times.

alter table if exists lab_settings
  drop column if exists exotel_number;

