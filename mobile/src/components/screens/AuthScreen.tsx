import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../theme/theme';
import { api, getErrorMessage } from '../../services/api';
import { useToast } from '../common/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen = ({ onSuccess }: AuthScreenProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      showToast('Preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    setLoading(true);
    try {
      let token = '';
      let userObj = null;

      if (isLogin) {
        const res = await api.post('/auth/login', { email: email.trim(), password });
        token = res.data.token || res.data.accessToken;
        userObj = res.data.user;
        await AsyncStorage.setItem('@healthy_routine_token', token);
        await AsyncStorage.setItem('@healthy_routine_user', JSON.stringify(userObj));
        showToast('Login realizado com sucesso! ✨', 'success');
      } else {
        const res = await api.post('/auth/register', { name: name.trim(), email: email.trim(), password });
        token = res.data.token || res.data.accessToken;
        userObj = res.data.user;
        await AsyncStorage.setItem('@healthy_routine_token', token);
        await AsyncStorage.setItem('@healthy_routine_user', JSON.stringify(userObj));
        showToast('Conta criada com sucesso! 🎉', 'success');
      }

      // Busca automaticamente os workspaces do usuário logado na API
      try {
        const wsRes = await api.get('/workspaces', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (wsRes.data && wsRes.data.length > 0) {
          // Conecta imediatamente ao primeiro workspace ativo
          await AsyncStorage.setItem('@healthy_routine_workspace', JSON.stringify(wsRes.data[0]));
        } else {
          await AsyncStorage.removeItem('@healthy_routine_workspace');
        }
      } catch (wsErr) {
        console.warn('Could not fetch workspaces on login', wsErr);
      }

      onSuccess();
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'ios' ? 50 : 80}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Logo Oficial */}
          <View style={styles.header}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.appLogo}
              resizeMode="contain"
            />
            <Text style={styles.logoTitle}>Healthy Routine</Text>
            <Text style={styles.subtitle}>Rotina Saudável, Marmitas & Receitas</Text>
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Criar Conta</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Seu Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: André"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>{isLogin ? 'Entrar no App' : 'Cadastrar'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appLogo: {
    width: 76,
    height: 76,
    borderRadius: 18,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
