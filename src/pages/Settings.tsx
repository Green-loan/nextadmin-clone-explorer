import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import DataTable from '@/components/ui/DataTable';
import { formatDistanceToNow } from 'date-fns';

type UserSettings = {
  theme: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  language: string;
};

type UserLog = {
  id: string;
  action: string;
  description: string;
  ip_address: string;
  device_info: string;
  created_at: string;
};

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    full_names: '',
    email: '',
    phone: '',
    id_number: '',
    home_address: '',
  });
  const [userSettings, setUserSettings] = useState<UserSettings>({
    theme: 'light',
    email_notifications: true,
    sms_notifications: false,
    language: 'en',
  });
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchUserLogs();
      
      // Log this settings visit
      logUserAction('SETTINGS_VIEW', 'User viewed settings page');
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('users_account')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      if (profileData) {
        setUserProfile({
          full_names: profileData.full_names || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          id_number: profileData.id_number || '',
          home_address: profileData.home_address || '',
        });
      }
      
      // Fetch user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - this is ok for new users
        throw settingsError;
      }
      
      if (settingsData) {
        setUserSettings({
          theme: settingsData.theme || 'light',
          email_notifications: settingsData.email_notifications ?? true,
          sms_notifications: settingsData.sms_notifications ?? false,
          language: settingsData.language || 'en',
        });
      } else {
        // Create default settings for new user
        await supabase.from('user_settings').insert({
          user_id: user.id,
          theme: 'light',
          email_notifications: true,
          sms_notifications: false,
          language: 'en',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    }
  };

  const fetchUserLogs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setUserLogs(data || []);
    } catch (error) {
      console.error('Error fetching user logs:', error);
    }
  };

  const logUserAction = async (action: string, description: string) => {
    if (!user) return;
    
    try {
      await supabase.from('user_logs').insert({
        user_id: user.id,
        action,
        description,
        ip_address: 'Unknown', // In a real app, you'd capture this
        device_info: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('users_account')
        .update({
          full_names: userProfile.full_names,
          phone: userProfile.phone,
          id_number: userProfile.id_number,
          home_address: userProfile.home_address,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await logUserAction('PROFILE_UPDATE', 'User updated their profile information');
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          email_notifications: userSettings.email_notifications,
          sms_notifications: userSettings.sms_notifications,
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await logUserAction('SETTINGS_UPDATE', 'User updated notification preferences');
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For password changes, you'd typically use Supabase auth.updateUser
      // This is just a placeholder for demonstration
      await logUserAction('PASSWORD_UPDATE', 'User updated their password');
      toast.success('Security settings updated');
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast.error('Failed to update security settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Log table columns
  const logColumns = [
    {
      accessorKey: 'action' as keyof UserLog,
      header: 'Action',
      cell: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      accessorKey: 'description' as keyof UserLog,
      header: 'Description',
    },
    {
      accessorKey: 'created_at' as keyof UserLog,
      header: 'Time',
      cell: (value: string) => (
        <span>{formatDistanceToNow(new Date(value), { addSuffix: true })}</span>
      ),
    },
    {
      accessorKey: 'ip_address' as keyof UserLog,
      header: 'IP Address',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="animate-fade-in">
              <form onSubmit={handleSaveProfile}>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullNames">Full Name</Label>
                    <Input
                      id="fullNames"
                      value={userProfile.full_names}
                      onChange={(e) => setUserProfile({...userProfile, full_names: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={userProfile.phone || ''}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idNumber">ID Number</Label>
                      <Input
                        id="idNumber"
                        value={userProfile.id_number || ''}
                        onChange={(e) => setUserProfile({...userProfile, id_number: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Home Address</Label>
                    <Input
                      id="address"
                      value={userProfile.home_address || ''}
                      onChange={(e) => setUserProfile({...userProfile, home_address: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="animate-fade-in">
              <form onSubmit={handleSaveNotifications}>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium leading-none">Email Notifications</h3>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Account activity</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive emails about your account activity and security.
                        </p>
                      </div>
                      <Switch 
                        checked={userSettings.email_notifications}
                        onCheckedChange={(checked) => 
                          setUserSettings({...userSettings, email_notifications: checked})
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium leading-none">SMS Notifications</h3>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS alerts</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive SMS notifications for important account updates.
                        </p>
                      </div>
                      <Switch 
                        checked={userSettings.sms_notifications}
                        onCheckedChange={(checked) => 
                          setUserSettings({...userSettings, sms_notifications: checked})
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save preferences'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="animate-fade-in">
              <form onSubmit={handleSaveSecurity}>
                <CardHeader>
                  <CardTitle>Password Change</CardTitle>
                  <CardDescription>
                    Update your password to maintain security.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Update password'}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="animate-fade-in animation-delay-200">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-factor authentication</Label>
                    <p className="text-xs text-muted-foreground">
                      Protect your account with an extra security layer.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
                <CardDescription>
                  Review your recent account activity and security events.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={userLogs}
                  columns={logColumns}
                  searchable={true}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
