import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import type { SessionData } from "express-session";
import { storage } from "./storage";
// import { WebSocketServer } from "ws";
import { 
  insertUserSchema, 
  insertProductionLineSchema, 
  insertInventorySchema, 
  insertWorkforceSchema,
  insertAlertSchema,
  insertFactorySchema
} from "@shared/schema";
import { z } from "zod";

// Utility function to validate request body
function validateBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  try {
    return schema.parse(body);
  } catch (error) {
    throw new Error(`Invalid request body: ${error}`);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates
  // Temporarily disabled while fixing connectivity issues
  // const wss = new WebSocketServer({ server: httpServer });
  // 
  // wss.on('connection', (ws) => {
  //   ws.on('message', (message) => {
  //     // Handle incoming messages
  //     console.log(`Received message: ${message}`);
  //   });
  // });
  
  // Utility function to broadcast updates to all connected clients
  const broadcastUpdate = (topic: string, data: any) => {
    // Temporarily disabled
    // wss.clients.forEach((client) => {
    //   client.send(JSON.stringify({ topic, data }));
    // });
    console.log(`Update broadcast disabled: ${topic}`, data);
  };

  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = validateBody(insertUserSchema, req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Authentication routes
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      
      // Set user in session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  app.get('/api/auth/current-user', async (req: Request, res: Response) => {
    try {
      // Check if user is in session (simplified for demo)
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(Number(userId));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/logout', (req: Request, res: Response) => {
    try {
      // Clear session
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true });
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
  
  // Factory routes
  app.get('/api/factories', async (_req: Request, res: Response) => {
    try {
      const factories = await storage.getFactories();
      res.json(factories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/factories', async (req: Request, res: Response) => {
    try {
      const factoryData = validateBody(insertFactorySchema, req.body);
      const factory = await storage.createFactory(factoryData);
      res.status(201).json(factory);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Dashboard routes
  app.get('/api/dashboard/:factoryId', async (req: Request, res: Response) => {
    try {
      const factoryId = req.params.factoryId;
      const metrics = await storage.getDashboardMetrics(factoryId);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Production routes
  app.get('/api/production/:factoryId', async (req: Request, res: Response) => {
    try {
      const factoryId = req.params.factoryId;
      const lines = await storage.getProductionLines(factoryId);
      res.json(lines);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/production', async (req: Request, res: Response) => {
    try {
      const lineData = validateBody(insertProductionLineSchema, req.body);
      const line = await storage.createProductionLine(lineData);
      
      // Broadcast update to all clients
      broadcastUpdate('production_updated', { factoryId: line.factoryId });
      
      res.status(201).json(line);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.patch('/api/production/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const currentLine = await storage.getProductionLine(id);
      
      if (!currentLine) {
        return res.status(404).json({ message: 'Production line not found' });
      }
      
      const updatedLine = await storage.updateProductionLine(id, req.body);
      
      // Broadcast update to all clients
      broadcastUpdate('production_updated', { factoryId: currentLine.factoryId });
      
      res.json(updatedLine);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Inventory routes
  app.get('/api/inventory/:factoryId', async (req: Request, res: Response) => {
    try {
      const factoryId = req.params.factoryId;
      const items = await storage.getInventoryItems(factoryId);
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/inventory', async (req: Request, res: Response) => {
    try {
      const itemData = validateBody(insertInventorySchema, req.body);
      const item = await storage.createInventoryItem(itemData);
      
      // Broadcast update to all clients
      broadcastUpdate('inventory_updated', { factoryId: item.factoryId });
      
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.patch('/api/inventory/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const currentItem = await storage.getInventoryItem(id);
      
      if (!currentItem) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      const updatedItem = await storage.updateInventoryItem(id, req.body);
      
      // Broadcast update to all clients
      broadcastUpdate('inventory_updated', { factoryId: currentItem.factoryId });
      
      res.json(updatedItem);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Workforce routes
  app.get('/api/workforce/:factoryId', async (req: Request, res: Response) => {
    try {
      const factoryId = req.params.factoryId;
      const departments = await storage.getWorkforceDepartments(factoryId);
      res.json(departments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/workforce', async (req: Request, res: Response) => {
    try {
      const deptData = validateBody(insertWorkforceSchema, req.body);
      const dept = await storage.createWorkforceDepartment(deptData);
      
      // Broadcast update to all clients
      broadcastUpdate('workforce_updated', { factoryId: dept.factoryId });
      
      res.status(201).json(dept);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.patch('/api/workforce/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const currentDept = await storage.getWorkforceDepartment(id);
      
      if (!currentDept) {
        return res.status(404).json({ message: 'Workforce department not found' });
      }
      
      const updatedDept = await storage.updateWorkforceDepartment(id, req.body);
      
      // Broadcast update to all clients
      broadcastUpdate('workforce_updated', { factoryId: currentDept.factoryId });
      
      res.json(updatedDept);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Alerts routes
  app.get('/api/alerts/:factoryId', async (req: Request, res: Response) => {
    try {
      const factoryId = req.params.factoryId;
      const alerts = await storage.getAlerts(factoryId);
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.post('/api/alerts', async (req: Request, res: Response) => {
    try {
      const alertData = validateBody(insertAlertSchema, req.body);
      const alert = await storage.createAlert(alertData);
      
      // Broadcast update to all clients
      broadcastUpdate('alert_created', { factoryId: alert.factoryId, alert });
      
      res.status(201).json(alert);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  app.patch('/api/alerts/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const currentAlert = await storage.getAlert(id);
      
      if (!currentAlert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      const updatedAlert = await storage.updateAlert(id, req.body);
      
      // Broadcast update to all clients
      broadcastUpdate('alert_updated', { factoryId: currentAlert.factoryId });
      
      res.json(updatedAlert);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
