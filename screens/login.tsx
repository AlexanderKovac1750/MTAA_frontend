// app/login.tsx or app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useState } from 'react';

export default function LoginScreen() {
  const router = useRouter();

  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      
      const query = `?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`;
      const url = `http://147.175.161.105:5000/login${query}`;
      const response = await fetch(url, {
        method: 'POST',
      });
  
      const responseText = await response.text(); // 🔁 Use `.text()` instead of `.json()`
  
      if (!response.ok) {
        console.log('❌ Error response:', responseText);
        Alert.alert('failed: ', responseText);
        //throw new Error(`Login failed: ${responseText}`);
        return;
      }
  
      router.push('/screens/main_menu');
      console.log('✅ Login successful !!:', responseText);
      //Alert.alert('Success', responseText);
    } catch (error) {
      console.error('🚨 Login error:', error.message);
      Alert.alert('Login Error', error.message);
    }
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>◀</Text>
      </TouchableOpacity>

      <Text style={styles.title}>U slepeho orla</Text>

      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>🦅</Text>
      </View>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#ccc"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/main_menu')}>
        <Text style={styles.buttonText}>Prihlas saa</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Prihlas sa for real</Text>
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
