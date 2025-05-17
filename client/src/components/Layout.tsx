import React, { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';
import { Factory } from '@shared/schema';

interface LayoutProps {
  children: ReactNode;
  user: {
    name: string;
    role: string;
    factory: string;
  };
  factories: Factory[];
  currentFactory: Factory;
  setCurrentFactory: (factory: Factory) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  factories,
  currentFactory,
  setCurrentFactory
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar 
        user={user}
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
      />
      
      <div className="flex-1 md:ml-64">
        <TopNavBar 
          toggleSidebar={toggleSidebar}
          factories={factories} 
          currentFactory={currentFactory}
          onFactoryChange={setCurrentFactory}
        />
        
        <div 
          className="min-h-[calc(100vh-4rem)]"
          onClick={() => {
            if (isSidebarOpen && window.innerWidth < 768) {
              closeSidebar();
            }
          }}
        >
          {children}
        </div>
        
        {/* Footer */}
        <div className="bg-white border-t border-background mt-6">
          <div className="container mx-auto py-4 px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="text-text-secondary text-sm mb-2 md:mb-0">
                © {new Date().getFullYear()} Factora | Manufacturing Dashboard v1.2.0
              </div>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-text-secondary text-sm hover:text-primary">Help Center</a>
                <a href="#" className="text-text-secondary text-sm hover:text-primary">Documentation</a>
                <a href="#" className="text-text-secondary text-sm hover:text-primary">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
