-- Run this in your Supabase SQL Editor to support decimal points (e.g. 0.5)

-- Change 'amount' column from integer to numeric (allows decimals)
ALTER TABLE public.points ALTER COLUMN amount TYPE numeric;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'points' AND column_name = 'amount';
