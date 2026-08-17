import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { useAppTheme, ThemePreference } from '../../theme/theme';
import { api, getErrorMessage } from '../../services/api';
import { useToast } from '../common/Toast';
import { Icon } from '../common/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileTabProps {
  user: { id: string; name: string; email: string };
  workspace: { id: string; name: string; inviteCode: string };
  onUpdateUser: (user: { id: string; name: string; email: string }) => void;
  onLogout: () => void;
}

export const ProfileTab = ({ user, workspace, onUpdateUser, onLogout }: ProfileTabProps) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const { colors, themePreference, setThemePreference, isDark } = useAppTheme();

  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const toggleLanguage = async (lang: string) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem('@healthy_routine_language', lang);
    showToast(lang === 'pt-BR' ? 'Idioma alterado para Português 🇧🇷' : 'Language changed to English 🇺🇸', 'info');
  };

  const handleSelectTheme = (pref: ThemePreference) => {
    setThemePreference(pref);
    const label =
      pref === 'system'
        ? 'Tema Sincronizado com o Celular 📱'
        : pref === 'dark'
        ? 'Modo Escuro Ativado 🌙'
        : 'Modo Claro Ativado ☀️';
    showToast(label, 'info');
  };

  const copyInviteCode = async () => {
    await Clipboard.setStringAsync(workspace.inviteCode);
    showToast(t('profile.copiedToast'), 'success');
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showToast('O nome não pode ficar em branco.', 'warning');
      return;
    }

    setLoadingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name: name.trim() });
      const updatedUser = { ...user, name: res.data.name };
      await AsyncStorage.setItem('@healthy_routine_user', JSON.stringify(updatedUser));
      onUpdateUser(updatedUser);
      showToast(t('profile.profileUpdated'), 'success');
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast('Preencha a senha atual e a nova senha.', 'warning');
      return;
    }

    if (newPassword.length < 6) {
      showToast('A nova senha deve ter no mínimo 6 caracteres.', 'warning');
      return;
    }

    setLoadingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showToast(t('profile.passwordUpdated'), 'success');
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Banner do Usuário */}
      <View style={[styles.userBanner, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user.email}</Text>
      </View>

      {/* Seletor de Tema (Claro, Escuro ou Automático) */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🎨 Aparência do Aplicativo</Text>
        <View style={styles.themeOptionsRow}>
          <TouchableOpacity
            style={[
              styles.themeOptionBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              themePreference === 'system' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => handleSelectTheme('system')}
          >
            <Text style={styles.themeOptionEmoji}>📱</Text>
            <Text
              style={[
                styles.themeOptionLabel,
                { color: colors.textMuted },
                themePreference === 'system' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              Automático
            </Text>
            <Text style={[styles.themeOptionSub, { color: colors.textMuted }]}>Segue o Celular</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOptionBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              themePreference === 'light' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => handleSelectTheme('light')}
          >
            <Text style={styles.themeOptionEmoji}>☀️</Text>
            <Text
              style={[
                styles.themeOptionLabel,
                { color: colors.textMuted },
                themePreference === 'light' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              Claro
            </Text>
            <Text style={[styles.themeOptionSub, { color: colors.textMuted }]}>Sempre Claro</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOptionBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              themePreference === 'dark' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => handleSelectTheme('dark')}
          >
            <Text style={styles.themeOptionEmoji}>🌙</Text>
            <Text
              style={[
                styles.themeOptionLabel,
                { color: colors.textMuted },
                themePreference === 'dark' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              Escuro
            </Text>
            <Text style={[styles.themeOptionSub, { color: colors.textMuted }]}>Sempre Escuro</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Seletor de Idioma Integrado no Perfil */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>🌐 Idioma / Language</Text>
        <View style={styles.langRow}>
          <TouchableOpacity
            style={[
              styles.langBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              i18n.language === 'pt-BR' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => toggleLanguage('pt-BR')}
          >
            <Text
              style={[
                styles.langBtnText,
                { color: colors.textMuted },
                i18n.language === 'pt-BR' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              🇧🇷 Português (Brasil)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.langBtn,
              { backgroundColor: colors.background, borderColor: colors.border },
              i18n.language === 'en' && { backgroundColor: colors.primaryLight, borderColor: colors.primary },
            ]}
            onPress={() => toggleLanguage('en')}
          >
            <Text
              style={[
                styles.langBtnText,
                { color: colors.textMuted },
                i18n.language === 'en' && { color: colors.primaryDark, fontWeight: '800' },
              ]}
            >
              🇺🇸 English (US)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Espaço Conectado com Cópia para Clipboard */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('profile.workspaceInfo')}</Text>
        <View style={styles.workspaceRow}>
          <Text style={[styles.workspaceLabel, { color: colors.textMuted }]}>{t('profile.workspaceName')}</Text>
          <Text style={[styles.workspaceValue, { color: colors.text }]}>{workspace.name}</Text>
        </View>

        <TouchableOpacity
          style={[styles.copyCodeBox, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
          onPress={copyInviteCode}
          activeOpacity={0.7}
        >
          <View>
            <Text style={[styles.copyCodeLabel, { color: colors.primaryDark }]}>{t('profile.inviteCodeLabel')}</Text>
            <Text style={[styles.copyCodeValue, { color: colors.primaryDark }]}>{workspace.inviteCode}</Text>
          </View>
          <View style={[styles.copyBtn, { backgroundColor: colors.card }]}>
            <Icon name="users" color={colors.primaryDark} size={14} />
            <Text style={[styles.copyBtnText, { color: colors.primaryDark }]}>{t('profile.tapToCopy')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Informações Pessoais */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('profile.personalInfo')}</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('profile.nameLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('profile.emailLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.badgeBg, borderColor: colors.border, color: colors.textMuted }]}
            value={user.email}
            editable={false}
          />
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleUpdateProfile}
          disabled={loadingProfile}
        >
          {loadingProfile ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>{t('profile.updateProfileBtn')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Segurança & Alteração de Senha */}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('profile.security')}</Text>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('profile.currentPassLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('profile.newPassLabel')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleChangePassword}
          disabled={loadingPassword}
        >
          {loadingPassword ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>{t('profile.changePassBtn')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Botão de Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
        onPress={onLogout}
      >
        <Text style={[styles.logoutBtnText, { color: colors.danger }]}>🚪 {t('profile.logoutBtn')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 30,
  },
  userBanner: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeOptionEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  themeOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  themeOptionSub: {
    fontSize: 10,
    marginTop: 2,
  },
  langRow: {
    gap: 10,
  },
  langBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  langBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  workspaceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workspaceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  workspaceValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  copyCodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  copyCodeLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  copyCodeValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
