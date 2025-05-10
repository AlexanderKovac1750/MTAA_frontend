// app/login.tsx or app/(auth)/login.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors, ThemeProvider } from '../resources/themes/themeProvider';
import theme from '../resources/themes/theme';
import { getBaseUrl, setBaseUrl, setToken, setUserType } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDiscounts } from '../discount';

export default function LoginScreen() {
  const { theme, fontScale } = useThemeColors();
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
      console.log('the role is',data.type);
      if (!response.ok) {
        console.log('❌ Error response:', data.message);
        Alert.alert('failed: ', data.message);
        return;
      }
    
      setToken(data.token);
      fetchDiscounts();
      setUserType(data.type);
      router.push('/screens/main_menu');
      console.log('✅ Login successful !!:', data.token);
      
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

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin}>
        <Text style={{ fontSize: 18 * fontScale, color: theme.surface }}>Prihlas sa</Text>
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
  backButtonText: { fontSize: 24, color: '#fff' },
  title: { fontSize: 24, color: '#fff', marginBottom: 20 },
  logoText: { fontSize: 48 },
  buttonText: { color: '#fff', fontSize: 18 }
});

