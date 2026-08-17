import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';
import { MealPlanItem } from '../../types/models';

interface TodayTabProps {
  meals: MealPlanItem[];
  currentUserId?: string;
  isPro?: boolean;
  onOpenSpecialModal: () => void;
  onOpenDinnerModal: () => void;
  onOpenCustomMealModal: () => void;
  onOpenBatchModal: () => void;
  onSpinRoulette: () => void;
  onOpenUpgradeModal: () => void;
  onSelectMealDetail: (meal: MealPlanItem) => void;
}

export const TodayTab = ({
  meals,
  currentUserId,
  isPro = false,
  onOpenSpecialModal,
  onOpenDinnerModal,
  onOpenCustomMealModal,
  onOpenBatchModal,
  onSpinRoulette,
  onOpenUpgradeModal,
  onSelectMealDetail,
}: TodayTabProps) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();

  // Filtro de Visualização: 'ME' (Minhas Refeições por padrão) ou 'ALL' (Todas do Grupo)
  const [viewFilter, setViewFilter] = useState<'ME' | 'ALL'>('ME');

  // Formatação dinâmica da data de hoje para o cabeçalho
  const todayDateFormatted = new Intl.DateTimeFormat(
    i18n.language === 'en' ? 'en-US' : 'pt-BR',
    { weekday: 'long', day: 'numeric', month: 'long' }
  ).format(new Date());

  const capitalizedDate =
    todayDateFormatted.charAt(0).toUpperCase() + todayDateFormatted.slice(1);

  // Filtra as refeições
  const filteredMeals = meals.filter((m) => {
    if (viewFilter === 'ALL') return true;
    if (!m.assignedTo?.id) return true; // Refeição compartilhada (ambos/todos)
    return m.assignedTo.id === currentUserId;
  });

  const lunchMeal = filteredMeals.find((m) => m.mealType === 'LUNCH');
  const dinnerMeal = filteredMeals.find((m) => m.mealType === 'DINNER');
  const customMeals = filteredMeals.filter((m) => m.mealType !== 'LUNCH' && m.mealType !== 'DINNER');

  const canAddMoreCustom = isPro || customMeals.length < 1;

  const handleAddCustomClick = () => {
    if (canAddMoreCustom) {
      onOpenCustomMealModal();
    } else {
      onOpenUpgradeModal();
    }
  };

  return (
    <View style={styles.container}>
      {/* Banner Principal Responsivo com Ações Rápidas */}
      <View style={[styles.bannerContainer, { backgroundColor: colors.primaryDark }]}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>{t('today.bannerTitle')}</Text>
          <Text style={styles.bannerSubtitle}>{capitalizedDate}</Text>
        </View>
        <View style={styles.bannerActionRow}>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: colors.primary }]} onPress={onOpenDinnerModal}>
            <Text style={styles.quickActionEmoji}>🌙</Text>
            <Text style={styles.quickActionText}>{t('today.dinnerButton')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: colors.secondary }]} onPress={onOpenSpecialModal}>
            <Text style={styles.quickActionEmoji}>✨</Text>
            <Text style={styles.quickActionText}>{t('today.specialButton')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Roleta Quebra de Rotina */}
      <TouchableOpacity
        style={[styles.rouletteBanner, { backgroundColor: colors.secondaryLight, borderColor: colors.secondary }]}
        onPress={onSpinRoulette}
        activeOpacity={0.8}
      >
        <View style={styles.rouletteIconBg}>
          <Icon name="dice" color={colors.secondary} size={24} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.rouletteTitle, { color: colors.secondary }]}>{t('today.rouletteTitle')}</Text>
          <Text style={[styles.rouletteSubtitle, { color: colors.textMuted }]}>{t('today.rouletteSubtitle')}</Text>
        </View>
        <Icon name="chevronRight" color={colors.secondary} size={20} />
      </TouchableOpacity>

      {/* Header com Filtro de Visualização (Minhas Refeições / Todas do Grupo) */}
      <View style={styles.filterSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('today.sectionTitle')}</Text>
        <View style={styles.filterPills}>
          <TouchableOpacity
            style={[
              styles.filterPillBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              viewFilter === 'ME' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => setViewFilter('ME')}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: colors.textMuted },
                viewFilter === 'ME' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              {t('today.filterMy')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPillBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              viewFilter === 'ALL' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => setViewFilter('ALL')}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: colors.textMuted },
                viewFilter === 'ALL' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              {t('today.filterAll')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Almoço de Hoje - Toque para Detalhes / Edição / Consumo */}
      <TouchableOpacity
        style={[
          styles.mealCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          lunchMeal?.isConsumed && { borderColor: colors.primary, opacity: 0.8 },
        ]}
        onPress={() => lunchMeal && onSelectMealDetail(lunchMeal)}
        activeOpacity={lunchMeal ? 0.7 : 1}
      >
        <View style={styles.mealCardHeader}>
          <View style={styles.mealBadgeRow}>
            <Text style={[styles.mealTypeBadge, { backgroundColor: colors.primaryLight, color: colors.primaryDark }]}>
              ☀️ {t('today.lunch')}
            </Text>
            {lunchMeal?.isConsumed && (
              <View style={[styles.consumedBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.consumedBadgeText, { color: colors.primaryDark }]}>{t('today.consumedBadge')}</Text>
              </View>
            )}
            {lunchMeal?.isMealPrep && (
              <View style={[styles.prepTag, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.prepTagText, { color: colors.primaryDark }]}>🍱 {t('today.mealPrepReady')}</Text>
              </View>
            )}
            {lunchMeal?.assignedTo?.name && (
              <View style={[styles.memberTag, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.memberTagText, { color: colors.textMuted }]}>👤 {lunchMeal.assignedTo.name}</Text>
              </View>
            )}
          </View>
          {!lunchMeal ? (
            <TouchableOpacity onPress={onOpenBatchModal}>
              <Text style={[styles.emptyActionLink, { color: colors.primary }]}>{t('today.schedulePrepLink')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.tapDetailHint, { color: colors.textMuted }]}>{t('mealDetail.seeEditHint')}</Text>
          )}
        </View>

        <Text style={[styles.recipeTitle, { color: colors.text }]}>
          {lunchMeal ? lunchMeal.recipeTitle : t('today.noLunch')}
        </Text>
        {lunchMeal?.notes && (
          <Text style={[styles.mealNotes, { color: colors.textMuted }]}>
            {t('today.notesPrefix', { notes: lunchMeal.notes })}
          </Text>
        )}
      </TouchableOpacity>

      {/* Card Jantar de Hoje - Toque para Detalhes / Edição / Consumo */}
      <TouchableOpacity
        style={[
          styles.mealCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          dinnerMeal?.isConsumed && { borderColor: colors.primary, opacity: 0.8 },
        ]}
        onPress={() => dinnerMeal && onSelectMealDetail(dinnerMeal)}
        activeOpacity={dinnerMeal ? 0.7 : 1}
      >
        <View style={styles.mealCardHeader}>
          <View style={styles.mealBadgeRow}>
            <Text style={[styles.mealTypeBadge, { backgroundColor: colors.secondaryLight, color: colors.secondary }]}>
              🌙 {t('today.dinner')}
            </Text>
            {dinnerMeal?.isConsumed && (
              <View style={[styles.consumedBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.consumedBadgeText, { color: colors.primaryDark }]}>{t('today.consumedBadge')}</Text>
              </View>
            )}
            {dinnerMeal?.isMealPrep && (
              <View style={[styles.prepTag, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.prepTagText, { color: colors.primaryDark }]}>🍱 {t('today.mealPrepReady')}</Text>
              </View>
            )}
            {dinnerMeal?.isSpecial && (
              <View style={[styles.specialTag, { backgroundColor: colors.secondaryLight }]}>
                <Text style={[styles.specialTagText, { color: colors.secondary }]}>✨ {t('today.breakMonotony')}</Text>
              </View>
            )}
            {dinnerMeal?.assignedTo?.name && (
              <View style={[styles.memberTag, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.memberTagText, { color: colors.textMuted }]}>👤 {dinnerMeal.assignedTo.name}</Text>
              </View>
            )}
          </View>
          {!dinnerMeal ? (
            <TouchableOpacity onPress={onOpenDinnerModal}>
              <Text style={[styles.emptyActionLink, { color: colors.secondary }]}>{t('today.defineDinnerLink')}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.tapDetailHint, { color: colors.textMuted }]}>{t('mealDetail.seeEditHint')}</Text>
          )}
        </View>

        <Text style={[styles.recipeTitle, { color: colors.text }]}>
          {dinnerMeal ? dinnerMeal.recipeTitle : t('today.noDinner')}
        </Text>
        {dinnerMeal?.notes && (
          <Text style={[styles.mealNotes, { color: colors.textMuted }]}>
            {t('today.notesPrefix', { notes: dinnerMeal.notes })}
          </Text>
        )}
      </TouchableOpacity>

      {/* Refeições Extras Personalizadas (Café da Manhã, Lanches, etc.) */}
      {customMeals.map((meal) => (
        <TouchableOpacity
          key={meal.id}
          style={[
            styles.mealCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            meal.isConsumed && { borderColor: colors.primary, opacity: 0.8 },
          ]}
          onPress={() => onSelectMealDetail(meal)}
          activeOpacity={0.7}
        >
          <View style={styles.mealCardHeader}>
            <View style={styles.mealBadgeRow}>
              <Text style={[styles.mealTypeBadge, { backgroundColor: colors.primaryLight, color: colors.primaryDark }]}>
                ☕ {meal.mealType === 'BREAKFAST' ? t('today.breakfast') : t('today.snack')}
              </Text>
              {meal.isConsumed && (
                <View style={[styles.consumedBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.consumedBadgeText, { color: colors.primaryDark }]}>{t('today.consumedBadge')}</Text>
                </View>
              )}
              {meal.assignedTo?.name && (
                <View style={[styles.memberTag, { backgroundColor: colors.badgeBg }]}>
                  <Text style={[styles.memberTagText, { color: colors.textMuted }]}>👤 {meal.assignedTo.name}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tapDetailHint, { color: colors.textMuted }]}>{t('mealDetail.seeEditHint')}</Text>
          </View>
          <Text style={[styles.recipeTitle, { color: colors.text }]}>{meal.recipeTitle}</Text>
          {meal.notes && (
            <Text style={[styles.mealNotes, { color: colors.textMuted }]}>
              {t('today.notesPrefix', { notes: meal.notes })}
            </Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Botão para Adicionar Refeição Extra (com limite no Plano Free e Ilimitado no Pro) */}
      <TouchableOpacity
        style={[styles.addCustomMealBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
        onPress={handleAddCustomClick}
        activeOpacity={0.7}
      >
        <Text style={styles.addCustomEmoji}>☕</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.addCustomTitle, { color: colors.text }]}>{t('today.addCustomTitle')}</Text>
          <Text style={[styles.addCustomSub, { color: colors.textMuted }]}>
            {isPro
              ? t('today.addCustomProSub')
              : customMeals.length >= 1
              ? t('today.addCustomLimitSub')
              : t('today.addCustomFreeSub')}
          </Text>
        </View>
        {!isPro && customMeals.length >= 1 && (
          <View style={[styles.proMiniBadge, { backgroundColor: colors.secondaryLight }]}>
            <Text style={[styles.proMiniBadgeText, { color: colors.secondary }]}>PRO 👑</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Banner Agendar Marmitas para a Semana */}
      <TouchableOpacity
        style={[styles.batchBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onOpenBatchModal}
        activeOpacity={0.8}
      >
        <View style={styles.batchLeft}>
          <Text style={styles.batchEmoji}>🍱</Text>
          <View style={styles.batchTitleWrapper}>
            <Text style={[styles.batchTitle, { color: colors.text }]} numberOfLines={2}>
              {t('today.batchBannerTitle')}
            </Text>
            <Text style={[styles.batchSubtitle, { color: colors.textMuted }]} numberOfLines={2}>
              {t('today.batchBannerSubtitle')}
            </Text>
          </View>
        </View>
        <View style={[styles.batchButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.batchButtonText}>{t('today.batchBtn')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  bannerContainer: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#A7F3D0',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bannerActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  quickActionEmoji: {
    fontSize: 12,
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rouletteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rouletteIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rouletteTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  rouletteSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  filterPills: {
    flexDirection: 'row',
    gap: 6,
  },
  filterPillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  mealCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  mealBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  mealTypeBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  consumedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  consumedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  specialTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specialTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  prepTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prepTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  memberTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyActionLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  tapDetailHint: {
    fontSize: 11,
    fontWeight: '700',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  mealNotes: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  addCustomMealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  addCustomEmoji: {
    fontSize: 22,
  },
  addCustomTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  addCustomSub: {
    fontSize: 11,
    marginTop: 2,
  },
  proMiniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proMiniBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  batchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 6,
    gap: 10,
  },
  batchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  batchEmoji: {
    fontSize: 24,
  },
  batchTitleWrapper: {
    flex: 1,
    paddingRight: 4,
  },
  batchTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  batchSubtitle: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  batchButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexShrink: 0,
  },
  batchButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
