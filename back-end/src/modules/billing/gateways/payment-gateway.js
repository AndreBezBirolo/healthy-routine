import axios from 'axios';
import { PLAN_PRICING } from '../dtos/billing.dto.js';
// 🟢 IMPLEMENTAÇÃO MOCKADA (Para desenvolvimento rápido sem precisar de credenciais reais)
export class MockPaymentGateway {
    async createSubscription(customer, cycle, input) {
        const plan = PLAN_PRICING[cycle];
        const mockPaymentId = `mock_pay_${Date.now()}`;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        return {
            paymentId: mockPaymentId,
            status: input.paymentMethod === 'CREDIT_CARD' ? 'CONFIRMED' : 'PENDING',
            invoiceUrl: `https://mock.payment.gateway/invoice/${mockPaymentId}`,
            pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            pixCopyAndPaste: `00020126580014br.gov.bcb.pix0136mock-healthy-routine-${mockPaymentId}520400005303986540${plan.totalPrice}5802BR5915Healthy Routine6009Sao Paulo62070503***6304ABCD`,
            expiresAt,
            amount: plan.totalPrice,
            isMocked: true,
        };
    }
}
// 🔵 IMPLEMENTAÇÃO REAL ASAAS (PIX, Boleto e Cartão de Crédito com Recorrência)
export class AsaasPaymentGateway {
    apiKey;
    apiUrl;
    constructor() {
        this.apiKey = process.env.ASAAS_API_KEY || '';
        this.apiUrl = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
    }
    async createSubscription(customer, cycle, input) {
        const plan = PLAN_PRICING[cycle];
        // 1. Cria ou recupera cliente no Asaas
        const customerRes = await axios.post(`${this.apiUrl}/customers`, {
            name: customer.name,
            email: customer.email,
            cpfCnpj: customer.cpfCnpj,
            mobilePhone: customer.phone,
            externalReference: customer.id,
        }, { headers: { access_token: this.apiKey } });
        const asaasCustomerId = customerRes.data.id;
        // 2. Mapeamento de ciclo para o padrão Asaas
        const cycleMap = {
            MONTHLY: 'MONTHLY',
            QUARTERLY: 'QUARTERLY',
            SEMIANNUAL: 'SEMIANNUALLY',
            ANNUAL: 'ANNUALLY',
        };
        // 3. Criação de Assinatura Recorrente no Asaas
        const subRes = await axios.post(`${this.apiUrl}/subscriptions`, {
            customer: asaasCustomerId,
            billingType: input.paymentMethod,
            value: plan.totalPrice,
            nextDueDate: new Date().toISOString().split('T')[0],
            cycle: cycleMap[cycle],
            description: `Healthy Routine Casal Pro - Plano ${plan.name}`,
            creditCard: input.creditCard ? {
                holderName: input.creditCard.holderName,
                number: input.creditCard.number,
                expiryMonth: input.creditCard.expiryMonth,
                expiryYear: input.creditCard.expiryYear,
                ccv: input.creditCard.ccv,
            } : undefined,
        }, { headers: { access_token: this.apiKey } });
        const sub = subRes.data;
        return {
            paymentId: sub.id,
            status: sub.status === 'ACTIVE' ? 'CONFIRMED' : 'PENDING',
            invoiceUrl: sub.invoiceUrl,
            expiresAt: new Date(sub.nextDueDate),
            amount: plan.totalPrice,
            isMocked: false,
        };
    }
}
// 🟠 IMPLEMENTAÇÃO REAL MERCADO PAGO
export class MercadoPagoPaymentGateway {
    accessToken;
    constructor() {
        this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
    }
    async createSubscription(customer, cycle, input) {
        const plan = PLAN_PRICING[cycle];
        // Criação de Preferência de Pagamento Recorrente no Mercado Pago
        const mpRes = await axios.post('https://api.mercadopago.com/preapproval', {
            payer_email: customer.email,
            back_url: 'https://healthyroutine.app/payment/success',
            reason: `Healthy Routine Casal - ${plan.name}`,
            auto_recurring: {
                frequency: plan.cycleMonths,
                frequency_type: 'months',
                transaction_amount: plan.totalPrice,
                currency_id: 'BRL',
            },
        }, { headers: { Authorization: `Bearer ${this.accessToken}` } });
        return {
            paymentId: mpRes.data.id,
            status: 'PENDING',
            invoiceUrl: mpRes.data.init_point,
            expiresAt: new Date(Date.now() + 86400000),
            amount: plan.totalPrice,
            isMocked: false,
        };
    }
}
// 🏭 FACTORY PATTERN: Seleciona o gateway ativo via .env
export class PaymentGatewayFactory {
    static getGateway() {
        const isMock = process.env.PAYMENT_MOCK_MODE === 'true';
        if (isMock) {
            return new MockPaymentGateway();
        }
        const gatewayType = (process.env.PAYMENT_GATEWAY || 'ASAAS').toUpperCase();
        if (gatewayType === 'MERCADO_PAGO') {
            return new MercadoPagoPaymentGateway();
        }
        return new AsaasPaymentGateway();
    }
}
