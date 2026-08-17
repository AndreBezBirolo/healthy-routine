import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  paidByName: string;
  category: string;
  date: string;
}

export interface BalanceSummary {
  totalSpent: number;
  fairSharePerPerson: number;
  balances: Array<{
    userId?: string;
    userName?: string;
    name?: string;
    paid?: number;
    totalPaid?: number;
    netBalance?: number;
    balance?: number;
  }>;
}

interface ExpensesTabProps {
  expenses: ExpenseItem[];
  summary: BalanceSummary;
  onOpenNewExpenseModal: () => void;
}

export const ExpensesTab = ({
  expenses = [],
  summary = { totalSpent: 0, fairSharePerPerson: 0, balances: [] },
  onOpenNewExpenseModal,
}: ExpensesTabProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const totalSpentNum = typeof summary?.totalSpent === 'number' ? summary.totalSpent : 0;
  const fairShareNum = typeof summary?.fairSharePerPerson === 'number' ? summary.fairSharePerPerson : 0;
  const balancesList = Array.isArray(summary?.balances) ? summary.balances : [];

  return (
    <View style={styles.container}>
      {/* Header com Título e Botão Novo Gasto com layout responsivo */}
      <View style={styles.headerContainer}>
        <View style={styles.titleWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={2}>
            {t('expenses.sectionTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Divisão igualitária e compensação automática
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newExpenseBtn, { backgroundColor: colors.primary }]}
          onPress={onOpenNewExpenseModal}
          activeOpacity={0.7}
        >
          <Icon name="plus" color="#FFF" size={14} />
          <Text style={styles.newExpenseBtnText}>{t('expenses.newExpenseBtn')}</Text>
        </TouchableOpacity>
      </View>

      {/* Card de Resumo Geral */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('expenses.totalSpent')}</Text>
            <Text style={[styles.summaryValue, { color: colors.primaryDark }]}>
              R$ {totalSpentNum.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>{t('expenses.perPerson')}</Text>
            <Text style={[styles.summaryValueSmall, { color: colors.text }]}>
              R$ {fairShareNum.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Saldos Individuais */}
        {balancesList.length > 0 && (
          <View style={[styles.balancesList, { borderTopColor: colors.border }]}>
            {balancesList.map((b, idx) => {
              const uName = b.userName || b.name || 'Membro';
              const paidAmount = typeof b.paid === 'number' ? b.paid : typeof b.totalPaid === 'number' ? b.totalPaid : 0;
              const netBal = typeof b.netBalance === 'number' ? b.netBalance : typeof b.balance === 'number' ? b.balance : 0;

              const isPositive = netBal > 0;
              const isZero = Math.abs(netBal) < 0.01;

              return (
                <View key={b.userId || `bal-${idx}`} style={styles.balanceItem}>
                  <View>
                    <Text style={[styles.balanceUserName, { color: colors.text }]}>{uName}</Text>
                    <Text style={[styles.balancePaidText, { color: colors.textMuted }]}>
                      Pagou: R$ {paidAmount.toFixed(2).replace('.', ',')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.balanceBadge,
                      { backgroundColor: isZero ? colors.badgeBg : isPositive ? colors.primaryLight : colors.dangerLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.balanceBadgeText,
                        { color: isZero ? colors.textMuted : isPositive ? colors.primaryDark : colors.danger },
                      ]}
                    >
                      {isZero
                        ? t('expenses.settledUp')
                        : isPositive
                        ? t('expenses.youGetBack', { amount: `R$ ${netBal.toFixed(2).replace('.', ',')}` })
                        : t('expenses.youOwe', { amount: `R$ ${Math.abs(netBal).toFixed(2).replace('.', ',')}` })}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Lista de Despesas Recentes */}
      <Text style={[styles.historyHeader, { color: colors.textMuted }]}>Extrato de Despesas</Text>

      {expenses.map((exp) => (
        <View key={exp.id} style={[styles.expenseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.expenseIconBox, { backgroundColor: colors.badgeBg }]}>
            <Icon name="wallet" color={colors.primaryDark} size={18} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.expenseTitle, { color: colors.text }]}>{exp.title}</Text>
            <Text style={[styles.expenseSubtitle, { color: colors.textMuted }]}>
              {t('expenses.paidBy', { name: exp.paidByName })} • {exp.date}
            </Text>
          </View>
          <Text style={[styles.expenseAmount, { color: colors.text }]}>
            R$ {(typeof exp.amount === 'number' ? exp.amount : 0).toFixed(2).replace('.', ',')}
          </Text>
        </View>
      ))}

      {expenses.length === 0 && (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>💸</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum gasto registrado</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Registre compras do mercado, feira ou jantares para dividir automaticamente.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  newExpenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    flexShrink: 0,
  },
  newExpenseBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryValueSmall: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  balancesList: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceUserName: {
    fontSize: 14,
    fontWeight: '700',
  },
  balancePaidText: {
    fontSize: 12,
    marginTop: 2,
  },
  balanceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  balanceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
  },
  expenseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  expenseIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  expenseSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
