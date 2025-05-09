import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import { FontAwesome } from '@expo/vector-icons';
import { resetSelectedFood, getSelectedFood, selectFood } from '../config';
import { Food} from '../food';

const { width } = Dimensions.get('window');

export default function FoodDescriptionScreen() {
  const { theme, fontScale } = useThemeColors();
  const router = useRouter();

  // States
  const [cartCount, setCartCount] = useState(3);// fetched from backend
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('stredné');
  const [meal, setMeal] = useState<Food|null>(null)
  const [portion, setPortion] = useState(null);

  // Replace with actual API call
  useEffect(() => { 
    setMeal(getSelectedFood());
    // Simulate fetch
    setCartCount(3); // Example: 3 items in cart
  }, []);

/*
  const dish = {
    name: 'Zemiaky na šľahačke',
    description: 'Zemiaky, šľahačka, párky, zelenina. Tradičné jedlo z regiónu...',
    imageUrl: 'https://icons.iconarchive.com/icons/paomedia/small-n-flat/128/beer-icon.png',
    sizes: [
      { label: 'malé', weight: '120g', price: '2.57€' },
      { label: 'stredné', weight: '240g', price: '4.21€' },
      { label: 'veľké', weight: '500g', price: '6.35€' },
    ],
  };*/

  const getPortionBoxElement = (name: string, portion_size: number|null, portion_price: GLfloat|null, unit: string) => {
    if(portion_size===null || portion_price===null){
      return null;
    }
    else{
      return (<TouchableOpacity
                  onPress={() => setSelectedSize(name)}
                  style={[
                  styles.sizeOption,
                  {
                    borderColor: (selectedSize===name) ? '#c79a55' : theme.border,
                    backgroundColor: (selectedSize===name) ? '#c79a5520' : 'transparent',
                  },
                ]}>
                <View style={styles.checkboxOuter}>
                  {(selectedSize===name) && <View style={styles.checkboxInner} />}
                </View>
                <Text style={[styles.sizeText, { color: theme.text }]}>
                  {name} – {portion_size} {unit} – {portion_price}
                </Text>
            </TouchableOpacity>)
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Triangle Arrow + Cart */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backTriangle} onPress={() => router.back()} />
        <View style={styles.cartContainer}>
          <TouchableOpacity onPress={() => router.push('./shopping_cart')}>
            <FontAwesome name="shopping-cart" size={24 * fontScale} color={theme.text} />
          </TouchableOpacity>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={{ color: 'white', fontSize: 10 }}>{cartCount}</Text>
            </View>
          )}
        </View>
      </View>

      {meal && (<ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title + Star ABOVE the image */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text, fontSize: 20 * fontScale }]}>
            {meal.title}
          </Text>
          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            style={styles.starWrapper}
          >
            <FontAwesome
              name={isFavorite ? 'star' : 'star-o'}
              size={28}
              color={isFavorite ? '#c79a55' : theme.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Dish Image */}
        <Image source={{ uri: meal.image }} style={styles.image} />

        {/* Description */}
        <Text style={[styles.description, { color: theme.text, fontSize: 14 * fontScale }]}>
          {meal.description}
        </Text>

        {/* Size Options */}
        <View style={styles.sizesContainer}>
          
            {/*{meal.small_portion && (<TouchableOpacity
                  onPress={() => setSelectedSize(meal.small_portion!.name)}
                  style={[
                  styles.sizeOption,
                  {
                    borderColor: (selectedSize===meal.small_portion!.name) ? '#c79a55' : theme.border,
                    backgroundColor: (selectedSize===meal.small_portion!.name) ? '#c79a5520' : 'transparent',
                  },
                ]}>
                <View style={styles.checkboxOuter}>
                  {(selectedSize===meal.small_portion!.name) && <View style={styles.checkboxInner} />}
                </View>
                <Text style={[styles.sizeText, { color: theme.text }]}>
                  male – {size.weight} – {size.price}
                </Text>
            </TouchableOpacity>)};
            {meal.medium_portion && (<TouchableOpacity
                  onPress={() => setSelectedSize(meal.medium_portion!.name)}style={[
                  styles.sizeOption,
                  {
                    borderColor: (selectedSize===meal.medium_portion!.name) ? '#c79a55' : theme.border,
                    backgroundColor: (selectedSize===meal.medium_portion!.name) ? '#c79a5520' : 'transparent',
                  },
                ]}>
                <View style={styles.checkboxOuter}>
                  {(selectedSize===meal.medium_portion!.name) && <View style={styles.checkboxInner} />}
                </View>
                <Text style={[styles.sizeText, { color: theme.text }]}>
                  stredne – {size.weight} – {size.price}
                </Text>
            </TouchableOpacity>)};
            {meal.large_portion && (<TouchableOpacity
                  onPress={() => setSelectedSize(meal.large_portion!.name)}style={[
                  styles.sizeOption,
                  {
                    borderColor: (selectedSize===meal.large_portion!.name) ? '#c79a55' : theme.border,
                    backgroundColor: (selectedSize===meal.large_portion!.name) ? '#c79a5520' : 'transparent',
                  },
                ]}>
                <View style={styles.checkboxOuter}>
                  {(selectedSize===meal.large_portion!.name) && <View style={styles.checkboxInner} />}
                </View>
                <Text style={[styles.sizeText, { color: theme.text }]}>
                  velke – {size.weight} – {size.price}
                </Text>
            </TouchableOpacity>)};*/}

            {getPortionBoxElement('male', meal.small_size, meal.small_price, meal.unit)}
            {getPortionBoxElement('stredne', meal.medium_size, meal.medium_price, meal.unit)}
            {getPortionBoxElement('velke', meal.large_size, meal.large_price, meal.unit)}
          
          {/*meal.sizes.map((size, idx) => {
            const isSelected = selectedSize === size.label;
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedSize(size.label)}
                style={[
                  styles.sizeOption,
                  {
                    borderColor: isSelected ? '#c79a55' : theme.border,
                    backgroundColor: isSelected ? '#c79a5520' : 'transparent',
                  },
                ]}
              >
                <View style={styles.checkboxOuter}>
                  {isSelected && <View style={styles.checkboxInner} />}
                </View>
                <Text style={[styles.sizeText, { color: theme.text }]}>
                  {size.label} – {size.weight} – {size.price}
                </Text>
              </TouchableOpacity>
            );
          })*/}
        </View>
      </ScrollView>)}

      {/* Sticky Bottom Bar */}
      {meal && (<View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))}>
            <Text style={styles.quantityButton}>−</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => setQuantity(q => q + 1)}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('./delivery')}>
          <Text style={styles.addButtonText}>Pridať do košíka</Text>
        </TouchableOpacity>
      </View>)}
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingHorizontal: 20,
      alignItems: 'center',
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
        marginLeft: 10,
      },
    cartContainer: {
      position: 'relative',
    },
    cartBadge: {
      position: 'absolute',
      top: -6,
      right: -10,
      backgroundColor: '#a47551',
      borderRadius: 10,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 120,
    },
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    title: {
      fontWeight: '600',
      flex: 1,
    },
    starWrapper: {
      marginLeft: 10,
    },
    image: {
      width: width - 40,
      height: 200,
      borderRadius: 12,
      marginBottom: 15,
    },
    description: {
      textAlign: 'center',
      marginBottom: 20,
    },
    sizesContainer: {
      marginBottom: 20,
    },
    sizeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 6,
      padding: 10,
      borderWidth: 1,
      borderRadius: 8,
    },
    checkboxOuter: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#c79a55',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },
    checkboxInner: {
      width: 12,
      height: 12,
      backgroundColor: '#c79a55',
    },
    sizeText: {
      fontSize: 14,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
      alignItems: 'center',
      backgroundColor: '#3a2e25',
      borderTopWidth: 1,
      borderColor: '#2a1e18',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      fontSize: 26,
      color: '#ffffff',
      marginHorizontal: 10,
    },
    quantityText: {
      fontSize: 18,
      color: '#ffffff',
    },
    addButton: {
      backgroundColor: '#c79a55',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });
  