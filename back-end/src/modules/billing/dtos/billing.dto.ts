import { z } from 'zod';

export const planBillingCycleEnum = z.enum([
  'MONTHLY',      // Mensal
  'QUARTERLY',    // Trimestral (3 meses)
  'SEMIANNUAL',   // Semestral (6 meses)
  'ANNUAL',       // Anual (12 meses)
]);

export const paymentMethodEnum = z.enum([
  'PIX',
  'CREDIT_CARD',
  'BOLETO',
]);

export const createCheckoutSchema = z.object({
  billingCycle: planBillingCycleEnum,
  paymentMethod: paymentMethodEnum.default('PIX'),
  customerName: z.string().min(2),
  customerCpfCnpj: z.string().min(11).max(14),
  customerPhone: z.string().optional(),
  creditCard: z.object({
    holderName: z.string(),
    number: z.string(),
    expiryMonth: z.string(),
    expiryYear: z.string(),
    ccv: z.string(),
  }).optional(),
});

export type PlanBillingCycle = z.infer<typeof planBillingCycleEnum>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;

// Tabela de Preços e Benefícios Oficiais do Casal
export const PLAN_PRICING: Record<PlanBillingCycle, {
  name: string;
  cycleMonths: number;
  totalPrice: number;
  monthlyEquivalent: number;
  discountPercentage: number;
  description: string;
}> = {
  MONTHLY: {
    name: 'Mensal Casal',
    cycleMonths: 1,
    totalPrice: 29.90,
    monthlyEquivalent: 29.90,
    discountPercentage: 0,
    description: 'Flexibilidade total, cancele quando quiser.',
  },
  QUARTERLY: {
    name: 'Trimestral Casal',
    cycleMonths: 3,
    totalPrice: 79.90,
    monthlyEquivalent: 26.63,
    discountPercentage: 11,
    description: 'Economize 11% para 3 meses de rotina e dates.',
  },
  SEMIANNUAL: {
    name: 'Semestral Casal',
    cycleMonths: 6,
    totalPrice: 149.90,
    monthlyEquivalent: 24.98,
    discountPercentage: 16,
    description: 'Economize 16% com 6 meses de cardápio e splitwise.',
  },
  ANNUAL: {
    name: 'Anual Casal (Mais Popular)',
    cycleMonths: 12,
    totalPrice: 249.90,
    monthlyEquivalent: 20.82,
    discountPercentage: 30,
    description: 'Melhor custo-benefício! 30% OFF no ano.',
  },
};
