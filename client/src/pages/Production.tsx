import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, getStatusColor, exportTableToCSV } from '@/lib/utils';
import { Factory, ProductionLine as ProductionLineType } from '@shared/schema';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ProductionProps {
  factory: Factory;
}

const ProductionPage: React.FC<ProductionProps> = ({ factory }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const factoryId = factory.name;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    product: '',
    target: 0,
    completed: 0,
    efficiency: 0,
    status: 'Active',
  });
  
  // Fetch production lines
  const { 
    data: productionLines = [], 
    isLoading
  } = useQuery<ProductionLineType[]>({ 
    queryKey: [`/api/production/${factoryId}`],
  });
  
  // Add production line mutation
  const addProductionLine = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/production', {
        ...data,
        factoryId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/production/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${factoryId}`] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Production Line Added",
        description: "The production line has been added successfully.",
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
  
  // Update production line mutation
  const updateProductionLine = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<ProductionLineType> }) => {
      return apiRequest('PATCH', `/api/production/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/production/${factoryId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/dashboard/${factoryId}`] });
      toast({
        title: "Production Line Updated",
        description: "The production line has been updated successfully.",
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
      name: '',
      product: '',
      target: 0,
      completed: 0,
      efficiency: 0,
      status: 'Active',
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate efficiency if not provided
    const efficiency = formData.efficiency || (formData.target > 0 
      ? Math.round((formData.completed / formData.target) * 100) 
      : 0);
    
    addProductionLine.mutate({
      ...formData,
      efficiency
    });
  };
  
  const handleExportData = () => {
    exportTableToCSV('productionTable', 'production_lines.csv');
  };
  
  const handleUpdateStatus = (id: number, status: string) => {
    updateProductionLine.mutate({
      id,
      data: { status }
    });
  };
  
  const handleUpdateCompletion = (id: number, completed: number, target: number) => {
    const efficiency = target > 0 ? Math.round((completed / target) * 100) : 0;
    
    updateProductionLine.mutate({
      id,
      data: { 
        completed,
        efficiency,
        status: completed >= target ? 'Completed' : 'Active'
      }
    });
  };
  
  const totalLines = productionLines.length;
  const activeLines = productionLines.filter(line => line.status === 'Active' || line.status === 'Completed').length;
  const completedTarget = productionLines.filter(line => line.completed >= line.target).length;
  const totalOutput = productionLines.reduce((sum, line) => sum + line.completed, 0);
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Production Lines</h2>
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
                Add Production Line
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Production Line</DialogTitle>
                <DialogDescription>
                  Create a new production line for your factory.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Line Name</label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Line 07"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="product" className="text-sm font-medium">Product</label>
                    <Input 
                      id="product" 
                      value={formData.product}
                      onChange={e => setFormData({...formData, product: e.target.value})}
                      placeholder="e.g. Metal Housings"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="target" className="text-sm font-medium">Target</label>
                      <Input 
                        id="target" 
                        type="number"
                        value={formData.target || ''}
                        onChange={e => setFormData({...formData, target: Number(e.target.value)})}
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="completed" className="text-sm font-medium">Completed</label>
                      <Input 
                        id="completed" 
                        type="number"
                        value={formData.completed || ''}
                        onChange={e => setFormData({...formData, completed: Number(e.target.value)})}
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({...formData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Delayed">Delayed</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addProductionLine.isPending}>
                    {addProductionLine.isPending ? (
                      <div className="h-4 w-4 border-2 border-background border-t-white rounded-full animate-spin mr-2"></div>
                    ) : null}
                    Add Line
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Production Lines</CardDescription>
            <CardTitle className="text-2xl">{totalLines}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-secondary">
              <span className="inline-flex items-center text-success">
                <span className="material-icons text-sm">arrow_upward</span>
                1 new in last 7 days
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Lines</CardDescription>
            <CardTitle className="text-2xl">{activeLines}/{totalLines}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full" 
                style={{ width: `${(activeLines / totalLines) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Targets</CardDescription>
            <CardTitle className="text-2xl">{completedTarget}/{totalLines}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${(completedTarget / totalLines) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Output</CardDescription>
            <CardTitle className="text-2xl">{totalOutput.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-secondary">
              <span className="inline-flex items-center text-success">
                <span className="material-icons text-sm">arrow_upward</span>
                12% increase from yesterday
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Production Lines Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Production Lines</CardTitle>
          <CardDescription>
            Manage and monitor all your production lines in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table id="productionTable">
                <TableHeader>
                  <TableRow>
                    <TableHead>Line</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionLines.map((line) => {
                    const statusColors = getStatusColor(line.status);
                    return (
                      <TableRow key={line.id}>
                        <TableCell className="font-medium">{line.name}</TableCell>
                        <TableCell>{line.product}</TableCell>
                        <TableCell>{line.target.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              className="w-20 h-8"
                              value={line.completed}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0) {
                                  handleUpdateCompletion(line.id, value, line.target);
                                }
                              }}
                            />
                            <span className="text-sm">{`/ ${line.target}`}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-16 bg-background rounded-full h-1.5 mr-2">
                              <div 
                                className={`${line.efficiency >= 70 ? 'bg-success' : line.efficiency >= 50 ? 'bg-warning' : 'bg-error'} h-1.5 rounded-full`} 
                                style={{ width: `${line.efficiency}%` }}
                              ></div>
                            </div>
                            <span>{line.efficiency}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={line.status}
                            onValueChange={(value) => handleUpdateStatus(line.id, value)}
                          >
                            <SelectTrigger className={`w-32 h-7 ${statusColors.bg} ${statusColors.text}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Delayed">Delayed</SelectItem>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <span className="material-icons text-sm">bar_chart</span>
                            </Button>
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

export default ProductionPage;
