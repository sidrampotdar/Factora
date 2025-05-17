import React from 'react';
import { Button } from '@/components/ui/button';
import { exportTableToCSV } from '@/lib/utils';

interface QuickAction {
  icon: string;
  label: string;
  onClick: () => void;
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const defaultActions: QuickAction[] = [
    {
      icon: 'assignment',
      label: 'Create Report',
      onClick: () => alert('Create report functionality')
    },
    {
      icon: 'inventory_2',
      label: 'Inventory Check',
      onClick: () => alert('Inventory check functionality')
    },
    {
      icon: 'add_task',
      label: 'Add Task',
      onClick: () => alert('Add task functionality')
    },
    {
      icon: 'download',
      label: 'Export Data',
      onClick: () => exportTableToCSV('productionTable', 'production_data.csv')
    }
  ];
  
  const quickActions = actions || defaultActions;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto border border-background rounded-md hover:bg-background-light transition-colors"
            onClick={action.onClick}
          >
            <span className="material-icons text-primary mb-1">{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
