import { z } from 'zod';
import { insertServiceSchema, insertCustomerSchema, insertBookingSchema, services, customers, bookings, availability } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  services: {
    list: { 
      method: 'GET' as const, 
      path: '/api/services' as const, 
      responses: { 200: z.array(z.custom<typeof services.$inferSelect>()) } 
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
  },
  customers: {
    list: { 
      method: 'GET' as const, 
      path: '/api/customers' as const, 
      responses: { 200: z.array(z.custom<typeof customers.$inferSelect>()) } 
    },
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
  }
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
