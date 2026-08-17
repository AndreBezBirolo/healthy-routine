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
import { MealPlanItem } from '../../types/models';
import { WorkspaceMemberOption } from './MealModal';
import { Icon } from '../common/Icon';

interface MealDetailModalProps {
  visible: boolean;
  meal: MealPlanItem | null;
  workspaceMembers?: WorkspaceMemberOption[];
  onClose: () => void;
  onToggleConsumed: (mealId: string, isConsumed: boolean) => void;
  onUpdateMeal: (mealId: string, data: { recipeTitle: string; ingredients?: string[]; notes?: string; assignedToUserId?: string | null }) => void;
  onDeleteMeal: (mealId: string) => void;
  onAddIngredientsToMarket: (ingredients: string[], recipeTitle: string) => void;
}

export const MealDetailModal = ({
  visible,
  meal,
  workspaceMembers = [],
  onClose,
  onToggleConsumed,
  onUpdateMeal,
  onDeleteMeal,
  onAddIngredientsToMarket,
}: MealDetailModalProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (meal) {
      setRecipeTitle(meal.recipeTitle);
      setNotes(meal.notes || '');
      setIngredientsText(meal.ingredients && Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : '');
      setAssignedMemberId(meal.assignedTo?.id || null);
      setIsEditing(false);
    }
  }, [meal, visible]);

  if (!meal) return null;

  const handleSave = () => {
    if (!recipeTitle.trim()) {
      Alert.alert(t('alerts.warningTitle'), t('alerts.fillRecipeName'));
      return;
    }

    const ingList = ingredientsText
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    onUpdateMeal(meal.id, {
      recipeTitle: recipeTitle.trim(),
      ingredients: ingList,
      notes: notes.trim() || undefined,
      assignedToUserId: assignedMemberId,
    });
    setIsEditing(false);
  };

  const handleAddIngredients = () => {
    const list = meal.ingredients && meal.ingredients.length > 0
      ? meal.ingredients
      : ingredientsText.split(',').map((i) => i.trim()).filter((i) => i.length > 0);

    if (list.length === 0) {
      Alert.alert(t('alerts.warningTitle'), t('mealDetail.noIngredients'));
      return;
    }

    onAddIngredientsToMarket(list, meal.recipeTitle);
  };

  const handleDelete = () => {
    Alert.alert(
      t('mealDetail.deleteConfirmTitle'),
      t('mealDetail.deleteConfirmMsg', { title: meal.recipeTitle }),
      [
        { text: t('mealDetail.cancelBtn'), style: 'cancel' },
        {
          text: t('mealDetail.deleteBtn'),
          style: 'destructive',
          onPress: () => {
            onDeleteMeal(meal.id);
            onClose();
          },
        },
      ]
    );
  };

  const getMealTypeName = (type: string) => {
    switch (type) {
      case 'BREAKFAST':
        return `☕ ${t('today.breakfast')}`;
      case 'LUNCH':
        return `☀️ ${t('today.lunch')}`;
      case 'DINNER':
        return `🌙 ${t('today.dinner')}`;
      case 'SNACK':
        return `🥪 ${t('today.snack')}`;
      default:
        return '🍽️ Refeição';
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header com Tipo e Status */}
            <View style={styles.headerRow}>
              <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.typeBadgeText, { color: colors.primaryDark }]}>
                  {getMealTypeName(meal.mealType)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.consumedToggleBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  meal.isConsumed && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                ]}
                onPress={() => onToggleConsumed(meal.id, !meal.isConsumed)}
                activeOpacity={0.7}
              >
                <Text style={styles.consumedToggleEmoji}>{meal.isConsumed ? '✅' : '⭕'}</Text>
                <Text
                  style={[
                    styles.consumedToggleText,
                    { color: colors.textMuted },
                    meal.isConsumed && { color: colors.primaryDark, fontWeight: '800' },
                  ]}
                >
                  {meal.isConsumed ? t('mealDetail.alreadyConsumedBtn') : t('mealDetail.markConsumedBtn')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Conteúdo em Modo Leitura ou Edição */}
            {!isEditing ? (
              <View style={styles.viewContent}>
                <Text style={[styles.dishTitle, { color: colors.text }]}>{meal.recipeTitle}</Text>

                {meal.assignedTo?.name && (
                  <View style={[styles.infoRow, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{t('mealDetail.ownerLabel')}</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>👤 {meal.assignedTo.name}</Text>
                  </View>
                )}

                {meal.notes ? (
                  <View style={styles.sectionBox}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{t('mealDetail.notesLabel')}</Text>
                    <Text style={[styles.bodyText, { color: colors.text }]}>{meal.notes}</Text>
                  </View>
                ) : null}

                {/* Lista de Ingredientes com Envio para o Mercado */}
                <View style={styles.sectionBox}>
                  <View style={styles.ingHeaderRow}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{t('mealDetail.ingredientsLabel')}</Text>
                    <TouchableOpacity
                      style={[styles.addToMarketSmallBtn, { backgroundColor: colors.primaryLight }]}
                      onPress={handleAddIngredients}
                    >
                      <Icon name="cart" color={colors.primaryDark} size={12} />
                      <Text style={[styles.addToMarketSmallText, { color: colors.primaryDark }]}>{t('mealDetail.buyInMarketBtn')}</Text>
                    </TouchableOpacity>
                  </View>

                  {meal.ingredients && meal.ingredients.length > 0 ? (
                    <View style={styles.ingList}>
                      {meal.ingredients.map((ing, idx) => (
                        <View key={idx} style={[styles.ingTag, { backgroundColor: colors.background, borderColor: colors.border }]}>
                          <Text style={[styles.ingTagText, { color: colors.text }]}>• {ing}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.noIngText, { color: colors.textMuted }]}>
                      {t('mealDetail.noIngredients')}
                    </Text>
                  )}
                </View>

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
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('mealDetail.dishNameLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={recipeTitle}
                  onChangeText={setRecipeTitle}
                  placeholder={t('mealDetail.dishNameLabel')}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>
                  {t('mealDetail.ingredientsInputLabel')}
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={ingredientsText}
                  onChangeText={setIngredientsText}
                  placeholder={t('mealDetail.ingredientsPlaceholder')}
                  placeholderTextColor={colors.textMuted}
                />

                {workspaceMembers.length > 1 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('today.chef', { name: '' })}</Text>
                    <View style={styles.memberSelectionRow}>
                      <TouchableOpacity
                        style={[
                          styles.memberOptionBtn,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          assignedMemberId === null && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                        ]}
                        onPress={() => setAssignedMemberId(null)}
                      >
                        <Text
                          style={[
                            styles.memberOptionText,
                            { color: colors.textMuted },
                            assignedMemberId === null && { color: colors.primaryDark, fontWeight: '800' },
                          ]}
                        >
                          {t('mealDetail.allMembers')}
                        </Text>
                      </TouchableOpacity>

                      {workspaceMembers.map((m) => (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            styles.memberOptionBtn,
                            { backgroundColor: colors.background, borderColor: colors.border },
                            assignedMemberId === m.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                          ]}
                          onPress={() => setAssignedMemberId(m.id)}
                        >
                          <Text
                            style={[
                              styles.memberOptionText,
                              { color: colors.textMuted },
                              assignedMemberId === m.id && { color: colors.primaryDark, fontWeight: '800' },
                            ]}
                          >
                            👤 {m.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('mealDetail.notesInputLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('mealDetail.notesInputLabel')}
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
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  consumedToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  consumedToggleEmoji: {
    fontSize: 14,
  },
  consumedToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewContent: {
    gap: 14,
  },
  dishTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
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
  ingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToMarketSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  addToMarketSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  ingList: {
    gap: 4,
    marginTop: 4,
  },
  ingTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  ingTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noIngText: {
    fontSize: 12,
    fontStyle: 'italic',
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
  memberSelectionRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  memberOptionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  memberOptionText: {
    fontSize: 12,
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
