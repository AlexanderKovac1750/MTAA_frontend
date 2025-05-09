import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

export default function LoyaltyScreen() {
    const { theme, fontScale } = useThemeColors();
    const router = useRouter();

    const userPoints = 10;
    const maxPoints = 20;
    const currentDiscount = userPoints >= 20 ? 20 : userPoints >= 10 ? 10 : userPoints >= 5 ? 5 : 0;
    const isUnlocked = (value: number) => userPoints >= value;

    const screenWidth = Dimensions.get('window').width;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const progress = userPoints / maxPoints;
        Animated.timing(progressAnim, {
            toValue: progress,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, [userPoints]);

    const barHeightInterpolate = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 160],
    });

    return (
        <Animatable.View animation="fadeInUp" duration={800} style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Back and Account Icons */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backTriangle} />
            <View style={styles.accountIcon}>
                <TouchableOpacity onPress={() => router.push('/screens/account')}>
                    <Ionicons name="person-circle" size={44} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>
                Ďakujeme za vašu lojalitu
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
                                    opacity: isUnlocked(level) ? 1 : 0.4,
                                    color: theme.text,
                                    fontSize: 14 * fontScale,
                                },
                            ]}
                        >
                            zľava {level}%
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
                Aktuálna úroveň: {currentDiscount}%
            </Text>

            {/* Bottom Button */}
            <TouchableOpacity
                style={[styles.skipButton, { backgroundColor: theme.primary, width: screenWidth }]}
                onPress={() => router.push('/screens/main_menu')}
            >
                <Text style={[styles.skipText, { fontSize: 16 * fontScale }]}>Preskočiť</Text>
            </TouchableOpacity>
        </Animatable.View>
    );
}

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
        borderRightColor: '#f4e4d4',
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
