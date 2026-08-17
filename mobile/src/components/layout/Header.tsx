import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';
import { useToast } from '../common/Toast';

interface HeaderProps {
  workspaceName: string;
  inviteCode: string;
  onOpenUpgrade?: () => void;
  isPro?: boolean;
}

export const Header = ({
  workspaceName,
  inviteCode,
  onOpenUpgrade,
  isPro = false,
}: HeaderProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { colors } = useAppTheme();

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    showToast(t('profile.copiedToast'), 'success');
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {/* Linha Superior: Categoria da Rotina e Status da Assinatura no Canto Direito */}
      <View style={styles.topRow}>
        <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
          {t('header.workspaceTag')}
        </Text>

        {/* Indicador de Plano no Canto Superior Direito */}
        {isPro ? (
          <View style={[styles.proBadgeActive, { backgroundColor: colors.secondaryLight, borderColor: colors.secondary }]}>
            <Text style={[styles.proBadgeText, { color: colors.secondary }]}>PLANO PRO 👑</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.freePlanBadge, { backgroundColor: colors.badgeBg, borderColor: colors.border }]}
            onPress={onOpenUpgrade}
            activeOpacity={0.7}
          >
            <Text style={[styles.freePlanText, { color: colors.textMuted }]}>Plano Grátis</Text>
            <View style={[styles.upgradePill, { backgroundColor: colors.primary }]}>
              <Text style={styles.upgradePillText}>Assinar PRO ✨</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Linha Principal: Nome do Espaço e Código de Convite com Clique para Copiar */}
      <View style={styles.mainRow}>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {workspaceName} ✨
        </Text>
        <TouchableOpacity
          style={[styles.inviteBadge, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
          onPress={handleCopyCode}
          activeOpacity={0.7}
        >
          <Icon name="users" color={colors.primaryDark} size={12} />
          <Text style={[styles.inviteText, { color: colors.primaryDark }]}>{inviteCode}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  proBadgeActive: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  freePlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 3,
    paddingVertical: 2,
    gap: 6,
  },
  freePlanText: {
    fontSize: 11,
    fontWeight: '600',
  },
  upgradePill: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  upgradePillText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
  },
  inviteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 6,
    flexShrink: 0,
  },
  inviteText: {
    fontSize: 12,
    fontWeight: '800',
  },
});
