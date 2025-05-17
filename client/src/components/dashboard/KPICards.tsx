import React from 'react';
import KPICard from './KPICard';

interface KPICardsProps {
  metrics: {
    productionEfficiency: number;
    activeLines: string;
    todaysOutput: number;
    attendance: string;
    attendanceRate: number;
  };
  isLoading?: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({ metrics, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-5 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="w-1/2">
                <div className="h-4 bg-background rounded mb-2"></div>
                <div className="h-6 bg-background rounded w-3/4"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-background"></div>
            </div>
            <div className="h-4 bg-background rounded mt-4 w-full"></div>
          </div>
        ))}
      </div>
    );
  }
  
  // Parse active lines numbers
  const [active, total] = metrics.activeLines.split('/').map(Number);
  
  // Production Efficiency Card
  const efficiencyChart = (
    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
      <div className="bg-primary h-full" style={{ width: `${metrics.productionEfficiency}%` }}></div>
    </div>
  );
  
  // Active Production Lines Card
  const activeLinesDots = (
    <div className="grid grid-cols-6 gap-1">
      {Array.from({ length: Number(total) }).map((_, i) => (
        <div 
          key={i} 
          className={`h-2 rounded-full ${i < active ? 'bg-success' : 'bg-background'}`}
        ></div>
      ))}
    </div>
  );
  
  // Today's Output Card
  const outputChart = (
    <div className="flex w-full items-end space-x-1 h-8">
      {Array.from({ length: 7 }).map((_, i) => {
        const heights = ['h-2/5', 'h-3/5', 'h-1/2', 'h-2/3', 'h-1/2', 'h-4/5', 'h-full'];
        return (
          <div 
            key={i} 
            className={`w-full ${i === 6 ? 'bg-secondary' : 'bg-secondary bg-opacity-20'} rounded-sm ${heights[i]}`}
          ></div>
        );
      })}
    </div>
  );
  
  // Workforce Attendance Card
  const attendanceChart = (
    <div className="w-full bg-background rounded-full h-2 overflow-hidden">
      <div className="bg-info h-full" style={{ width: `${metrics.attendanceRate}%` }}></div>
    </div>
  );
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <KPICard
        title="Production Efficiency"
        value={`${metrics.productionEfficiency}%`}
        changeValue={3.1}
        icon="speed"
        iconBgColor="bg-primary-light bg-opacity-20"
        iconColor="text-primary"
        chartComponent={efficiencyChart}
        targetText="Target: 90%"
      />
      
      <KPICard
        title="Active Production Lines"
        value={metrics.activeLines}
        icon="memory"
        iconBgColor="bg-success bg-opacity-20"
        iconColor="text-success"
        chartComponent={activeLinesDots}
      />
      
      <KPICard
        title="Today's Output"
        value={metrics.todaysOutput.toLocaleString()}
        changeValue={12}
        icon="inventory"
        iconBgColor="bg-secondary bg-opacity-20"
        iconColor="text-secondary"
        chartComponent={outputChart}
        targetText="Target: 6,000 units"
      />
      
      <KPICard
        title="Workforce Attendance"
        value={metrics.attendance}
        changeValue={-2}
        icon="people"
        iconBgColor="bg-info bg-opacity-20"
        iconColor="text-info"
        chartComponent={attendanceChart}
        targetText={`Attendance rate: ${metrics.attendanceRate}%`}
      />
    </div>
  );
};

export default KPICards;
