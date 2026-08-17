import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';

export type ModalType = 'batch' | 'special' | 'dinner' | 'custom_meal' | 'new_recipe' | 'new_expense' | 'new_shopping_item';

export interface WorkspaceMemberOption {
  id: string;
  name: string;
  email: string;
}

interface MealModalProps {
  visible: boolean;
  type: ModalType;
  recipeTitle: string;
  onChangeRecipeTitle: (text: string) => void;
  notes: string;
  onChangeNotes: (text: string) => void;
  batchDays: string;
  onChangeBatchDays: (text: string) => void;
  batchMealSelection?: 'LUNCH' | 'DINNER' | 'BOTH';
  onChangeBatchMealSelection?: (selection: 'LUNCH' | 'DINNER' | 'BOTH') => void;
  customMealType?: 'BREAKFAST' | 'SNACK';
  onChangeCustomMealType?: (val: 'BREAKFAST' | 'SNACK') => void;
  recipeCategory: 'GOURMET' | 'WEEKEND' | 'DESSERT';
  onChangeRecipeCategory: (cat: 'GOURMET' | 'WEEKEND' | 'DESSERT') => void;
  assignedMemberId?: string | null;
  onChangeAssignedMemberId?: (id: string | null) => void;
  workspaceMembers?: WorkspaceMemberOption[];
  expenseAmount?: string;
  onChangeExpenseAmount?: (val: string) => void;
  shoppingPrice?: string;
  onChangeShoppingPrice?: (val: string) => void;
  shoppingRecurrence?: 'NONE' | 'WEEKLY' | 'MONTHLY';
  onChangeShoppingRecurrence?: (val: 'NONE' | 'WEEKLY' | 'MONTHLY') => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const MealModal = ({
  visible,
  type,
  recipeTitle,
  onChangeRecipeTitle,
  notes,
  onChangeNotes,
  batchDays,
  onChangeBatchDays,
  batchMealSelection = 'LUNCH',
  onChangeBatchMealSelection = () => {},
  customMealType = 'BREAKFAST',
  onChangeCustomMealType = () => {},
  recipeCategory,
  onChangeRecipeCategory,
  assignedMemberId = null,
  onChangeAssignedMemberId = () => {},
  workspaceMembers = [],
  expenseAmount = '',
  onChangeExpenseAmount = () => {},
  shoppingPrice = '',
  onChangeShoppingPrice = () => {},
  shoppingRecurrence = 'NONE',
  onChangeShoppingRecurrence = () => {},
  onClose,
  onConfirm,
}: MealModalProps) => {
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const currencySymbol = i18n.language === 'en' ? '$' : 'R$';

  const daysNum = parseInt(batchDays, 10) || 1;
  const totalMarmitas = batchMealSelection === 'BOTH' ? daysNum * 2 : daysNum;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {type === 'batch' && t('modals.batchTitle')}
              {type === 'special' && t('modals.specialTitle')}
              {type === 'dinner' && '🌙 Definir Jantar de Hoje'}
              {type === 'custom_meal' && '☕ Adicionar Refeição Extra'}
              {type === 'new_recipe' && t('modals.newRecipeTitle')}
              {type === 'new_expense' && '💰 Novo Gasto Compartilhado'}
              {type === 'new_shopping_item' && '🛒 Novo Item de Compras'}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              {type === 'batch' && `Agende para almoço, jantar ou ambos. Total: ${totalMarmitas} marmitas.`}
              {type === 'special' && t('modals.specialSubtitle')}
              {type === 'dinner' && 'Escolha o que preparar para o jantar desta noite.'}
              {type === 'custom_meal' && 'Adicione café da manhã, lanche da tarde ou ceia.'}
              {type === 'new_recipe' && t('modals.newRecipeSubtitle')}
              {type === 'new_expense' && 'Informe o valor e a descrição para dividir no grupo.'}
              {type === 'new_shopping_item' && 'Adicione produtos avulsos ou com lista recorrente (semanal/mensal).'}
            </Text>

            {/* Tipo de Refeição Extra (Café ou Lanche) */}
            {type === 'custom_meal' && (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Tipo de Refeição Extra</Text>
                <View style={styles.categoryRow}>
                  {[
                    { id: 'BREAKFAST', label: '☕ Café da Manhã' },
                    { id: 'SNACK', label: '🥪 Lanche / Ceia' },
                  ].map((ct) => (
                    <TouchableOpacity
                      key={ct.id}
                      style={[
                        styles.categoryBtn,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        customMealType === ct.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                      onPress={() => onChangeCustomMealType(ct.id as any)}
                    >
                      <Text
                        style={[
                          styles.categoryBtnText,
                          { color: colors.textMuted },
                          customMealType === ct.id && { color: colors.primaryDark, fontWeight: '800' },
                        ]}
                      >
                        {ct.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Nome do Prato ou Item */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {type === 'new_expense'
                ? 'Descrição do Gasto'
                : type === 'new_shopping_item'
                ? 'Nome do Produto'
                : type === 'dinner'
                ? 'Prato do Jantar'
                : type === 'custom_meal'
                ? 'Prato / Lanche'
                : t('modals.dishNameLabel')}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder={
                type === 'new_expense'
                  ? 'Ex: Supermercado Semanal, Feira...'
                  : type === 'new_shopping_item'
                  ? 'Ex: Arroz Integral, Azeite, Café...'
                  : type === 'dinner'
                  ? 'Ex: Salmão Grelhado com Legumes, Sopa...'
                  : type === 'custom_meal'
                  ? 'Ex: Ovos Mexidos com Torrada, Smoothie...'
                  : t('modals.dishNamePlaceholder')
              }
              placeholderTextColor={colors.textMuted}
              value={recipeTitle}
              onChangeText={onChangeRecipeTitle}
            />

            {/* Seleção de Almoço / Jantar / Ambos no Agendamento em Lote */}
            {type === 'batch' && (
              <>
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Agendar para qual refeição?</Text>
                  <View style={styles.categoryRow}>
                    {[
                      { id: 'LUNCH', label: '☀️ Almoço' },
                      { id: 'DINNER', label: '🌙 Jantar' },
                      { id: 'BOTH', label: '🍽️ Ambos (Alm + Jant)' },
                    ].map((bType) => (
                      <TouchableOpacity
                        key={bType.id}
                        style={[
                          styles.categoryBtn,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          batchMealSelection === bType.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                        ]}
                        onPress={() => onChangeBatchMealSelection(bType.id as any)}
                      >
                        <Text
                          style={[
                            styles.categoryBtnText,
                            { color: colors.textMuted },
                            batchMealSelection === bType.id && { color: colors.primaryDark, fontWeight: '800' },
                          ]}
                        >
                          {bType.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    {t('modals.batchDaysLabel')} (Gera {totalMarmitas} marmitas)
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={batchDays}
                    onChangeText={onChangeBatchDays}
                  />
                </View>
              </>
            )}

            {/* Responsável / Dono da Refeição (Ambos / Pessoa 1 / Pessoa 2) */}
            {(type === 'batch' || type === 'dinner' || type === 'special' || type === 'custom_meal') && workspaceMembers.length > 1 && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>De quem é esta refeição?</Text>
                <View style={styles.categoryRow}>
                  <TouchableOpacity
                    style={[
                      styles.categoryBtn,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      assignedMemberId === null && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                    ]}
                    onPress={() => onChangeAssignedMemberId(null)}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        { color: colors.textMuted },
                        assignedMemberId === null && { color: colors.primaryDark, fontWeight: '800' },
                      ]}
                    >
                      👥 Todos / Ambos
                    </Text>
                  </TouchableOpacity>

                  {workspaceMembers.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[
                        styles.categoryBtn,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        assignedMemberId === m.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                      onPress={() => onChangeAssignedMemberId(m.id)}
                    >
                      <Text
                        style={[
                          styles.categoryBtnText,
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

            {/* Campo de Preço Estimado e Recorrência para Lista de Compras */}
            {type === 'new_shopping_item' && (
              <>
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Preço Estimado Opcional ({currencySymbol})
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    placeholder={i18n.language === 'en' ? 'e.g. 12.50' : 'Ex: 24,90'}
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={shoppingPrice}
                    onChangeText={onChangeShoppingPrice}
                  />
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Recorrência na Lista de Compras</Text>
                  <View style={styles.categoryRow}>
                    {[
                      { id: 'NONE', label: 'Avulso' },
                      { id: 'WEEKLY', label: 'Semanal 🔄' },
                      { id: 'MONTHLY', label: 'Mensal 📅' },
                    ].map((rec) => (
                      <TouchableOpacity
                        key={rec.id}
                        style={[
                          styles.categoryBtn,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          shoppingRecurrence === rec.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                        ]}
                        onPress={() => onChangeShoppingRecurrence(rec.id as any)}
                      >
                        <Text
                          style={[
                            styles.categoryBtnText,
                            { color: colors.textMuted },
                            shoppingRecurrence === rec.id && { color: colors.primaryDark, fontWeight: '800' },
                          ]}
                        >
                          {rec.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Campo de Valor em caso de Despesa */}
            {type === 'new_expense' && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Valor ({currencySymbol})</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholder={i18n.language === 'en' ? 'e.g. 50.00' : 'Ex: 85,50'}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={expenseAmount}
                  onChangeText={onChangeExpenseAmount}
                />
              </View>
            )}

            {/* Categoria para Nova Receita no Catálogo */}
            {type === 'new_recipe' && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('modals.categoryLabel')}</Text>
                <View style={styles.categoryRow}>
                  {(['GOURMET', 'WEEKEND', 'DESSERT'] as const).map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryBtn,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        recipeCategory === cat && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                      onPress={() => onChangeRecipeCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryBtnText,
                          { color: colors.textMuted },
                          recipeCategory === cat && { color: colors.primaryDark, fontWeight: '800' },
                        ]}
                      >
                        {cat === 'GOURMET' && t('modals.catGourmet')}
                        {cat === 'WEEKEND' && t('modals.catWeekend')}
                        {cat === 'DESSERT' && t('modals.catDessert')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Notas / Ingredientes / Quantidade */}
            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>
              {type === 'new_shopping_item' ? 'Quantidade (Ex: 2 un, 1kg)' : t('modals.notesLabel')}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder={
                type === 'new_shopping_item'
                  ? 'Ex: 1 bandeja, 2 kg...'
                  : t('modals.notesPlaceholder')
              }
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={onChangeNotes}
            />

            {/* Botões do Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={onClose}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>{t('modals.cancelButton')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={onConfirm}
              >
                <Text style={styles.saveButtonText}>{t('modals.saveButton')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBtn: {
    flex: 1,
    minWidth: '28%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
});
