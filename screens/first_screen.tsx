// app/login-choice.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import i18n from '../localisation/localisation';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getBaseUrl, setBaseUrl, setOfflineMode, setToken, setUserType, sleep } from '../config';
import { fetchDiscounts } from '../discount';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginChoiceScreen() {
  const router = useRouter();
  const { theme, toggleTheme, mode, fontScale } = useThemeColors();
  const { t } = useTranslation();
  
  const loadServerURL = async () => {
      const savedServerURL = await AsyncStorage.getItem('ServerURL');
      if(savedServerURL){
        setBaseUrl(savedServerURL);
      }
    }

    useEffect(()=>{
      loadServerURL();
    })

  const anon_login = async() => {

    //try to load from memory
    let name:string|null = await AsyncStorage.getItem('anon_username');
    let password:string|null = await AsyncStorage.getItem('anon_password');
    let was_loaded = true;

    
    

    if(name === null || password ===null){
      was_loaded=false;
      try {
          
        const url = `http://${getBaseUrl()}/anonymous`;
        const response = await fetch(url, {
          method: 'POST',
        });
      
        const responseText = await response.text(); // Use `.text()` instead of `.json()`
        const data: any = JSON.parse(responseText);
        
        if (!response.ok) {
          console.log('❌ Error response:', data.message);
          Alert.alert('login failed',data.message);
          return;
        }

        name=data.name;
        password=data.password;
        console.log('✅ anonymous created:', data);

        
        
      } catch (error) {
        console.error('🚨 Login error:', error.message);
        Alert.alert('failed to connect', error.message);
      }
    

      if(name === null || password ===null){
        return;
      }

      try{
            await AsyncStorage.setItem('anon_username', name);
            await AsyncStorage.setItem('anon_password', password);
          }
          catch{
            console.error('🚨 failed to save anonymous:');
          }
    }

    try {
          
        const query = `?name=${encodeURIComponent(name)}&password=${encodeURIComponent(password)}`;
        const url = `http://${getBaseUrl()}/login${query}`;
        const response = await fetch(url, {
          method: 'POST',
        });
      
        const responseText = await response.text(); // Use `.text()` instead of `.json()`
        const data: any = JSON.parse(responseText);
        console.log('the role is',data.type);
        if (!response.ok) {
          console.log('❌ Error response:', data.message);
          console.log('status is ',response.status);
          Alert.alert('login failed',data.message);

          if(was_loaded){
            AsyncStorage.removeItem('anon_username');
            AsyncStorage.removeItem('anon_password');
          }
          return;
        }
      
        setOfflineMode(false);
        sleep(100);
        setToken(data.token);
        setUserType(data.type);

        router.push('/screens/main_menu');
        console.log('✅ Login successful !!:', data.token);
        
      } catch (error) {
        console.error('🚨 Login error:', error.message);
      }
}

  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleTheme}>
          <FontAwesome
            name={mode === 'light' ? 'moon-o' : 'sun-o'}
            size={24}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.languageContainer}>
        {['sk', 'rus', 'en'].map(lang => (
          <TouchableOpacity key={lang} onPress={() => i18n.changeLanguage(lang)} style={styles.flagButton}>
            <Text style={{ fontSize: 26 * fontScale, color: theme.text }}>
              {lang === 'sk' ? '🇸🇰' : lang === 'rus' ? '🇷🇺' : '🇬🇧'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontSize: 28 * fontScale, fontWeight: '600', color: theme.text, marginBottom: 20 }}>
        {t('account.pubName')}
      </Text>

      <View style={styles.logoPlaceholder}>
        <Text style={{ fontSize: 48 * fontScale }}>🦅</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/screens/login')}
      >
        <Text style={{ fontSize: 18 * fontScale, fontWeight: 'bold', color: theme.surface }}>
          {t('account.login')}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={[styles.smallButton, { borderColor: theme.border }]}
          onPress={() => anon_login()}
        >
          <Text style={{ fontSize: 14 * fontScale, color: theme.accent }}>
            {t('account.anonymous')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.smallButton, { borderColor: theme.border }]}
          onPress={() => router.push('/screens/register')}
        >
          <Text style={{ fontSize: 14 * fontScale, color: theme.accent }}>
            {t('account.register')}
          </Text>
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
  logoPlaceholder: { marginVertical: 20 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
  },
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
});
