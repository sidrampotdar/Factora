import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('en-IN', options);
}

export function getStatusColor(status: string): {bg: string, text: string} {
  switch(status.toLowerCase()) {
    case 'active':
    case 'adequate':
    case 'completed':
    case 'present':
      return { bg: 'bg-success bg-opacity-10', text: 'text-success' };
    case 'delayed':
    case 'low stock':
    case 'on leave':
      return { bg: 'bg-warning bg-opacity-10', text: 'text-warning' };
    case 'maintenance':
    case 'critical':
    case 'absent':
      return { bg: 'bg-error bg-opacity-10', text: 'text-error' };
    default:
      return { bg: 'bg-info bg-opacity-10', text: 'text-info' };
  }
}

export function getAlertIcon(type: string): string {
  switch(type.toLowerCase()) {
    case 'error':
      return 'priority_high';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return 'info';
  }
}

export function getAlertIconColor(type: string): string {
  switch(type.toLowerCase()) {
    case 'error':
      return 'text-error';
    case 'warning':
      return 'text-warning';
    case 'info':
      return 'text-info';
    default:
      return 'text-info';
  }
}

export function getAlertIconBg(type: string): string {
  switch(type.toLowerCase()) {
    case 'error':
      return 'bg-error bg-opacity-20';
    case 'warning':
      return 'bg-warning bg-opacity-20';
    case 'info':
      return 'bg-info bg-opacity-20';
    default:
      return 'bg-info bg-opacity-20';
  }
}

export function exportTableToCSV(tableId: string, filename: string) {
  const table = document.getElementById(tableId);
  if (!table) return;
  
  const rows = table.querySelectorAll('tr');
  let csv = [];
  
  for (let i = 0; i < rows.length; i++) {
    const row = [], cols = rows[i].querySelectorAll('td, th');
    
    for (let j = 0; j < cols.length; j++) {
      let data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ');
      data = data.replace(/"/g, '""');
      row.push('"' + data + '"');
    }
    
    csv.push(row.join(','));
  }
  
  const csvData = csv.join('\n');
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  link.click();
}
