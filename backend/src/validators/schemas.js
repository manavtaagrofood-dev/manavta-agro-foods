import { z } from 'zod';

export const registerSchema = z.object({ name: z.string().min(2).max(100), email: z.string().email(), password: z.string().min(8).max(128) });
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(128) });
const imageSchema = z.string().min(1).max(500).refine(v => /^https?:\/\//i.test(v) || /^\/?images\//.test(v), 'Image must be an https URL or an images/ path');
export const productSchema = z.object({ name: z.string().min(2).max(160), category: z.string().min(2).max(80), description: z.string().min(5).max(2000), image: imageSchema.optional(), specifications: z.record(z.string(), z.string()).optional(), stock: z.number().min(0).optional(), price: z.number().min(0).optional(), currency: z.string().length(3).optional(), lowStockThreshold: z.number().min(0).optional(), active: z.boolean().optional() });
export const createProductSchema = productSchema.extend({ image: imageSchema });
export const enquirySchema = z.object({
  firstName: z.string().min(2).max(60), lastName: z.string().max(60).optional().default(''),
  email: z.string().email(), phone: z.string().max(30).optional().default(''),
  country: z.string().max(80).optional().default(''), destination: z.string().max(160).optional().default(''),
  company: z.string().max(120).optional().default(''), productId: z.string().optional(),
  productName: z.string().min(2).max(160).optional().default('General enquiry'), requirementType: z.enum(['QUOTE', 'SAMPLE']).default('QUOTE'),
  quantity: z.string().min(1).max(80), packaging: z.string().max(160).optional().default(''),
  message: z.string().min(10).max(5000), sourcePage: z.string().max(200).optional().default('website'),
});
export const statusSchema = z.object({ status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'NEGOTIATION', 'CONVERTED', 'SAMPLE_REQUESTED', 'CLOSED', 'CANCELLED']) });
export const movementSchema = z.object({ productId: z.string(), type: z.enum(['PURCHASE', 'SALE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN']), quantity: z.number().positive(), reference: z.string().max(120).optional() });
export const orderSchema = z.object({ items: z.array(z.object({ productId: z.string(), quantity: z.number().positive() })).min(1) });
