
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu, User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';

type HeaderProps = {
  toggleSidebar: () => void;
};

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  if (pathname === '/users') return 'Users';
  if (pathname === '/analytics') return 'Analytics';
  if (pathname === '/reports') return 'Reports';
  if (pathname === '/settings') return 'Settings';
  return pathname.charAt(1).toUpperCase() + pathname.slice(2);
};

const Header = ({ toggleSidebar }: HeaderProps) => {
  const location = useLocation();
  const [pageTitle, setPageTitle] = useState('');
  const [mounted, setMounted] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState('JD');
  
  useEffect(() => {
    setMounted(true);
    setPageTitle(getPageTitle(location.pathname));
    
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
  }, [location.pathname]);

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
              className="h-[190px] w-[190px] object-contain" 
            />
            <h1 className="text-xl font-semibold tracking-tight hidden sm:block">
              {pageTitle}
            </h1>
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  {profileUrl ? (
                    <AvatarImage src={profileUrl} alt="User" />
                  ) : (
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-scale-in">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;
