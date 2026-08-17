import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../theme/theme';
import { api, getErrorMessage } from '../../services/api';
import { useToast } from '../common/Toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WorkspaceSetupScreenProps {
  onSuccess: (workspace: any) => void;
}

export const WorkspaceSetupScreen = ({ onSuccess }: WorkspaceSetupScreenProps) => {
  const { showToast } = useToast();
  const [isCreating, setIsCreating] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!workspaceName.trim()) {
      showToast('Dê um nome para o seu espaço (ex: Minha Rotina, Lar André & Família).', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/workspaces', { name: workspaceName });
      await AsyncStorage.setItem('@healthy_routine_workspace', JSON.stringify(res.data));
      showToast('Espaço criado com sucesso! 🎉', 'success');
      onSuccess(res.data);
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      showToast('Informe o código de convite de 6 caracteres.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/workspaces/join', { inviteCode: inviteCode.toUpperCase() });
      await AsyncStorage.setItem('@healthy_routine_workspace', JSON.stringify(res.data));
      showToast('Conectado ao espaço compartilhado com sucesso! ✨', 'success');
      onSuccess(res.data);
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
          <View style={styles.header}>
            <Text style={styles.emoji}>🏡</Text>
            <Text style={styles.title}>Configurar Espaço</Text>
            <Text style={styles.subtitle}>
              Organize suas marmitas, receitas especiais, mercado e finanças de forma individual ou compartilhada.
            </Text>
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, isCreating && styles.toggleBtnActive]}
              onPress={() => setIsCreating(true)}
            >
              <Text style={[styles.toggleText, isCreating && styles.toggleTextActive]}>
                Criar Novo Espaço
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isCreating && styles.toggleBtnActive]}
              onPress={() => setIsCreating(false)}
            >
              <Text style={[styles.toggleText, !isCreating && styles.toggleTextActive]}>
                Tenho um Código
              </Text>
            </TouchableOpacity>
          </View>

          {isCreating ? (
            <View>
              <Text style={styles.label}>Nome do Espaço</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Minha Rotina, Família Silva, Meu Lar..."
                value={workspaceName}
                onChangeText={setWorkspaceName}
              />
              <TouchableOpacity style={styles.actionBtn} onPress={handleCreate} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Criar Espaço</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Código de Convite (6 dígitos)</Text>
              <TextInput
                style={[styles.input, { textAlign: 'center', letterSpacing: 4, fontWeight: '700', fontSize: 18 }]}
                placeholder="Ex: A3B8F1"
                maxLength={6}
                autoCapitalize="characters"
                value={inviteCode}
                onChangeText={setInviteCode}
              />
              <TouchableOpacity style={styles.actionBtn} onPress={handleJoin} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Entrar no Espaço</Text>}
              </TouchableOpacity>
            </View>
          )}
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
    marginBottom: 24,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  toggleTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
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
    marginBottom: 16,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
