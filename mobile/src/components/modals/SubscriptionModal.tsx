import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../theme/theme';
import { Icon } from '../common/Icon';
import { api, getErrorMessage } from '../../services/api';
import { useToast } from '../common/Toast';

interface PlanOption {
  id: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL';
  name: string;
  cycleMonths: number;
  totalPrice: number;
  monthlyEquivalent: number;
  discountPercentage: number;
  description: string;
}

const PLANS: PlanOption[] = [
  {
    id: 'MONTHLY',
    name: 'Mensal',
    cycleMonths: 1,
    totalPrice: 29.90,
    monthlyEquivalent: 29.90,
    discountPercentage: 0,
    description: 'Flexibilidade total, cancele quando quiser.',
  },
  {
    id: 'QUARTERLY',
    name: 'Trimestral',
    cycleMonths: 3,
    totalPrice: 79.90,
    monthlyEquivalent: 26.63,
    discountPercentage: 11,
    description: 'Economize 11% para 3 meses de planejamento.',
  },
  {
    id: 'SEMIANNUAL',
    name: 'Semestral',
    cycleMonths: 6,
    totalPrice: 149.90,
    monthlyEquivalent: 24.98,
    discountPercentage: 16,
    description: 'Economize 16% com 6 meses de cardápio e finanças.',
  },
  {
    id: 'ANNUAL',
    name: 'Anual (Melhor Oferta)',
    cycleMonths: 12,
    totalPrice: 249.90,
    monthlyEquivalent: 20.82,
    discountPercentage: 30,
    description: 'Economize 30% — Apenas R$ 20,82/mês no plano anual!',
  },
];

interface SubscriptionModalProps {
  visible: boolean;
  workspaceId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubscriptionModal = ({
  visible,
  workspaceId,
  onClose,
  onSuccess,
}: SubscriptionModalProps) => {
  const { colors } = useAppTheme();
  const { showToast } = useToast();

  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'QUARTERLY' | 'SEMIANNUAL' | 'ANNUAL'>('ANNUAL');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [loading, setLoading] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === selectedCycle) || PLANS[3];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/billing/checkout`, {
        cycle: selectedCycle,
        paymentMethod,
      });

      if (paymentMethod === 'PIX') {
        showToast('Plano PRO Ativado com Sucesso via PIX! 👑', 'success');
      } else {
        showToast('Assinatura de Cartão Aprovada com Sucesso! 👑', 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.translatedMessage || getErrorMessage(err);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header Pro */}
            <View style={styles.header}>
              <View style={[styles.badgePro, { backgroundColor: colors.secondaryLight }]}>
                <Text style={[styles.badgeProText, { color: colors.secondary }]}>👑 HEALTHY ROUTINE PRO</Text>
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Desbloqueie Todos os Recursos</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Planejamento ilimitado, roleta de pratos especiais, divisão de despesas e lista inteligente.
              </Text>
            </View>

            {/* Ciclos de Planos */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolha seu ciclo de economia:</Text>

            {PLANS.map((plan) => {
              const isSelected = selectedCycle === plan.id;
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    { backgroundColor: colors.background, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => setSelectedCycle(plan.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planTitleGroup}>
                      <Text
                        style={[
                          styles.planName,
                          { color: colors.text },
                          isSelected && { color: colors.primaryDark, fontWeight: '800' },
                        ]}
                      >
                        {plan.name}
                      </Text>
                      {plan.discountPercentage > 0 && (
                        <View style={[styles.discountTag, { backgroundColor: colors.secondary }]}>
                          <Text style={styles.discountTagText}>{plan.discountPercentage}% OFF</Text>
                        </View>
                      )}
                    </View>
                    <View style={[styles.radioCircle, { borderColor: isSelected ? colors.primaryDark : colors.border }]}>
                      {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primaryDark }]} />}
                    </View>
                  </View>

                  <Text style={[styles.planPrice, { color: colors.text }]}>
                    R$ {plan.totalPrice.toFixed(2).replace('.', ',')}
                    <Text style={[styles.planCycleText, { color: colors.textMuted }]}>
                      {' '}
                      ({plan.cycleMonths === 1 ? 'mês' : `${plan.cycleMonths} meses`})
                    </Text>
                  </Text>

                  {plan.cycleMonths > 1 && (
                    <Text style={[styles.monthlyEquivalent, { color: colors.primaryDark }]}>
                      Apenas R$ {plan.monthlyEquivalent.toFixed(2).replace('.', ',')} por mês
                    </Text>
                  )}

                  <Text style={[styles.planDesc, { color: colors.textMuted }]}>{plan.description}</Text>
                </TouchableOpacity>
              );
            })}

            {/* Forma de Pagamento */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 14 }]}>Forma de Pagamento:</Text>
            <View style={styles.paymentMethodsRow}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  paymentMethod === 'PIX' && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                ]}
                onPress={() => setPaymentMethod('PIX')}
              >
                <Text style={styles.paymentEmoji}>⚡</Text>
                <Text
                  style={[
                    styles.paymentLabel,
                    { color: colors.textMuted },
                    paymentMethod === 'PIX' && { color: colors.primaryDark, fontWeight: '800' },
                  ]}
                >
                  PIX Instantâneo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethodBtn,
                  { backgroundColor: colors.background, borderColor: colors.border },
                  paymentMethod === 'CREDIT_CARD' && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                ]}
                onPress={() => setPaymentMethod('CREDIT_CARD')}
              >
                <Text style={styles.paymentEmoji}>💳</Text>
                <Text
                  style={[
                    styles.paymentLabel,
                    { color: colors.textMuted },
                    paymentMethod === 'CREDIT_CARD' && { color: colors.primaryDark, fontWeight: '800' },
                  ]}
                >
                  Cartão de Crédito
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ações */}
            <TouchableOpacity
              style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.checkoutBtnText}>
                  Assinar Agora • R$ {selectedPlan.totalPrice.toFixed(2).replace('.', ',')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={[styles.closeBtnText, { color: colors.textMuted }]}>Continuar no Plano Grátis</Text>
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
    padding: 20,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badgePro: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeProText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  planCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
  },
  discountTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  planCycleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  monthlyEquivalent: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  planDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  paymentMethodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  paymentEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkoutBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  checkoutBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  closeBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
