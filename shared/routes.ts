import { z } from 'zod';
import { insertServiceSchema, insertCustomerSchema, insertBookingSchema, insertWorkspaceSchema, insertStaffSchema, insertWorkflowSchema, services, customers, bookings, availability, workspaces, staff, notifications, workflows } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  workspaces: {
    list: {
      method: 'GET' as const,
      path: '/api/workspaces' as const,
      responses: { 200: z.array(z.custom<typeof workspaces.$inferSelect>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/workspaces/:id' as const,
      responses: { 200: z.custom<typeof workspaces.$inferSelect>(), 404: errorSchemas.notFound }
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/workspaces/slug/:slug' as const,
      responses: { 200: z.custom<typeof workspaces.$inferSelect>(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/workspaces' as const,
      input: insertWorkspaceSchema,
      responses: { 201: z.custom<typeof workspaces.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  staff: {
    list: {
      method: 'GET' as const,
      path: '/api/staff' as const,
      responses: { 200: z.array(z.custom<typeof staff.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/staff' as const,
      input: insertStaffSchema,
      responses: { 201: z.custom<typeof staff.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  services: {
    list: {
      method: 'GET' as const,
      path: '/api/services' as const,
      responses: { 200: z.array(z.custom<typeof services.$inferSelect>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/services/:id' as const,
      responses: { 200: z.custom<typeof services.$inferSelect>(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/services' as const,
      input: insertServiceSchema,
      responses: { 201: z.custom<typeof services.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/services/:id' as const,
      input: insertServiceSchema.partial(),
      responses: { 200: z.custom<typeof services.$inferSelect>(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/services/:id' as const,
      responses: { 204: z.null(), 404: errorSchemas.notFound }
    },
  },
  auth: {
    login: {
      method: "POST" as const,
      path: "/api/login" as const,
      input: z.object({ email: z.string().email(), password: z.string() }),
      responses: { 200: z.any() }
    },
    register: {
      method: "POST" as const,
      path: "/api/register" as const,
      input: z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
        organizationName: z.string().optional()
      }),
      responses: { 201: z.any() }
    },
    switchWorkspace: {
      method: "POST" as const,
      path: "/api/auth/switch-workspace" as const,
      input: z.object({ organizationId: z.number() }),
      responses: { 200: z.any() }
    },
    me: {
      method: 'GET' as const,
      path: '/api/me' as const,
      responses: { 200: z.any() } // Will return User
    },
    updateMe: {
      method: 'PATCH' as const,
      path: '/api/me' as const,
      responses: { 200: z.any() }
    }
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers' as const,
      responses: { 200: z.array(z.custom<typeof customers.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers' as const,
      input: insertCustomerSchema,
      responses: { 201: z.custom<typeof customers.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  bookings: {
    list: {
      method: 'GET' as const,
      path: '/api/bookings' as const,
      responses: { 200: z.array(z.custom<typeof bookings.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: { 201: z.custom<typeof bookings.$inferSelect>(), 400: errorSchemas.validation }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof bookings.$inferSelect>(), 404: errorSchemas.notFound }
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id' as const,
      input: insertBookingSchema.partial(),
      responses: { 200: z.custom<typeof bookings.$inferSelect>(), 404: errorSchemas.notFound }
    },
  },
  availability: {
    get: {
      method: 'GET' as const,
      path: '/api/availability' as const,
      responses: { 200: z.custom<typeof availability.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/availability' as const,
      input: z.object({ schedule: z.any(), timezone: z.string() }),
      responses: { 200: z.custom<typeof availability.$inferSelect>() }
    }
  },
  dashboardStats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.object({
          todayBookings: z.number(),
          upcomingBookings: z.number(),
          totalBookings: z.number(),
          revenue: z.number()
        })
      }
    }
  },
  notifications: {
    list: {
      method: 'GET' as const,
      path: '/api/notifications' as const,
      responses: { 200: z.array(z.custom<typeof notifications.$inferSelect>()) }
    },
    markRead: {
      method: 'PATCH' as const,
      path: '/api/notifications/:id/read' as const,
      responses: { 200: z.custom<typeof notifications.$inferSelect>(), 404: errorSchemas.notFound }
    },
    markAllRead: {
      method: "POST" as const,
      path: "/api/notifications/read-all" as const,
      responses: { 200: z.object({ success: z.boolean() }) },
    },
  },
  workflows: {
    list: {
      method: "GET" as const,
      path: "/api/workflows" as const,
      responses: { 200: z.array(z.custom<typeof workflows.$inferSelect>()) },
    },
    create: {
      method: "POST" as const,
      path: "/api/workflows" as const,
      input: insertWorkflowSchema,
      responses: {
        201: z.custom<typeof workflows.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/workflows/:id" as const,
      responses: { 204: z.null(), 404: errorSchemas.notFound },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
