import { prisma } from '../../../shared/prisma/prisma.js';
export class ExpenseUseCase {
    async getExpenses(workspaceId) {
        const expenses = await prisma.expense.findMany({
            where: { workspaceId },
            include: {
                paidBy: {
                    select: { id: true, name: true, avatarUrl: true },
                },
            },
            orderBy: { date: 'desc' },
        });
        return expenses;
    }
    async createExpense(workspaceId, userId, data) {
        const expense = await prisma.expense.create({
            data: {
                workspaceId,
                title: data.title,
                amount: data.amount,
                category: data.category,
                paidByUserId: data.paidByUserId || userId,
                splitEqually: data.splitEqually,
                notes: data.notes,
                date: new Date(`${data.date}T12:00:00.000Z`),
            },
            include: {
                paidBy: {
                    select: { id: true, name: true },
                },
            },
        });
        return expense;
    }
    async getBalanceSummary(workspaceId) {
        const members = await prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: {
                user: { select: { id: true, name: true } },
            },
        });
        const expenses = await prisma.expense.findMany({
            where: { workspaceId },
        });
        const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
        // Calculate who paid what
        const userTotals = {};
        members.forEach((m) => {
            userTotals[m.userId] = { name: m.user.name, paid: 0 };
        });
        expenses.forEach((e) => {
            if (e.paidByUserId && userTotals[e.paidByUserId]) {
                userTotals[e.paidByUserId].paid += e.amount;
            }
        });
        const memberCount = Math.max(members.length, 1);
        const fairSharePerPerson = totalSpent / memberCount;
        // Calculate balances (positive = gets back, negative = owes)
        const balances = Object.keys(userTotals).map((uid) => ({
            userId: uid,
            name: userTotals[uid].name,
            totalPaid: userTotals[uid].paid,
            balance: userTotals[uid].paid - fairSharePerPerson,
        }));
        return {
            totalSpent,
            fairSharePerPerson,
            balances,
        };
    }
}
