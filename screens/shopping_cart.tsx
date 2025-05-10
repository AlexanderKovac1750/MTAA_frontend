import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { decItem, getCartItems, incItem, order_item, removeItem, setItemQuantity } from '../cart';
import { selectFood } from '../config';

export default function ShoppingCartScreen() {
    const router = useRouter();
    const { theme, fontScale } = useThemeColors();

    // Sample cart data (to be replaced by backend)
    const MAX_QUANTITY = 15;
    const [cartItems, setCartItems] = useState<order_item[]>([]);
    const [reloading, setReloading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('📌 cart screen is focused');
            reloadCart();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => { 
        if(reloading){
            setCartItems(getCartItems());
            setReloading(false);
        }
    },[reloading]);

    const reloadCart = async() => {
        setReloading(true);
        console.log('📌 reloading items in shopping cart');
        setCartItems([]);
        await setCartItems(getCartItems());
    }

    const updateQuantity = (changed_item: order_item, delta: number) => {
        if(changed_item.count+delta>MAX_QUANTITY){
            Alert.alert('Limit', `Maximálny počet porcií na objednávku je ${MAX_QUANTITY}.`);
            setItemQuantity(changed_item,MAX_QUANTITY);
        }
        else{
            if(delta===1){
                incItem(changed_item);
            }
            if(delta===-1){
                decItem(changed_item);
            }
        }
        reloadCart();
    };

    const deleteItem = (remItem: order_item) => {
        setCartItems(prev => prev.filter(item => item.name !== remItem.name));
        removeItem(remItem);
    };

    const totalPrice = cartItems
        .reduce((sum, item) => sum + item.price * item.count, 0)
        .toFixed(2);

    const totalItemCount = cartItems.reduce((sum, item) => sum + item.count, 0);

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
            <Ionicons name="person-circle" size={50} color={theme.text} />
            </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>
            Nákupný košík ({totalItemCount})
        </Text>

        {/* Scrollable cart items */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            {cartItems.map(item => (
                <View key={item.name} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                    <TouchableOpacity onPress={() => {selectFood(item.meal),router.push('/screens/item_desc')}}>
                    <Image source={{uri: item.meal.image}} style={styles.itemImage} resizeMode="cover" />
                    </TouchableOpacity>

                    <View style={styles.itemDetails}>
                    <Text style={[styles.itemTitle, { color: theme.text, fontSize: 16 * fontScale }]}>
                        {item.name}
                    </Text>
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={() => updateQuantity(item, -1)}>
                        <Ionicons name="remove-circle-outline" size={26} color={theme.accent} />
                        </TouchableOpacity>
                        <Text style={[styles.quantity, { color: theme.text }]}>{item.count}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item, 1)}>
                        <Ionicons name="add-circle-outline" size={26} color={theme.accent} />
                        </TouchableOpacity>
                    </View>
                    </View>

                    <View style={{ flexDirection: 'column', justifyContent: 'space-between', height: 60 }}>
                        <View style={{marginLeft:15}}>
                        <TouchableOpacity onPress={() => deleteItem(item)}>
                            <Ionicons name="close" size={24} color={theme.primary} />
                        </TouchableOpacity>
                        </View>

                        <View>
                        <Text
                            style={[styles.itemTitle,{
                                color: theme.text,
                                fontSize: 16 * fontScale,
                                alignSelf: 'flex-start', // Optional: align to left
                                bottom: -10
                            },]}>
                            {(item.price * item.count).toFixed(2)}
                        </Text>
                        </View>
                        
                    </View>
                </View>
                /*
            <View key={item.id} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                
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

                
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                <Ionicons name="close" size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>*/
            ))}
        </ScrollView>

        {/* Bottom bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
            <Text style={[styles.total, { color: theme.text, fontSize: 16 * fontScale }]}>
            Spolu: {totalPrice} €
            </Text>
            <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/screens/delivery')}
            //   onPress={() => router.push('/screens/favourites')} //just for now, to be changed later
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
