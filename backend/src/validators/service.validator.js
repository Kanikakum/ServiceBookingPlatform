const { z } = require('zod');

const createServiceSchema = z.object({
  categoryId: z
    .number({ required_error: 'Category ID is required', invalid_type_error: 'Category ID must be a number' })
    .int('Category ID must be an integer')
    .positive('Category ID must be a positive integer'),
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters long')
    .max(120, 'Title must not exceed 120 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters long')
    .max(2000, 'Description must not exceed 2000 characters'),
  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a valid number' })
    .positive('Price must be greater than 0')
    .max(1000000, 'Price must not exceed 1,000,000'),
  durationMinutes: z
    .number({ required_error: 'Duration in minutes is required', invalid_type_error: 'Duration must be a number' })
    .int('Duration must be an integer')
    .positive('Duration must be greater than 0')
    .max(1440, 'Duration cannot exceed 1440 minutes (24 hours)'),
});

const updateServiceSchema = z
  .object({
    categoryId: z
      .number({ invalid_type_error: 'Category ID must be a number' })
      .int('Category ID must be an integer')
      .positive('Category ID must be a positive integer')
      .optional(),
    title: z
      .string()
      .trim()
      .min(3, 'Title must be at least 3 characters long')
      .max(120, 'Title must not exceed 120 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters long')
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),
    price: z
      .number({ invalid_type_error: 'Price must be a valid number' })
      .positive('Price must be greater than 0')
      .max(1000000, 'Price must not exceed 1,000,000')
      .optional(),
    durationMinutes: z
      .number({ invalid_type_error: 'Duration must be a number' })
      .int('Duration must be an integer')
      .positive('Duration must be greater than 0')
      .max(1440, 'Duration cannot exceed 1440 minutes (24 hours)')
      .optional(),
    isActive: z.boolean({ invalid_type_error: 'isActive must be a boolean' }).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
  );

const queryCatalogSchema = z.object({
  search: z.string().trim().max(100, 'Search query too long').optional(),
  categoryId: z.coerce.number().int().positive('Category ID must be a positive integer').optional(),
  minPrice: z.coerce.number().min(0, 'Minimum price must be non-negative').optional(),
  maxPrice: z.coerce.number().positive('Maximum price must be positive').optional(),
  sort: z
    .enum(['newest', 'oldest', 'price_asc', 'price_desc'], {
      errorMap: () => ({ message: "Sort must be one of: 'newest', 'oldest', 'price_asc', 'price_desc'" }),
    })
    .default('newest'),
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(50, 'Maximum limit is 50').default(10),
});

const providerPaginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(50, 'Maximum limit is 50').default(10),
});

const serviceIdParamSchema = z.object({
  id: z.coerce.number().int().positive('Service ID must be a positive integer'),
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  queryCatalogSchema,
  providerPaginationSchema,
  serviceIdParamSchema,
};
