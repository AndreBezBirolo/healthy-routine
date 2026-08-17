import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Colors } from '../../theme/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type, visible: true });

    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <View style={styles.toastWrapper} pointerEvents="none">
          <View
            style={[
              styles.toastContainer,
              toast.type === 'success' && styles.toastSuccess,
              toast.type === 'error' && styles.toastError,
              toast.type === 'warning' && styles.toastWarning,
              toast.type === 'info' && styles.toastInfo,
            ]}
          >
            <Text style={styles.toastIcon}>
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </Text>
            <Text style={styles.toastMessage}>{toast.message}</Text>
          </View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 55,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 99999,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    maxWidth: 500,
    width: '100%',
  },
  toastSuccess: {
    backgroundColor: '#065F46', // Deep emerald
  },
  toastError: {
    backgroundColor: '#991B1B', // Deep red
  },
  toastWarning: {
    backgroundColor: '#92400E', // Deep amber
  },
  toastInfo: {
    backgroundColor: '#1E40AF', // Deep blue
  },
  toastIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  toastMessage: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
});
