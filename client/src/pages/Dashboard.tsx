import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import KPICards from '@/components/dashboard/KPICards';
import ProductionStatus from '@/components/dashboard/ProductionStatus';
import InventoryStatus from '@/components/dashboard/InventoryStatus';
import WorkforceStatus from '@/components/dashboard/WorkforceStatus';
import AlertsSection from '@/components/dashboard/AlertsSection';
import QuickActions from '@/components/dashboard/QuickActions';
import { Factory, DashboardMetrics, ProductionLine, Inventory, Workforce, Alert } from '@shared/schema';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DashboardProps {
  factory: Factory;
}

const Dashboard: React.FC<DashboardProps> = ({ factory }) => {
  const queryClient = useQueryClient();
  const factoryId = factory.name;
  const [dateRange, setDateRange] = useState('Today');
  
  // Set up periodic data refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('Refreshing dashboard data...');
      queryClient.invalidateQueries({ queryKey: [`/api/production/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/workforce/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/alerts/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${factoryId}`] });
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, [factoryId, queryClient]);
  
  // Fetch dashboard metrics
  const { 
    data: metrics, 
    isLoading: metricsLoading,
    refetch: refetchMetrics 
  } = useQuery<DashboardMetrics>({ 
    queryKey: [`/api/dashboard/${factoryId}`],
  });
  
  // Fetch production lines
  const { 
    data: productionLines = [], 
    isLoading: productionLoading,
    refetch: refetchProduction 
  } = useQuery<ProductionLine[]>({ 
    queryKey: [`/api/production/${factoryId}`],
  });
  
  // Fetch inventory items
  const { 
    data: inventoryItems = [], 
    isLoading: inventoryLoading,
    refetch: refetchInventory 
  } = useQuery<Inventory[]>({ 
    queryKey: [`/api/inventory/${factoryId}`],
  });
  
  // Fetch workforce data
  const { 
    data: workforce = [], 
    isLoading: workforceLoading,
    refetch: refetchWorkforce 
  } = useQuery<Workforce[]>({ 
    queryKey: [`/api/workforce/${factoryId}`],
  });
  
  // Fetch alerts
  const { 
    data: alerts = [], 
    isLoading: alertsLoading
  } = useQuery<Alert[]>({ 
    queryKey: [`/api/alerts/${factoryId}`],
  });
  
  // Filter alerts to show only the most recent 4
  const recentAlerts = alerts.slice(0, 4);
  
  const handleRefreshProduction = async () => {
    await refetchProduction();
    await refetchMetrics();
  };
  
  const handleRefreshInventory = async () => {
    await refetchInventory();
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Date and Factory Selector */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Welcome back, Sanjay</h2>
          <p className="text-text-secondary">
            {formatDate(new Date())} · 
            <span className="inline-flex items-center">
              <span className="h-2 w-2 rounded-full bg-success mr-1"></span>
              Online
            </span>
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Factory selector is handled in the main app layout */}
          
          {/* Date range selector */}
          <div className="flex items-center space-x-2 bg-white rounded-md border border-background px-3 py-2">
            <span className="material-icons text-text-secondary">calendar_today</span>
            <Select
              value={dateRange}
              onValueChange={(value) => setDateRange(value)}
            >
              <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-sm shadow-none focus:ring-0 w-auto">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="Last 7 days">Last 7 days</SelectItem>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="Custom range">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <KPICards 
        metrics={metrics || {
          productionEfficiency: 0,
          activeLines: '0/0',
          todaysOutput: 0,
          attendance: '0/0',
          attendanceRate: 0
        }} 
        isLoading={metricsLoading}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Production Status and Inventory Status Sections (2 columns) */}
        <div className="xl:col-span-2 space-y-6">
          <ProductionStatus 
            productionLines={productionLines} 
            onRefresh={handleRefreshProduction}
            isLoading={productionLoading}
          />
          
          <InventoryStatus 
            inventoryItems={inventoryItems} 
            onRefresh={handleRefreshInventory}
            isLoading={inventoryLoading}
          />
        </div>
        
        {/* Sidebar content (1 column) */}
        <div className="space-y-6">
          <WorkforceStatus 
            departments={workforce}
            isLoading={workforceLoading}
          />
          
          <AlertsSection 
            alerts={recentAlerts}
            onViewAll={() => console.log('View all alerts')}
            isLoading={alertsLoading}
          />
          
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
