// app/login-choice.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; 

export default function LoginChoiceScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Language Flags */}
      <View style={styles.languageContainer}>
        <Text style={styles.flag}>🇸🇰</Text>
        <Text style={styles.flag}>🇨🇿</Text>
        <Text style={styles.flag}>🇬🇧</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>U slepeho orla</Text>

      {/* Logo */}
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>🦅</Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/login')}>
        <Text style={styles.buttonText}>Prihlás sa13</Text>
      </TouchableOpacity>

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.smallButton} onPress={() => router.push('/screens/main_menu')}>
          <Text style={styles.smallButtonText}>anonymní mód</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.smallButton} onPress={() => router.push('/screens/register')}>
          <Text style={styles.smallButtonText}>zaregistruj sa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3c2e23', alignItems: 'center', justifyContent: 'center' },
  languageContainer: { flexDirection: 'row', position: 'absolute', top: 40 },
  flag: { marginHorizontal: 10, fontSize: 24 },
  title: { fontSize: 24, color: '#fff', marginBottom: 20 },
  logoPlaceholder: { marginVertical: 20 },
  logoText: { fontSize: 48 },
  button: { backgroundColor: '#8b6f47', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8, marginVertical: 10 },
  buttonText: { color: '#fff', fontSize: 18 },
  bottomButtons: { flexDirection: 'row', marginTop: 20 },
  smallButton: { marginHorizontal: 10 },
  smallButtonText: { color: '#d3c4a3' }
});
