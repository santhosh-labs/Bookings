import { Service, Customer, Booking, Availability } from "@shared/schema";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  createService(service: any): Promise<Service>;
  updateService(id: number, service: any): Promise<Service>;
  
  // Customers
  getCustomers(): Promise<Customer[]>;
  
  // Bookings
  getBookings(): Promise<Booking[]>;
  createBooking(booking: any): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Availability
  getAvailability(): Promise<Availability>;
  updateAvailability(schedule: any, timezone: string): Promise<Availability>;
  
  // Dashboard
  getStats(): Promise<{todayBookings: number, upcomingBookings: number, totalBookings: number, revenue: number}>;
}

export class MemStorage implements IStorage {
  private services: Map<number, Service>;
  private customers: Map<number, Customer>;
  private bookings: Map<number, Booking>;
  private currentId: number;
  private availability: Availability;

  constructor() {
    this.services = new Map();
    this.customers = new Map();
    this.bookings = new Map();
    this.currentId = 1;
    
    // Seed default availability
    this.availability = {
      id: 1,
      timezone: "America/New_York",
      schedule: {
        monday: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
        tuesday: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
        wednesday: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
        thursday: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
        friday: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
        saturday: { active: false, slots: [] },
        sunday: { active: false, slots: [] },
      }
    };
    
    // Seed some mock data
    this.seedMockData();
  }

  private seedMockData() {
    // Customers
    this.customers.set(1, { id: 1, name: "Alice Johnson", email: "alice@example.com", phone: "555-0101", totalBookings: 2 });
    this.customers.set(2, { id: 2, name: "Bob Smith", email: "bob@example.com", phone: "555-0102", totalBookings: 1 });
    
    // Services
    this.services.set(1, { id: 1, name: "Initial Consultation", duration: 30, price: 50, bufferTime: 15, location: "Online", isActive: true });
    this.services.set(2, { id: 2, name: "Deep Dive Session", duration: 60, price: 120, bufferTime: 15, location: "Online", isActive: true });
    
    // Bookings
    const today = new Date().toISOString().split('T')[0];
    this.bookings.set(1, { id: 1, customerName: "Alice Johnson", serviceName: "Initial Consultation", date: today, time: "10:00", status: "Upcoming" });
    this.bookings.set(2, { id: 2, customerName: "Bob Smith", serviceName: "Deep Dive Session", date: "2025-01-15", time: "14:00", status: "Completed" });
    
    this.currentId = 3;
  }

  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async createService(insertService: any): Promise<Service> {
    const id = this.currentId++;
    const service: Service = { ...insertService, id, isActive: insertService.isActive ?? true };
    this.services.set(id, service);
    return service;
  }
  
  async updateService(id: number, update: any): Promise<Service> {
    const existing = this.services.get(id);
    if (!existing) throw new Error("Service not found");
    const updated = { ...existing, ...update };
    this.services.set(id, updated);
    return updated;
  }

  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }
  
  async createBooking(insertBooking: any): Promise<Booking> {
    const id = this.currentId++;
    const booking: Booking = { ...insertBooking, id };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const existing = this.bookings.get(id);
    if (!existing) throw new Error("Booking not found");
    const updated = { ...existing, status };
    this.bookings.set(id, updated);
    return updated;
  }

  async getAvailability(): Promise<Availability> {
    return this.availability;
  }
  
  async updateAvailability(schedule: any, timezone: string): Promise<Availability> {
    this.availability = { ...this.availability, schedule, timezone };
    return this.availability;
  }

  async getStats() {
    const allBookings = Array.from(this.bookings.values());
    const today = new Date().toISOString().split('T')[0];
    
    const todayBookings = allBookings.filter(b => b.date === today).length;
    const upcomingBookings = allBookings.filter(b => b.status === "Upcoming").length;
    const totalBookings = allBookings.length;
    const revenue = 1250; // Mock revenue
    
    return { todayBookings, upcomingBookings, totalBookings, revenue };
  }
}

export const storage = new MemStorage();
