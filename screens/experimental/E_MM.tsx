// app/login.tsx or app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useState } from 'react';
import { getBaseUrl, setBaseUrl } from '../../config';

export default function E_MainMenuScreen() {
  const router = useRouter();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [address, setAddress] = useState(getBaseUrl());

    const handle_change = (text: string) => {
        setBaseUrl(text);
        setAddress(text);
    }
  
    const handleLogin = async () => {
      try {
        
        const query = `?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`;
        const url = `http://${address}/login${query}`;
        const response = await fetch(url, {
          method: 'POST',
        });
    
        const responseText = await response.text(); // Use `.text()` instead of `.json()`
    
        if (!response.ok) {
          console.log('❌ Error response:', responseText);
          Alert.alert('failed: ', responseText);
          //throw new Error(`Login failed: ${responseText}`);
          return;
        }
    
        router.push('/screens/experimental/E_MM_food_pic');
        console.log('✅ Login successful !!:', responseText);
        //Alert.alert('Success', responseText);
      } catch (error) {
        console.error('🚨 Login error:', error.message);
        Alert.alert('Login Error', error.message);
      }
    };

  return (

    <View style={styles.container}>
        <Text style={styles.title}>EEE Hlavne menu7</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
    
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
        <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            value={address}
            onChangeText={handle_change}
        />
    
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Prihlas sa for real</Text>
        </TouchableOpacity>
        <Text>steps:</Text>
        <Text>1 - get ip of your wifi adapter (ipconfig)</Text>
        <Text>2 - download latest mtaa_backend, whole zip and extract</Text>
        <Text>3 - run app from backend, set ip:</Text>
        <Text> port to that of wifi adapter</Text>
        <Text>4 - your backend server is now visible on LAN</Text>
        <Text>5 - now with backend active you can progress further</Text>
        <Text>5 - set the 3rd field to server address</Text>
        <Text>5 - Enter valid user f.e. Peter : 123</Text>
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
