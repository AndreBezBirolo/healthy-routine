import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';

export type TabType = 'today' | 'week' | 'special' | 'tasks_list' | 'shopping' | 'expenses' | 'history';

interface NavigationTabsProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  allowedTabs: TabType[];
}

export const NavigationTabs = ({ activeTab, onSelectTab, allowedTabs }: NavigationTabsProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const allTabs: Record<TabType, { label: string; icon: string; activeColor: string }> = {
    today: { label: t('tabs.today') || 'Hoje', icon: 'today', activeColor: colors.primary },
    week: { label: t('tabs.week') || 'Semana', icon: 'calendar', activeColor: colors.primary },
    special: { label: t('tabs.special') || 'Especiais', icon: 'special', activeColor: colors.secondary },
    tasks_list: { label: t('tabs.tasks_list') || 'Tarefas & Hábitos', icon: 'calendar', activeColor: colors.primary },
    shopping: { label: t('tabs.shopping') || 'Compras', icon: 'cart', activeColor: colors.primaryDark },
    expenses: { label: t('tabs.expenses') || 'Finanças', icon: 'wallet', activeColor: colors.primaryDark },
    history: { label: t('tabs.history') || 'Histórico', icon: 'history', activeColor: colors.accent },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allowedTabs.map((tabId) => {
          const tab = allTabs[tabId];
          if (!tab) return null;
          const isActive = activeTab === tabId;
          return (
            <TouchableOpacity
              key={tabId}
              style={[
                styles.tabItem,
                { backgroundColor: colors.background, borderColor: colors.border },
                isActive && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
              ]}
              onPress={() => onSelectTab(tabId)}
              activeOpacity={0.7}
            >
              <Icon
                name={tab.icon}
                color={isActive ? colors.primaryDark : colors.textMuted}
                size={15}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textMuted },
                  isActive && { color: colors.primaryDark, fontWeight: '800' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
