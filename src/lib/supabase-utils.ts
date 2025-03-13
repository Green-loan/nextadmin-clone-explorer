
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
  return data || [];
}

export async function getApprovedLoans() {
  const { data, error } = await supabase
    .from('approved_loans')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getRejectedLoans() {
  const { data, error } = await supabase
    .from('rejected_loans')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// New functions for approving and rejecting loans with improved error handling
export async function approveLoan(loanData: any) {
  try {
    console.log('Approving loan:', loanData);
    
    // Step 1: Insert the loan into approved_loans table
    const { data: approvedLoan, error: approveError } = await supabase
      .from('approved_loans')
      .insert([{
        name: loanData.name,
        email: loanData.email,
        phone: loanData.phone,
        id_number: loanData.id_number,
        gender: loanData.gender,
        dob: loanData.dob,
        address: loanData.address,
        amount: loanData.amount,
        bank: loanData.bank,
        account_number: loanData.account_number,
        purpose: loanData.purpose,
        due_date: loanData.due_date,
        status: true,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (approveError) {
      console.error('Error inserting into approved_loans:', approveError);
      throw approveError;
    }
    
    console.log('Successfully inserted into approved_loans:', approvedLoan);
    
    // Step 2: Delete the loan from loan_applications table
    const { error: deleteError } = await supabase
      .from('loan_applications')
      .delete()
      .eq('id', loanData.id);
    
    if (deleteError) {
      console.error('Error deleting from loan_applications:', deleteError);
      throw deleteError;
    }
    
    console.log('Successfully deleted from loan_applications');
    return approvedLoan;
  } catch (error) {
    console.error('Error in approveLoan:', error);
    throw error;
  }
}

export async function rejectLoan(loanData: any) {
  try {
    console.log('Rejecting loan:', loanData);
    
    // Step 1: Insert the loan into rejected_loans table
    const { data: rejectedLoan, error: rejectError } = await supabase
      .from('rejected_loans')
      .insert([{
        name: loanData.name,
        email: loanData.email,
        phone: loanData.phone,
        id_number: loanData.id_number,
        gender: loanData.gender,
        dob: loanData.dob,
        address: loanData.address,
        amount: loanData.amount,
        bank: loanData.bank,
        account_number: loanData.account_number,
        purpose: loanData.purpose,
        due_date: loanData.due_date,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (rejectError) {
      console.error('Error inserting into rejected_loans:', rejectError);
      throw rejectError;
    }
    
    console.log('Successfully inserted into rejected_loans:', rejectedLoan);
    
    // Step 2: Delete the loan from loan_applications table
    const { error: deleteError } = await supabase
      .from('loan_applications')
      .delete()
      .eq('id', loanData.id);
    
    if (deleteError) {
      console.error('Error deleting from loan_applications:', deleteError);
      throw deleteError;
    }
    
    console.log('Successfully deleted from loan_applications');
    return rejectedLoan;
  } catch (error) {
    console.error('Error in rejectLoan:', error);
    throw error;
  }
}

// Investment functions
export async function getInvestments() {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

// Stokvela members functions
export async function getStokvelaMembers() {
  const { data, error } = await supabase
    .from('stokvela_members')
    .select('*')
    .order('user_number', { ascending: true });
  
  if (error) throw error;
  return data || [];
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
