import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useThemeColors } from '../resources/themes/themeProvider';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={[styles.backButtonText, { color: theme.text }]}>◀</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]}>U slepeho orla</Text>

      {/* Logo */}
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>🦅</Text>
      </View>

      {/* Inputs */}
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="meno"
        placeholderTextColor={theme.secondary}
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="heslo"
        placeholderTextColor={theme.secondary}
        secureTextEntry
      />
      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        placeholder="heslo znova"
        placeholderTextColor={theme.secondary}
        secureTextEntry
      />

      {/* Button */}
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => router.push('/screens/main_menu')}>
        <Text style={[styles.buttonText, { color: theme.text }]}>Registruj</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 100,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backButtonText: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  logoPlaceholder: {
    marginVertical: 20,
  },
  logoText: {
    fontSize: 48,
  },
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
  buttonText: {
    fontSize: 18,
  },
});
