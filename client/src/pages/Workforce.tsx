import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, exportTableToCSV } from '@/lib/utils';
import { Factory, Workforce as WorkforceType } from '@shared/schema';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

interface WorkforceProps {
  factory: Factory;
}

const WorkforcePage: React.FC<WorkforceProps> = ({ factory }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const factoryId = factory.name;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    department: '',
    total: 0,
    present: 0,
    onLeave: 0,
    absent: 0,
  });
  
  // Fetch workforce departments
  const { 
    data: departments = [], 
    isLoading
  } = useQuery<WorkforceType[]>({ 
    queryKey: [`/api/workforce/${factoryId}`],
  });
  
  // Add department mutation
  const addDepartment = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/workforce', {
        ...data,
        factoryId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workforce/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${factoryId}`] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Department Added",
        description: "The department has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update department mutation
  const updateDepartment = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<WorkforceType> }) => {
      return apiRequest('PATCH', `/api/workforce/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workforce/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${factoryId}`] });
      toast({
        title: "Department Updated",
        description: "The department data has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setFormData({
      department: '',
      total: 0,
      present: 0,
      onLeave: 0,
      absent: 0,
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that numbers add up
    const { total, present, onLeave, absent } = formData;
    if (present + onLeave + absent !== total) {
      toast({
        title: "Validation Error",
        description: "The sum of present, on leave, and absent must equal the total employees.",
        variant: "destructive",
      });
      return;
    }
    
    addDepartment.mutate(formData);
  };
  
  const handleExportData = () => {
    exportTableToCSV('workforceTable', 'workforce_attendance.csv');
  };
  
  const handleUpdateAttendance = (id: number, field: 'present' | 'onLeave' | 'absent', value: number) => {
    const department = departments.find(dept => dept.id === id);
    if (!department) return;
    
    // Calculate the other fields to maintain total
    const total = department.total;
    const updates: Partial<WorkforceType> = { [field]: value };
    
    if (field === 'present') {
      // Keep on leave the same, adjust absent
      const onLeave = department.onLeave;
      const newAbsent = Math.max(0, total - value - onLeave);
      updates.absent = newAbsent;
    } else if (field === 'onLeave') {
      // Keep present the same, adjust absent
      const present = department.present;
      const newAbsent = Math.max(0, total - present - value);
      updates.absent = newAbsent;
    } else if (field === 'absent') {
      // Keep on leave the same, adjust present
      const onLeave = department.onLeave;
      const newPresent = Math.max(0, total - onLeave - value);
      updates.present = newPresent;
    }
    
    updateDepartment.mutate({
      id,
      data: updates
    });
  };
  
  // Calculate workforce statistics
  const totalEmployees = departments.reduce((sum, dept) => sum + dept.total, 0);
  const totalPresent = departments.reduce((sum, dept) => sum + dept.present, 0);
  const totalOnLeave = departments.reduce((sum, dept) => sum + dept.onLeave, 0);
  const totalAbsent = departments.reduce((sum, dept) => sum + dept.absent, 0);
  
  const attendanceRate = totalEmployees > 0 ? Math.round((totalPresent / totalEmployees) * 100) : 0;
  
  // Prepare pie chart data
  const attendanceData = [
    { name: 'Present', value: totalPresent, color: '#1976D2' },
    { name: 'On Leave', value: totalOnLeave, color: '#FF9800' },
    { name: 'Absent', value: totalAbsent, color: '#F44336' },
  ];
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Workforce Management</h2>
          <p className="text-text-secondary">{formatDate(new Date())}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button onClick={handleExportData}>
            <span className="material-icons mr-2">download</span>
            Export Data
          </Button>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <span className="material-icons mr-2">add</span>
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Add a new department to track workforce attendance.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="department" className="text-sm font-medium">Department Name</label>
                    <Input 
                      id="department" 
                      value={formData.department}
                      onChange={e => setFormData({...formData, department: e.target.value})}
                      placeholder="e.g. Production Floor"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="total" className="text-sm font-medium">Total Employees</label>
                    <Input 
                      id="total" 
                      type="number"
                      value={formData.total || ''}
                      onChange={e => setFormData({...formData, total: Number(e.target.value)})}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="present" className="text-sm font-medium">Present</label>
                      <Input 
                        id="present" 
                        type="number"
                        value={formData.present || ''}
                        onChange={e => setFormData({...formData, present: Number(e.target.value)})}
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="onLeave" className="text-sm font-medium">On Leave</label>
                      <Input 
                        id="onLeave" 
                        type="number"
                        value={formData.onLeave || ''}
                        onChange={e => setFormData({...formData, onLeave: Number(e.target.value)})}
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="absent" className="text-sm font-medium">Absent</label>
                      <Input 
                        id="absent" 
                        type="number"
                        value={formData.absent || ''}
                        onChange={e => setFormData({...formData, absent: Number(e.target.value)})}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-text-secondary">
                    Note: Total should equal the sum of Present, On Leave, and Absent.
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addDepartment.isPending}>
                    {addDepartment.isPending ? (
                      <div className="h-4 w-4 border-2 border-background border-t-white rounded-full animate-spin mr-2"></div>
                    ) : null}
                    Add Department
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Summary Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
            <CardDescription>Today's workforce attendance statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="text-center">
                <div className="text-3xl font-semibold text-primary">{totalPresent}</div>
                <div className="text-sm text-text-secondary">Present</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-warning">{totalOnLeave}</div>
                <div className="text-sm text-text-secondary">On Leave</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold text-error">{totalAbsent}</div>
                <div className="text-sm text-text-secondary">Absent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold">{totalEmployees}</div>
                <div className="text-sm text-text-secondary">Total</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <div className="text-sm font-medium">Overall Attendance Rate</div>
                  <div className="text-sm font-medium">{attendanceRate}%</div>
                </div>
                <Progress value={attendanceRate} className="h-2" />
              </div>
              
              {departments.map((dept) => {
                const deptAttendanceRate = dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0;
                return (
                  <div key={dept.id}>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm">{dept.department}</div>
                      <div className="text-sm font-medium">{dept.present}/{dept.total} ({deptAttendanceRate}%)</div>
                    </div>
                    <Progress value={deptAttendanceRate} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Pie Chart Card */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Departments Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Department Attendance</CardTitle>
          <CardDescription>
            Track and manage employee attendance by department.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table id="workforceTable">
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>On Leave</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => {
                    const attendanceRate = dept.total > 0 ? Math.round((dept.present / dept.total) * 100) : 0;
                    return (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.department}</TableCell>
                        <TableCell>{dept.total}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-16 h-8"
                            value={dept.present}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0 && value <= dept.total) {
                                handleUpdateAttendance(dept.id, 'present', value);
                              }
                            }}
                            min="0"
                            max={dept.total}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-16 h-8"
                            value={dept.onLeave}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0 && value <= dept.total) {
                                handleUpdateAttendance(dept.id, 'onLeave', value);
                              }
                            }}
                            min="0"
                            max={dept.total}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            className="w-16 h-8"
                            value={dept.absent}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (value >= 0 && value <= dept.total) {
                                handleUpdateAttendance(dept.id, 'absent', value);
                              }
                            }}
                            min="0"
                            max={dept.total}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-full bg-background rounded-full h-1.5 mr-2">
                              <div 
                                className={`${attendanceRate >= 90 ? 'bg-success' : attendanceRate >= 75 ? 'bg-primary' : attendanceRate >= 60 ? 'bg-warning' : 'bg-error'} h-1.5 rounded-full`} 
                                style={{ width: `${attendanceRate}%` }}
                              ></div>
                            </div>
                            <span>{attendanceRate}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkforcePage;
