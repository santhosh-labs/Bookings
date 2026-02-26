import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Services
  app.get(api.services.list.path, async (req, res) => {
    const services = await storage.getServices();
    res.json(services);
  });
  
  app.post(api.services.create.path, async (req, res) => {
    try {
      const input = api.services.create.input.parse(req.body);
      const service = await storage.createService(input);
      res.status(201).json(service);
    } catch(err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  app.put(api.services.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("Invalid ID");
      const input = api.services.update.input.parse(req.body);
      const service = await storage.updateService(id, input);
      res.json(service);
    } catch(err: any) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(404).json({ message: err.message });
    }
  });

  // Customers
  app.get(api.customers.list.path, async (req, res) => {
    const customers = await storage.getCustomers();
    res.json(customers);
  });

  // Bookings
  app.get(api.bookings.list.path, async (req, res) => {
    const bookings = await storage.getBookings();
    res.json(bookings);
  });
  
  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch(err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  
  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) throw new Error("Invalid ID");
      const input = api.bookings.updateStatus.input.parse(req.body);
      const booking = await storage.updateBookingStatus(id, input.status);
      res.json(booking);
    } catch(err: any) {
      res.status(404).json({ message: err.message });
    }
  });

  // Availability
  app.get(api.availability.get.path, async (req, res) => {
    const availability = await storage.getAvailability();
    res.json(availability);
  });
  
  app.put(api.availability.update.path, async (req, res) => {
    try {
      const input = api.availability.update.input.parse(req.body);
      const availability = await storage.updateAvailability(input.schedule, input.timezone);
      res.json(availability);
    } catch(err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // Stats
  app.get(api.dashboardStats.get.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  return httpServer;
}
