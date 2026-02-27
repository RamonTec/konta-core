import { Injectable } from '@nestjs/common';
import { CreateDeliveryNoteDto } from '../dtos/create-delivery-note.dto';
import { FiscalDocumentRepository } from '../../domain/ports/fiscal-document.repository';
import { FiscalDocument, CurrencyCode } from '../../domain/model/fiscal-document';
import { DocumentItem, TaxType } from '../../domain/model/document-item';

@Injectable()
export class CreateDeliveryNoteUseCase {
  constructor(private readonly fiscalDocumentRepository: FiscalDocumentRepository) { }

  async execute(tenantId: string, dto: CreateDeliveryNoteDto): Promise<FiscalDocument> {

    const deliveryNote = FiscalDocument.create({
      tenantId: tenantId,
      customerId: dto.customerId,
      type: 'DELIVERY_NOTE',
      currency: dto.currency as CurrencyCode,
      exchangeRate: dto.exchangeRate,
    });

    for (const itemDto of dto.items) {
      const domainItem = DocumentItem.create({
        description: itemDto.description,
        code: itemDto.code,
        quantity: itemDto.quantity,
        unitPrice: itemDto.unitPrice,
        discountAmount: itemDto.discountAmount,
        taxType: itemDto.taxType as TaxType,
        taxRate: itemDto.taxRate,
      });

      deliveryNote.addItem(domainItem);
    }
    await this.fiscalDocumentRepository.save(deliveryNote);

    return deliveryNote;
  }
}