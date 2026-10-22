import { z } from 'zod';

export const CreateDonationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  category: z.enum(['cooked_meals', 'bakery', 'produce', 'packaged', 'dairy', 'beverages', 'other']),
  quantity_total: z.number().int().positive('Quantity must be greater than zero').max(10000),
  quantity_unit: z.string().min(1).max(30).default('portions'),
  pickup_deadline: z.string().refine((val) => !isNaN(Date.parse(val)) && new Date(val) > new Date(), {
    message: 'Pickup deadline must be a valid future timestamp',
  }),
  city: z.string().min(2).max(100).default('Delhi NCR'),
  location_label: z.string().min(3, 'Location label is required (e.g. Rohini Sector 17, Delhi)'),
  pickup_instructions: z.string().max(1000).optional(),
  ingredients: z.string().max(500).optional(),
  allergens: z.string().max(300).optional(),
  preparation_time: z.string().optional(),
  image_url: z.string().url('Must be a valid URL').optional(),
  cloudinary_public_id: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const UpdateDonationSchema = CreateDonationSchema.partial();

export const CreateClaimSchema = z.object({
  quantity: z.number().int().positive('Claim quantity must be greater than zero'),
  notes: z.string().max(500).optional(),
});

export const UpdateClaimStatusSchema = z.object({
  status: z.enum(['collected', 'delivered']),
  notes: z.string().max(500).optional(),
});

export const CancelClaimSchema = z.object({
  reason: z.string().max(300).optional(),
});

export const CreateReportSchema = z.object({
  donation_id: z.string().uuid().optional(),
  reason: z.string().min(3, 'Reason is required').max(100),
  description: z.string().min(5, 'Detailed description is required').max(1000),
});

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  organization_name: z.string().max(150).optional(),
  phone: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  service_area: z.string().max(200).optional(),
  avatar_url: z.string().url().optional(),
});
