import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { decItem, getCartItems, incItem, order_item, OrderInfo, removeItem, setCurrentOrder, setItemQuantity,  } from '../cart';
import { getOfflineMode, selectFood, getUserType, getBaseUrl, getToken } from '../config';
import { getFavs, isFav } from '../food';

export default function ShoppingCartScreen() {
    const router = useRouter();
    const { theme, fontScale } = useThemeColors();

    // Sample cart data (to be replaced by backend)
    const MAX_QUANTITY = 15;
    const [cartItems, setCartItems] = useState<order_item[]>([]);
    const [reloading, setReloading] = useState(false);
    const navigation = useNavigation();
    const [isOffline, setIsOfline] = useState(false);

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

    useEffect(()=>{
        setIsOfline(getOfflineMode());
    })

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
        setCartItems(prev => prev.filter(item => item.name !== remItem.name  || remItem.size !== item.size));
        removeItem(remItem);
    };



    const totalPrice = cartItems
        .reduce((sum, item) => sum + item.price * item.count, 0)
        .toFixed(2);

    const totalItemCount = cartItems.reduce((sum, item) => sum + item.count, 0);

    const sizeToString = (size: string): string => {
        
        if(size==='small'){
            return 'malé';
        }
        if(size==='medium'){
            return 'stredné';
        }
        if(size==='large'){
            return 'veľké';
        }
        return 'neplatné'
    }

    const handleOrderSubmit = async () => {
    try {
        const token = getToken();
        if (!token) {
            Alert.alert('Error', 'no token');
            return;
        }    

        // Prepare order items
        const orderItems = cartItems.map(item => ({
            name: item.meal.title,
            size: item.size,
            count: item.count
        }));

        // Create order payload
        const orderData = {
            body: {
                comment: "", // Add any user comment here
                items: orderItems
            }
        };

        const response = await fetch(`http://${getBaseUrl()}/order?token=${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
        });

        const responseData = await response.json();

        if (!response.ok) throw new Error(responseData.message || 'Order creation failed');

        const orderInfo: OrderInfo = {
            id: responseData.order_id,
            user: token,
            time: new Date().toISOString(),
            comment: '',
            price: parseFloat(responseData.total_price),
            discount_used: '',
            items_start: BigInt(responseData.items_start),
            items_end: BigInt(responseData.items_end),
            is_paid: false,
            discount_total: totalDiscount
            };

        setCurrentOrder(orderInfo);
        router.push('/screens/delivery');
        

        // Clear cart and handle success
        setCartItems([]);
        Alert.alert('Úspech', 'Objednávka bola vytvorená');
        router.push(`/order-confirmation/${responseData.order_id}`);

    } catch (error) {
        Alert.alert('Chyba', error.message || 'Neočakávaná chyba');
    }   
    };

        const calculatePrices = () => {
                let originalTotal = 0;
                let discountedTotal = 0;
                let totalDiscount = 0;

                const itemsWithDiscounts = cartItems.map(item => {
                    const originalPrice = item.price * item.count;
                    let discountedPrice = originalPrice;
                    let discount = 0;

                    if (getUserType() === 'registered' && isFav(item.meal)) {
                        discount = originalPrice * item.meal.discount_base;
                        discountedPrice = originalPrice - discount;
                        totalDiscount += discount;
                    }

                    originalTotal += originalPrice;
                    discountedTotal += discountedPrice;

                    return { ...item, originalPrice, discountedPrice, discount };
                });

                return { itemsWithDiscounts, originalTotal, discountedTotal, totalDiscount };
            };

            const { itemsWithDiscounts, originalTotal, discountedTotal, totalDiscount } = calculatePrices();


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
                <View key={`${item.name}+(${item.size}`} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                    <TouchableOpacity onPress={() => {selectFood(item.meal),router.push('/screens/item_desc')}}>
                    <Image source={{uri: item.meal.image}} style={styles.itemImage} resizeMode="cover" />
                    </TouchableOpacity>

                    <View style={styles.itemDetails}>
                    <Text style={[styles.itemTitle, { color: theme.text, fontSize: 16 * fontScale }]}>
                        {item.name} ({sizeToString(item.size)})
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
            ))}
        </ScrollView>

        {/* Bottom bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.surface }]}>
            <Text style={[styles.total, { color: theme.text, fontSize: 16 * fontScale }]}>
            Spolu: {totalPrice} €
            </Text>
            {!isOffline && <TouchableOpacity
            style={[styles.orderButton, { backgroundColor: theme.primary }]}
            onPress={async () => {
                await handleOrderSubmit();
                router.push('/screens/delivery');
            }}
            //   onPress={() => router.push('/screens/favourites')} //just for now, to be changed later
            >
            <Text style={[styles.orderText, { color: theme.text, fontSize: 16 * fontScale }]}>
                Objednať
            </Text>
            </TouchableOpacity>}
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
