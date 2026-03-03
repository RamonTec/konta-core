import { FiscalDocument } from '../model/fiscal-document';
import { DocumentStatus } from '../model/fiscal-document';

export abstract class FiscalDocumentRepository {
    abstract save(document: FiscalDocument): Promise<void>;
    abstract findById(id: string): Promise<FiscalDocument | null>;
    abstract findAllByTenant(tenantId: string): Promise<FiscalDocument[]>;
    abstract findNextCorrelative(
        tenantId: string,
        type: 'INVOICE' | 'DELIVERY_NOTE' | 'CREDIT_NOTE',
        series: string
    ): Promise<number>;
    abstract existsByControlNumber(controlNumber: string): Promise<boolean>;
}