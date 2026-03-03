import { DocumentItem } from './document-item';

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  FISCALIZED = 'FISCALIZED',
  ANNULLED = 'ANNULLED'
}

export enum CurrencyCode {
  VES = 'VES',
  USD = 'USD'
}

export class FiscalDocument {
  private constructor(
    public id: string,
    public tenantId: string,
    public customerId: string,
    public type: 'INVOICE' | 'DELIVERY_NOTE' | 'CREDIT_NOTE',
    public status: DocumentStatus,
    public items: DocumentItem[],

    public currency: CurrencyCode,
    public exchangeRate: number,

    public subtotal: number,
    public taxAmount: number,
    public igtfAmount: number,
    public totalAmount: number,

    public controlNumber?: string,
    public fiscalSerial?: string,

    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) { }

  static create(props: {
    tenantId: string;
    customerId: string;
    type: 'INVOICE' | 'DELIVERY_NOTE' | 'CREDIT_NOTE';
    currency: CurrencyCode;
    exchangeRate: number;
  }): FiscalDocument {
    if (props.exchangeRate <= 0) {
      throw new Error('La tasa de cambio debe ser positiva');
    }

    return new FiscalDocument(
      crypto.randomUUID(),
      props.tenantId,
      props.customerId,
      props.type,
      DocumentStatus.DRAFT,
      [],
      props.currency,
      props.exchangeRate,
      0, 0, 0, 0
    );
  }


  public addItem(item: DocumentItem): void {
    if (this.status !== DocumentStatus.DRAFT) {
      throw new Error('No se pueden agregar ítems a un documento ya fiscalizado');
    }

    this.items.push(item);
    this.recalculateTotals();
  }

  public removeItem(itemId: string): void {
    if (this.status !== DocumentStatus.DRAFT) {
      throw new Error('Solo se pueden editar borradores');
    }
    this.items = this.items.filter(i => i.id !== itemId);
    this.recalculateTotals();
  }

  private recalculateTotals(): void {
    let subtotal = 0;
    let tax = 0;

    for (const item of this.items) {
      subtotal += item.subtotal;
      tax += item.taxAmount;
    }

    let igtf = 0;
    if (this.currency === CurrencyCode.USD) {
      igtf = (subtotal + tax) * 0.03;
    }

    this.subtotal = Math.round(subtotal * 100) / 100;
    this.taxAmount = Math.round(tax * 100) / 100;
    this.igtfAmount = Math.round(igtf * 100) / 100;

    this.totalAmount = this.subtotal + this.taxAmount + this.igtfAmount;
    this.updatedAt = new Date();
  }

  public fiscalize(controlNumber: string, fiscalSerial: string): void {
    if (this.items.length === 0) {
      throw new Error('No se puede fiscalizar un documento vacío');
    }
    if (this.status !== DocumentStatus.DRAFT) {
      throw new Error('El documento ya fue procesado');
    }

    this.controlNumber = controlNumber;
    this.fiscalSerial = fiscalSerial;
    this.status = DocumentStatus.FISCALIZED;
    this.updatedAt = new Date();
  }
}