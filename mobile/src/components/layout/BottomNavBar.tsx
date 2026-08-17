import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';

export type BottomNavTab = 'meals' | 'tasks' | 'planning' | 'profile';

interface BottomNavBarProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
}

export const BottomNavBar = ({ activeTab, onSelectTab }: BottomNavBarProps) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();

  const navItems: Array<{ id: BottomNavTab; label: string; icon: string }> = [
    { id: 'meals', label: t('bottomNav.meals') || 'Refeições', icon: 'today' },
    { id: 'tasks', label: t('bottomNav.tasks') || 'Casa', icon: 'calendar' },
    { id: 'planning', label: t('bottomNav.planning') || 'Planejamento', icon: 'cart' },
    { id: 'profile', label: t('bottomNav.profile') || 'Perfil', icon: 'users' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.navBackground, borderTopColor: colors.navBorder }]}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => onSelectTab(item.id)}
            activeOpacity={0.7}
          >
            {/* Indicador de Top Line Minimalista e Elegante */}
            <View style={[styles.indicator, isActive && { backgroundColor: colors.primary }]} />

            <View style={styles.iconContainer}>
              <Icon
                name={item.icon}
                color={isActive ? colors.primary : colors.navInactiveText}
                size={22}
              />
            </View>
            <Text
              style={[
                styles.label,
                { color: colors.navInactiveText },
                isActive && { color: colors.primary, fontWeight: '800' },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 76 : 64,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    paddingTop: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    marginTop: 6,
    marginBottom: 3,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
