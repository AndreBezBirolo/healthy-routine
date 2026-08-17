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
import { TaskItem } from '../../types/models';
import { WorkspaceMemberOption } from './MealModal';

interface TaskDetailModalProps {
  visible: boolean;
  task: TaskItem | null;
  workspaceMembers?: WorkspaceMemberOption[];
  onClose: () => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onUpdateTask: (taskId: string, data: Partial<TaskItem>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailModal = ({
  visible,
  task,
  workspaceMembers = [],
  onClose,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailModalProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'HOUSEHOLD' | 'CLEANING' | 'HABIT' | 'PET' | 'MAINTENANCE'>('HOUSEHOLD');
  const [recurrence, setRecurrence] = useState<'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [assignedToUserId, setAssignedToUserId] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setCategory(task.category);
      setRecurrence(task.recurrence);
      setAssignedToUserId(task.assignedToUserId || task.assignedTo?.id || null);
      setIsEditing(false);
    }
  }, [task, visible]);

  if (!task) return null;

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert(t('alerts.warningTitle'), t('tasks.titlePlaceholder'));
      return;
    }

    onUpdateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      recurrence,
      assignedToUserId,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      t('taskDetail.deleteConfirmTitle'),
      t('taskDetail.deleteConfirmMsg', { title: task.title }),
      [
        { text: t('mealDetail.cancelBtn'), style: 'cancel' },
        {
          text: t('mealDetail.deleteBtn'),
          style: 'destructive',
          onPress: () => {
            onDeleteTask(task.id);
            onClose();
          },
        },
      ]
    );
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
        return t('tasks.recNone');
    }
  };

  const formattedCompletedTime = task.completedAt
    ? new Date(task.completedAt).toLocaleString('pt-BR', {
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
                  {getCategoryLabel(task.category)}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  task.completed && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                ]}
                onPress={() => onToggleTask(task.id, !task.completed)}
                activeOpacity={0.7}
              >
                <Text style={styles.statusToggleEmoji}>{task.completed ? '✅' : '⭕'}</Text>
                <Text
                  style={[
                    styles.statusToggleText,
                    { color: colors.textMuted },
                    task.completed && { color: colors.primaryDark, fontWeight: '800' },
                  ]}
                >
                  {task.completed ? t('taskDetail.completedStatus') : t('taskDetail.pendingStatus')}
                </Text>
              </TouchableOpacity>
            </View>

            {!isEditing ? (
              <View style={styles.viewContent}>
                <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>

                {/* Banner de Rastreabilidade e Auditoria de Conclusão */}
                {task.completed && (
                  <View style={[styles.auditBox, { backgroundColor: colors.badgeBg }]}>
                    <Text style={[styles.auditText, { color: colors.primaryDark }]}>
                      {t('taskDetail.completedAudit', {
                        user: task.lastCompletedBy || task.assignedTo?.name || t('alerts.you'),
                        time: formattedCompletedTime || t('alerts.justNow'),
                      })}
                    </Text>
                  </View>
                )}

                {/* Informações da Tarefa */}
                <View style={[styles.infoGrid, { borderColor: colors.border }]}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{t('taskDetail.assignedToLabel')}</Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {task.assignedTo?.name ? `👤 ${task.assignedTo.name}` : t('taskDetail.allMembers')}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{t('tasks.recurrenceLabel')}:</Text>
                    <Text style={[styles.infoVal, { color: colors.text }]}>
                      {getRecurrenceLabel(task.recurrence)}
                    </Text>
                  </View>
                </View>

                {task.description ? (
                  <View style={styles.sectionBox}>
                    <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>{t('taskDetail.descriptionLabel')}</Text>
                    <Text style={[styles.bodyText, { color: colors.text }]}>{task.description}</Text>
                  </View>
                ) : null}

                {/* Botões de Ação */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.text }]}>{t('taskDetail.editBtn')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
                    onPress={handleDelete}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.danger }]}>{t('taskDetail.deleteBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Formulário de Edição */
              <View style={styles.editContent}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('tasks.titleLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={t('tasks.titlePlaceholder')}
                  placeholderTextColor={colors.textMuted}
                />

                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('tasks.categoryLabel')}</Text>
                <View style={styles.pillsWrap}>
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
                        styles.pillOption,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        category === c.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                      ]}
                      onPress={() => setCategory(c.id as any)}
                    >
                      <Text
                        style={[
                          styles.pillOptionText,
                          { color: colors.textMuted },
                          category === c.id && { color: colors.primaryDark, fontWeight: '800' },
                        ]}
                      >
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('tasks.recurrenceLabel')}</Text>
                <View style={styles.pillsWrap}>
                  {[
                    { id: 'NONE', label: t('tasks.recNone') },
                    { id: 'DAILY', label: t('tasks.recDaily') },
                    { id: 'WEEKLY', label: t('tasks.recWeekly') },
                    { id: 'MONTHLY', label: t('tasks.recMonthly') },
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

                {workspaceMembers.length > 1 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('tasks.assignedLabel')}</Text>
                    <View style={styles.pillsWrap}>
                      <TouchableOpacity
                        style={[
                          styles.pillOption,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          assignedToUserId === null && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                        ]}
                        onPress={() => setAssignedToUserId(null)}
                      >
                        <Text
                          style={[
                            styles.pillOptionText,
                            { color: colors.textMuted },
                            assignedToUserId === null && { color: colors.primaryDark, fontWeight: '800' },
                          ]}
                        >
                          {t('tasks.assignedAll')}
                        </Text>
                      </TouchableOpacity>

                      {workspaceMembers.map((m) => (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            styles.pillOption,
                            { backgroundColor: colors.background, borderColor: colors.border },
                            assignedToUserId === m.id && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                          ]}
                          onPress={() => setAssignedToUserId(m.id)}
                        >
                          <Text
                            style={[
                              styles.pillOptionText,
                              { color: colors.textMuted },
                              assignedToUserId === m.id && { color: colors.primaryDark, fontWeight: '800' },
                            ]}
                          >
                            👤 {m.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>{t('taskDetail.descriptionLabel')}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t('taskDetail.descriptionPlaceholder')}
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
  taskTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
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
