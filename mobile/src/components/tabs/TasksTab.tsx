import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { TaskItem } from '../../types/models';
import { WorkspaceMemberOption } from '../modals/MealModal';
import { Icon } from '../common/Icon';

interface TasksTabProps {
  tasks: TaskItem[];
  workspaceMembers?: WorkspaceMemberOption[];
  currentUserId?: string;
  isPro?: boolean;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onCreateTask: (data: { title: string; category: string; dueDate?: string; recurrence: string; assignedToUserId?: string | null }) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenUpgradeModal: () => void;
  onSelectTaskDetail: (task: TaskItem) => void;
}

export const TasksTab = ({
  tasks,
  workspaceMembers = [],
  currentUserId,
  onToggleTask,
  onCreateTask,
  onDeleteTask,
  onSelectTaskDetail,
}: TasksTabProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState<'HOUSEHOLD' | 'CLEANING' | 'HABIT' | 'PET' | 'MAINTENANCE'>('HOUSEHOLD');
  const [recurrence, setRecurrence] = useState<'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [assignedMemberId, setAssignedMemberId] = useState<string | null>(null);

  // Filtros de Visualização
  const [userFilter, setUserFilter] = useState<'ME' | 'ALL'>('ME');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'COMPLETED' | 'ALL'>('PENDING');

  const filteredTasks = tasks.filter((tItem) => {
    // Filtro por usuário
    if (userFilter === 'ME') {
      if (tItem.assignedToUserId && tItem.assignedToUserId !== currentUserId) return false;
    }
    // Filtro por status
    if (statusFilter === 'PENDING' && tItem.completed) return false;
    if (statusFilter === 'COMPLETED' && !tItem.completed) return false;
    return true;
  });

  const handleCreate = () => {
    if (!taskTitle.trim()) {
      Alert.alert(t('alerts.warningTitle'), t('tasks.titlePlaceholder'));
      return;
    }

    onCreateTask({
      title: taskTitle.trim(),
      category,
      recurrence,
      assignedToUserId: assignedMemberId,
    });

    setTaskTitle('');
    setCategory('HOUSEHOLD');
    setRecurrence('NONE');
    setAssignedMemberId(null);
    setModalVisible(false);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'CLEANING':
        return t('tasks.catCleaning');
      case 'HABIT':
        return t('tasks.catHabit');
      case 'PET':
        return t('tasks.catPet');
      case 'MAINTENANCE':
        return t('tasks.catMaintenance');
      default:
        return t('tasks.catHousehold');
    }
  };

  const getRecurrenceLabel = (rec: string) => {
    switch (rec) {
      case 'DAILY':
        return t('tasks.recDaily');
      case 'WEEKLY':
        return t('tasks.recWeekly');
      case 'MONTHLY':
        return t('tasks.recMonthly');
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header com Título e Botão Nova Tarefa */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrapper}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('tasks.sectionTitle')}</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>
            {t('tasks.sectionSub')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Icon name="plus" color="#FFF" size={14} />
          <Text style={styles.createBtnText}>{t('tasks.createBtn')}</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Filtros Dupla (Usuário e Status) */}
      <View style={styles.filtersContainer}>
        {/* Filtro Minhas / Todas */}
        <View style={styles.pillRow}>
          <TouchableOpacity
            style={[
              styles.pillBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              userFilter === 'ME' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => setUserFilter('ME')}
          >
            <Text
              style={[
                styles.pillText,
                { color: colors.textMuted },
                userFilter === 'ME' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              {t('tasks.filterMy')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pillBtn,
              { backgroundColor: colors.card, borderColor: colors.border },
              userFilter === 'ALL' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => setUserFilter('ALL')}
          >
            <Text
              style={[
                styles.pillText,
                { color: colors.textMuted },
                userFilter === 'ALL' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              {t('tasks.filterAll')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro Pendentes / Concluídas */}
        <View style={styles.pillRow}>
          {(['PENDING', 'COMPLETED', 'ALL'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.pillBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                statusFilter === st && { backgroundColor: colors.secondaryLight, borderColor: colors.secondary },
              ]}
              onPress={() => setStatusFilter(st)}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.textMuted },
                  statusFilter === st && { color: colors.secondary, fontWeight: '800' },
                ]}
              >
                {st === 'PENDING' ? t('tasks.filterPending') : st === 'COMPLETED' ? t('tasks.filterCompleted') : t('tasks.filterAllStatus')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de Tarefas */}
      {filteredTasks.map((tItem) => {
        const recLabel = getRecurrenceLabel(tItem.recurrence);
        return (
          <TouchableOpacity
            key={tItem.id}
            style={[
              styles.taskCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              tItem.completed && { opacity: 0.65 },
            ]}
            onPress={() => onSelectTaskDetail(tItem)}
            activeOpacity={0.7}
          >
            {/* Checkbox independente */}
            <TouchableOpacity
              style={styles.checkTouchable}
              onPress={() => onToggleTask(tItem.id, !tItem.completed)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  tItem.completed && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                {tItem.completed && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>

            <View style={styles.taskInfo}>
              <Text
                style={[
                  styles.taskTitle,
                  { color: colors.text },
                  tItem.completed && { textDecorationLine: 'line-through', color: colors.textMuted },
                ]}
              >
                {tItem.title}
              </Text>

              <View style={styles.tagsRow}>
                <View style={[styles.catBadge, { backgroundColor: colors.badgeBg }]}>
                  <Text style={[styles.catBadgeText, { color: colors.textMuted }]}>
                    {getCategoryLabel(tItem.category)}
                  </Text>
                </View>

                {recLabel && (
                  <View style={[styles.recBadge, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.recBadgeText, { color: colors.primaryDark }]}>{recLabel}</Text>
                  </View>
                )}

                {tItem.assignedTo?.name && (
                  <View style={[styles.memberBadge, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.memberBadgeText, { color: colors.textMuted }]}>
                      👤 {tItem.assignedTo.name}
                    </Text>
                  </View>
                )}

                {tItem.completed && tItem.lastCompletedBy && (
                  <View style={[styles.recBadge, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.recBadgeText, { color: colors.primaryDark }]}>
                      ✓ {tItem.lastCompletedBy}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text style={[styles.chevronHint, { color: colors.textMuted }]}>›</Text>
          </TouchableOpacity>
        );
      })}

      {filteredTasks.length === 0 && (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>✨</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('tasks.emptyTitle')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            {t('tasks.emptySubtitle')}
          </Text>
        </View>
      )}

      {/* Modal de Criação de Tarefa */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('tasks.modalTitle')}</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                {t('tasks.modalSubtitle')}
              </Text>

              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('tasks.titleLabel')}</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={t('tasks.titlePlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={taskTitle}
                onChangeText={setTaskTitle}
              />

              {/* Categorias */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('tasks.categoryLabel')}</Text>
              <View style={styles.categoryGrid}>
                {[
                  { id: 'HOUSEHOLD', label: t('tasks.catHousehold') },
                  { id: 'CLEANING', label: t('tasks.catCleaning') },
                  { id: 'HABIT', label: t('tasks.catHabit') },
                  { id: 'PET', label: t('tasks.catPet') },
                  { id: 'MAINTENANCE', label: t('tasks.catMaintenance') },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      category === c.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                    ]}
                    onPress={() => setCategory(c.id as any)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: colors.textMuted },
                        category === c.id && { color: colors.primaryDark, fontWeight: '800' },
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Recorrência */}
              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('tasks.recurrenceLabel')}</Text>
              <View style={styles.categoryGrid}>
                {[
                  { id: 'NONE', label: t('tasks.recNone') },
                  { id: 'DAILY', label: t('tasks.recDaily') },
                  { id: 'WEEKLY', label: t('tasks.recWeekly') },
                  { id: 'MONTHLY', label: t('tasks.recMonthly') },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.categoryOption,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      recurrence === r.id && { backgroundColor: colors.secondaryLight, borderColor: colors.secondary },
                    ]}
                    onPress={() => setRecurrence(r.id as any)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        { color: colors.textMuted },
                        recurrence === r.id && { color: colors.secondary, fontWeight: '800' },
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Responsável */}
              {workspaceMembers.length > 1 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>{t('tasks.assignedLabel')}</Text>
                  <View style={styles.categoryGrid}>
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        assignedMemberId === null && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                      onPress={() => setAssignedMemberId(null)}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          { color: colors.textMuted },
                          assignedMemberId === null && { color: colors.primaryDark, fontWeight: '800' },
                        ]}
                      >
                        {t('tasks.assignedAll')}
                      </Text>
                    </TouchableOpacity>

                    {workspaceMembers.map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.categoryOption,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          assignedMemberId === m.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                        ]}
                        onPress={() => setAssignedMemberId(m.id)}
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
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

              {/* Botões do Modal */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textMuted }]}>{t('mealDetail.cancelBtn')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleCreate}
                >
                  <Text style={styles.saveButtonText}>{t('tasks.saveBtn')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    flexShrink: 0,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filtersContainer: {
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  pillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  checkTouchable: {
    padding: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  taskInfo: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
  memberBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  memberBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chevronHint: {
    fontSize: 18,
    fontWeight: '700',
    paddingLeft: 4,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: 14,
  },
  emptyBox: {
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 8,
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
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
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 11,
    fontWeight: '600',
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
