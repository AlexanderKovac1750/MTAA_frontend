import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { clearAllOrderInfo } from '../cart';
import { UserAccountInfo } from '../user';
import { getBaseUrl, getToken } from '../config';
import i18n from '../localisation/localisation';
import { useTranslation } from 'react-i18next';

export default function LoyaltyScreen() {
  const { t } = useTranslation();
  const { theme, fontScale } = useThemeColors();
  const router = useRouter();
  const [user, setUser] = useState<UserAccountInfo | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  
  // Animation and layout setup
  const screenWidth = Dimensions.get('window').width;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const maxPoints = 100;
  
  // Derived values
  const currentDiscount = userPoints >= 75 ? 20 : userPoints >= 50 ? 10 : userPoints >= 25 ? 5 : 0;
  const isUnlocked = (value: number) => userPoints >= value;

  // Animation interpolation
  const barHeightInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 160],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accountRes = await fetch(
          `http://${getBaseUrl()}/account_info?token=${getToken()}`,
          { method: 'GET' }
        );
        const userData = await accountRes.json();
        setUser(userData);
        
        const points = UserAccountInfo.getPoints(userData);
        setUserPoints(points.loyalty_points || 0);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Animation effect
  useEffect(() => {
    const progress = userPoints / maxPoints;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [userPoints, progressAnim, maxPoints]);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>{t('LoyalityScreen.loading')}</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeInUp" duration={800} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back and Account Icons */}
      <TouchableOpacity onPress={() => router.back()} style={[styles.backTriangle, { borderRightColor: theme.text }]} />
      <View style={styles.accountIcon}>
        <TouchableOpacity onPress={() => router.push('/screens/account')}>
          <Ionicons name="person-circle" size={44} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>
        {t('account.discount')}
      </Text>

      {/* Center Row: Labels – Bar – Beer */}
      <View style={styles.centerContent}>
        {/* Discount Labels */}
        <View style={styles.discountColumn}>
          {[20, 10, 5].map((level) => (
            <Text
              key={level}
              style={[
                styles.discountText,
                {
                  opacity: isUnlocked(level * 5) ? 1 : 0.4, // hreshold calculation
                  color: theme.text,
                  fontSize: 14 * fontScale,
                },
              ]}
            >
              {t('account.discount')} {level}%
            </Text>
          ))}
        </View>

        {/* Animated Bar */}
        <View style={styles.barContainer}>
          <Animated.View
            style={[
              styles.barFill,
              {
                height: barHeightInterpolate,
                backgroundColor: theme.primary,
              },
            ]}
          />
        </View>

        {/* Beer Image */}
        <Image
          source={require('../resources/images/beer.png')}
          style={styles.beerImage}
          resizeMode="contain"
        />
      </View>

      {/* Current Discount */}
      <Text style={[styles.levelText, { color: theme.text, fontSize: 16 * fontScale }]}>
        {t('account.discount')}: {currentDiscount}%
      </Text>

      {/* Bottom Button */}
      <TouchableOpacity
        style={[styles.skipButton, { backgroundColor: theme.primary, width: screenWidth }]}
        onPress={() => {
          router.dismissAll();
          router.replace('/screens/first_screen');
          router.push('/screens/main_menu');
          clearAllOrderInfo();
        }}
      >
        <Text style={[styles.skipText, { fontSize: 16 * fontScale }]}>{t('login.skipButton')}</Text>
      </TouchableOpacity>
    </Animatable.View>
  );
}

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backTriangle: {
    position: 'absolute',
    top: 60,
    left: 16,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderRightWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  accountIcon: {
    position: 'absolute',
    top: 58,
    right: 16,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  discountColumn: {
    justifyContent: 'space-between',
    height: 160,
    marginRight: 10,
  },
  discountText: {
    marginVertical: 5,
  },
  barContainer: {
    width: 20,
    height: 160,
    backgroundColor: '#ccc',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 10,
    opacity: 0.4,
  },
  beerImage: {
    width: 140,
    height: 200,
  },
  levelText: {
    fontWeight: '500',
    marginBottom: 10,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipText: {
    fontWeight: '600',
    color: 'white',
  },
});