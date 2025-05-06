// app/login-choice.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { FontAwesome } from '@expo/vector-icons';

export default function LoginChoiceScreen() {
  const router = useRouter();
  const { theme, toggleTheme, mode } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Theme Toggle Buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleTheme}>
          <FontAwesome
            name={mode === 'light' ? 'moon-o' : 'sun-o'}
            size={24}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>

      {/* Language Flags as Buttons */}
      <View style={styles.languageContainer}>
        {['🇸🇰', '🇨🇿', '🇬🇧'].map((flag, idx) => (
          <TouchableOpacity key={idx} style={styles.flagButton}>
            <Text style={[styles.flag, { color: theme.text }]}>{flag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>U slepého orla</Text>

      {/* Logo */}
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>🦅</Text>
      </View>

      {/* Main Login Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/screens/login')}
      >
        <Text style={[styles.buttonText, { color: theme.surface }]}>Prihlás sa</Text>
      </TouchableOpacity>

      {/* Anon/Register Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.smallButton, { borderColor: theme.border }]}
          onPress={() => router.push('/screens/experimental/E_MM')}
        >
          <Text style={[styles.smallButtonText, { color: theme.accent }]}>anonymný mód</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, { borderColor: theme.border }]}
          onPress={() => router.push('/screens/register')}
        >
          <Text style={[styles.smallButtonText, { color: theme.accent }]}>zaregistruj sa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  topBar: { position: 'absolute', top: 50, right: 30 },
  languageContainer: { flexDirection: 'row', marginBottom: 30 },
  flagButton: { marginHorizontal: 10, padding: 10, borderRadius: 8 },
  flag: { fontSize: 26 },
  title: { fontSize: 28, fontWeight: '600', marginBottom: 20 },
  logoPlaceholder: { marginVertical: 20 },
  logoText: { fontSize: 48 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
  },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
  bottomButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
  },
  smallButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 5,
  },
  smallButtonText: { fontSize: 14 },
});
