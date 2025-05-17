import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { getAlertIcon, getAlertIconBg, getAlertIconColor } from '@/lib/utils';

interface AlertsSectionProps {
  alerts: Alert[];
  onViewAll: () => void;
  isLoading?: boolean;
}

const AlertsSection: React.FC<AlertsSectionProps> = ({ alerts, onViewAll, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Alerts & Notifications</h3>
          <Button variant="ghost" size="icon" disabled>
            <span className="material-icons">notifications_none</span>
          </Button>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 pb-4 border-b border-background">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button variant="link" className="text-primary" disabled>View all notifications</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="gradient-heading font-semibold text-lg">Alerts & Notifications</h3>
        <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
          <span className="material-icons">notifications_none</span>
        </Button>
      </div>
      
      <div className="space-y-4">
        {alerts.map((alert) => {
          const iconName = getAlertIcon(alert.type);
          const iconColor = getAlertIconColor(alert.type);
          const iconBg = getAlertIconBg(alert.type);
          
          return (
            <div key={alert.id} className="flex items-start space-x-3 pb-4 border-b border-muted">
              <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
                <span className={`material-icons ${iconColor} text-sm`}>{iconName}</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-sm">{alert.title}</h4>
                  <span className={`alert-badge-${alert.type.toLowerCase()}`}>{alert.type}</span>
                </div>
                <p className="text-muted-foreground text-sm">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-center">
        <Button variant="link" className="text-primary hover:text-primary/80" onClick={onViewAll}>
          View all notifications
        </Button>
      </div>
    </div>
  );
};

export default AlertsSection;
