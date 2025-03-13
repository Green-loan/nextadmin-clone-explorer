
import { supabase } from './supabase';

// Users account functions
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users_account')
    .select('*');
  
  if (error) throw error;
  return data;
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users_account')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Loan application functions
export async function getLoanApplications() {
  const { data, error } = await supabase
    .from('loan_applications')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getApprovedLoans() {
  const { data, error } = await supabase
    .from('approved_loans')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getRejectedLoans() {
  const { data, error } = await supabase
    .from('rejected_loans')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Investment functions
export async function getInvestments() {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Stokvela members functions
export async function getStokvelaMembers() {
  const { data, error } = await supabase
    .from('stokvela_members')
    .select('*')
    .order('user_number', { ascending: true });
  
  if (error) throw error;
  return data;
}

// System settings functions
export async function getSystemSettings() {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*');
  
  if (error) throw error;
  
  // Convert to key-value object
  const settings: Record<string, string> = {};
  data?.forEach(item => {
    settings[item.setting_key] = item.setting_value;
  });
  
  return settings;
}

export async function updateSystemSetting(key: string, value: string) {
  const { data, error } = await supabase
    .from('system_settings')
    .update({ setting_value: value, updated_at: new Date() })
    .eq('setting_key', key);
  
  if (error) throw error;
  return data;
}
