-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the check-reminders function to run every 5 minutes
SELECT cron.schedule(
  'check-reminders-every-5-minutes',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://iyfwfwryibqfqetmbpqq.supabase.co/functions/v1/check-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Zndmd3J5aWJxZnFldG1icHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzE5NDcsImV4cCI6MjA3NDgwNzk0N30._5M8F9rW9pC7yfLmnnF1RbkQWGswqrDmm0c0P48bN5M"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);