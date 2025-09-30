-- Add structured analysis columns to health_reports table
ALTER TABLE health_reports 
ADD COLUMN IF NOT EXISTS analysis_data JSONB,
ADD COLUMN IF NOT EXISTS prediction_data JSONB,
ADD COLUMN IF NOT EXISTS ocr_text TEXT,
ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_health_reports_analysis_status ON health_reports(analysis_status);
CREATE INDEX IF NOT EXISTS idx_health_reports_user_analyzed ON health_reports(user_id, analyzed_at DESC);