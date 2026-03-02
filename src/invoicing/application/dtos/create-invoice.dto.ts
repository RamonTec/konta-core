import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateInvoiceSchema = z.object({
    customerId: z.string().uuid(),
    items: z.array(z.object({
        description: z.string(),
        price: z.number().positive()
    })).min(1)
});

export class CreateInvoiceDto extends createZodDto(CreateInvoiceSchema) { }