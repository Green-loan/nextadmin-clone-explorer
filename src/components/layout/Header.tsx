
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/hooks/use-auth";
import { Link } from 'react-router-dom';
import UserNav from './UserNav';

type HeaderProps = {
  toggleSidebar: () => void;
};

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [mounted, setMounted] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('JD');
  
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    setMounted(true);
    
    // Get current user
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.id) {
        // Fetch user details
        const { data } = await supabase
          .from('users_account')
          .select('full_names, profile_picture')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          if (data.profile_picture) {
            setProfileUrl(data.profile_picture);
          }
          
          if (data.full_names) {
            const initials = data.full_names
              .split(' ')
              .map(name => name[0])
              .join('')
              .toUpperCase()
              .substring(0, 2);
            
            setUserInitials(initials);
          }
        }
      }
    };
    
    getCurrentUser();
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/a2ba7d49-d862-44f2-ba79-09dfd459d0dd.png" 
              alt="Green Finance Logo" 
              className="h-[95px] w-[95px] object-contain" 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] lg:w-[280px] pl-8 bg-background"
            />
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            <span className="sr-only">Notifications</span>
          </Button>
          
          <UserNav />
        </div>
      </div>
    </header>
  );
}

export default Header;
