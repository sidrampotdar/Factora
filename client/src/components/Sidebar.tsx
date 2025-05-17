import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    role: string;
    factory: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user }) => {
  const [location] = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/production', label: 'Production', icon: 'sync' },
    { path: '/inventory', label: 'Inventory', icon: 'inventory_2' },
    { path: '/workforce', label: 'Workforce', icon: 'group' },
    { path: '/analytics', label: 'Analytics', icon: 'insert_chart' },
  ];
  
  const settingsItems = [
    { path: '/settings', label: 'Preferences', icon: 'settings' },
    { path: '/help', label: 'Help & Support', icon: 'help' },
  ];
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <div
      id="sidebar"
      className={cn(
        "fixed h-full w-64 bg-white shadow-lg z-10 transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      {/* Logo and App Name */}
      <div className="p-4 border-b border-background">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-md bg-primary">
            <span className="material-icons text-white">precision_manufacturing</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Factora</h1>
            <p className="text-xs text-text-secondary">Manufacturing Dashboard</p>
          </div>
        </div>
      </div>
      
      {/* User Profile Summary */}
      <div className="p-4 border-b border-background">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white font-medium flex items-center justify-center">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">{user.name}</p>
            <div className="flex items-center">
              <span className="text-xs py-0.5 px-2 bg-primary-light text-white rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="p-4">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">Main Menu</p>
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link href={item.path}>
                <a 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive(item.path) 
                      ? "bg-secondery-light text-black" 
                      : "text-text-primary hover:bg-background"
                  )}
                >
                  <span className="material-icons text-sm mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mt-6 mb-2">Settings</p>
        <ul>
          {settingsItems.map((item) => (
            <li key={item.path} className="mb-1">
              <Link href={item.path}>
                <a 
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive(item.path) 
                      ? "bg-secondery-light text-black" 
                      : "text-text-primary hover:bg-background"
                  )}
                >
                  <span className="material-icons text-sm mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
