import React from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  changeValue?: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  chartComponent?: React.ReactNode;
  targetText?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  changeValue,
  icon,
  iconBgColor,
  iconColor,
  chartComponent,
  targetText
}) => {
  const isPositiveChange = changeValue && changeValue > 0;
  const changeClass = isPositiveChange ? 'text-success' : 'text-error';
  const changeIcon = isPositiveChange ? 'arrow_upward' : 'arrow_downward';
  
  return (
    <div className="dashboard-card">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="stats-label">{title}</p>
          <div className="flex items-end">
            <h3 className="stats-value">{value}</h3>
            {changeValue && (
              <span className={cn("ml-2 text-xs flex items-center font-medium", changeClass)}>
                <span className="material-icons text-sm">{changeIcon}</span>
                {Math.abs(changeValue)}%
              </span>
            )}
          </div>
        </div>
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm", iconBgColor)}>
          <span className={cn("material-icons", iconColor)}>{icon}</span>
        </div>
      </div>
      
      {chartComponent}
      
      {targetText && (
        <p className="text-muted-foreground text-xs mt-2">{targetText}</p>
      )}
    </div>
  );
};

export default KPICard;
