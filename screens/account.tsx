import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../localisation/localisation';

const languages = [
    { code: 'sk', label: 'Slovenčina', emoji: '🇸🇰' },
    { code: 'en', label: 'English', emoji: '🇬🇧' },
    { code: 'rus', label: 'Русский', emoji: '🇷🇺' },
];

export default function AccountScreen() {
  const router = useRouter();
    const { theme, toggleTheme, mode, fontScale, setFontScale, highContrastMode, toggleHighContrast } =
      useThemeColors();
    const { t } = useTranslation();
    const [accessExpanded, setAccessExpanded] = useState(false);

    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back-ios" size={24 * fontScale} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.nameText, { color: theme.text, fontSize: 20 * fontScale }]}>
            Peter Jamek
          </Text>
          <Feather name="user" size={30 * fontScale} color={theme.text} />
        </View>

        {/* Discount */}
        <View style={styles.discountSection}>
          <Text style={[styles.discountText, { color: theme.text, fontSize: 18 * fontScale }]}>
            {t('account.discount')}
          </Text>
          <Image
            source={require('../resources/images/beer.png')}
            style={styles.beerImage}
            resizeMode="contain"
          />
          <View>
            <Text style={[styles.discountStep, { color: theme.text, fontSize: 16 * fontScale }]}>20%</Text>
            <Text style={[styles.discountStep, { color: theme.text, fontSize: 16 * fontScale }]}>10%</Text>
            <Text style={[styles.discountStep, { color: theme.text, fontSize: 16 * fontScale }]}>5%</Text>
          </View>
        </View>

        {/* Reservations */}
        <TouchableOpacity style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
            {t('account.myReservations')}
          </Text>
        </TouchableOpacity>

        {/* Theme Toggle */}
        <View style={[styles.sectionRow, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
            {t('account.darkMode')}
          </Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.modeButton}>
            {mode === 'dark' ? (
              <Feather name="sun" size={24 * fontScale} color={theme.accent} />
            ) : (
              <Feather name="moon" size={24 * fontScale} color={theme.accent} />
            )}
          </TouchableOpacity>
        </View>

        {/* Language Picker */}
        <View style={[styles.sectionRow, { backgroundColor: theme.surface, flexWrap: 'wrap' }]}>
          <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
            {t('account.language')}
          </Text>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => i18n.changeLanguage(lang.code)}
              style={{ marginHorizontal: 5, padding: 4 }}
            >
              <Text style={{ color: theme.accent, fontSize: 16 * fontScale }}>
                {lang.emoji || ''} {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Accessibility */}
        <TouchableOpacity
          style={[styles.sectionRow, { backgroundColor: theme.surface }]}
          onPress={() => setAccessExpanded(!accessExpanded)}
        >
          <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
            {t('account.accessibility')}
          </Text>
          <Text style={[styles.sectionText, { color: theme.accent, fontSize: 16 * fontScale }]}>
            {accessExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {accessExpanded && (
          <>
            {/* Font Size */}
            <View style={[styles.switchRow, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
                {t('account.fontSize')}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => setFontScale(Math.max(0.8, fontScale - 0.1))}>
                  <Text style={{ fontSize: 18 * fontScale, color: theme.accent, marginHorizontal: 10 }}>A−</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setFontScale(Math.min(2, fontScale + 0.1))}>
                  <Text style={{ fontSize: 18 * fontScale, color: theme.accent, marginHorizontal: 10 }}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* High Contrast */}
            <View style={[styles.switchRow, { backgroundColor: theme.surface }]}>
              <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
                {t('account.highContrast')}
              </Text>
              <Switch value={highContrastMode} onValueChange={toggleHighContrast} />
            </View>
          </>
        )}

        {/* Password & Logout */}
        <TouchableOpacity style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
            {t('account.changePassword')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton}>
          <Feather name="log-out" size={20 * fontScale} color="white" />
          <Text style={[styles.logoutText, { fontSize: 16 * fontScale }]}>
            {t('account.logout')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      alignItems: 'center',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '90%',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    iconButton: {
      padding: 5,
    },
    nameText: {
      fontWeight: '600',
    },
    discountSection: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '90%',
      marginBottom: 30,
      justifyContent: 'space-between',
    },
    discountText: {},
    beerImage: {
      width: 60,
      height: 60,
    },
    discountStep: {
      marginVertical: 2,
    },
    section: {
      width: '90%',
      padding: 15,
      borderRadius: 10,
      marginVertical: 6,
    },
    sectionText: {},
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '90%',
      padding: 15,
      borderRadius: 10,
      marginVertical: 6,
      alignItems: 'center',
    },
    modeButton: {
      padding: 5,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '90%',
      padding: 15,
      borderRadius: 10,
      marginVertical: 4,
      alignItems: 'center',
    },
    logoutButton: {
      flexDirection: 'row',
      backgroundColor: '#a33',
      marginTop: 30,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    logoutText: {
      color: 'white',
      marginLeft: 10,
    },
  });
