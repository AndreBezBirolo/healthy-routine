import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { MealPlanItem } from '../../types/models';

export interface WeekDayItem {
  day: string;
  date: string;
  lunch: string;
  lunchIsPrep?: boolean;
  lunchMeal?: MealPlanItem;
  dinner: string;
  dinnerIsPrep?: boolean;
  dinnerMeal?: MealPlanItem;
  isPrep?: boolean;
  isSpecial?: boolean;
  extraCount?: number;
  extraTitles?: string[];
  extraMeals?: MealPlanItem[];
  rawMeals?: MealPlanItem[];
}

interface WeekTabProps {
  days: WeekDayItem[];
  onOpenBatchModal: () => void;
  onSelectMeal?: (meal: MealPlanItem) => void;
}

export const WeekTab = ({ days, onOpenBatchModal, onSelectMeal }: WeekTabProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Header com Título e Botão Marmitas em Lote */}
      <View style={styles.headerContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('week.sectionTitle')}</Text>
        <TouchableOpacity style={[styles.batchLink, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]} onPress={onOpenBatchModal}>
          <Text style={[styles.batchLinkText, { color: colors.primaryDark }]}>{t('week.batchLink')}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista dos 7 Dias da Semana com Toque para Abrir Detalhes das Refeições */}
      {days.map((item, index) => (
        <View
          key={index}
          style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {/* Header do Dia */}
          <View style={styles.dayHeader}>
            <View style={styles.dayBadgeRow}>
              <Text style={[styles.dayName, { color: colors.text }]}>{item.day}</Text>
              <Text style={[styles.dayDate, { color: colors.textMuted }]}>{item.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {item.isPrep && (
                <View style={[styles.prepBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.prepText, { color: colors.primaryDark }]}>{t('week.prepBadge')}</Text>
                </View>
              )}
              {item.isSpecial && (
                <View style={[styles.specialBadge, { backgroundColor: colors.secondaryLight }]}>
                  <Text style={[styles.specialText, { color: colors.secondary }]}>{t('week.specialBadge')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Linhas de Almoço e Jantar - Toque para Abrir Modal de Detalhes / Edição */}
          <View style={styles.mealRows}>
            <TouchableOpacity
              style={styles.mealRow}
              onPress={() => item.lunchMeal && onSelectMeal && onSelectMeal(item.lunchMeal)}
              disabled={!item.lunchMeal || !onSelectMeal}
              activeOpacity={item.lunchMeal ? 0.65 : 1}
            >
              <Text style={[styles.mealLabel, { color: colors.textMuted }]}>{t('week.lunchLabel')}</Text>
              <Text style={[styles.mealValue, { color: colors.text }]} numberOfLines={1}>
                {item.lunch}
              </Text>
              {item.lunchMeal && <Text style={[styles.detailChevron, { color: colors.textMuted }]}>›</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mealRow}
              onPress={() => item.dinnerMeal && onSelectMeal && onSelectMeal(item.dinnerMeal)}
              disabled={!item.dinnerMeal || !onSelectMeal}
              activeOpacity={item.dinnerMeal ? 0.65 : 1}
            >
              <Text style={[styles.mealLabel, { color: colors.textMuted }]}>{t('week.dinnerLabel')}</Text>
              <Text style={[styles.mealValue, { color: colors.text }]} numberOfLines={1}>
                {item.dinner}
              </Text>
              {item.dinnerMeal && <Text style={[styles.detailChevron, { color: colors.textMuted }]}>›</Text>}
            </TouchableOpacity>

            {/* Exibição de Refeições Extras no Dia */}
            {typeof item.extraCount === 'number' && item.extraCount > 0 && (
              <View style={[styles.extraMealRow, { borderTopColor: colors.border }]}>
                <Text style={[styles.extraMealLabel, { color: colors.textMuted }]}>{t('week.extrasLabel')}</Text>
                <Text style={[styles.extraMealValue, { color: colors.primaryDark }]} numberOfLines={1}>
                  {item.extraTitles?.join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  batchLink: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  batchLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '800',
  },
  dayDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  prepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  prepText: {
    fontSize: 10,
    fontWeight: '800',
  },
  specialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  specialText: {
    fontSize: 10,
    fontWeight: '800',
  },
  mealRows: {
    gap: 6,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  mealLabel: {
    fontSize: 13,
    fontWeight: '700',
    width: 60,
  },
  mealValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  detailChevron: {
    fontSize: 18,
    fontWeight: '700',
  },
  extraMealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  extraMealLabel: {
    fontSize: 11,
    fontWeight: '700',
    width: 55,
  },
  extraMealValue: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
});
