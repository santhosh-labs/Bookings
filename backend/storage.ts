import {
  workspaces, users, memberships, staff, services, customers, bookings, availability, notifications, workflows,
  type Workspace, type User, type Membership, type Staff, type Service, type Customer, type Booking, type Availability, type Notification, type Workflow
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sum, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;

  // Workspaces
  getWorkspaces(): Promise<Workspace[]>;
  getWorkspacesForUser(userId: number): Promise<(Workspace & { role: string })[]>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspaceBySlug(slug: string): Promise<Workspace | undefined>;
  createWorkspace(workspace: any, ownerId: number): Promise<Workspace>;
  updateWorkspace(id: number, workspace: any): Promise<Workspace>;

  // Memberships
  getMemberships(workspaceId: number): Promise<any[]>;
  createMembership(membership: any): Promise<Membership>;
  updateMembershipRole(id: number, role: string): Promise<Membership>;
  deleteMembership(id: number): Promise<void>;

  // Staff (Backward compatibility / Specialized workspace view)
  getStaff(workspaceId?: number): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  createStaff(staff: any): Promise<Staff>;

  // Services
  getServices(workspaceId?: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: any): Promise<Service>;
  updateService(id: number, service: any): Promise<Service>;
  deleteService(id: number): Promise<void>;

  // Customers
  getCustomers(workspaceId?: number): Promise<Customer[]>;
  createCustomer(customer: any): Promise<Customer>;
  updateCustomer(id: number, customer: any): Promise<Customer>;

  // Bookings
  getBookings(workspaceId?: number, serviceId?: number): Promise<Booking[]>;
  createBooking(booking: any): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updateBooking(id: number, update: any): Promise<Booking>;

  // Availability
  getAvailability(workspaceId?: number): Promise<Availability>;
  updateAvailability(schedule: any, timezone: string, workspaceId?: number): Promise<Availability>;

  // Notifications
  getNotifications(): Promise<Notification[]>;
  createNotification(notif: any): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(): Promise<void>;

  // Workflows
  getWorkflows(workspaceId?: number): Promise<Workflow[]>;
  createWorkflow(workflow: any): Promise<Workflow>;
  deleteWorkflow(id: number): Promise<void>;

  // Stats
  getStats(workspaceId?: number, serviceId?: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(insertUser: any): Promise<User> {
    const [result]: any = await db.insert(users).values({
      ...insertUser,
      createdAt: new Date().toISOString()
    });
    const [user] = await db.select().from(users).where(eq(users.id, result.insertId));
    return user;
  }
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    await db.update(users).set(data).where(eq(users.id, id));
    const [updated] = await db.select().from(users).where(eq(users.id, id));
    if (!updated) throw new Error("User not found");
    return updated;
  }

  // Workspaces
  async getWorkspaces(): Promise<Workspace[]> {
    return await db.select().from(workspaces);
  }
  async getWorkspacesForUser(userId: number): Promise<(Workspace & { role: string })[]> {
    const userMemberships = await db.select().from(memberships).where(eq(memberships.userId, userId));
    if (userMemberships.length === 0) return [];

    const workspaceIds = userMemberships.map(m => m.workspaceId);
    const wsList = await db.select().from(workspaces).where(inArray(workspaces.id, workspaceIds));

    return wsList.map(ws => {
      const membership = userMemberships.find(m => m.workspaceId === ws.id);
      return { ...ws, role: membership?.role || "STAFF" };
    });
  }
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return ws;
  }
  async getWorkspaceBySlug(slug: string): Promise<Workspace | undefined> {
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.slug, slug));
    return ws;
  }
  async createWorkspace(insertWorkspace: any, ownerId: number): Promise<Workspace> {
    const [result]: any = await db.insert(workspaces).values({
      ...insertWorkspace,
      ownerId
    });
    const workspaceId = result.insertId;

    // Create membership for owner
    await db.insert(memberships).values({
      userId: ownerId,
      workspaceId,
      role: "SUPER_ADMIN",
      createdAt: new Date().toISOString()
    });

    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId));
    return ws;
  }
  async updateWorkspace(id: number, update: any): Promise<Workspace> {
    await db.update(workspaces).set(update).where(eq(workspaces.id, id));
    const [updated] = await db.select().from(workspaces).where(eq(workspaces.id, id));
    if (!updated) throw new Error("Workspace not found");
    return updated;
  }

  // Memberships
  async getMemberships(workspaceId: number): Promise<any[]> {
    const mems = await db.select().from(memberships).where(eq(memberships.workspaceId, workspaceId));
    const userIds = mems.map(m => m.userId);
    if (userIds.length === 0) return [];

    const userList = await db.select().from(users).where(inArray(users.id, userIds));

    return mems.map(m => {
      const user = userList.find(u => u.id === m.userId);
      return {
        ...user,
        ...m,
        id: m.id, // Keep membership ID
        userId: m.userId,
        name: user?.name || "Unknown",
        email: user?.email || "unknown@example.com",
        isActive: true // Mock for now
      };
    });
  }
  async createMembership(insertMembership: any): Promise<Membership> {
    const [result]: any = await db.insert(memberships).values({
      ...insertMembership,
      createdAt: new Date().toISOString()
    });
    const [m] = await db.select().from(memberships).where(eq(memberships.id, result.insertId));
    return m;
  }
  async updateMembershipRole(id: number, role: string): Promise<Membership> {
    await db.update(memberships).set({ role }).where(eq(memberships.id, id));
    const [m] = await db.select().from(memberships).where(eq(memberships.id, id));
    if (!m) throw new Error("Membership not found");
    return m;
  }
  async deleteMembership(id: number): Promise<void> {
    await db.delete(memberships).where(eq(memberships.id, id));
  }

  // Staff (Legacy support)
  async getStaff(workspaceId?: number): Promise<Staff[]> {
    if (workspaceId) {
      return await db.select().from(staff).where(eq(staff.workspaceId, workspaceId));
    }
    return await db.select().from(staff);
  }
  async getStaffMember(id: number): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.id, id));
    return member;
  }
  async createStaff(insertStaff: any): Promise<Staff> {
    const [result]: any = await db.insert(staff).values(insertStaff);
    const [member] = await db.select().from(staff).where(eq(staff.id, result.insertId));
    return member;
  }

  // Services
  async getServices(workspaceId?: number): Promise<Service[]> {
    if (workspaceId) {
      return await db.select().from(services).where(eq(services.workspaceId, workspaceId));
    }
    return await db.select().from(services);
  }
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  async createService(insertService: any): Promise<Service> {
    const [result]: any = await db.insert(services).values(insertService);
    const [service] = await db.select().from(services).where(eq(services.id, result.insertId));

    try {
      await this.createNotification({
        title: "New Event Created",
        message: `Event type "${service.name}" was successfully created.`,
        type: "success",
        createdAt: new Date().toISOString(),
        isRead: false
      });
    } catch (e) {
      console.error("Failed to trigger notification:", e);
    }

    return service;
  }
  async updateService(id: number, update: any): Promise<Service> {
    await db.update(services).set(update).where(eq(services.id, id));
    const [updated] = await db.select().from(services).where(eq(services.id, id));
    if (!updated) throw new Error("Service not found");
    return updated;
  }
  async deleteService(id: number): Promise<void> {
    await db.delete(bookings).where(eq(bookings.serviceId, id));
    await db.delete(services).where(eq(services.id, id));
  }

  // Customers
  async getCustomers(workspaceId?: number): Promise<Customer[]> {
    if (workspaceId) {
      return await db.select().from(customers).where(eq(customers.workspaceId, workspaceId));
    }
    return await db.select().from(customers);
  }
  async createCustomer(insertCustomer: any): Promise<Customer> {
    const [result]: any = await db.insert(customers).values(insertCustomer);
    const [customer] = await db.select().from(customers).where(eq(customers.id, result.insertId));
    return customer;
  }
  async updateCustomer(id: number, update: any): Promise<Customer> {
    await db.update(customers).set(update).where(eq(customers.id, id));
    const [updated] = await db.select().from(customers).where(eq(customers.id, id));
    if (!updated) throw new Error("Customer not found");
    return updated;
  }

  // Bookings
  async getBookings(workspaceId?: number, serviceId?: number): Promise<Booking[]> {
    const filters = [];
    if (workspaceId) filters.push(eq(bookings.workspaceId, workspaceId));
    if (serviceId) filters.push(eq(bookings.serviceId, serviceId));

    if (filters.length > 0) {
      return await db.select().from(bookings).where(and(...filters)).orderBy(desc(bookings.id));
    }
    return await db.select().from(bookings).orderBy(desc(bookings.id));
  }
  async createBooking(insertBooking: any): Promise<Booking> {
    let [customer] = await db.select().from(customers).where(
      and(
        eq(customers.email, insertBooking.customerEmail),
        eq(customers.workspaceId, insertBooking.workspaceId)
      )
    ).limit(1);

    const now = new Date().toISOString();

    if (customer) {
      await db.update(customers)
        .set({
          totalBookings: (customer.totalBookings || 0) + 1,
          lastBooking: insertBooking.date,
          name: insertBooking.customerName,
          phone: insertBooking.customerPhone
        })
        .where(eq(customers.id, customer.id));
    } else {
      const [resCust]: any = await db.insert(customers).values({
        workspaceId: insertBooking.workspaceId,
        name: insertBooking.customerName,
        email: insertBooking.customerEmail,
        phone: insertBooking.customerPhone,
        totalBookings: 1,
        lastBooking: insertBooking.date,
        joinedDate: now.split('T')[0]
      });
      [customer] = await db.select().from(customers).where(eq(customers.id, resCust.insertId));
    }

    const [resBook]: any = await db.insert(bookings).values(insertBooking);
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, resBook.insertId));

    try {
      await this.createNotification({
        title: "New appointment booked",
        message: `${booking.customerName} booked ${booking.serviceName} for ${booking.date} at ${booking.time}`,
        type: "booking",
        createdAt: new Date().toISOString(),
        isRead: false
      });
    } catch (e) {
      console.error("Failed to trigger notification:", e);
    }

    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));
    const [updated] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!updated) throw new Error("Booking not found");
    return updated;
  }

  async updateBooking(id: number, update: any): Promise<Booking> {
    await db.update(bookings).set(update).where(eq(bookings.id, id));
    const [updated] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!updated) throw new Error("Booking not found");
    return updated;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    try {
      return await db.select().from(notifications).orderBy(desc(notifications.id));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async createNotification(notif: any): Promise<Notification> {
    const [res]: any = await db.insert(notifications).values({
      ...notif,
      createdAt: notif.createdAt || new Date().toISOString(),
      isRead: false
    });
    const [newNotif] = await db.select().from(notifications).where(eq(notifications.id, res.insertId));
    return newNotif;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(): Promise<void> {
    await db.update(notifications).set({ isRead: true });
  }

  // Availability
  async getAvailability(workspaceId?: number): Promise<Availability> {
    if (workspaceId) {
      const [found] = await db.select().from(availability).where(eq(availability.workspaceId, workspaceId));
      if (found) return found;
    }
    const [first] = await db.select().from(availability).limit(1);
    return first;
  }
  async updateAvailability(schedule: any, timezone: string, workspaceId?: number): Promise<Availability> {
    let result;
    if (workspaceId) {
      const [existing] = await db.select().from(availability).where(eq(availability.workspaceId, workspaceId));
      if (existing) {
        await db.update(availability).set({ schedule, timezone }).where(eq(availability.id, existing.id));
        const [updated] = await db.select().from(availability).where(eq(availability.id, existing.id));
        result = updated;
      }
    }
    if (!result) {
      const [res]: any = await db.insert(availability).values({ workspaceId: workspaceId ?? 1, schedule, timezone });
      const [created] = await db.select().from(availability).where(eq(availability.id, res.insertId));
      result = created;
    }
    return result;
  }

  // Stats
  async getStats(workspaceId?: number, serviceId?: number) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filters = [];
      if (workspaceId) filters.push(eq(bookings.workspaceId, workspaceId));
      if (serviceId) filters.push(eq(bookings.serviceId, serviceId));

      const [todayCountRes, upcomingCountRes, revenueRes] = await Promise.all([
        db.select({ count: count() }).from(bookings).where(and(...filters, eq(bookings.date, today))),
        db.select({ count: count() }).from(bookings).where(and(...filters, eq(bookings.status, "Upcoming"))),
        db.select({ total: sum(services.price) })
          .from(bookings)
          .innerJoin(services, eq(bookings.serviceId, services.id))
          .where(and(...filters, eq(bookings.status, "Completed")))
      ]);

      const [totalCount] = await db.select({ count: count() }).from(bookings).where(and(...filters));

      return {
        todayBookings: Number(todayCountRes[0]?.count || 0),
        upcomingBookings: Number(upcomingCountRes[0]?.count || 0),
        totalBookings: Number(totalCount?.count || 0),
        revenue: Number(revenueRes[0]?.total || 0)
      };
    } catch (error) {
      console.error("Error in getStats:", error);
      return { todayBookings: 0, upcomingBookings: 0, totalBookings: 0, revenue: 0 };
    }
  }

  // Workflows
  async getWorkflows(workspaceId?: number): Promise<Workflow[]> {
    if (workspaceId) {
      return await db.select().from(workflows).where(eq(workflows.workspaceId, workspaceId));
    }
    return await db.select().from(workflows);
  }
  async createWorkflow(insertWorkflow: any): Promise<Workflow> {
    const [res]: any = await db.insert(workflows).values(insertWorkflow);
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, res.insertId));
    return workflow;
  }
  async deleteWorkflow(id: number): Promise<void> {
    await db.delete(workflows).where(eq(workflows.id, id));
  }
}

export const storage = new DatabaseStorage();
