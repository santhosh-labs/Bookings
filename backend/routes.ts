import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { hashPassword, authenticateToken } from "./auth";
import { sendInvitationEmail } from "./lib/email";
import multer from "multer";
import { put } from "@vercel/blob";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for Vercel Blob (Memory Storage)
const upload = multer({
  storage: multer.memoryStorage(),
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
  // API Health check/Root
  app.get("/", (_req, res) => {
    res.json({ message: "SaaS Scheduler API is running" });
  });

  // File Uploads
  app.post("/api/upload", (req, res, next) => {
    upload.single("image")(req, res, async (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        return res.status(400).json({ message: err.message || "Upload failed" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        console.log(`[File Upload] Starting upload to Vercel Blob: ${req.file.originalname}`);
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            console.error("[File Upload] Error: BLOB_READ_WRITE_TOKEN is missing!");
            return res.status(500).json({ message: "Cloud storage token missing" });
        }

        // Upload to Vercel Blob
        const blob = await put(req.file.originalname, req.file.buffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        
        console.log(`[File Upload] Successfully uploaded: ${blob.url}`);
        res.json({ url: blob.url });
      } catch (blobErr: any) {
        console.error("[File Upload] Vercel Blob upload error:", blobErr.message);
        res.status(500).json({ message: `Cloud upload failed: ${blobErr.message}` });
      }
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
      const id = parseInt(req.params.id as string);
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
    let workspaceId = getWorkspaceId(req);
    
    // Fallback/Override from query param if provided
    if (req.query.workspaceId) {
      const queryId = parseInt(req.query.workspaceId as string);
      if (!isNaN(queryId)) {
        const userWorkspaces = await storage.getWorkspacesForUser((req as any).user.id);
        if (userWorkspaces.some(w => w.id === queryId)) {
          workspaceId = queryId;
        } else {
          return res.status(403).json({ message: "Access denied to this workspace" });
        }
      }
    }

    if (!workspaceId) return res.status(400).json({ message: "No workspace selected" });
    const members = await storage.getMemberships(workspaceId);
    res.json(members);
  });

  app.post('/api/users', authenticateToken, async (req, res) => {
    try {
      const workspaceId = getWorkspaceId(req);
      if (!workspaceId) return res.status(400).json({ message: "No workspace selected" });
      if ((req as any).role !== "SUPER_ADMIN") return res.status(403).json({ message: "Super Admin privilege required" });
      
      const { email, name, role } = req.body;
      let user = await storage.getUserByEmail(email);
      let isNewUser = false;
      
      if (!user) {
        // Create a new user if they don't exist
        isNewUser = true;
        const tempPassword = await hashPassword("Welcome123!");
        user = await storage.createUser({ 
          name: name || email.split('@')[0], 
          email, 
          password: tempPassword 
        });
      }
      
      const membership = await storage.createMembership({
        userId: user.id,
        workspaceId,
        role: (role || "STAFF").toUpperCase()
      });

      // Send email after successful membership creation
      try {
        const workspace = await storage.getWorkspace(workspaceId);
        const host = process.env.FRONTEND_URL || (req.get('origin') as string) || 'http://localhost:5173';
        const inviteLink = `${host}/login?email=${encodeURIComponent(email)}`;
        
        await sendInvitationEmail({
          email,
          workspaceName: workspace?.name || "Saas Scheduler",
          role: (role || "STAFF").toUpperCase(),
          inviteLink
        });
      } catch (emailErr) {
        console.error("Non-blocking email failure:", emailErr);
      }
      
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
      const id = parseInt(req.params.id as string);
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
    const id = parseInt(req.params.id as string);
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
      const id = parseInt(req.params.id as string);
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
      const id = parseInt(req.params.id as string);
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
      const id = parseInt(req.params.id as string);
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
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteWorkflow(id);
    res.status(204).end();
  });

  return httpServer;
}
