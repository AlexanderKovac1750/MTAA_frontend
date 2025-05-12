import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { getBaseUrl, setBaseUrl, setOfflineMode, setToken, setUserType, sleep } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchDiscounts } from '../discount';
import i18n from '../localisation/localisation';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { theme, fontScale } = useThemeColors();
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState(getBaseUrl());
  const [rememberMe, setRememberMe] = useState(false);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);
  const [credentialsTried, setCredentialsTried] = useState(false);

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('username');
        const savedPassword = await AsyncStorage.getItem('password');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');

        if (savedRememberMe === 'true') {
          setName(savedUsername || '');
          setPassword(savedPassword || '');
          setRememberMe(true);
        }
      } finally {
        console.log('Loaded credentials:', name);
        setCredentialsLoaded(true);
      }
    };

    const loadServerURL = async () => {
      const savedServerURL = await AsyncStorage.getItem('ServerURL');
      if (savedServerURL != null) {
        handle_IP_change(savedServerURL);
      }
    };

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
    AsyncStorage.setItem('ServerURL', text);
  };

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout: number = 1000
  ): Promise<Response> => {
    return await Promise.race<Response>([
      fetch(url, options),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      )
    ]);
  };

  const handleLogin = async () => {
    if (name === '__dev__conf__') {
      router.push('/screens/experimental/E_MM');
      return;
    }

    if (rememberMe) {
      await AsyncStorage.setItem('username', name);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('rememberMe', 'true');
    } else {
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      await AsyncStorage.removeItem('rememberMe');
    }

    try {
      const query = `?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`;
      const url = `http://${address}/login${query}`;
      const response = await fetchWithTimeout(url, { method: 'POST' }, 1000);

      const responseText = await response.text();
      const data: any = JSON.parse(responseText);

      if (!response.ok) {
        console.log('❌ Error response:', data.message);
        Alert.alert('login failed', data.message);
        return;
      }

      setOfflineMode(false);
      sleep(100);
      setToken(data.token);
      fetchDiscounts();
      setUserType(data.type);
      router.push('/screens/main_menu');
      console.log('✅ Login successful !!:', data.token);
    } catch (error) {
      console.error('🚨 Login error:', error.message);
      setOfflineMode(true);
      Alert.alert(
        'failed to connect: ',
        'using offline mode, limited functionality. Please relog to gain full functionality when connection is regained.'
      );
      router.push('/screens/favourites');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={{ fontSize: 24 * fontScale, color: theme.text }}>◀</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 24 * fontScale, color: theme.text, marginBottom: 20, fontWeight: 'bold' }}>
        {t('appName')}
      </Text>

      <View style={[styles.logoPlaceholder, { backgroundColor: theme.card, borderRadius: 16, padding: 8 }]}>
        <Text style={{ fontSize: 48 * fontScale, color: theme.primary }}>🦅</Text>
      </View>

      <TextInput
        placeholder={t('name')}
        placeholderTextColor={theme.placeholder}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            color: theme.text,
            borderColor: theme.border,
            fontSize: 16 * fontScale,
          }
        ]}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder={t('password')}
        placeholderTextColor={theme.placeholder}
        secureTextEntry
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            color: theme.text,
            borderColor: theme.border,
            fontSize: 16 * fontScale,
          }
        ]}
        value={password}
        onChangeText={setPassword}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
        <TouchableOpacity
          style={{
            width: 24,
            height: 24,
            borderColor: theme.border,
            borderWidth: 1,
            backgroundColor: rememberMe ? theme.primary : theme.surface,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
          }}
          onPress={() => {
            setRememberMe(!rememberMe);
            setCredentialsTried(true);
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: rememberMe }}
        />
        <Text
          style={{
            marginLeft: 10 * fontScale,
            color: theme.text,
            fontSize: 14 * fontScale,
          }}
        >
          {t('rememberMe')}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleLogin}
        accessibilityRole="button"
      >
        <Text style={{ fontSize: 18 * fontScale, color: theme.surface }}>{t('loginButton')}</Text>
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
  logoPlaceholder: {
    marginVertical: 20,
  },
  input: {
    width: 250,
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
