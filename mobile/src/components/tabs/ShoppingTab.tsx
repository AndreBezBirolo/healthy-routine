import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';
import { ShoppingItemUI } from '../../types/models';

export { ShoppingItemUI };

interface ShoppingTabProps {
  items: ShoppingItemUI[];
  currencySymbol?: string;
  onToggleItem: (id: string, checked: boolean) => void;
  onOpenAddItemModal: () => void;
  onClearChecked: () => void;
  onSelectItemDetail: (item: ShoppingItemUI) => void;
}

export const ShoppingTab = ({
  items,
  currencySymbol = 'R$',
  onToggleItem,
  onOpenAddItemModal,
  onClearChecked,
  onSelectItemDetail,
}: ShoppingTabProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  // Filtro de Recorrência: ALL (Tudo), WEEKLY (Semanal), MONTHLY (Mensal)
  const [filterRecurrence, setFilterRecurrence] = useState<'ALL' | 'WEEKLY' | 'MONTHLY'>('ALL');

  const filteredItems = items.filter((item) => {
    if (filterRecurrence === 'ALL') return true;
    return item.recurrence === filterRecurrence;
  });

  const pendingItems = filteredItems.filter((i) => !i.checked);
  const checkedItems = filteredItems.filter((i) => i.checked);

  // Calcula o total estimado dos itens pendentes
  const totalEstimated = pendingItems.reduce((acc, curr) => {
    return acc + (typeof curr.price === 'number' ? curr.price : 0);
  }, 0);

  const getCategoryName = (cat: string) => {
    switch (cat) {
      case 'PRODUCE':
        return t('shoppingDetail.catProduce');
      case 'SPICES':
        return t('shoppingDetail.catSpices');
      case 'HOUSEHOLD':
        return t('shoppingDetail.catHousehold');
      case 'HYGIENE':
        return t('shoppingDetail.catHygiene');
      case 'PET':
        return t('shoppingDetail.catPet');
      default:
        return t('shoppingDetail.catGroceries');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com Resumo de Itens Pendentes e Botão Adicionar */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('shopping.sectionTitle')}
          </Text>
          <Text style={[styles.pendingSubtitle, { color: colors.textMuted }]}>
            {t('shopping.pendingCount', { count: pendingItems.length })}
            {totalEstimated > 0 &&
              ` • ${t('shopping.estimated', { currency: currencySymbol, amount: totalEstimated.toFixed(2).replace('.', ',') })}`}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addItemBtn, { backgroundColor: colors.primary }]}
          onPress={onOpenAddItemModal}
          activeOpacity={0.7}
        >
          <Icon name="plus" color="#FFF" size={14} />
          <Text style={styles.addItemBtnText}>{t('shopping.addItemBtn')}</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro Rápido de Listas Recorrentes: Todas / Semanal / Mensal */}
      <View style={styles.filterRow}>
        {[
          { id: 'ALL', label: t('shopping.tabAll') },
          { id: 'WEEKLY', label: t('shopping.tabWeekly') },
          { id: 'MONTHLY', label: t('shopping.tabMonthly') },
        ].map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              filterRecurrence === f.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => setFilterRecurrence(f.id as any)}
          >
            <Text
              style={[
                styles.filterText,
                { color: colors.textMuted },
                filterRecurrence === f.id && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista de Itens Pendentes */}
      {pendingItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => onSelectItemDetail(item)}
          activeOpacity={0.7}
        >
          {/* Checkbox independente para marcar como comprado */}
          <TouchableOpacity
            style={styles.checkboxTouchable}
            onPress={() => onToggleItem(item.id, !item.checked)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={[styles.checkboxUnchecked, { borderColor: colors.border, backgroundColor: colors.background }]} />
          </TouchableOpacity>

          <View style={{ flex: 1, marginLeft: 10 }}>
            <View style={styles.itemTitleRow}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              {item.recurrence === 'WEEKLY' && (
                <View style={[styles.recBadge, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.recBadgeText, { color: colors.primaryDark }]}>Semanal 🔄</Text>
                </View>
              )}
              {item.recurrence === 'MONTHLY' && (
                <View style={[styles.recBadge, { backgroundColor: colors.secondaryLight }]}>
                  <Text style={[styles.recBadgeText, { color: colors.secondary }]}>
                    {item.nextPeriodLabel ? `📅 ${item.nextPeriodLabel}` : 'Mensal 📅'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.itemSubRow}>
              {item.quantity && (
                <Text style={[styles.itemQty, { color: colors.textMuted }]}>
                  {t('shopping.itemQuantity', { qty: item.quantity })}
                </Text>
              )}
              {typeof item.price === 'number' && item.price > 0 && (
                <Text style={[styles.itemPrice, { color: colors.primaryDark }]}>
                  • {currencySymbol} {item.price.toFixed(2).replace('.', ',')}
                </Text>
              )}
              {item.notes ? (
                <Text style={[styles.itemNotes, { color: colors.textMuted }]} numberOfLines={1}>
                  • 📝 {item.notes}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.categoryBadge, { backgroundColor: colors.badgeBg }]}>
            <Text style={[styles.categoryText, { color: colors.textMuted }]}>
              {getCategoryName(item.category)}
            </Text>
          </View>

          <Text style={[styles.chevronHint, { color: colors.textMuted }]}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Seção de Concluídos */}
      {checkedItems.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <View style={styles.checkedHeader}>
            <Text style={[styles.checkedTitle, { color: colors.textMuted }]}>
              Comprados ({checkedItems.length})
            </Text>
            <TouchableOpacity onPress={onClearChecked}>
              <Text style={[styles.clearBtnText, { color: colors.danger }]}>{t('shopping.clearCheckedBtn')}</Text>
            </TouchableOpacity>
          </View>

          {checkedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.itemCard,
                styles.itemCardChecked,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => onSelectItemDetail(item)}
              activeOpacity={0.7}
            >
              <TouchableOpacity
                style={styles.checkboxTouchable}
                onPress={() => onToggleItem(item.id, !item.checked)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.checkboxChecked, { backgroundColor: colors.primary, borderColor: colors.primary }]}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.itemNameChecked, { color: colors.textMuted }]}>
                  {item.name}
                </Text>
                {/* Rastreabilidade de quem comprou e próximo ciclo */}
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                  {item.lastPurchasedBy && (
                    <Text style={[styles.checkedMetaText, { color: colors.primaryDark }]}>
                      👤 Comprado por {item.lastPurchasedBy}
                    </Text>
                  )}
                  {item.nextPeriodLabel && (
                    <Text style={[styles.checkedMetaText, { color: colors.secondary }]}>
                      📅 {item.nextPeriodLabel}
                    </Text>
                  )}
                </View>
              </View>

              <View style={[styles.categoryBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.categoryText, { color: colors.textMuted }]}>
                  {getCategoryName(item.category)}
                </Text>
              </View>

              <Text style={[styles.chevronHint, { color: colors.textMuted }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Estado Vazio */}
      {items.length === 0 && (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('shopping.allDoneTitle')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {t('shopping.allDoneSubtitle')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  titleWrapper: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  pendingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    flexShrink: 0,
  },
  addItemBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  itemCardChecked: {
    opacity: 0.65,
  },
  checkboxTouchable: {
    padding: 2,
  },
  checkboxUnchecked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  checkboxChecked: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemNameChecked: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  recBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  itemSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  itemQty: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemNotes: {
    fontSize: 11,
    flex: 1,
  },
  checkedMetaText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chevronHint: {
    fontSize: 18,
    fontWeight: '700',
    paddingLeft: 4,
  },
  checkedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkedTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 4,
  },
});
