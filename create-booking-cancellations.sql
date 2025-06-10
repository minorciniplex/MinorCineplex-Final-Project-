-- Create booking_cancellations table for Supabase
CREATE TABLE IF NOT EXISTS booking_cancellations (
  cancellation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cancellation_reason TEXT NOT NULL,
  original_total_price DECIMAL(10,2) NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL,
  refund_percentage INTEGER NOT NULL DEFAULT 100,
  cancellation_date TIMESTAMPTZ DEFAULT NOW(),
  refund_status VARCHAR(20) DEFAULT 'pending' CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed')),
  refund_processed_date TIMESTAMPTZ,
  refund_method VARCHAR(50),
  showtime_date TIMESTAMPTZ,
  hours_before_showtime DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add cancellation fields to bookings table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='cancelled_at') THEN
        ALTER TABLE bookings ADD COLUMN cancelled_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='cancellation_id') THEN
        ALTER TABLE bookings ADD COLUMN cancellation_id UUID REFERENCES booking_cancellations(cancellation_id);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_booking_id ON booking_cancellations(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_user_id ON booking_cancellations(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_cancellations_date ON booking_cancellations(cancellation_date);

-- Enable Row Level Security (RLS)
ALTER TABLE booking_cancellations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cancellations" ON booking_cancellations;
DROP POLICY IF EXISTS "Users can insert their own cancellations" ON booking_cancellations;

-- Create RLS policies
CREATE POLICY "Users can view their own cancellations" ON booking_cancellations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cancellations" ON booking_cancellations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_cancellations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_booking_cancellations_updated_at ON booking_cancellations;

-- Create trigger for updated_at
CREATE TRIGGER update_booking_cancellations_updated_at
    BEFORE UPDATE ON booking_cancellations
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_cancellations_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON booking_cancellations TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comment
COMMENT ON TABLE booking_cancellations IS 'Store booking cancellation records with refund details'; 