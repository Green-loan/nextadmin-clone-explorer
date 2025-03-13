
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szmjtsldkbmgcdjkjafk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bWp0c2xka2JtZ2NkamtqYWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4NzEyODEsImV4cCI6MjA1NzQ0NzI4MX0.jn9tzxh9g6oKWSZgqe-Gm_9Uug80isSfvuTpj9KgnHM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
