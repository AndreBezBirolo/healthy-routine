import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';

export interface RecipeItem {
  id: string;
  title: string;
  category: 'GOURMET' | 'WEEKEND' | 'DESSERT';
  prepTime: string;
  difficulty: string;
  ingredients?: string[];
  description?: string;
}

interface SpecialTabProps {
  recipes: RecipeItem[];
  workspaceId?: string;
  onSelectRecipe: (recipe: RecipeItem) => void;
  onOpenNewRecipeModal: () => void;
  onSpinRoulette: () => void;
  onAddIngredientsToMarket: (recipe: RecipeItem) => void;
}

export const SpecialTab = ({
  recipes,
  onSelectRecipe,
  onOpenNewRecipeModal,
  onSpinRoulette,
  onAddIngredientsToMarket,
}: SpecialTabProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {/* Banner de Roleta de Pratos */}
      <TouchableOpacity
        style={[styles.rouletteBanner, { backgroundColor: colors.secondaryLight, borderColor: colors.secondary }]}
        onPress={onSpinRoulette}
        activeOpacity={0.8}
      >
        <View style={styles.rouletteLeft}>
          <Text style={styles.rouletteEmoji}>🎲</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rouletteTitle, { color: colors.secondary }]}>
              {t('special.rouletteTitle')}
            </Text>
            <Text style={[styles.rouletteSubtitle, { color: colors.textMuted }]}>
              {t('special.rouletteSubtitle')}
            </Text>
          </View>
        </View>
        <View style={[styles.rouletteButton, { backgroundColor: colors.secondary }]}>
          <Text style={styles.rouletteButtonText}>Girar</Text>
        </View>
      </TouchableOpacity>

      {/* Header do Catálogo com layout responsivo */}
      <View style={styles.headerContainer}>
        <View style={styles.titleWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]} numberOfLines={2}>
            {t('special.headerTitle')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {t('special.headerSubtitle')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={onOpenNewRecipeModal}
          activeOpacity={0.7}
        >
          <Icon name="plus" color="#FFF" size={14} />
          <Text style={styles.createBtnText}>{t('special.createButton')}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Receitas Especiais */}
      {recipes.map((item) => (
        <View
          key={item.id}
          style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.recipeTitle, { color: colors.text }]}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>⏱ {item.prepTime}</Text>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>•</Text>
                <Text style={[styles.metaText, { color: colors.textMuted }]}>⚡ {item.difficulty}</Text>
              </View>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: colors.badgeBg }]}>
              <Text style={[styles.categoryText, { color: colors.textMuted }]}>{item.category}</Text>
            </View>
          </View>

          {item.description && (
            <Text style={[styles.recipeDesc, { color: colors.textMuted }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          {/* Ações da Receita */}
          <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.marketActionBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
              onPress={() => onAddIngredientsToMarket(item)}
            >
              <Icon name="cart" color={colors.primaryDark} size={14} />
              <Text style={[styles.marketActionText, { color: colors.primaryDark }]}>{t('special.buyIngredientsBtn')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => onSelectRecipe(item)}
            >
              <Text style={[styles.planActionText, { color: colors.text }]}>{t('special.addToMenuBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {recipes.length === 0 && (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('special.emptyTitle')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {t('special.emptySubtitle')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  rouletteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  rouletteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 10,
  },
  rouletteEmoji: {
    fontSize: 28,
  },
  rouletteTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  rouletteSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rouletteButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rouletteButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    flexShrink: 0,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  recipeCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recipeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  marketActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  marketActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  planActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
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
