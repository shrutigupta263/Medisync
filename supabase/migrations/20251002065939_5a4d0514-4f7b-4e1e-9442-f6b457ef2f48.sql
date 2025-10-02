-- Create or replace the timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create medicine tracking table for daily taken/missed status
CREATE TABLE IF NOT EXISTS public.medicine_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('taken', 'missed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(medicine_id, date)
);

-- Enable RLS
ALTER TABLE public.medicine_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own medicine tracking"
  ON public.medicine_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medicine tracking"
  ON public.medicine_tracking
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medicine tracking"
  ON public.medicine_tracking
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medicine tracking"
  ON public.medicine_tracking
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_medicine_tracking_user_date ON public.medicine_tracking(user_id, date);
CREATE INDEX idx_medicine_tracking_medicine ON public.medicine_tracking(medicine_id);

-- Trigger for updating updated_at timestamp
CREATE TRIGGER update_medicine_tracking_updated_at
  BEFORE UPDATE ON public.medicine_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();