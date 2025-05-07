// app/register.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme, fontScale } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={{ fontSize: 24 * fontScale, color: theme.text }}>◀</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 24 * fontScale, color: theme.text, marginBottom: 20 }}>
        U slepeho orla
      </Text>

      <View style={styles.logoPlaceholder}>
        <Text style={{ fontSize: 48 * fontScale }}>🦅</Text>
      </View>

      {['meno', 'heslo', 'heslo znova'].map((ph, idx) => (
        <TextInput
          key={idx}
          placeholder={ph}
          placeholderTextColor={theme.secondary}
          secureTextEntry={ph.includes('heslo')}
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
              fontSize: 16 * fontScale,
            },
          ]}
        />
      ))}

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]}>
        <Text style={{ fontSize: 18 * fontScale, color: theme.text }}>Registruj</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 100 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  logoPlaceholder: { marginVertical: 20 },
  input: {
    width: 250,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
  },
});
