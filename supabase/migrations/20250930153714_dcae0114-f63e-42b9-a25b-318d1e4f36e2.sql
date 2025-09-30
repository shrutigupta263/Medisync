-- Create report_analysis table to store per-report AI results
CREATE TABLE IF NOT EXISTS public.report_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL UNIQUE,
  analysis_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT report_analysis_report_fk FOREIGN KEY (report_id)
    REFERENCES public.health_reports (id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.report_analysis ENABLE ROW LEVEL SECURITY;

-- RLS policies to ensure users can only access their own reports' analyses
CREATE POLICY "Users can view their own report analyses"
ON public.report_analysis
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.health_reports hr
    WHERE hr.id = report_analysis.report_id
      AND hr.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own report analyses"
ON public.report_analysis
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.health_reports hr
    WHERE hr.id = report_analysis.report_id
      AND hr.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own report analyses"
ON public.report_analysis
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.health_reports hr
    WHERE hr.id = report_analysis.report_id
      AND hr.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.health_reports hr
    WHERE hr.id = report_analysis.report_id
      AND hr.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own report analyses"
ON public.report_analysis
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.health_reports hr
    WHERE hr.id = report_analysis.report_id
      AND hr.user_id = auth.uid()
  )
);

-- Trigger to maintain updated_at
CREATE TRIGGER update_report_analysis_updated_at
BEFORE UPDATE ON public.report_analysis
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_report_analysis_report_id ON public.report_analysis (report_id);
