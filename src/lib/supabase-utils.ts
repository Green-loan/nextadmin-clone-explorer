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

// New functions for calculating loan metrics
export async function getTotalLoanRevenue() {
  try {
    const { data, error } = await supabase
      .from('approved_loans')
      .select('amount');
    
    if (error) throw error;
    
    // Calculate total revenue (assuming 10% interest rate)
    const interestRate = 0.1; // 10% interest
    const totalAmount = data?.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0) || 0;
    const revenue = totalAmount * interestRate;
    
    return {
      totalRevenue: revenue.toFixed(2),
      totalAmount: totalAmount.toFixed(2)
    };
  } catch (error) {
    console.error('Error calculating total loan revenue:', error);
    throw error;
  }
}

export async function getMonthlyLoanStats() {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calculate previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Get current month's data
    const { data: currentMonthData, error: currentError } = await supabase
      .from('approved_loans')
      .select('amount, timestamp')
      .gte('timestamp', new Date(currentYear, currentMonth, 1).toISOString())
      .lt('timestamp', new Date(currentYear, currentMonth + 1, 1).toISOString());
    
    if (currentError) throw currentError;
    
    // Get previous month's data
    const { data: prevMonthData, error: prevError } = await supabase
      .from('approved_loans')
      .select('amount, timestamp')
      .gte('timestamp', new Date(prevMonthYear, prevMonth, 1).toISOString())
      .lt('timestamp', new Date(prevMonthYear, prevMonth + 1, 1).toISOString());
    
    if (prevError) throw prevError;
    
    // Calculate totals (assuming 10% interest rate)
    const interestRate = 0.1; // 10% interest
    
    const currentMonthAmount = currentMonthData?.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0) || 0;
    const currentMonthRevenue = currentMonthAmount * interestRate;
    
    const prevMonthAmount = prevMonthData?.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0) || 0;
    const prevMonthRevenue = prevMonthAmount * interestRate;
    
    // Calculate percentage change
    const revenueChange = prevMonthRevenue === 0 
      ? 100 // If previous month was 0, show 100% increase
      : ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    
    const amountChange = prevMonthAmount === 0
      ? 100 // If previous month was 0, show 100% increase
      : ((currentMonthAmount - prevMonthAmount) / prevMonthAmount) * 100;
    
    return {
      currentMonthRevenue: currentMonthRevenue.toFixed(2),
      prevMonthRevenue: prevMonthRevenue.toFixed(2),
      revenueChange: revenueChange.toFixed(1),
      currentMonthAmount: currentMonthAmount.toFixed(2),
      prevMonthAmount: prevMonthAmount.toFixed(2),
      amountChange: amountChange.toFixed(1)
    };
  } catch (error) {
    console.error('Error calculating monthly loan stats:', error);
    throw error;
  }
}

export async function getMonthlyRevenueData() {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get all approved loans for the current year
    const { data, error } = await supabase
      .from('approved_loans')
      .select('amount, timestamp')
      .gte('timestamp', new Date(currentYear, 0, 1).toISOString())
      .lt('timestamp', new Date(currentYear + 1, 0, 1).toISOString());
    
    if (error) throw error;
    
    // Initialize monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = monthNames.map(name => ({ name, total: 0 }));
    
    // Calculate revenue for each month (10% interest)
    const interestRate = 0.1;
    
    data?.forEach(loan => {
      const loanDate = new Date(loan.timestamp);
      const month = loanDate.getMonth();
      const amount = parseFloat(loan.amount || '0');
      const revenue = amount * interestRate;
      
      monthlyData[month].total += revenue;
    });
    
    // Round to 2 decimal places
    monthlyData.forEach(item => {
      item.total = parseFloat(item.total.toFixed(2));
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error calculating monthly revenue data:', error);
    throw error;
  }
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
