// ============================================================
// MOCK DATA — Frontend-only. Replace with real API calls later.
// ============================================================

export type Workspace = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  currency: string;
  timezone: string;
};

export type Staff = {
  id: number;
  workspaceId: number;
  name: string;
  email: string;
  role: "Admin" | "Staff";
  avatar?: string;
  phone?: string;
  isActive: boolean;
};

export type Service = {
  id: number;
  workspaceId: number;
  name: string;
  duration: number; // in minutes
  price: number;
  bufferTime: number; // in minutes
  location: string;
  isActive: boolean;
  description?: string;
  color?: string;
  staffIds: number[]; // the staff who can provide this service
};

export type Booking = {
  id: number;
  workspaceId: number;
  serviceId: number;
  staffId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm AM/PM
  status: "Upcoming" | "Completed" | "Cancelled" | "Pending";
  notes?: string;
};

export type Customer = {
  id: number;
  workspaceId: number;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastBooking?: string;
  joinedDate: string;
};

export type DashboardStats = {
  todayBookings: number;
  upcomingBookings: number;
  totalBookings: number;
  revenue: number;
};

// ------ WORKSPACES ------
export const mockWorkspaces: Workspace[] = [
  { id: 1, name: "Consulting HQ", slug: "consulting-hq", description: "Our primary consulting business.", currency: "USD", timezone: "America/New_York" },
  { id: 2, name: "Design Studio", slug: "design-studio", description: "UI/UX design reviews and workshops.", currency: "USD", timezone: "America/Los_Angeles" },
  { id: 3, name: "Development agency", slug: "dev-agency", description: "Code review and technical audits.", currency: "EUR", timezone: "Europe/London" },
];

// ------ STAFF ------
export const mockStaff: Staff[] = [
  { id: 1, workspaceId: 1, name: "John Doe", email: "john@example.com", role: "Admin", isActive: true },
  { id: 2, workspaceId: 1, name: "Jane Smith", email: "jane@example.com", role: "Staff", isActive: true },
  { id: 3, workspaceId: 2, name: "Alice Designer", email: "alice@example.com", role: "Admin", isActive: true },
  { id: 4, workspaceId: 3, name: "Bob Coder", email: "bob@example.com", role: "Admin", isActive: true },
];

// ------ SERVICES ------
export const mockServices: Service[] = [
  { id: 1, workspaceId: 1, name: "1-on-1 Consultation", duration: 60, price: 120, bufferTime: 15, location: "Zoom", isActive: true, description: "A personalized one-hour consultation session.", color: "indigo", staffIds: [1, 2] },
  { id: 2, workspaceId: 1, name: "Strategy Workshop", duration: 90, price: 250, bufferTime: 30, location: "Google Meet", isActive: true, description: "In-depth strategic planning for your business.", color: "violet", staffIds: [1] },
  { id: 3, workspaceId: 1, name: "Quick Intro Call", duration: 30, price: 0, bufferTime: 10, location: "Phone", isActive: true, description: "A free 30-minute introductory call.", color: "emerald", staffIds: [1, 2] },
  { id: 4, workspaceId: 1, name: "Team Training Session", duration: 120, price: 400, bufferTime: 30, location: "Office / On-site", isActive: true, description: "Group training session for your team.", color: "amber", staffIds: [1] },

  { id: 5, workspaceId: 3, name: "Code Review & Audit", duration: 60, price: 180, bufferTime: 15, location: "Zoom", isActive: true, description: "Detailed review and audit of your codebase.", color: "rose", staffIds: [4] },

  { id: 6, workspaceId: 2, name: "UX Design Review", duration: 45, price: 90, bufferTime: 10, location: "Figma + Zoom", isActive: true, description: "Expert review and feedback on your UI/UX.", color: "sky", staffIds: [3] },
];

// ------ BOOKINGS ------
export const mockBookings: Booking[] = [
  { id: 1, workspaceId: 1, staffId: 1, serviceId: 1, customerName: "Alice Johnson", customerEmail: "alice@example.com", customerPhone: "+1 (555) 001-0001", serviceName: "1-on-1 Consultation", date: "2026-02-27", time: "10:00 AM", status: "Upcoming", notes: "Wants to discuss Q2 roadmap" },
  { id: 2, workspaceId: 1, staffId: 1, serviceId: 2, customerName: "Bob Martinez", customerEmail: "bob@example.com", customerPhone: "+1 (555) 002-0002", serviceName: "Strategy Workshop", date: "2026-02-27", time: "02:00 PM", status: "Upcoming" },
  { id: 3, workspaceId: 1, staffId: 2, serviceId: 3, customerName: "Carol White", customerEmail: "carol@example.com", customerPhone: "+1 (555) 003-0003", serviceName: "Quick Intro Call", date: "2026-02-26", time: "11:00 AM", status: "Completed" },
  { id: 4, workspaceId: 1, staffId: 1, serviceId: 4, customerName: "David Chen", customerEmail: "david@example.com", customerPhone: "+1 (555) 004-0004", serviceName: "Team Training Session", date: "2026-02-25", time: "09:00 AM", status: "Completed" },
  { id: 5, workspaceId: 2, staffId: 3, serviceId: 6, customerName: "Emily Davis", customerEmail: "emily@example.com", customerPhone: "+1 (555) 005-0005", serviceName: "UX Design Review", date: "2026-02-24", time: "03:00 PM", status: "Cancelled", notes: "Client requested cancellation" },
  { id: 6, workspaceId: 1, staffId: 2, serviceId: 1, customerName: "Frank Lee", customerEmail: "frank@example.com", customerPhone: "+1 (555) 006-0006", serviceName: "1-on-1 Consultation", date: "2026-03-01", time: "10:00 AM", status: "Upcoming" },
  { id: 7, workspaceId: 1, staffId: 2, serviceId: 3, customerName: "Grace Kim", customerEmail: "grace@example.com", customerPhone: "+1 (555) 007-0007", serviceName: "Quick Intro Call", date: "2026-03-02", time: "11:30 AM", status: "Pending" },
  { id: 8, workspaceId: 1, staffId: 1, serviceId: 2, customerName: "Henry Park", customerEmail: "henry@example.com", customerPhone: "+1 (555) 008-0008", serviceName: "Strategy Workshop", date: "2026-03-03", time: "01:00 PM", status: "Upcoming" },
  { id: 9, workspaceId: 3, staffId: 4, serviceId: 5, customerName: "Irene Nguyen", customerEmail: "irene@example.com", customerPhone: "+1 (555) 009-0009", serviceName: "Code Review & Audit", date: "2026-02-20", time: "04:00 PM", status: "Completed" },
  { id: 10, workspaceId: 2, staffId: 3, serviceId: 6, customerName: "James Fox", customerEmail: "james@example.com", customerPhone: "+1 (555) 010-0010", serviceName: "UX Design Review", date: "2026-03-05", time: "09:30 AM", status: "Upcoming" },
];

// ------ CUSTOMERS ------
export const mockCustomers: Customer[] = [
  { id: 1, workspaceId: 1, name: "Alice Johnson", email: "alice@example.com", phone: "+1 (555) 001-0001", totalBookings: 4, lastBooking: "2026-02-27", joinedDate: "2025-09-15" },
  { id: 2, workspaceId: 1, name: "Bob Martinez", email: "bob@example.com", phone: "+1 (555) 002-0002", totalBookings: 2, lastBooking: "2026-02-27", joinedDate: "2025-10-01" },
  { id: 3, workspaceId: 1, name: "Carol White", email: "carol@example.com", phone: "+1 (555) 003-0003", totalBookings: 6, lastBooking: "2026-02-26", joinedDate: "2025-08-11" },
  { id: 4, workspaceId: 1, name: "David Chen", email: "david@example.com", phone: "+1 (555) 004-0004", totalBookings: 3, lastBooking: "2026-02-25", joinedDate: "2025-11-30" },
  { id: 5, workspaceId: 2, name: "Emily Davis", email: "emily@example.com", phone: "+1 (555) 005-0005", totalBookings: 1, lastBooking: "2026-02-24", joinedDate: "2025-12-14" },
  { id: 6, workspaceId: 1, name: "Frank Lee", email: "frank@example.com", phone: "+1 (555) 006-0006", totalBookings: 5, lastBooking: "2026-03-01", joinedDate: "2025-07-22" },
  { id: 7, workspaceId: 1, name: "Grace Kim", email: "grace@example.com", phone: "+1 (555) 007-0007", totalBookings: 2, lastBooking: "2026-03-02", joinedDate: "2026-01-05" },
  { id: 8, workspaceId: 1, name: "Henry Park", email: "henry@example.com", phone: "+1 (555) 008-0008", totalBookings: 1, lastBooking: "2026-03-03", joinedDate: "2026-01-19" },
  { id: 9, workspaceId: 3, name: "Irene Nguyen", email: "irene@example.com", phone: "+1 (555) 009-0009", totalBookings: 7, lastBooking: "2026-02-20", joinedDate: "2025-06-30" },
  { id: 10, workspaceId: 2, name: "James Fox", email: "james@example.com", phone: "+1 (555) 010-0010", totalBookings: 3, lastBooking: "2026-03-05", joinedDate: "2025-10-17" },
];

// ------ DASHBOARD STATS ------
export const mockStats: Record<number, DashboardStats> = {
  1: { todayBookings: 2, upcomingBookings: 8, totalBookings: 65, revenue: 10250 },
  2: { todayBookings: 0, upcomingBookings: 2, totalBookings: 15, revenue: 1350 },
  3: { todayBookings: 0, upcomingBookings: 0, totalBookings: 7, revenue: 2680 },
};

// ------ AVAILABILITY ------
export const mockAvailability = {
  timezone: "America/New_York",
  schedule: {
    Mon: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
    Tue: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
    Wed: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
    Thu: { active: true, slots: [{ start: "09:00", end: "17:00" }] },
    Fri: { active: true, slots: [{ start: "09:00", end: "15:00" }] },
    Sat: { active: false, slots: [] },
    Sun: { active: false, slots: [] },
  }
};
