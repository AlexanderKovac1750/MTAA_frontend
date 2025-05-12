// app/register.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useState } from 'react';
import { getBaseUrl, setToken, setUserType } from '../config';

import i18n from '../localisation/localisation';
import { useTranslation } from 'react-i18next';

export default function RegisterScreen() {
  const router = useRouter();
  const { theme, fontScale } = useThemeColors();
  const [inputs, setInputs] = useState(['', '', '']); // [meno, heslo, heslo znova]

  const handleChange = (text, index) => {
    const newInputs = [...inputs];
    newInputs[index] = text;
    setInputs(newInputs);
  };

  const handleRegister = async () => {
    if(inputs[1]!=inputs[2]){
      Alert.alert('Passwords need to be same');
      return;
    }

    try {
      const query = `?name=${encodeURIComponent(inputs[0])}&password=${encodeURIComponent(inputs[1])}`;
      const url = `http://${getBaseUrl()}/register${query}`;
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
        
      setUserType(data.type);
      setToken(data.token);
      router.push('/screens/main_menu');
      console.log('✅ Register successful !!:', data.token);
          
    } catch (error) {
      console.error('🚨 Register error:', error.message);
      Alert.alert('Register Error', error.message);
    }
    
  }

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

      {['meno', 'heslo', 'heslo znova'].map((ph, idx) => (
        <TextInput
          key={idx}
          placeholder={ph}
          value={inputs[idx]}
        onChangeText={(text) => handleChange(text, idx)}
          placeholderTextColor={theme.secondary}
          secureTextEntry={ph.includes('heslo')}
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: theme.border,
              fontSize: 16 * fontScale,
            },
          ]}
        />
      ))}

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleRegister}>
        <Text style={{ fontSize: 18 * fontScale, color: theme.text }}>Registruj</Text>
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
