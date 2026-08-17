import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';
import { ActivityItem } from '../../types/models';

interface HistoryTabProps {
  activities: ActivityItem[];
}

export const HistoryTab = ({ activities = [] }: HistoryTabProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const list = Array.isArray(activities) ? activities : [];

  return (
    <View style={styles.container}>
      {/* Header com Título e Badge */}
      <View style={styles.headerContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('history.sectionTitle')}</Text>
        <Text style={[styles.badgeRealtime, { backgroundColor: colors.primaryLight, color: colors.primaryDark, borderColor: colors.primary }]}>
          {t('history.realtimeBadge')}
        </Text>
      </View>

      {/* Lista de Atividades */}
      {list.map((item) => {
        const userName = item.performedBy?.name || t('history.partnerDefault');
        const changeKeys = item.changes ? Object.keys(item.changes) : [];
        const detailText = changeKeys.length > 0
          ? changeKeys.map((k) => `${k}: ${item.changes[k]?.new ?? ''}`).join(', ')
          : item.entity;

        const timeString = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : t('alerts.justNow');

        return (
          <View
            key={item.id}
            style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.badgeBg }]}>
              <Icon name="history" color={colors.primaryDark} size={16} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.activityUser, { color: colors.text }]}>
                {userName}
              </Text>
              <Text style={[styles.activityAction, { color: colors.textMuted }]}>
                {item.action === 'CREATE'
                  ? t('history.addedToMenu')
                  : t('history.updatedMealTo')}
              </Text>
              <Text style={[styles.activityDetails, { color: colors.primaryDark }]}>{detailText}</Text>
              <Text style={[styles.activityTime, { color: colors.textMuted }]}>{timeString}</Text>
            </View>
          </View>
        );
      })}

      {list.length === 0 && (
        <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhuma atividade recente</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            As alterações do cardápio, marmitas e gastos compartilhados aparecerão aqui em tempo real.
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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  badgeRealtime: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  activityCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '800',
  },
  activityAction: {
    fontSize: 13,
    marginTop: 2,
  },
  activityDetails: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 6,
  },
  emptyBox: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
  },
  emptyIcon: {
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
