
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

type SidebarProps = {
  isMobile: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
};

const Sidebar = ({ isMobile, isOpen, toggleSidebar }: SidebarProps) => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('User');
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    // Fetch user name when component mounts
    const fetchUserName = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users_account')
          .select('full_names')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setUserName(data.full_names || 'User');
        }
      }
    };
    
    fetchUserName();
  }, [user]);

  if (!mounted) return null;

  // Sidebar links configuration
  const sidebarLinks = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
    { path: '/reports', icon: <FileText size={20} />, label: 'Reports' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  // Render collapsed or mobile sidebar
  if (!isOpen) {
    return (
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-16 flex flex-col bg-sidebar py-4 border-r border-sidebar-border",
        "bg-sidebar transition-all duration-300 ease-in-out",
        isMobile && "hidden"
      )}>
        <div className="flex items-center justify-center h-16 mb-4">
          <button 
            onClick={toggleSidebar} 
            className="rounded-md p-2 hover:bg-sidebar-accent/80 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-sidebar-foreground" />
          </button>
        </div>
        
        <nav className="flex-grow px-2 space-y-2">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "sidebar-item justify-center py-3",
                isActive && "active"
              )}
            >
              {link.icon}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pt-2 mt-auto">
          <button className="sidebar-item justify-center py-3 w-full text-sidebar-foreground/70 hover:text-destructive">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar py-4 border-r border-sidebar-border",
        "transition-all duration-300 ease-in-out",
        isMobile && "animate-slide-in-left",
        !isMobile && "animate-fade-in"
      )}>
        <div className="flex items-center justify-between h-16 px-4 mb-4">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-sidebar-foreground">{userName}</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="rounded-md p-1.5 hover:bg-sidebar-accent/80 transition-colors"
          >
            {isMobile ? (
              <Menu className="h-5 w-5 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="h-5 w-5 text-sidebar-foreground" />
            )}
          </button>
        </div>
        
        <nav className="flex-grow px-3 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => cn(
                "sidebar-item",
                isActive && "active"
              )}
            >
              {link.icon}
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pt-2 mt-auto border-t border-sidebar-border/50">
          <button className="sidebar-item w-full text-sidebar-foreground/70 hover:text-destructive">
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
