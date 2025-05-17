import React, { useState } from 'react';
import { useLocation } from 'wouter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Factory } from '@shared/schema';

interface TopNavBarProps {
  toggleSidebar: () => void;
  factories: Factory[];
  currentFactory: Factory;
  onFactoryChange: (factory: Factory) => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ 
  toggleSidebar, 
  factories, 
  currentFactory,
  onFactoryChange
}) => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('Today');
  
  // Generate page title based on current route
  const getPageTitle = () => {
    switch (location) {
      case '/':
        return 'Dashboard';
      case '/production':
        return 'Production';
      case '/inventory':
        return 'Inventory';
      case '/workforce':
        return 'Workforce';
      case '/analytics':
        return 'Analytics';
      default:
        return 'Dashboard';
    }
  };
  
  const pageTitle = getPageTitle();
  
  const dateRangeOptions = [
    'Today',
    'Last 7 days',
    'This month',
    'Custom range'
  ];
  
  return (
    <div className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button 
            onClick={toggleSidebar}
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-md hover:bg-background"
          >
            <span className="material-icons">menu</span>
          </button>
          
          {/* Page title */}
          <div className="md:hidden flex-1 text-center">
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="flex items-center h-10 px-3 py-1 bg-background-light rounded-md">
                <span className="material-icons text-text-secondary text-lg">search</span>
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="ml-2 bg-transparent border-none text-sm focus:outline-none w-32 md:w-auto" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-background">
                    <span className="material-icons">notifications_none</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View all notifications</DropdownMenuItem>
                  <DropdownMenuItem>Mark all as read</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-background">
                    <span className="material-icons">download</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Print report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-background">
                    <span className="material-icons">more_vert</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Help Center</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavBar;
