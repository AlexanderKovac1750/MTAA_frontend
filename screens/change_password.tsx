import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { getBaseUrl, getToken } from '../config';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';


const ChangePasswordScreen = () => {
    const { theme, fontScale } = useThemeColors();
    const { t } = useTranslation();
    const token = getToken();

    const [userType, setUserType] = useState<'admin' | 'registered' | 'anonymous' | null>(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`http://${getBaseUrl()}/sensitive_info?token=${token}`);
                const data = await response.json();
                setUserType(data?.user_type);
            } catch (error) {
                console.error('Failed to fetch user info', error);
                Alert.alert(t('changePassword.title'), t('changePassword.errorFetch'));
            }
        };
        fetchUserInfo();
    }, []);

    const handleChangePassword = async () => {
        if (userType === 'anonymous') {
            Alert.alert(t('changePassword.title'), t('changePassword.errorAnon'));
            return;
        }

        if (!newPassword || !confirmPassword || (userType !== 'admin' && !oldPassword)) {
            Alert.alert(t('changePassword.title'), t('changePassword.errorEmpty'));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('changePassword.title'), t('changePassword.errorMismatch'));
            return;
        }

        try {
            setLoading(true);

            // const resolvedUserType = userType ?? 'anonymous';
            const resolvedUserType = userType ?? 'registered';          //for testing

            const query = new URLSearchParams({
                token,
                user_type: resolvedUserType,
                old_password: oldPassword,
                new_password: newPassword,
            });

            const response = await fetch(`http://${getBaseUrl()}/change_password?${query}`, {
                method: 'PUT',
            });

            const result = await response.text();

            if (response.ok && result.includes('successfully')) {
                Alert.alert(
                    t('changePassword.title'),
                    t('changePassword.success'),
                    [
                        {
                            text: t('changePassword.ok') || 'OK',
                            onPress: () => router.back(),
                        },
                    ]
                );
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                Alert.alert(t('changePassword.title'), result || t('changePassword.errorUnknown'));
            }

        } catch (error) {
            console.error('Password change error:', error);
            Alert.alert(t('changePassword.title'), t('changePassword.errorServer'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text style={[styles.title, { color: theme.text, fontSize: 22 * fontScale }]}>
                {t('changePassword.title')}
            </Text>

            {userType === 'registered' && (
                <TextInput
                    secureTextEntry
                    placeholder={t('changePassword.old')}
                    placeholderTextColor={theme.placeholder}
                    style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize: 16 * fontScale }]}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />
            )}

            <TextInput
                secureTextEntry
                placeholder={t('changePassword.new')}
                placeholderTextColor={theme.placeholder}
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize: 16 * fontScale }]}
                value={newPassword}
                onChangeText={setNewPassword}
            />

            <TextInput
                secureTextEntry
                placeholder={t('changePassword.confirm')}
                placeholderTextColor={theme.placeholder}
                style={[styles.input, { backgroundColor: theme.surface, color: theme.text, fontSize: 16 * fontScale }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                onPress={handleChangePassword}
                style={[styles.button, { backgroundColor: theme.primary }]}
                disabled={loading}
            >
                <Text style={[styles.buttonText, { color: theme.text, fontSize: 16 * fontScale }]}>
                    {loading ? t('changePassword.saving') : t('changePassword.save')}
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        padding: 12,
        borderRadius: 10,
        marginVertical: 10,
    },
    button: {
        padding: 14,
        borderRadius: 10,
        marginTop: 20,
        alignItems: 'center',
    },
    buttonText: {
        fontWeight: '600',
    },
});

export default ChangePasswordScreen;
