import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { ShoppingItemUI } from '../../types/models';

interface ShoppingDetailModalProps {
  visible: boolean;
  item: ShoppingItemUI | null;
  currencySymbol?: string;
  onClose: () => void;
  onToggleItem: (itemId: string, checked: boolean) => void;
  onUpdateItem: (itemId: string, data: Partial<ShoppingItemUI>) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ShoppingDetailModal = ({
  visible,
  item,
  currencySymbol = 'R$',
  onClose,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
}: ShoppingDetailModalProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('GROCERIES');
  const [recurrence, setRecurrence] = useState<'NONE' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity || '');
      setPrice(item.price ? String(item.price) : '');
      setCategory(item.category || 'GROCERIES');
      setRecurrence(item.recurrence || 'NONE');
      setNotes(item.notes || '');
      setIsEditing(false);
    }
  }, [item, visible]);

  if (!item) return null;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert(t('alerts.warningTitle'), t('shoppingDetail.nameRequired'));
      return;
    }

    const priceNum = price.trim() ? parseFloat(price.replace(',', '.')) : undefined;

    onUpdateItem(item.id, {
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      price: priceNum,
      category,
      recurrence,
      notes: notes.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      t('shoppingDetail.deleteConfirmTitle'),
      t('shoppingDetail.deleteConfirmMsg', { name: item.name }),
      [
        { text: t('mealDetail.cancelBtn'), style: 'cancel' },
        {
          text: t('mealDetail.deleteBtn'),
          style: 'destructive',
          onPress: () => {
            onDeleteItem(item.id);
            onClose();
          },
        },
      ]
    );
  };

  const getCategoryLabel = (cat: string) => {
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

  const getRecurrenceLabel = (rec: string) => {
    switch (rec) {
      case 'WEEKLY':
        return t('shoppingDetail.recWeekly');
      case 'MONTHLY':
        return t('shoppingDetail.recMonthly');
      default:
        return t('shoppingDetail.recNone');
    }
  };

  const formattedPurchasedTime = item.lastPurchasedAt
    ? new Date(item.lastPurchasedAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header com Categoria e Status */}
            <View style={styles.headerRow}>
              <View style={[styles.catBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.catBadgeText, { color: colors.primaryDark }]}>
                  {getCategoryLabel(item.category)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  item.checked && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                ]}
                onPress={() => onToggleItem(item.id, !item.checked)}
                activeOpacity={0.7}
              >
                <Text style={styles.statusToggleEmoji}>{item.checked ? '✅' : '🛒'}</Text>
                <Text
                  style={[
                    styles.statusToggleText,
                    { color: colors.textMuted },
                    item.checked && { color: colors.primaryDark, fontWeight: '800' },
                  ]}
                >
                  {item.checked ? t('shoppingDetail.boughtStatus') : t('shoppingDetail.pendingStatus')}
                </Text>
              </TouchableOpacity>
            </View>

            {!isEditing ? (
              <View style={styles.viewContent}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>

                {/* Banner de Previsão de Próximo Período para itens Recorrentes */}
                {item.recurrence && item.recurrence !== 'NONE' && (
                  <View
                    style={[
                      styles.cycleBanner,
                      {
                        backgroundColor: item.checked ? colors.secondaryLight : colors.primaryLight,
                        borderColor: item.checked ? colors.secondary : colors.primary,
                      },
                    ]}
                  >
                    <Text style={styles.cycleBannerEmoji}>
                      {item.recurrence === 'MONTHLY' ? '📅' : '🔄'}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.cycleBannerTitle,
                          { color: item.checked ? colors.secondary : colors.primaryDark },
                        ]}
                      >
                        {item.nextPeriodLabel
                          ? `Próximo Ciclo: ${item.nextPeriodLabel}`
                          : item.recurrence === 'MONTHLY'
                          ? 'Recorrência Mensal 📅'
                          : 'Recorrência Semanal 🔄'}
                      </Text>
                      <Text style={[styles.cycleBannerSub, { color: colors.textMuted }]}>
                        {item.checked
                          ? 'Item comprado no período atual! Ao limpar, será agendado para o próximo período.'
                          : 'Item recorrente da lista de compras.'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Histórico da Última Compra */}
                {item.lastPurchasedAt && (
                  <View style={[styles.auditBox, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.auditText, { color: colors.primaryDark }]}>
                      {t('shoppingDetail.lastPurchasedAudit', {
                        user: item.lastPurchasedBy || t('alerts.you'),
                        time: formattedPurchasedTime,
                      })}
                    </Text>
                  </View>
                )}

                {/* Grade de Informações (Quantidade, Preço, Recorrência) */}
                <View style={[styles.infoGrid, { borderColor: colors.border }]}>
                  {item.quantity && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{t('shoppingDetail.quantityLabel')}</Text>
                      <Text style={[styles.infoVal, { color: colors.text }]}>{item.quantity}</Text>
                    </View>
                  )}

                  {typeof item.price === 'number' && item.price > 0 && (
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{t('shoppingDetail.priceLabel')}</Text>
                      <Text style={[styles.infoVal, { color: colors.primaryDark }]}>
                        {currencySymbol} {item.price.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{t('tasks.recurrenceLabel')}:</Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {getRecurrenceLabel(item.recurrence || 'NONE')}
                    </Text>
                  </View>
                </View>

                {item.notes ? (
                  <View style={styles.sectionBox}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{t('mealDetail.notesLabel')}</Text>
                    <Text style={[styles.bodyText, { color: colors.text }]}>{item.notes}</Text>
                  </View>
                ) : null}

                {/* Botões de Ação */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>{t('mealDetail.editBtn')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.danger }]}>{t('mealDetail.deleteBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Formulário de Edição */
              <View style={styles.editContent}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('shoppingDetail.itemNameLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('shoppingDetail.itemNameLabel')}
                  placeholderTextColor={colors.textMuted}
                />

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('shoppingDetail.quantityLabel')}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      value={quantity}
                      onChangeText={setQuantity}
                      placeholder="Ex: 2kg / 1 un"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('shoppingDetail.priceLabel')}</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0,00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                {/* Recorrência */}
                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('tasks.recurrenceLabel')}</Text>
                <View style={styles.pillsWrap}>
                  {[
                    { id: 'NONE', label: t('shoppingDetail.recNone') },
                    { id: 'WEEKLY', label: t('shoppingDetail.recWeekly') },
                    { id: 'MONTHLY', label: t('shoppingDetail.recMonthly') },
                  ].map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[
                        styles.pillOption,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        recurrence === r.id && { backgroundColor: colors.secondaryLight, borderColor: colors.secondary },
                      ]}
                      onPress={() => setRecurrence(r.id as any)}
                    >
                      <Text
                        style={[
                          styles.pillOptionText,
                          { color: colors.textMuted },
                          recurrence === r.id && { color: colors.secondary, fontWeight: '800' },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Observações */}
                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('mealDetail.notesLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Ex: Marca favorita, versão integral, etc."
                  placeholderTextColor={colors.textMuted}
                />

                <View style={styles.editButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>{t('mealDetail.cancelBtn')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>{t('mealDetail.saveBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>{t('mealDetail.closeBtn')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statusToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statusToggleEmoji: {
    fontSize: 14,
  },
  statusToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewContent: {
    gap: 14,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  cycleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  cycleBannerEmoji: {
    fontSize: 22,
  },
  cycleBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  cycleBannerSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  auditBox: {
    padding: 10,
    borderRadius: 10,
  },
  auditText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoGrid: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionBox: {
    gap: 6,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  editContent: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  pillOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillOptionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    elevation: 2,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
