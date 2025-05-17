import {
  users, type User, type InsertUser,
  productionLines, type ProductionLine, type InsertProductionLine,
  inventory, type Inventory, type InsertInventory,
  workforce, type Workforce, type InsertWorkforce,
  alerts, type Alert, type InsertAlert,
  factories, type Factory, type InsertFactory,
  type DashboardMetrics
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Factory methods
  getFactories(): Promise<Factory[]>;
  getFactory(id: number): Promise<Factory | undefined>;
  createFactory(factory: InsertFactory): Promise<Factory>;
  
  // Production methods
  getProductionLines(factoryId: string): Promise<ProductionLine[]>;
  getProductionLine(id: number): Promise<ProductionLine | undefined>;
  createProductionLine(line: InsertProductionLine): Promise<ProductionLine>;
  updateProductionLine(id: number, data: Partial<ProductionLine>): Promise<ProductionLine | undefined>;
  
  // Inventory methods
  getInventoryItems(factoryId: string): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, data: Partial<Inventory>): Promise<Inventory | undefined>;
  
  // Workforce methods
  getWorkforceDepartments(factoryId: string): Promise<Workforce[]>;
  getWorkforceDepartment(id: number): Promise<Workforce | undefined>;
  createWorkforceDepartment(department: InsertWorkforce): Promise<Workforce>;
  updateWorkforceDepartment(id: number, data: Partial<Workforce>): Promise<Workforce | undefined>;
  
  // Alerts methods
  getAlerts(factoryId: string): Promise<Alert[]>;
  getAlert(id: number): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, data: Partial<Alert>): Promise<Alert | undefined>;
  
  // Dashboard methods
  getDashboardMetrics(factoryId: string): Promise<DashboardMetrics>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private factories: Map<number, Factory>;
  private productionLines: Map<number, ProductionLine>;
  private inventory: Map<number, Inventory>;
  private workforce: Map<number, Workforce>;
  private alerts: Map<number, Alert>;
  
  private userCurrentId: number;
  private factoryCurrentId: number;
  private productionLineCurrentId: number;
  private inventoryCurrentId: number;
  private workforceCurrentId: number;
  private alertCurrentId: number;

  constructor() {
    this.users = new Map();
    this.factories = new Map();
    this.productionLines = new Map();
    this.inventory = new Map();
    this.workforce = new Map();
    this.alerts = new Map();
    
    this.userCurrentId = 1;
    this.factoryCurrentId = 1;
    this.productionLineCurrentId = 1;
    this.inventoryCurrentId = 1;
    this.workforceCurrentId = 1;
    this.alertCurrentId = 1;
    
    // Initialize with some default data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Factory methods
  async getFactories(): Promise<Factory[]> {
    return Array.from(this.factories.values());
  }
  
  async getFactory(id: number): Promise<Factory | undefined> {
    return this.factories.get(id);
  }
  
  async createFactory(insertFactory: InsertFactory): Promise<Factory> {
    const id = this.factoryCurrentId++;
    const factory: Factory = { ...insertFactory, id };
    this.factories.set(id, factory);
    return factory;
  }
  
  // Production methods
  async getProductionLines(factoryId: string): Promise<ProductionLine[]> {
    return Array.from(this.productionLines.values()).filter(
      (line) => line.factoryId === factoryId
    );
  }
  
  async getProductionLine(id: number): Promise<ProductionLine | undefined> {
    return this.productionLines.get(id);
  }
  
  async createProductionLine(insertLine: InsertProductionLine): Promise<ProductionLine> {
    const id = this.productionLineCurrentId++;
    const line: ProductionLine = { 
      ...insertLine, 
      id,
      status: insertLine.status ?? "Active",
      completed: insertLine.completed ?? 0,
      efficiency: insertLine.efficiency ?? 0
    };
    this.productionLines.set(id, line);
    return line;
  }
  
  async updateProductionLine(id: number, data: Partial<ProductionLine>): Promise<ProductionLine | undefined> {
    const line = this.productionLines.get(id);
    if (!line) return undefined;
    
    const updatedLine = { ...line, ...data };
    this.productionLines.set(id, updatedLine);
    return updatedLine;
  }
  
  // Inventory methods
  async getInventoryItems(factoryId: string): Promise<Inventory[]> {
    return Array.from(this.inventory.values()).filter(
      (item) => item.factoryId === factoryId
    );
  }
  
  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }
  
  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = this.inventoryCurrentId++;
    const item: Inventory = { 
      ...insertItem, 
      id,
      nextDelivery: insertItem.nextDelivery ?? null
    };
    this.inventory.set(id, item);
    return item;
  }
  
  async updateInventoryItem(id: number, data: Partial<Inventory>): Promise<Inventory | undefined> {
    const item = this.inventory.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...data };
    this.inventory.set(id, updatedItem);
    return updatedItem;
  }
  
  // Workforce methods
  async getWorkforceDepartments(factoryId: string): Promise<Workforce[]> {
    return Array.from(this.workforce.values()).filter(
      (dept) => dept.factoryId === factoryId
    );
  }
  
  async getWorkforceDepartment(id: number): Promise<Workforce | undefined> {
    return this.workforce.get(id);
  }
  
  async createWorkforceDepartment(insertDept: InsertWorkforce): Promise<Workforce> {
    const id = this.workforceCurrentId++;
    const dept: Workforce = { ...insertDept, id };
    this.workforce.set(id, dept);
    return dept;
  }
  
  async updateWorkforceDepartment(id: number, data: Partial<Workforce>): Promise<Workforce | undefined> {
    const dept = this.workforce.get(id);
    if (!dept) return undefined;
    
    const updatedDept = { ...dept, ...data };
    this.workforce.set(id, updatedDept);
    return updatedDept;
  }
  
  // Alerts methods
  async getAlerts(factoryId: string): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((alert) => alert.factoryId === factoryId)
      .sort((a, b) => {
        // Sort by read status then by time
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        return 0;
      });
  }
  
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertCurrentId++;
    const alert: Alert = { 
      ...insertAlert, 
      id,
      read: insertAlert.read ?? false
    };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async updateAlert(id: number, data: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...data };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
  
  // Dashboard methods
  async getDashboardMetrics(factoryId: string): Promise<DashboardMetrics> {
    const lines = await this.getProductionLines(factoryId);
    const workforceDepts = await this.getWorkforceDepartments(factoryId);
    
    const activeLines = lines.filter(line => line.status === 'Active' || line.status === 'Completed');
    const totalLines = lines.length;
    
    let totalProduction = 0;
    let totalEfficiency = 0;
    
    lines.forEach(line => {
      totalProduction += line.completed;
      totalEfficiency += line.efficiency;
    });
    
    const avgEfficiency = lines.length > 0 ? totalEfficiency / lines.length : 0;
    
    let totalPresent = 0;
    let totalEmployees = 0;
    
    workforceDepts.forEach(dept => {
      totalPresent += dept.present;
      totalEmployees += dept.total;
    });
    
    const attendanceRate = totalEmployees > 0 ? (totalPresent / totalEmployees) * 100 : 0;
    
    return {
      productionEfficiency: Math.round(avgEfficiency),
      activeLines: `${activeLines.length}/${totalLines}`,
      todaysOutput: totalProduction,
      attendance: `${totalPresent}/${totalEmployees}`,
      attendanceRate: Math.round(attendanceRate)
    };
  }
  
  // Seed initial data for demo purposes
  private seedData() {
    // Create a factory
    this.createFactory({
      name: "Jaipur Manufacturing Unit",
      location: "Jaipur, Rajasthan"
    });
    
    this.createFactory({
      name: "Pune Assembly Unit",
      location: "Pune, Maharashtra"
    });
    
    this.createFactory({
      name: "Coimbatore Production",
      location: "Coimbatore, Tamil Nadu"
    });
    
    // Create a user
    this.createUser({
      username: "sanjay",
      password: "password",
      name: "Sanjay Kumar",
      role: "Floor Manager",
      factory: "Jaipur Manufacturing Unit"
    });
    
    // Create production lines
    this.createProductionLine({
      name: "Line 01",
      product: "Metal Housings",
      target: 1200,
      completed: 968,
      efficiency: 80,
      status: "Active",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createProductionLine({
      name: "Line 02",
      product: "Mechanical Parts",
      target: 950,
      completed: 950,
      efficiency: 100,
      status: "Completed",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createProductionLine({
      name: "Line 03",
      product: "Circuit Boards",
      target: 800,
      completed: 423,
      efficiency: 53,
      status: "Delayed",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createProductionLine({
      name: "Line 04",
      product: "Electrical Components",
      target: 1500,
      completed: 1280,
      efficiency: 85,
      status: "Active",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createProductionLine({
      name: "Line 05",
      product: "Assembly",
      target: 700,
      completed: 602,
      efficiency: 86,
      status: "Active",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createProductionLine({
      name: "Line 06",
      product: "Packaging",
      target: 1800,
      completed: 0,
      efficiency: 0,
      status: "Maintenance",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    // Create inventory items
    this.createInventoryItem({
      material: "Sheet Metal",
      currentStock: 1250,
      unit: "kg",
      minRequired: 500,
      status: "Adequate",
      nextDelivery: "21 Mar 2023",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createInventoryItem({
      material: "Circuit Components",
      currentStock: 3200,
      unit: "units",
      minRequired: 1000,
      status: "Adequate",
      nextDelivery: "18 Mar 2023",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createInventoryItem({
      material: "Copper Wire",
      currentStock: 85,
      unit: "kg",
      minRequired: 100,
      status: "Low Stock",
      nextDelivery: "15 Mar 2023",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createInventoryItem({
      material: "Screws & Fasteners",
      currentStock: 42,
      unit: "kg",
      minRequired: 25,
      status: "Adequate",
      nextDelivery: "27 Mar 2023",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createInventoryItem({
      material: "Plastic Covers",
      currentStock: 120,
      unit: "units",
      minRequired: 500,
      status: "Critical",
      nextDelivery: "14 Mar 2023",
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    // Create workforce departments
    this.createWorkforceDepartment({
      department: "Production Floor",
      total: 38,
      present: 34,
      onLeave: 3,
      absent: 1,
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createWorkforceDepartment({
      department: "Assembly Lines",
      total: 15,
      present: 12,
      onLeave: 2,
      absent: 1,
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createWorkforceDepartment({
      department: "Quality Control",
      total: 7,
      present: 6,
      onLeave: 1,
      absent: 0,
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    // Create alerts
    this.createAlert({
      type: "error",
      title: "Critical Inventory Alert",
      message: "Plastic covers inventory below critical threshold (120/500)",
      time: "10 minutes ago",
      read: false,
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createAlert({
      type: "warning",
      title: "Maintenance Required",
      message: "Line 06 requires scheduled maintenance",
      time: "45 minutes ago",
      read: false,
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createAlert({
      type: "warning",
      title: "Low Inventory Warning",
      message: "Copper wire stock below minimum threshold (85/100kg)",
      time: "1 hour ago",
      read: false,
      factoryId: "Jaipur Manufacturing Unit"
    });
    
    this.createAlert({
      type: "info",
      title: "Production Target Met",
      message: "Line 02 completed daily target of 950 units",
      time: "2 hours ago",
      read: false,
      factoryId: "Jaipur Manufacturing Unit"
    });
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Factory methods
  async getFactories(): Promise<Factory[]> {
    return await db.select().from(factories);
  }

  async getFactory(id: number): Promise<Factory | undefined> {
    const [factory] = await db.select().from(factories).where(eq(factories.id, id));
    return factory;
  }

  async createFactory(insertFactory: InsertFactory): Promise<Factory> {
    const [factory] = await db.insert(factories).values(insertFactory).returning();
    return factory;
  }
  
  // Production methods
  async getProductionLines(factoryId: string): Promise<ProductionLine[]> {
    return await db.select().from(productionLines).where(eq(productionLines.factoryId, factoryId));
  }

  async getProductionLine(id: number): Promise<ProductionLine | undefined> {
    const [line] = await db.select().from(productionLines).where(eq(productionLines.id, id));
    return line;
  }

  async createProductionLine(insertLine: InsertProductionLine): Promise<ProductionLine> {
    const [line] = await db.insert(productionLines).values(insertLine).returning();
    return line;
  }

  async updateProductionLine(id: number, data: Partial<ProductionLine>): Promise<ProductionLine | undefined> {
    const [line] = await db
      .update(productionLines)
      .set(data)
      .where(eq(productionLines.id, id))
      .returning();
    return line;
  }
  
  // Inventory methods
  async getInventoryItems(factoryId: string): Promise<Inventory[]> {
    return await db.select().from(inventory).where(eq(inventory.factoryId, factoryId));
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item;
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const [item] = await db.insert(inventory).values(insertItem).returning();
    return item;
  }

  async updateInventoryItem(id: number, data: Partial<Inventory>): Promise<Inventory | undefined> {
    const [item] = await db
      .update(inventory)
      .set(data)
      .where(eq(inventory.id, id))
      .returning();
    return item;
  }
  
  // Workforce methods
  async getWorkforceDepartments(factoryId: string): Promise<Workforce[]> {
    return await db.select().from(workforce).where(eq(workforce.factoryId, factoryId));
  }

  async getWorkforceDepartment(id: number): Promise<Workforce | undefined> {
    const [dept] = await db.select().from(workforce).where(eq(workforce.id, id));
    return dept;
  }

  async createWorkforceDepartment(insertDept: InsertWorkforce): Promise<Workforce> {
    const [dept] = await db.insert(workforce).values(insertDept).returning();
    return dept;
  }

  async updateWorkforceDepartment(id: number, data: Partial<Workforce>): Promise<Workforce | undefined> {
    const [dept] = await db
      .update(workforce)
      .set(data)
      .where(eq(workforce.id, id))
      .returning();
    return dept;
  }
  
  // Alerts methods
  async getAlerts(factoryId: string): Promise<Alert[]> {
    return await db.select().from(alerts).where(eq(alerts.factoryId, factoryId));
  }

  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db.insert(alerts).values(insertAlert).returning();
    return alert;
  }

  async updateAlert(id: number, data: Partial<Alert>): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set(data)
      .where(eq(alerts.id, id))
      .returning();
    return alert;
  }
  
  // Dashboard methods
  async getDashboardMetrics(factoryId: string): Promise<DashboardMetrics> {
    // This could be optimized with specific database queries in a real-world scenario
    const lines = await this.getProductionLines(factoryId);
    const departments = await this.getWorkforceDepartments(factoryId);
    
    const activeLines = lines.filter(line => line.status === 'Active').length;
    const totalLines = lines.length;
    
    // Calculate production efficiency
    const efficiency = lines.reduce((sum, line) => sum + line.efficiency, 0) / (lines.length || 1);
    
    // Calculate today's output
    const todaysOutput = lines.reduce((sum, line) => sum + line.completed, 0);
    
    // Calculate attendance
    const totalEmployees = departments.reduce((sum, dept) => sum + dept.total, 0);
    const presentEmployees = departments.reduce((sum, dept) => sum + dept.present, 0);
    const attendanceRate = totalEmployees > 0 ? (presentEmployees / totalEmployees) * 100 : 0;
    
    return {
      productionEfficiency: Math.round(efficiency * 100) / 100, // Round to 2 decimals
      activeLines: `${activeLines}/${totalLines}`,
      todaysOutput,
      attendance: `${presentEmployees}/${totalEmployees}`,
      attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimals
    };
  }
}

// Use Memory Storage for development and Database Storage for production
const isDev = process.env.NODE_ENV === 'development';
export const storage = isDev ? new MemStorage() : new DatabaseStorage();
