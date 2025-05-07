// app/login.tsx or app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { theme, fontScale } = useThemeColors();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const query = `?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`;
      const url = `http://147.175.161.105:5000/login${query}`;
      const response = await fetch(url, { method: 'POST' });
      const responseText = await response.text();

      if (!response.ok) {
        console.log('❌ Error response:', responseText);
        Alert.alert('failed: ', responseText);
        return;
      }

      router.push('/screens/main_menu');
      console.log('✅ Login successful !!:', responseText);
    } catch (error) {
      console.error('🚨 Login error:', error.message);
      Alert.alert('Login Error', error.message);
    }
  };

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

      <TextInput
        placeholder="Name"
        placeholderTextColor={theme.secondary}
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.secondary}
        secureTextEntry
        style={[styles.input, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => router.push('/screens/main_menu')}>
        <Text style={{ fontSize: 18 * fontScale, color: theme.surface }}>Prihlas saa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleLogin}>
        <Text style={{ fontSize: 18 * fontScale, color: theme.surface }}>Prihlas sa for real</Text>
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
