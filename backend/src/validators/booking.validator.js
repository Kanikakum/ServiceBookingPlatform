const { z } = require('zod');

// Regex for YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
// Regex for HH:mm or ISO datetime
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createBookingSchema = z.object({
  serviceId: z
    .number({ required_error: 'Service ID is required', invalid_type_error: 'Service ID must be a number' })
    .int('Service ID must be an integer')
    .positive('Service ID must be a positive integer'),
  bookingDate: z
    .string({ required_error: 'Booking date is required' })
    .regex(dateRegex, 'Booking date must be in YYYY-MM-DD format'),
  startTime: z
    .string({ required_error: 'Start time is required' })
    .refine(
      (val) => timeRegex.test(val) || !isNaN(Date.parse(val)),
      'Start time must be in HH:mm format (e.g. 10:00) or valid ISO string'
    ),
  endTime: z
    .string()
    .refine(
      (val) => timeRegex.test(val) || !isNaN(Date.parse(val)),
      'End time must be in HH:mm format or valid ISO string'
    )
    .optional(),
});

const availabilityQuerySchema = z.object({
  serviceId: z.coerce
    .number({ required_error: 'Service ID is required' })
    .int('Service ID must be an integer')
    .positive('Service ID must be a positive integer'),
  bookingDate: z
    .string({ required_error: 'Booking date is required' })
    .regex(dateRegex, 'Booking date must be in YYYY-MM-DD format'),
});

const bookingFilterQuerySchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'], {
      errorMap: () => ({ message: 'Invalid booking status filter' }),
    })
    .optional(),
  bookingDate: z
    .string()
    .regex(dateRegex, 'Booking date must be in YYYY-MM-DD format')
    .optional(),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(50, 'Maximum limit is 50').default(10),
});

const bookingIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Booking ID must be a positive integer'),
});

module.exports = {
  createBookingSchema,
  availabilityQuerySchema,
  bookingFilterQuerySchema,
  bookingIdParamSchema,
};
