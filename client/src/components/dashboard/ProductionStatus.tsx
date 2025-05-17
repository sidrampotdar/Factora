import React, { useState } from 'react';
import { getStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductionLine } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductionStatusProps {
  productionLines: ProductionLine[];
  onRefresh: () => void;
  isLoading?: boolean;
}

const ProductionStatus: React.FC<ProductionStatusProps> = ({ productionLines, onRefresh, isLoading = false }) => {
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
          <h3 className="font-semibold text-lg">Production Status</h3>
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
                <th className="pb-2 font-medium">Line</th>
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Target</th>
                <th className="pb-2 font-medium">Completed</th>
                <th className="pb-2 font-medium">Efficiency</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-t border-background">
                  <td className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-14" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-14" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-6 w-16 rounded-full" />
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
        <h3 className="gradient-heading font-semibold text-lg">Production Status</h3>
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
        <table className="min-w-full" id="productionTable">
          <thead>
            <tr className="text-left text-muted-foreground text-sm">
              <th className="pb-2 font-medium">Line</th>
              <th className="pb-2 font-medium">Product</th>
              <th className="pb-2 font-medium">Target</th>
              <th className="pb-2 font-medium">Completed</th>
              <th className="pb-2 font-medium">Efficiency</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {productionLines.map((line) => {
              const statusColors = getStatusColor(line.status);
              return (
                <tr key={line.id} className="border-t border-muted hover:bg-muted/20 transition-colors">
                  <td className="py-3 font-medium">{line.name}</td>
                  <td className="py-3">{line.product}</td>
                  <td className="py-3">{line.target.toLocaleString()}</td>
                  <td className="py-3">{line.completed.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center">
                      <div className="w-16 bg-muted rounded-full h-2 mr-2">
                        <div 
                          className={`${line.efficiency >= 70 ? 'bg-success' : line.efficiency >= 50 ? 'bg-warning' : 'bg-destructive'} h-2 rounded-full shadow-sm`} 
                          style={{ width: `${line.efficiency}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{line.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} shadow-sm`}>
                      {line.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionStatus;
