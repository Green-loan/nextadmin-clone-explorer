
-- Add document URL columns to loan_applications table
ALTER TABLE IF EXISTS loan_applications 
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS proof_of_income_url TEXT,
ADD COLUMN IF NOT EXISTS bank_statement_url TEXT;

-- Add document verification status columns
ALTER TABLE IF EXISTS loan_applications 
ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Create storage bucket for loan documents (add this to your Supabase project)
-- Note: In Supabase Studio under Storage, create a bucket named 'loans' with appropriate access

-- Create a policy to allow authenticated users to upload their own loan documents
-- In Supabase Studio, go to Storage > Buckets > loans > Policies and add:
-- 1. For loan document uploads:
/*
CREATE POLICY "Allow authenticated users to upload loan documents" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'loans' AND 
  (storage.foldername(name))[1] = 'loan-documents'
);
*/

-- 2. For accessing loan documents:
/*
CREATE POLICY "Allow public access to loan documents" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'loans' AND 
  (storage.foldername(name))[1] = 'loan-documents'
);
*/

-- 3. For loan application verification by admin:
ALTER TABLE IF EXISTS loan_applications
ADD COLUMN IF NOT EXISTS ai_verification_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_verification_passed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_verification_timestamp TIMESTAMP WITH TIME ZONE;

-- 4. Add notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_account(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT TRUE,
  due_date_reminders BOOLEAN DEFAULT TRUE,
  application_updates BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users_account(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  notification_type VARCHAR(50),
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add document verification process for AI
CREATE OR REPLACE FUNCTION process_document_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- This would normally call an AI verification service
  -- For now, we're just simulating with a basic check if all documents are present
  IF (NEW.id_document_url IS NOT NULL AND 
      NEW.proof_of_income_url IS NOT NULL AND 
      NEW.bank_statement_url IS NOT NULL) THEN
    
    -- Simulate AI verification (in reality, this would call an external service)
    NEW.ai_verification_score := random() * 100;
    NEW.ai_verification_passed := NEW.ai_verification_score > 65;
    NEW.ai_verification_timestamp := NOW();
    
    -- Update document verification status
    NEW.documents_verified := NEW.ai_verification_passed;
    
    -- Add verification notes based on result
    IF NEW.ai_verification_passed THEN
      NEW.verification_notes := 'Documents automatically verified. Score: ' || NEW.ai_verification_score;
    ELSE
      NEW.verification_notes := 'Document verification failed. Manual review required. Score: ' || NEW.ai_verification_score;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for document verification
DROP TRIGGER IF EXISTS document_verification_trigger ON loan_applications;
CREATE TRIGGER document_verification_trigger
BEFORE UPDATE ON loan_applications
FOR EACH ROW
WHEN (
  (OLD.id_document_url IS NULL AND NEW.id_document_url IS NOT NULL) OR
  (OLD.proof_of_income_url IS NULL AND NEW.proof_of_income_url IS NOT NULL) OR
  (OLD.bank_statement_url IS NULL AND NEW.bank_statement_url IS NOT NULL)
)
EXECUTE FUNCTION process_document_verification();
