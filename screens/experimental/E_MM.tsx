// app/login.tsx or app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useState, useEffect } from 'react';
import { getBaseUrl, setBaseUrl, setToken } from '../../config';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function E_MainMenuScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(getBaseUrl());
  const [rememberMe, setRememberMe] = useState(false);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false); // track when load is done
  const [credentialsTried, setCredentialsTried] = useState(false); // track when load is done
  

  // Check if there are saved credentials when the component mounts
  useEffect(() => {
    const loadCredentials = async () => {
      try{
        const savedUsername = await AsyncStorage.getItem('username');
        const savedPassword = await AsyncStorage.getItem('password');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');

  
        if (savedRememberMe === 'true') {
          setName(savedUsername || '');
          setPassword(savedPassword || '');
          setRememberMe(true);
        }
      }
      finally{
        console.log('Loaded credintials:', name);
        setCredentialsLoaded(true);
      }
    };

    const loadServerURL = async () => {
      const savedServerURL = await AsyncStorage.getItem('ServerURL');

      if(savedServerURL != null){
        handle_IP_change(savedServerURL);
      }
    }

    loadCredentials();
    loadServerURL();
  }, []);
  
  useEffect(() => {
    if (credentialsLoaded && rememberMe && name && password && !credentialsTried) {
      handleLogin();
      setCredentialsTried(true);
    }
  }, [credentialsLoaded, rememberMe, name, password]);

  const handle_IP_change = (text: string) => {
    setBaseUrl(text);
    setAddress(text);

    const saveIP = async () => {
      await AsyncStorage.setItem('ServerURL', text);
    }
    saveIP();
  }
  
  const handleLogin = async () => {
    if (rememberMe) {
      await AsyncStorage.setItem('username', name);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      // If "Remember Me" is unchecked, clear credentials from AsyncStorage
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.removeItem('rememberMe');
    }

    try {
        
      const query = `?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`;
      const url = `http://${address}/login${query}`;
      const response = await fetch(url, {
        method: 'POST',
      });
    
      const responseText = await response.text(); // Use `.text()` instead of `.json()`
      const data: any = JSON.parse(responseText);
  
      if (!response.ok) {
        console.log('❌ Error response:', data.message);
        Alert.alert('failed: ', data.message);
        return;
      }
    
      setToken(data.token);
      router.push('/screens/main_menu');
      console.log('✅ Login successful !!:', data.token);
      
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
            onChangeText={handle_IP_change}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              width: 24,
              height: 24,
              borderColor: 'gray',
              borderWidth: 1,
              backgroundColor: rememberMe ? 'green' : 'white',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {setRememberMe(!rememberMe);setCredentialsTried(true);}}
          />
          <Text style={{ marginLeft: 10 }}>Remember me</Text>
        </View>
        <TouchableOpacity
            style={{
              width: 24,
              height: 24,
              borderColor: 'gray',
            }}
            onPress={() => {router.push('/screens/experimental/E_MM_food_pic');}}
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
