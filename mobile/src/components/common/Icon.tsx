import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface IconProps {
  name: string;
  color?: string;
  size?: number;
}

const iconMap: Record<string, string> = {
  today: '⏱️',
  calendar: '📅',
  special: '✨',
  history: '📜',
  users: '👥',
  plus: '＋',
  check: '✅',
  flame: '🔥',
  dice: '🎲',
  wallet: '💰',
  cart: '🛒',
  chevronRight: '›',
  utensils: '🍱',
  sparkles: '✨',
  heart: '❤️',
};

export const Icon = ({ name, color = '#0F172A', size = 16 }: IconProps) => {
  return (
    <Text style={[styles.icon, { fontSize: size, color, lineHeight: size + 4 }]}>
      {iconMap[name] || '•'}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
