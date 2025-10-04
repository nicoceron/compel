-- Add quantitative goal support to Compel
-- Run this in your Supabase SQL Editor to add the new columns

-- Add columns to goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS target_value DECIMAL(10, 2) DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'check-ins',
ADD COLUMN IF NOT EXISTS initial_buffer_days INTEGER DEFAULT 0;

-- Add value column to check_ins table
ALTER TABLE check_ins 
ADD COLUMN IF NOT EXISTS value DECIMAL(10, 2) DEFAULT 1;

-- Update existing goals to have default values
UPDATE goals SET target_value = 1 WHERE target_value IS NULL;
UPDATE goals SET unit_type = 'check-ins' WHERE unit_type IS NULL;
UPDATE goals SET initial_buffer_days = 0 WHERE initial_buffer_days IS NULL;

-- Update existing check_ins to have default values
UPDATE check_ins SET value = 1 WHERE value IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN goals.target_value IS 'Target amount per frequency period (e.g., 60 for "60 minutes per day")';
COMMENT ON COLUMN goals.unit_type IS 'Type of unit being measured (e.g., minutes, sessions, miles, books)';
COMMENT ON COLUMN goals.initial_buffer_days IS 'Extra safety buffer to start with (in days)';
COMMENT ON COLUMN check_ins.value IS 'Actual value logged for this check-in (e.g., 45 if logged 45 minutes)';

