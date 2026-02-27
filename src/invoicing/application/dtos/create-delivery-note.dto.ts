import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateItemSchema = z.object({
  description: z.string().min(3, 'La descripción es muy corta'),
  code: z.string().optional(),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio no puede ser negativo'),
  discountAmount: z.number().min(0).default(0),
  taxType: z.enum(['E', 'G', 'R', 'A']),
  taxRate: z.number().min(0).max(100)
});
const CreateDeliveryNoteSchema = z.object({
  customerId: z.string().uuid('El ID del cliente no es válido'),

  currency: z.enum(['VES', 'USD']),
  exchangeRate: z.number().positive('La tasa de cambio debe ser mayor a 0'),

  items: z.array(CreateItemSchema).min(1, 'Debes agregar al menos un producto/servicio'),
});

export class CreateDeliveryNoteDto extends createZodDto(CreateDeliveryNoteSchema) { }