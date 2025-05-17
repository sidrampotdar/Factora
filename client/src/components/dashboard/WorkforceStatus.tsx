import React from 'react';
import { Button } from '@/components/ui/button';
import { Workforce } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkforceStatusProps {
  departments: Workforce[];
  isLoading?: boolean;
}

const WorkforceStatus: React.FC<WorkforceStatusProps> = ({ departments, isLoading = false }) => {
  // Calculate totals
  const getTotals = () => {
    const present = departments.reduce((sum, dept) => sum + dept.present, 0);
    const onLeave = departments.reduce((sum, dept) => sum + dept.onLeave, 0);
    const absent = departments.reduce((sum, dept) => sum + dept.absent, 0);
    const total = departments.reduce((sum, dept) => sum + dept.total, 0);
    
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, onLeave, absent, total, attendanceRate };
  };
  
  const totals = getTotals();
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Workforce Status</h3>
          <Button variant="ghost" size="icon" disabled>
            <span className="material-icons">more_vert</span>
          </Button>
        </div>
        
        <div className="flex justify-between mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-8 w-10 mx-auto mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          ))}
        </div>
        
        <div className="relative h-48 flex items-center justify-center mb-4">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-1.5 w-full mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="gradient-heading font-semibold text-lg">Workforce Status</h3>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted">
          <span className="material-icons">more_vert</span>
        </Button>
      </div>
      
      <div className="flex justify-between mb-6">
        <div className="text-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
          <div className="text-3xl font-semibold text-primary">{totals.present}</div>
          <div className="text-sm text-muted-foreground">Present</div>
        </div>
        <div className="text-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
          <div className="text-3xl font-semibold text-warning">{totals.onLeave}</div>
          <div className="text-sm text-muted-foreground">On Leave</div>
        </div>
        <div className="text-center p-2 rounded-lg hover:bg-muted/20 transition-colors">
          <div className="text-3xl font-semibold text-destructive">{totals.absent}</div>
          <div className="text-sm text-muted-foreground">Absent</div>
        </div>
      </div>
      
      <div className="relative h-48 flex items-center justify-center mb-6">
        <div className="relative w-40 h-40 rounded-full border-8 border-muted flex items-center justify-center shadow-sm">
          <div className="relative text-center z-10">
            <div className="text-3xl font-bold">{totals.attendanceRate}%</div>
            <div className="text-xs text-muted-foreground">Attendance Rate</div>
          </div>
          <svg className="absolute inset-0" width="160" height="160" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="16"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="16"
              strokeDasharray={2 * Math.PI * 70}
              strokeDashoffset={2 * Math.PI * 70 * (1 - totals.attendanceRate / 100)}
              transform="rotate(-90 80 80)"
              className="drop-shadow"
            />
          </svg>
        </div>
      </div>
      
      <div className="space-y-3">
        {departments.map((dept) => (
          <div key={dept.id}>
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium">{dept.department}</div>
              <div className="text-sm font-medium">
                <span className="text-primary">{dept.present}</span>
                <span className="text-muted-foreground">/{dept.total}</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-sm">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(dept.present / dept.total) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkforceStatus;
