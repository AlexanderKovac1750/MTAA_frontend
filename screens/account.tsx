import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, Image, ScrollView, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { MaterialIcons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Animatable from 'react-native-animatable';
import i18n from '../localisation/localisation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getBaseUrl, getToken, getUserType } from '../config';
import { UserAccountInfo } from '../user';
import { Reservation } from '../reservation';
import { chooseDiscount, Discount, fetchDiscounts, getAvaiableDiscounts, getChosenDiscount, getDPs } from '../discount';

const languages = [
  { code: 'sk', label: 'Slovenčina', emoji: '🇸🇰' },
  { code: 'en', label: 'English', emoji: '🇬🇧' },
  { code: 'rus', label: 'Русский', emoji: '🇷🇺' },
];

export default function AccountScreen() {
  const router = useRouter();
  const { theme, toggleTheme, mode, fontScale, setFontScale, highContrastMode, toggleHighContrast, setInitialMode } = useThemeColors();
  const { t } = useTranslation();
  const systemTheme = useColorScheme();

  const [accessExpanded, setAccessExpanded] = useState(false);
  const [name, setName] = useState('Anonymous');
  const [userPoints, setUserPoints] = useState(0);
  const [loyaltyLevel, setLoyaltyLevel] = useState(0);
  const [reservations, setReservations] = useState<{ table: string; date: string; time: string }[]>([]);
  const [discountOptions, setDiscountOptions] = useState<Discount[]>([]);
  const [userType, setUserType] = useState('registered');
  const [reservationsExpanded, setReservationsExpanded] = useState(false);
  const [availableDPs, setAvailableDPs] = useState<number>(0);
  const [discount, setDiscount] = useState<Discount|null>(null);

  const maxPoints = 20;
  const currentDiscountLevel =
    userPoints >= 20 ? 20 : userPoints >= 10 ? 10 : userPoints >= 5 ? 5 : 0;
  const freeFavoriteSpaces = Math.floor(loyaltyLevel / 3);

  const fetchUserData = async () => {
    const token = getToken();

    if (!token) {
      console.log('[INFO] Anonymous user – using device theme and defaults');

      setName('Anonymous');
      setUserPoints(0);
      setLoyaltyLevel(0);
      setReservations([]);
      i18n.changeLanguage('sk');

      if (systemTheme && systemTheme !== mode) {
        setInitialMode(systemTheme);
      }

      return;
    }

    try {
      const accountRes = await fetch(`http://${getBaseUrl()}/account_info?token=${token}`, {
        method: 'GET',
      });
      const resRes = await fetch(`http://${getBaseUrl()}/reservation?token=${token}`, {
        method: 'GET',
      });

      
      const user = await accountRes.json();
      const reservationData = await resRes.json();

      if (!accountRes.ok) {
        console.warn('❌ [ERROR] with response:', user.message);
        if(accountRes.status!==404){
          throw new Error('⚠️ Server returned non-OK or non 404 status for account info');
        }
      }
      if (!resRes.ok) {
        console.warn('❌ [ERROR] with response:', reservationData.message);
        if(resRes.status!==404){
          throw new Error('⚠️ Server returned non-OK or non 404 status for reservation info');
        }
      }
      console.log('user info fetched');
      const account_info=user.account_info;
      const reservations=reservationData.reservations;
      setName(account_info.name || 'Anonymous');
      setUserPoints(account_info.loyalty_points || 0);
      setLoyaltyLevel(account_info.loyalty_level || 0);
      setReservations(reservationData.reservations || []);
    } catch (err) {
      console.error('❌ [ERROR] Failed to fetch user data:', err.message);
      setName('Anonymous');
      setUserPoints(0);
      setLoyaltyLevel(0);
      setReservations([]);
    }
  };

  useEffect(() => {
    fetchUserData();
    setUserType(getUserType());
    setDiscountOptions(getAvaiableDiscounts());
    
    setDiscount(getChosenDiscount());
    setAvailableDPs(getDPs());
  }, []);

  const logout_call = async() => {
    try {
                const query = `?token=${getToken()}`;
                const url = `http://${getBaseUrl()}/logout${query}`;
                const response = await fetch(url, {
                    method: 'post',
                });
                    
                const responseText = await response.text(); 
                const data: any = JSON.parse(responseText);
                
                if (!response.ok) {
                    console.log('❌ Error response:', data.message);
                    Alert.alert('failed invalidate token: ', data.message);
                }
    
            } catch (error) {
                console.error('🚨 logout error:', error.message);
                Alert.alert('logout Error', error.message);
            }
            router.dismissAll();
            router.replace('/screens/first_screen');

  }


   return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 60 }} style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <MaterialIcons name="arrow-back-ios" size={24 * fontScale} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.nameText, { color: theme.text, fontSize: 20 * fontScale }]}>
          {name}
        </Text>
        <Feather name="user" size={30 * fontScale} color={theme.text} />
      </View>

      <View style={styles.loyaltyContainer}>
        <View style={styles.discountRow}>
          <View style={[styles.discountColumn, {left:0}]}>
                                      {discountOptions.map((discOpt) => (
                                          
                                          <TouchableOpacity
                                              key={discOpt.id}
                                          onPress = {()=>{
                                              if(getChosenDiscount() && getChosenDiscount()!.id===discOpt.id){
                                                  chooseDiscount(null);
                                                  setDiscount(null);
                                              }
                                              else{
                                                  chooseDiscount(discOpt);
                                                  setDiscount(discOpt);
                                                  console.log('discount chosen',discOpt.id);
                                              }
                                          }}>
                                              <Text
                                                  
                                                  style={[
                                                  styles.discountText,
                                                  {
                                                      opacity: availableDPs >= discOpt.cost ? 1 : 0.4,
                                                      color: theme.text,
                                                      fontSize: 14 * fontScale,
                                                      fontWeight: (discount === discOpt  ? 900 : 'normal'),
                                                  },
                                                  ]}
                                              >
                                                  zľava {discOpt.effectivness.toFixed(2)}%
                                              </Text>
                                          </TouchableOpacity>
                                      ))}
                                    </View>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.barFill,
                {
                  height: `${(userPoints / maxPoints) * 100}%`,
                  backgroundColor: theme.primary,
                },
              ]}
            />
          </View>
          <Image
            source={require('../resources/images/beer.png')}
            style={styles.beerImage}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.levelText, { color: theme.text, fontSize: 14 * fontScale }]}>
          Aktuálna lojalitná úroveň: {loyaltyLevel}
        </Text>
        <Text style={[styles.levelText, { color: theme.text, fontSize: 14 * fontScale }]}>
          Dostupné obľúbené jedlo: {freeFavoriteSpaces}
        </Text>
        <Text style={[styles.levelText, { color: theme.text, fontSize: 14 * fontScale }]}>
          Aktuálna úroveň bonusu: {currentDiscountLevel}%
        </Text>
      </View>

      {/* Reservations toggle */}
      <TouchableOpacity
        style={[styles.section, { backgroundColor: theme.surface }]}
        onPress={() => setReservationsExpanded(!reservationsExpanded)}
      >
        <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
          {t('account.myReservations')}
        </Text>
        <Text style={{ color: theme.accent }}>{reservationsExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {reservationsExpanded && reservations.length > 0 && (
        reservations.map((res, idx) => (
          <TouchableOpacity key={idx} style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.text }}>{res.table}</Text>
            <Text style={{ color: theme.placeholder }}>{res.date} {res.time}</Text>
          </TouchableOpacity>
        ))
      )}

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

      {/* Language */}
      <View style={[styles.sectionRow, { backgroundColor: theme.surface, flexDirection: 'column', alignItems: 'flex-start' }]}>
        <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
          {t('account.language')}
        </Text>
        <View style={styles.languageRow}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => i18n.changeLanguage(lang.code)}
              style={{ marginHorizontal: 5, padding: 4 }}
            >
              <Text style={{ color: theme.accent, fontSize: 16 * fontScale }}>
                {lang.emoji} {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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

          <View style={[styles.switchRow, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
              {t('account.highContrast')}
            </Text>
            <Switch value={highContrastMode} onValueChange={toggleHighContrast} />
          </View>
        </>
      )}

      {/* Actions */}
      <TouchableOpacity style={[styles.section, { backgroundColor: theme.surface }]} onPress={() => router.push('/screens/change_password')}>
        <Text style={[styles.sectionText, { color: theme.text, fontSize: 16 * fontScale }]}>
          {t('account.changePassword')}
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 30 }}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={async () => {
            if (userType==='anonymous') {
              Alert.alert('Anonymous user', 'Please log in to save your preferences.');
              return;
            }

            const token =getToken();
            try {
              const res = await fetch(`http://${getBaseUrl()}/change_preferences`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },

                body: JSON.stringify({
                  token,
                  language: i18n.language,
                  darkmode: mode === 'dark',
                  high_contrast: highContrastMode,
                }),
              });

              // const result = await res.json();
              const text = await res.text();
              let result;
              try {
                result =  JSON.parse(text);
              } catch (err) {
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON data');
            }

              if (res.ok) {
                Alert.alert('✅', 'Preferences saved successfully!');
              } else {
                throw new Error(result.message || 'Failed to save preferences');
              }
            } catch (err) {
              console.error('Error saving preferences:', err);
              Alert.alert('Error', err.message);
            }
          }}
        >
            <Text style={[styles.saveText, { fontSize: 16 * fontScale }]}>
              {t('account.save')}
            </Text>
          </TouchableOpacity>

    <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {logout_call();}}
      >
        <Feather name="log-out" size={20 * fontScale} color="white" />
        <Text style={[styles.logoutText, { fontSize: 16 * fontScale }]}>
          {t('account.logout')}
        </Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}




  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 60,
      alignItems: 'center',
    },
    topRow: {
      paddingTop: 60,
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
    discountStep: {
      marginVertical: 2,
    },
    discountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    languageRow: {
      flexDirection: 'row',
      flexWrap: 'nowrap',
      alignItems: 'center',
      marginTop: 10,
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
    loyaltyContainer: {
      alignItems: 'center',
      marginVertical: 20,
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    discountColumn: {
      marginRight: 10,
      alignItems: 'flex-end',
    },
    discountText: {
      marginVertical: 4,
    },
    barContainer: {
      width: 20,
      height: 100,
      backgroundColor: '#ccc',
      borderRadius: 10,
      justifyContent: 'flex-end',
      overflow: 'hidden',
      marginHorizontal: 10,
    },
    barFill: {
      width: '100%',
      borderRadius: 10,
      opacity: 0.5,
    },
    beerImage: {
        width: 140,
        height: 200,
    },
    levelText: {
      marginTop: 6,
      fontWeight: '500',
    },

    saveButton: {
      marginTop: 30,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    saveText: {
      color: 'white',
      fontWeight: '600',
    },
    // logoutButtonSmall: {
    //   backgroundColor: '#a33',
    //   paddingVertical: 10,
    //   paddingHorizontal: 12,
    //   borderRadius: 10,
    //   alignItems: 'center',
    //   justifyContent: 'center',
    // },

  });
