-- Set up cron job to check reminders every 5 minutes
-- This will automatically send email notifications at the correct time
SELECT cron.schedule(
  'check-health-reminders',
  '*/5 * * * *', -- Run every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://iyfwfwryibqfqetmbpqq.supabase.co/functions/v1/check-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5Zndmd3J5aWJxZnFldG1icHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMzE5NDcsImV4cCI6MjA3NDgwNzk0N30._5M8F9rW9pC7yfLmnnF1RbkQWGswqrDmm0c0P48bN5M"}'::jsonb
  ) as request_id;
  $$
);