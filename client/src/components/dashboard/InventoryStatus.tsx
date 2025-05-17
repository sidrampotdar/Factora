import React, { useState } from 'react';
import { getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Inventory } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface InventoryStatusProps {
  inventoryItems: Inventory[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const InventoryStatus: React.FC<InventoryStatusProps> = ({ inventoryItems, onRefresh, isLoading = false }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Inventory Status</h3>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" disabled>
              <span className="material-icons">refresh</span>
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <span className="material-icons">more_vert</span>
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-text-secondary text-sm">
                <th className="pb-2 font-medium">Material</th>
                <th className="pb-2 font-medium">Current Stock</th>
                <th className="pb-2 font-medium">Min. Required</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Next Delivery</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-t border-background">
                  <td className="py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="gradient-heading font-semibold text-lg">Inventory Status</h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-primary hover:bg-primary/10"
          >
            {refreshing ? (
              <div className="h-5 w-5 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
            ) : (
              <span className="material-icons">refresh</span>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
            <span className="material-icons">more_vert</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full" id="inventoryTable">
          <thead>
            <tr className="text-left text-muted-foreground text-sm">
              <th className="pb-2 font-medium">Material</th>
              <th className="pb-2 font-medium">Current Stock</th>
              <th className="pb-2 font-medium">Min. Required</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Next Delivery</th>
            </tr>
          </thead>
          <tbody>
            {inventoryItems.map((item) => {
              const statusColors = getStatusColor(item.status);
              return (
                <tr key={item.id} className="border-t border-muted hover:bg-muted/20 transition-colors">
                  <td className="py-3 font-medium">{item.material}</td>
                  <td className="py-3">
                    <span className="font-medium">{item.currentStock}</span> {item.unit}
                  </td>
                  <td className="py-3">{item.minRequired} {item.unit}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} shadow-sm`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3">{item.nextDelivery}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryStatus;
