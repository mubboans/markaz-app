// app/providers/Toast.tsx
import React, { createContext, useContext, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X } from 'lucide-react-native';
type ToastApi = {
  show: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastApi>({} as ToastApi);

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const show = (message: string, duration = 3000) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), duration);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast.visible && (
        <View style={styles.container}>
          <Text style={styles.text}>{toast.message}</Text>
          <Pressable onPress={() => setToast({ ...toast, visible: false })}>
            <Text style={styles.close}>
              <X size={24} color="white" />
            </Text>
          </Pressable>
        </View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  text: { color: '#fff', fontSize: 14 },
  close: { color: '#fff', fontSize: 16, marginLeft: 8 },
});
