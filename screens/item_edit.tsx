import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Switch,
  ActivityIndicator,
  KeyboardTypeOptions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import {
  getSelectedFood,
  resetSelectedFood,
  getBaseUrl,
  getToken,
} from '../config';
import { getFullFoodInfo } from '../food';

const { width } = Dimensions.get('window');

export default function ItemEditScreen() {
  const { theme, fontScale } = useThemeColors();
  const router = useRouter();
  const token = getToken();

  const [food, setMeal] = useState<{ id: number; [key: string]: any } | null>(
    null
  );
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSpecial, setIsSpecial] = useState(false);
  const [loading, setLoading] = useState(true);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [portionUnit, setPortionUnit] = useState('');
  const [smallPortion, setSmallPortion] = useState('');
  const [mediumPortion, setMediumPortion] = useState('');
  const [largePortion, setLargePortion] = useState('');
  const [smallPrice, setSmallPrice] = useState('');
  const [mediumPrice, setMediumPrice] = useState('');
  const [largePrice, setLargePrice] = useState('');
  const [discountBase, setDiscountBase] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      const selected = getSelectedFood();
      if (!selected || !selected.id) {
        Alert.alert('Error', 'No item selected.');
        return;
      }

      try {
        const food = await getFullFoodInfo(selected.id);

        if (food) {
          setMeal(food);
          setTitle(food.title || '');
          setDescription(food.description || '');
          setCategory(food.category || '');
          setPortionUnit(food.portion_unit || '');
          setSmallPortion(food.small_portion?.toString() ?? '');
          setMediumPortion(food.medium_portion?.toString() ?? '');
          setLargePortion(food.large_portion?.toString() ?? '');
          setSmallPrice(food.small_price?.toString() ?? '');
          setMediumPrice(food.medium_price?.toString() ?? '');
          setLargePrice(food.large_price?.toString() ?? '');
          setDiscountBase(food.discount_base?.toString() ?? '');
          setIsSpecial(food.isSpecial || false);
          setImage(food.pic || null);
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Failed to fetch item data');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
    }
  };

  const saveChanges = async () => {
    if (!food || !food.id) {
      Alert.alert('Error', 'Meal data is missing.');
      return;
    }

    try {
        const url = `http://${getBaseUrl()}/edit_dish`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            token: token,
            id: food.id,
            title: title,
            description: description,
            category: category,
            portion_unit: portionUnit,
            small_portion: smallPortion !== '' ? parseInt(smallPortion) : null,
            medium_portion: mediumPortion !== '' ? parseInt(mediumPortion) : null,
            large_portion: largePortion !== '' ? parseInt(largePortion) : null,
            small_price: smallPrice !== '' ? parseFloat(smallPrice) : null,
            medium_price: mediumPrice !== '' ? parseFloat(mediumPrice) : null,
            large_price: largePrice !== '' ? parseFloat(largePrice) : null,
            discount_base: discountBase !== '' ? parseFloat(discountBase) : null,
            image_base64: imageBase64,
            }),
        });


      if (isSpecial) {
        const specialUrl = `http://${getBaseUrl()}/todays_special`;
        await fetch(specialUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token, special: title }),
        });
      }

      Alert.alert('Changes saved');
      router.push('../screens/main_menu');
    } catch (e) {
      console.error(e);
      Alert.alert('Error saving changes');
    }
  };

  const deleteItem = async () => {
    if (!food || !food.id) {
      Alert.alert('Error', 'Meal data is missing.');
      return;
    }

    Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const url = `http://${getBaseUrl()}/delete_dish`;
            await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token, id: food.id }),
            });
            Alert.alert('Item deleted');
            resetSelectedFood();
            router.push('../screens/main_menu');
          } catch (e) {
            console.error(e);
            Alert.alert('Error deleting item');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#c79a55" />
      </View>
    );
  }

      return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Triangle in top-left corner */}
      <View style={styles.triangleCorner} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Dish Title:</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter dish title"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        {/* Image Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Dish Image:</Text>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                typeof image === 'string' ? { uri: image } : 
                image || require('../resources/images/sample-dish.png')
              }
              style={styles.image}
            />
          </TouchableOpacity>
        </View>

        {/* Category Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Category:</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={category}
            onChangeText={setCategory}
            placeholder="Enter category"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Description:</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.text, 
              borderColor: theme.border,
              minHeight: 100,
              textAlignVertical: 'top'
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor={theme.placeholder}
            multiline
          />
        </View>

        {/* Portion Sizes & Prices */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Portion Sizes:</Text>
          <View style={styles.row}>
            {/* Small */}
            <View style={styles.sizeContainer}>
              <Text style={[styles.subLabel, { color: theme.text }]}>Small</Text>
              <TextInput
                style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                value={smallPortion}
                onChangeText={setSmallPortion}
                placeholder="Size"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                value={smallPrice}
                onChangeText={setSmallPrice}
                placeholder="Price"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>

            {/* Medium */}
            <View style={styles.sizeContainer}>
              <Text style={[styles.subLabel, { color: theme.text }]}>Medium</Text>
              <TextInput
                style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                value={mediumPortion}
                onChangeText={setMediumPortion}
                placeholder="Size"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                value={mediumPrice}
                onChangeText={setMediumPrice}
                placeholder="Price"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>

            {/* Large */}
            <View style={styles.sizeContainer}>
              <Text style={[styles.subLabel, { color: theme.text }]}>Large</Text>
              <TextInput
                style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                value={largePortion}
                onChangeText={setLargePortion}
                placeholder="Size"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                value={largePrice}
                onChangeText={setLargePrice}
                placeholder="Price"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Unit & Discount */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: theme.text }]}>Portion Unit:</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                value={portionUnit}
                onChangeText={setPortionUnit}
                placeholder="Unit (g/ml)"
                placeholderTextColor={theme.placeholder}
              />
            </View>
            
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: theme.text }]}>Discount Base:</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                value={discountBase}
                onChangeText={setDiscountBase}
                placeholder="Discount %"
                placeholderTextColor={theme.placeholder}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Special Toggle */}
        <View style={[styles.section, styles.switchRow]}>
          <Text style={[styles.label, { color: theme.text }]}>Today's Special:</Text>
          <Switch
            value={isSpecial}
            onValueChange={setIsSpecial}
            trackColor={{ false: theme.border, true: '#c79a55' }}
            thumbColor={isSpecial ? '#fff' : '#ccc'}
          />
        </View>
      </ScrollView>

        <View style={styles.bottomBar}>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: '#888' }]}
            onPress={() => router.push('../screens/main_menu')}
            >
            <Text style={styles.buttonText}>Zrušiť</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: '#c0392b' }]}
            // onPress={deleteItem}
            >
            <Text style={styles.buttonText}>Zmazať</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[styles.button, { backgroundColor: '#c79a55' }]}
            onPress={saveChanges}
            disabled={!food}
            >
            <Text style={styles.buttonText}>Uložiť</Text>
            </TouchableOpacity>
        </View>
        </View>
  );
}

const styles = StyleSheet.create({
  // Keep existing styles and add:
  section: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sizeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  smallInput: {
    width: '100%',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4,
  },
//   triangleCorner: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     zIndex: 1,

//   },
  scrollContent: {
    padding: 20,
    paddingTop: 60, // Make space for triangle
    paddingBottom: 120,
  },
//   image: {
//     width: '100%',
//     height: 200,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
    container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
},
    triangleCorner: {
    width: 0,
    height: 0,
    position: 'absolute',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderRightWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#f4e4d4',
},
    image: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
},
    switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
},
    bottomBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 20,
    backgroundColor: '#3a2e25',
},
    button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
},
    buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
},
});