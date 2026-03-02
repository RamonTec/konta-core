export type TaxType = 'E' | 'G' | 'R' | 'A';

export class DocumentItem {
    private constructor(
        public id: string,
        public productId: string | null,
        public code: string | null,
        public description: string,
        public quantity: number,
        public unitPrice: number,
        public discountAmount: number,
        public taxType: TaxType,
        public taxRate: number,
        public subtotal: number,
        public taxAmount: number,
        public total: number,
        public createdAt: Date
    ) { }

    static create(props: {
        id?: string;
        productId?: string | null;
        code?: string | null;
        description: string;
        quantity: number;
        unitPrice: number;
        discountAmount?: number;
        taxType: TaxType;
        taxRate: number;
    }): DocumentItem {

        if (props.quantity <= 0) {
            throw new Error('La cantidad debe ser mayor a 0');
        }
        if (props.unitPrice < 0) {
            throw new Error('El precio no puede ser negativo');
        }

        const discount = props.discountAmount || 0;
        const subtotalRaw = (props.quantity * props.unitPrice) - discount;
        const subtotal = Math.round(subtotalRaw * 100) / 100;

        const taxAmountRaw = subtotal * (props.taxRate / 100);
        const taxAmount = Math.round(taxAmountRaw * 100) / 100;

        const total = subtotal + taxAmount;

        return new DocumentItem(
            props.id || crypto.randomUUID(),
            props.productId || null,
            props.code || null,
            props.description,
            props.quantity,
            props.unitPrice,
            discount,
            props.taxType,
            props.taxRate,
            subtotal,
            taxAmount,
            total,
            new Date()
        );
    }
}