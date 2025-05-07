// app/login-choice.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import i18n from '../localisation/localisation';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function LoginChoiceScreen() {
  const router = useRouter();
  const { theme, toggleTheme, mode, fontScale } = useThemeColors();
  const { t } = useTranslation();

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
          onPress={() => router.push('/screens/experimental/E_MM')}
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
