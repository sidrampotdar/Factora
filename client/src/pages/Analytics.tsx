import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import { Factory, ProductionLine, Inventory, Workforce } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsProps {
  factory: Factory;
}

const Analytics: React.FC<AnalyticsProps> = ({ factory }) => {
  const factoryId = factory.name;
  const [dateRange, setDateRange] = useState('This Month');
  const [activeTab, setActiveTab] = useState('production');
  
  // Fetch data for analytics
  const { 
    data: productionLines = [], 
    isLoading: productionLoading
  } = useQuery<ProductionLine[]>({ 
    queryKey: [`/api/production/${factoryId}`],
  });
  
  const { 
    data: inventoryItems = [], 
    isLoading: inventoryLoading
  } = useQuery<Inventory[]>({ 
    queryKey: [`/api/inventory/${factoryId}`],
  });
  
  const { 
    data: workforce = [], 
    isLoading: workforceLoading
  } = useQuery<Workforce[]>({ 
    queryKey: [`/api/workforce/${factoryId}`],
  });
  
  // Generate manufacturing trend data (last 7 days)
  const generateTrendData = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      days.push({
        day: dayName,
        production: Math.floor(3500 + Math.random() * 2500),
        efficiency: Math.floor(70 + Math.random() * 30)
      });
    }
    
    return days;
  };
  
  const trendData = generateTrendData();
  
  // Production data for charts
  const productionData = productionLines.map(line => ({
    name: line.name,
    target: line.target,
    completed: line.completed,
    efficiency: line.efficiency
  }));
  
  // Inventory status for pie chart
  const inventoryStatusData = [
    { 
      name: 'Adequate', 
      value: inventoryItems.filter(item => item.status === 'Adequate').length,
      color: '#4CAF50'
    },
    { 
      name: 'Low Stock', 
      value: inventoryItems.filter(item => item.status === 'Low Stock').length,
      color: '#FF9800'
    },
    { 
      name: 'Critical', 
      value: inventoryItems.filter(item => item.status === 'Critical').length,
      color: '#F44336'
    }
  ];
  
  // Workforce attendance data
  const workforceData = workforce.map(dept => ({
    name: dept.department,
    present: dept.present,
    onLeave: dept.onLeave,
    absent: dept.absent
  }));
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
          <p className="text-text-secondary">{formatDate(new Date())}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
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
                <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="Custom Range">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Analytics Tabs */}
      <Tabs defaultValue="production" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="production">Production Analytics</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Analytics</TabsTrigger>
          <TabsTrigger value="workforce">Workforce Analytics</TabsTrigger>
        </TabsList>
        
        {/* Production Analytics */}
        <TabsContent value="production" className="space-y-6">
          {/* Production Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Production Trend</CardTitle>
              <CardDescription>Daily production output and efficiency for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {productionLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" stroke="#1976D2" />
                    <YAxis yAxisId="right" orientation="right" stroke="#FF8F00" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="production" 
                      name="Production (units)"
                      stroke="#1976D2" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="efficiency" 
                      name="Efficiency (%)"
                      stroke="#FF8F00" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Production by Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Production by Line</CardTitle>
              <CardDescription>Target vs. completed units for each production line</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {productionLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="target" name="Target" fill="#1976D2" />
                    <Bar dataKey="completed" name="Completed" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Production Efficiency Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Production Efficiency</CardTitle>
              <CardDescription>Efficiency percentage for each production line</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {productionLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="efficiency" 
                      name="Efficiency (%)" 
                      fill="#FF8F00"
                      label={{ position: 'top', formatter: (value: number) => `${value}%` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Inventory Analytics */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Inventory Status Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status Distribution</CardTitle>
                <CardDescription>Distribution of inventory items by status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {inventoryLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inventoryStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {inventoryStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Stock Level Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Levels</CardTitle>
                <CardDescription>Current stock vs. minimum required</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {inventoryLoading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={inventoryItems.slice(0, 5)} // Show top 5 materials
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="material" type="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="currentStock" name="Current Stock" fill="#1976D2" />
                      <Bar dataKey="minRequired" name="Min Required" fill="#F44336" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Inventory Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory Analysis</CardTitle>
              <CardDescription>Detailed analysis of inventory items</CardDescription>
            </CardHeader>
            <CardContent>
              {inventoryLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-text-secondary uppercase bg-background-light">
                      <tr>
                        <th scope="col" className="px-6 py-3">Material</th>
                        <th scope="col" className="px-6 py-3">Current Stock</th>
                        <th scope="col" className="px-6 py-3">Min Required</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Stock Adequacy (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryItems.map((item) => {
                        const adequacyPercent = Math.round((item.currentStock / item.minRequired) * 100);
                        return (
                          <tr key={item.id} className="bg-white border-b">
                            <td className="px-6 py-4 font-medium">{item.material}</td>
                            <td className="px-6 py-4">{item.currentStock} {item.unit}</td>
                            <td className="px-6 py-4">{item.minRequired} {item.unit}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'Adequate' ? 'bg-success bg-opacity-10 text-success' :
                                item.status === 'Low Stock' ? 'bg-warning bg-opacity-10 text-warning' :
                                'bg-error bg-opacity-10 text-error'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-full bg-background rounded-full h-1.5">
                                <div 
                                  className={`${
                                    adequacyPercent >= 100 ? 'bg-success' :
                                    adequacyPercent >= 50 ? 'bg-warning' :
                                    'bg-error'
                                  } h-1.5 rounded-full`} 
                                  style={{ width: `${Math.min(adequacyPercent, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs mt-1 inline-block">{adequacyPercent}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Workforce Analytics */}
        <TabsContent value="workforce" className="space-y-6">
          {/* Attendance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Workforce Attendance</CardTitle>
              <CardDescription>Attendance breakdown by department</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {workforceLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workforceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" name="Present" stackId="a" fill="#1976D2" />
                    <Bar dataKey="onLeave" name="On Leave" stackId="a" fill="#FF9800" />
                    <Bar dataKey="absent" name="Absent" stackId="a" fill="#F44336" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Attendance Rate Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Rate by Department</CardTitle>
              <CardDescription>Percentage of present employees by department</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {workforceLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={workforceData.map(dept => ({
                      name: dept.name,
                      rate: Math.round((dept.present / (dept.present + dept.onLeave + dept.absent)) * 100)
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="rate" 
                      name="Attendance Rate (%)" 
                      fill="#4CAF50"
                      label={{ position: 'top', formatter: (value: number) => `${value}%` }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          {/* Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Workforce Trend Analysis</CardTitle>
              <CardDescription>Weekly attendance rate trend</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {workforceLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: 'Mon', rate: 90 },
                      { day: 'Tue', rate: 87 },
                      { day: 'Wed', rate: 85 },
                      { day: 'Thu', rate: 88 },
                      { day: 'Fri', rate: 84 },
                      { day: 'Sat', rate: 92 },
                      { day: 'Sun', rate: 95 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      name="Attendance Rate (%)"
                      stroke="#1976D2" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
