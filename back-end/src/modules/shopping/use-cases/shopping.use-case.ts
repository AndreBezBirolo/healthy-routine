import { prisma } from '../../../shared/prisma/prisma.js';
import { CreateShoppingItemInput, UpdateShoppingItemInput } from '../dtos/shopping.dto.js';
import { AppError } from '../../../shared/errors/app-error.js';

export class ShoppingUseCase {
  async getShoppingList(workspaceId: string) {
    const items = await prisma.shoppingItem.findMany({
      where: { workspaceId },
      orderBy: [{ checked: 'asc' }, { createdAt: 'desc' }],
      include: {
        addedBy: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return items;
  }

  async addItem(workspaceId: string, userId: string, data: CreateShoppingItemInput) {
    const item = await prisma.shoppingItem.create({
      data: {
        workspaceId,
        addedByUserId: userId,
        name: data.name,
        quantity: data.quantity,
        price: data.price,
        category: data.category,
        recurrence: data.recurrence,
        notes: data.notes,
        checked: false,
      },
      include: {
        addedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return item;
  }

  async updateItem(itemId: string, data: UpdateShoppingItemInput) {
    const existing = await prisma.shoppingItem.findUnique({ where: { id: itemId } });
    if (!existing) {
      throw new AppError('SHOPPING_ITEM_NOT_FOUND', 404);
    }

    const item = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        quantity: data.quantity,
        price: data.price,
        category: data.category,
        recurrence: data.recurrence,
        notes: data.notes,
        checked: data.checked,
      },
      include: {
        addedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return item;
  }

  async toggleItem(itemId: string, checked: boolean, userId?: string) {
    const existing = await prisma.shoppingItem.findUnique({ where: { id: itemId } });
    if (!existing) {
      throw new AppError('SHOPPING_ITEM_NOT_FOUND', 404);
    }

    let userObj = null;
    if (userId) {
      userObj = await prisma.user.findUnique({ where: { id: userId } });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1..12

    // Calcula o rótulo do próximo período caso o item seja recorrente
    let nextPeriodLabel = null;
    if (checked && existing.recurrence === 'MONTHLY') {
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthName = nextMonthDate.toLocaleDateString('pt-BR', { month: 'long' });
      const capMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      const nextMonthNum = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
      nextPeriodLabel = `Próximo: ${capMonth} (Mês ${nextMonthNum})`;
    } else if (checked && existing.recurrence === 'WEEKLY') {
      nextPeriodLabel = 'Próxima Semana 🔄';
    }

    const item = await prisma.shoppingItem.update({
      where: { id: itemId },
      data: {
        checked,
        checkedAt: checked ? now : null,
        checkedByUserId: checked ? userId : null,
        lastPurchasedAt: checked ? now : existing.lastPurchasedAt,
        lastPurchasedBy: checked && userObj ? userObj.name : existing.lastPurchasedBy,
        nextPeriodLabel: checked ? nextPeriodLabel : existing.nextPeriodLabel,
      },
      include: {
        addedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return item;
  }

  async deleteItem(itemId: string) {
    const existing = await prisma.shoppingItem.findUnique({ where: { id: itemId } });
    if (!existing) {
      throw new AppError('SHOPPING_ITEM_NOT_FOUND', 404);
    }

    await prisma.shoppingItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  async clearCheckedItems(workspaceId: string) {
    // 1. Exclui permanentemente itens avulsos (recurrence == "NONE")
    await prisma.shoppingItem.deleteMany({
      where: {
        workspaceId,
        checked: true,
        recurrence: 'NONE',
      },
    });

    // 2. Para itens recorrentes (WEEKLY / MONTHLY), NÃO exclui: desmarca (checked: false)
    // para reaparecerem na lista já com a indicação do próximo período agendado!
    await prisma.shoppingItem.updateMany({
      where: {
        workspaceId,
        checked: true,
        recurrence: { in: ['WEEKLY', 'MONTHLY'] },
      },
      data: {
        checked: false,
        checkedAt: null,
        checkedByUserId: null,
      },
    });

    return { success: true };
  }
}
