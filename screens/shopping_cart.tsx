import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ShoppingCartScreen() {
    const { theme, fontScale } = useThemeColors();
    const router = useRouter();

    // Sample cart data (to be replaced by backend)
    const [cartItems, setCartItems] = useState([
        {
        id: 1,
        title: 'Zemiaky na smotane',
        quantity: 2,
        price: 4.2,
        image: require('../resources/images/sample-dish.png'),
        },
        {
        id: 2,
        title: 'Grilované kura',
        quantity: 3,
        price: 6.5,
        image: require('../resources/images/sample-dish.png'),
        },
    ]);

    const MAX_QUANTITY = 15;

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(prevItems =>
        prevItems.map(item => {
            if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > MAX_QUANTITY) {
                Alert.alert('Limit', 'Maximálny počet porcií na objednávku je 15.');
                return item;
            }
            return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
        })
        );
    };

    const deleteItem = (id: number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const totalPrice = cartItems
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2);

    const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Back triangle top-left */}
        <View style={styles.topBar}>
            <TouchableOpacity style={styles.backTriangle} onPress={() => router.back()} />
        </View>

        {/* Account icon top-right */}
        <View style={{ position: 'absolute', top: 32, right: 16, zIndex: 10 }}>
            <TouchableOpacity
            onPress={() => {
                console.log('Account pressed');
                router.push('/screens/account');
            }}
            >
            <Ionicons name="person-circle" size={48} color={theme.text} />
            </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>
            Nákupný košík ({totalItemCount})
        </Text>

        {/* Scrollable cart items */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {cartItems.map(item => (
            <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                {/* Image clickable to item_desc */}
                <TouchableOpacity onPress={() => router.push({ pathname: '/screens/item_desc', params: { id: item.id } })}>
                <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                </TouchableOpacity>

                <View style={styles.itemDetails}>
                <Text style={[styles.itemTitle, { color: theme.text, fontSize: 16 * fontScale }]}>
                    {item.title}
                </Text>
                <View style={styles.controls}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, -1)}>
                    <Ionicons name="remove-circle-outline" size={26} color={theme.accent} />
                    </TouchableOpacity>
                    <Text style={[styles.quantity, { color: theme.text }]}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, 1)}>
                    <Ionicons name="add-circle-outline" size={26} color={theme.accent} />
                    </TouchableOpacity>
                </View>
                </View>

                {/* Remove item */}
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <Ionicons name="close" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>
            ))}
        </ScrollView>

        {/* Bottom bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
            <Text style={[styles.total, { color: theme.text, fontSize: 16 * fontScale }]}>
            Spolu: {totalPrice} €
            </Text>
            <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: theme.primary }]}
              // onPress={() => router.push('/screens/delivery')}
              onPress={() => router.push('/screens/favourites')} //just for now, to be changed later
            >
            <Text style={[styles.orderText, { color: theme.text, fontSize: 16 * fontScale }]}>
                Objednať
            </Text>
            </TouchableOpacity>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
container: {
        flex: 1,
        paddingTop: 50,
    },
    topBar: {
        position: 'absolute',
        top: 36,
        left: 16,
        zIndex: 10,
    },
    backTriangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderTopWidth: 12,
        borderBottomWidth: 12,
        borderRightWidth: 18,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: '#f4e4d4',
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
    scrollContainer: {
        paddingHorizontal: 10,
        paddingBottom: 100,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 10,
        marginVertical: 6,
    },
    itemImage: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 10,
    },
    itemDetails: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: '600',
        marginBottom: 6,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantity: {
        marginHorizontal: 10,
        fontWeight: '600',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    total: {
        fontWeight: '600',
    },
    orderButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    orderText: {
        fontWeight: '600',
    },
});
