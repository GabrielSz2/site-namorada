/*
  # Create presents table for Julia's wishlist

  1. New Tables
    - `presents`
      - `id` (uuid, primary key)
      - `name` (text, present name)
      - `price` (text, price as string)
      - `image` (text, image URL or base64)
      - `category` (text, present category)
      - `store_link` (text, optional store URL)
      - `received` (boolean, whether present was received)
      - `priority` (text, romantic priority level)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `presents` table
    - Add policy for public access (since it's for Julia's personal use)
*/

CREATE TABLE IF NOT EXISTS presents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price text NOT NULL,
  image text DEFAULT '',
  category text NOT NULL,
  store_link text DEFAULT '',
  received boolean DEFAULT false,
  priority text DEFAULT 'querido',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE presents ENABLE ROW LEVEL SECURITY;

-- Allow public access for Julia's personal wishlist
CREATE POLICY "Allow public access to presents"
  ON presents
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_presents_updated_at
  BEFORE UPDATE ON presents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();