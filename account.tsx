// app/login.tsx or app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; 

export default function MainMenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Konto</Text>

      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>🦅</Text>
      </View>

      <TouchableOpacity style={styles.button}  onPress={() => router.push('.')}>
        <Text style={styles.buttonText}>odhlas sa</Text>
      </TouchableOpacity>
    </View>
  );
}

// styles ... your same StyleSheet


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3c2e23', alignItems: 'center', paddingTop: 100 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  backButtonText: { fontSize: 24, color: '#fff' },
  title: { fontSize: 24, color: '#fff', marginBottom: 20 },
  logoPlaceholder: { marginVertical: 20 },
  logoText: { fontSize: 48 },
  input: { backgroundColor: '#8b6f47', color: '#fff', width: 250, padding: 10, marginVertical: 10, borderRadius: 8 },
  button: { backgroundColor: '#8b6f47', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18 }
});
