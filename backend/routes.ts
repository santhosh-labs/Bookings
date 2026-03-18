import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { hashPassword, authenticateToken } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure Multer
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(process.cwd(), "backend", "uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images are allowed!"));
  },
});

// Helper to get workspace context
function getWorkspaceId(req: Request) {
  return (req as any).workspaceId;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // File Uploads
  app.post("/api/upload", (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        return res.status(400).json({ message: err.message || "Upload failed" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const filePath = `/uploads/${req.file.filename}`;
      res.json({ url: filePath });
    });
  });

  // Workspaces
  app.get(api.workspaces.list.path, authenticateToken, async (req, res) => {
    const workspaces = await storage.getWorkspacesForUser((req as any).user.id);
    res.json(workspaces);
  });

  app.get(api.workspaces.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const workspace = await storage.getWorkspace(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    res.json(workspace);
  });

  app.get(api.workspaces.getBySlug.path, async (req, res) => {
    const workspace = await storage.getWorkspaceBySlug(req.params.slug);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    res.json(workspace);
  });

  app.post(api.workspaces.create.path, authenticateToken, async (req, res) => {
    try {
      const input = api.workspaces.create.input.parse(req.body);
      const workspace = await storage.createWorkspace(input, (req as any).user.id);
      res.status(201).json(workspace);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.patch('/api/workspaces/:id', authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
      
      const workspace = await storage.updateWorkspace(id, req.body);
      res.json(workspace);
    } catch (err: any) {
      console.error("PATCH WORKSPACE ERROR:", err);
      res.status(400).json({ message: err.message });
    }
  });

  // Users (Memberships)
  app.get('/api/users', authenticateToken, async (req, res) => {
    const workspaceId = getWorkspaceId(req);
    if (!workspaceId) return res.status(400).json({ message: "No workspace selected" });
    const members = await storage.getMemberships(workspaceId);
    res.json(members);
  });

  app.post('/api/users', authenticateToken, async (req, res) => {
    try {
      const workspaceId = getWorkspaceId(req);
      if (!workspaceId) return res.status(400).json({ message: "No workspace selected" });
      if ((req as any).role !== "OWNER") return res.status(403).json({ message: "Owner privilege required" });
      
      const { email, name, role } = req.body;
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create a new user if they don't exist
        const tempPassword = await hashPassword("Welcome123!");
        user = await storage.createUser({ 
          name: name || "New Member", 
          email, 
          password: tempPassword 
        });
      }
      
      const membership = await storage.createMembership({
        userId: user.id,
        workspaceId,
        role: (role || "STAFF").toUpperCase()
      });
      res.status(201).json(membership);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Services
  app.get(api.services.list.path, async (req, res) => {
    let workspaceId = req.query.workspaceId ? parseInt(req.query.workspaceId as string) : undefined;
    if (workspaceId !== undefined && isNaN(workspaceId)) workspaceId = undefined;
    const services = await storage.getServices(workspaceId);
    res.json(services);
  });
  
  app.get(api.services.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const service = await storage.getService(id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  });

  app.post(api.services.create.path, authenticateToken, async (req, res) => {
    try {
      const workspaceId = getWorkspaceId(req);
      const input = api.services.create.input.parse(req.body);
      const service = await storage.createService({ ...input, workspaceId });
      res.status(201).json(service);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.services.update.path, authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("Invalid ID");
      const input = api.services.update.input.parse(req.body);
      const service = await storage.updateService(id, input);
      res.json(service);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(404).json({ message: err.message });
    }
  });

  app.delete(api.services.delete.path, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteService(id);
    res.status(204).end();
  });

  // Customers
  app.get(api.customers.list.path, authenticateToken, async (req, res) => {
    const workspaceId = getWorkspaceId(req);
    const customers = await storage.getCustomers(workspaceId);
    res.json(customers);
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // Bookings
  app.get(api.bookings.list.path, authenticateToken, async (req, res) => {
    const workspaceId = getWorkspaceId(req);
    const serviceId = req.query.serviceId ? parseInt(req.query.serviceId as string) : undefined;
    const bookings = await storage.getBookings(workspaceId, isNaN(serviceId as number) ? undefined : serviceId);
    res.json(bookings);
  });

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.bookings.updateStatus.path, authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("Invalid ID");
      const input = api.bookings.updateStatus.input.parse(req.body);
      const booking = await storage.updateBookingStatus(id, input.status);
      res.json(booking);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  });

  app.patch(api.bookings.update.path, authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("Invalid ID");
      const input = api.bookings.update.input.parse(req.body);
      const booking = await storage.updateBooking(id, input);
      res.json(booking);
    } catch (err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(404).json({ message: err.message });
    }
  });

  // Availability
  app.get(api.availability.get.path, authenticateToken, async (req, res) => {
    const workspaceId = getWorkspaceId(req);
    const availability = await storage.getAvailability(workspaceId);
    res.json(availability);
  });

  app.put(api.availability.update.path, authenticateToken, async (req, res) => {
    try {
      const workspaceId = getWorkspaceId(req);
      const input = api.availability.update.input.parse(req.body);
      const availability = await storage.updateAvailability(input.schedule, input.timezone, workspaceId);
      res.json(availability);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // Stats
  app.get(api.dashboardStats.get.path, authenticateToken, async (req, res) => {
    const workspaceId = getWorkspaceId(req);
    const serviceId = req.query.serviceId ? parseInt(req.query.serviceId as string) : undefined;
    const stats = await storage.getStats(workspaceId, isNaN(serviceId as number) ? undefined : serviceId);
    res.json(stats);
  });

  // Notifications
  app.get(api.notifications.list.path, authenticateToken, async (req, res) => {
    const notifications = await storage.getNotifications();
    res.json(notifications);
  });

  app.patch(api.notifications.markRead.path, authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("Invalid ID");
      await storage.markNotificationRead(id);
      res.json({ id });
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  });

  app.post(api.notifications.markAllRead.path, authenticateToken, async (req, res) => {
    await storage.markAllNotificationsRead();
    res.json({ success: true });
  });

  // Workflows
  app.get(api.workflows.list.path, authenticateToken, async (req, res) => {
    const workspaceId = getWorkspaceId(req);
    const workflows = await storage.getWorkflows(workspaceId);
    res.json(workflows);
  });

  app.post(api.workflows.create.path, authenticateToken, async (req, res) => {
    try {
      const workspaceId = getWorkspaceId(req);
      const input = api.workflows.create.input.parse(req.body);
      const workflow = await storage.createWorkflow({ ...input, workspaceId });
      res.status(201).json(workflow);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.delete(api.workflows.delete.path, authenticateToken, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteWorkflow(id);
    res.status(204).end();
  });

  return httpServer;
}
