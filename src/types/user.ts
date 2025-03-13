
export interface SupabaseUser {
  id: string;
  email: string;
  full_names: string;
  gender: string;
  home_address: string | null;
  cellphone: string | null;
  user_number: string | null;
  role: number;
  created_at: string;
  profile_picture: string | null;
  confirmed: boolean; // This is the actual column name in the database
  confirmed_email?: boolean; // Keep for backward compatibility 
  active?: boolean; // Keep for backward compatibility
  date_of_birth: string | null;
}

export type UserRole = 'Admin' | 'Editor' | 'User';

export function mapRoleNumberToString(role: number): UserRole {
  switch (role) {
    case 1:
      return 'Admin';
    case 2:
      return 'Editor';
    default:
      return 'User';
  }
}
