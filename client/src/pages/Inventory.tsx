import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate, getStatusColor, exportTableToCSV } from '@/lib/utils';
import { Factory, Inventory as InventoryType } from '@shared/schema';
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

interface InventoryProps {
  factory: Factory;
}

const InventoryPage: React.FC<InventoryProps> = ({ factory }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const factoryId = factory.name;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    material: '',
    currentStock: 0,
    unit: 'units',
    minRequired: 0,
    status: 'Adequate',
    nextDelivery: '',
  });
  
  // Fetch inventory items
  const { 
    data: inventoryItems = [], 
    isLoading
  } = useQuery<InventoryType[]>({ 
    queryKey: [`/api/inventory/${factoryId}`],
  });
  
  // Add inventory item mutation
  const addInventoryItem = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/inventory', {
        ...data,
        factoryId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/${factoryId}`] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Inventory Item Added",
        description: "The inventory item has been added successfully.",
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
  
  // Update inventory item mutation
  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InventoryType> }) => {
      return apiRequest('PATCH', `/api/inventory/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/${factoryId}`] });
      toast({
        title: "Inventory Item Updated",
        description: "The inventory item has been updated successfully.",
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
      material: '',
      currentStock: 0,
      unit: 'units',
      minRequired: 0,
      status: 'Adequate',
      nextDelivery: '',
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate status if not provided
    let status = formData.status;
    if (formData.currentStock < formData.minRequired * 0.5) {
      status = 'Critical';
    } else if (formData.currentStock < formData.minRequired) {
      status = 'Low Stock';
    } else {
      status = 'Adequate';
    }
    
    addInventoryItem.mutate({
      ...formData,
      status
    });
  };
  
  const handleExportData = () => {
    exportTableToCSV('inventoryTable', 'inventory_items.csv');
  };
  
  const handleUpdateStatus = (id: number, status: string) => {
    updateInventoryItem.mutate({
      id,
      data: { status }
    });
  };
  
  const handleUpdateStock = (id: number, currentStock: number, minRequired: number) => {
    // Automatically determine status based on stock levels
    let status = 'Adequate';
    if (currentStock < minRequired * 0.5) {
      status = 'Critical';
    } else if (currentStock < minRequired) {
      status = 'Low Stock';
    }
    
    updateInventoryItem.mutate({
      id,
      data: { 
        currentStock,
        status
      }
    });
  };
  
  // Calculate inventory statistics
  const totalItems = inventoryItems.length;
  const adequateItems = inventoryItems.filter(item => item.status === 'Adequate').length;
  const lowStockItems = inventoryItems.filter(item => item.status === 'Low Stock').length;
  const criticalItems = inventoryItems.filter(item => item.status === 'Critical').length;
  
  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Management</h2>
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
                Add Inventory Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new material or component to your inventory.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="material" className="text-sm font-medium">Material Name</label>
                    <Input 
                      id="material" 
                      value={formData.material}
                      onChange={e => setFormData({...formData, material: e.target.value})}
                      placeholder="e.g. Sheet Metal"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="currentStock" className="text-sm font-medium">Current Stock</label>
                      <Input 
                        id="currentStock" 
                        type="number"
                        value={formData.currentStock || ''}
                        onChange={e => setFormData({...formData, currentStock: Number(e.target.value)})}
                        min="0"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="unit" className="text-sm font-medium">Unit</label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({...formData, unit: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="units">Units</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="liters">Liters</SelectItem>
                          <SelectItem value="meters">Meters</SelectItem>
                          <SelectItem value="rolls">Rolls</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="minRequired" className="text-sm font-medium">Minimum Required</label>
                    <Input 
                      id="minRequired" 
                      type="number"
                      value={formData.minRequired || ''}
                      onChange={e => setFormData({...formData, minRequired: Number(e.target.value)})}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="nextDelivery" className="text-sm font-medium">Next Delivery Date</label>
                    <Input 
                      id="nextDelivery" 
                      value={formData.nextDelivery}
                      onChange={e => setFormData({...formData, nextDelivery: e.target.value})}
                      placeholder="e.g. 21 Mar 2023"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addInventoryItem.isPending}>
                    {addInventoryItem.isPending ? (
                      <div className="h-4 w-4 border-2 border-background border-t-white rounded-full animate-spin mr-2"></div>
                    ) : null}
                    Add Item
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
            <CardDescription>Total Inventory Items</CardDescription>
            <CardTitle className="text-2xl">{totalItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-secondary">
              <span className="inline-flex items-center">
                Last updated today
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Adequate Stock</CardDescription>
            <CardTitle className="text-2xl">{adequateItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full" 
                style={{ width: `${(adequateItems / totalItems) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Low Stock Items</CardDescription>
            <CardTitle className="text-2xl">{lowStockItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-warning h-2 rounded-full" 
                style={{ width: `${(lowStockItems / totalItems) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Items</CardDescription>
            <CardTitle className="text-2xl">{criticalItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-error h-2 rounded-full" 
                style={{ width: `${(criticalItems / totalItems) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Inventory Items Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Manage your inventory materials and track stock levels.
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
              <Table id="inventoryTable">
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min. Required</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Delivery</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryItems.map((item) => {
                    const statusColors = getStatusColor(item.status);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.material}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              className="w-20 h-8"
                              value={item.currentStock}
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0) {
                                  handleUpdateStock(item.id, value, item.minRequired);
                                }
                              }}
                            />
                            <span className="text-sm">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.minRequired} {item.unit}</TableCell>
                        <TableCell>
                          <Select
                            value={item.status}
                            onValueChange={(value) => handleUpdateStatus(item.id, value)}
                          >
                            <SelectTrigger className={`w-32 h-7 ${statusColors.bg} ${statusColors.text}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Adequate">Adequate</SelectItem>
                              <SelectItem value="Low Stock">Low Stock</SelectItem>
                              <SelectItem value="Critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{item.nextDelivery || 'Not scheduled'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm">
                              <span className="material-icons text-sm">edit</span>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <span className="material-icons text-sm">history</span>
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

export default InventoryPage;
