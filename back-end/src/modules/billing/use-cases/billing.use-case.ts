import { prisma } from '../../../shared/prisma/prisma.js';
import { CreateCheckoutInput, PLAN_PRICING } from '../dtos/billing.dto.js';
import { PaymentGatewayFactory } from '../gateways/payment-gateway.js';

export class BillingUseCase {
  async getPlans() {
    return {
      plans: Object.entries(PLAN_PRICING).map(([key, plan]) => ({
        id: key,
        ...plan,
      })),
      features: [
        'Compartilhamento ilimitado com o parceiro(a)',
        'Cardápio semanal & marmitas da semana',
        'Roleta e catálogo de dates para sair da rotina',
        'Lista de compras compartilhada com sync 1-toque',
        'Divisão de despesas do casal (Splitwise integrado)',
        'Auditoria e histórico em tempo real',
        'Sugestões por IA Culinária',
      ],
    };
  }

  async createCheckout(workspaceId: string, userId: string, input: CreateCheckoutInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const gateway = PaymentGatewayFactory.getGateway();

    const result = await gateway.createSubscription(
      {
        id: user.id,
        name: input.customerName || user.name,
        email: user.email,
        cpfCnpj: input.customerCpfCnpj,
        phone: input.customerPhone,
      },
      input.billingCycle,
      input
    );

    // Cria ou atualiza o registro de assinatura no banco
    const plan = PLAN_PRICING[input.billingCycle];
    const durationDays = plan.cycleMonths * 30;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await prisma.subscription.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        planType: input.billingCycle,
        status: result.status === 'CONFIRMED' ? 'ACTIVE' : 'PENDING',
        currentPeriodEnd: expiresAt,
      },
      update: {
        planType: input.billingCycle,
        status: result.status === 'CONFIRMED' ? 'ACTIVE' : 'PENDING',
        currentPeriodEnd: expiresAt,
      },
    });

    return {
      success: true,
      checkout: result,
      plan: plan.name,
    };
  }

  async getSubscriptionStatus(workspaceId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { workspaceId },
    });

    if (!subscription) {
      return {
        isActive: false,
        plan: 'FREE',
        status: 'FREE_TIER',
        expiresAt: null,
      };
    }

    const isActive =
      subscription.status === 'ACTIVE' &&
      (subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) > new Date() : true);

    return {
      isActive,
      plan: subscription.planType,
      status: subscription.status,
      expiresAt: subscription.currentPeriodEnd,
    };
  }
}
