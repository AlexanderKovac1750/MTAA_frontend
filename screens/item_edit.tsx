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
            token,
            id: food.id,
            title,
            description,
            category,
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
          body: JSON.stringify({ token, special: title }),
        });
      }

      Alert.alert('Changes saved');
      router.push('./screens/main_menu');
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
              body: JSON.stringify({ token, id: food.id }),
            });
            Alert.alert('Item deleted');
            resetSelectedFood();
            router.push('./screens/main_menu');
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
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              typeof image === 'string'
                ? { uri: image }
                : image || require('../resources/images/sample-dish.png')
            }
            style={styles.image}
          />
        </TouchableOpacity>

        {[{ val: title, set: setTitle, placeholder: 'Title' },
          { val: description, set: setDescription, placeholder: title, multiline: true },
          { val: category, set: setCategory, placeholder: category },
          { val: portionUnit, set: setPortionUnit, placeholder: portionUnit },
          { val: smallPortion, set: setSmallPortion, placeholder: smallPortion, type: 'numeric' as KeyboardTypeOptions },
          { val: mediumPortion, set: setMediumPortion, placeholder: mediumPortion, type: 'numeric' as KeyboardTypeOptions },
          { val: largePortion, set: setLargePortion, placeholder: largePortion, type: 'numeric' as KeyboardTypeOptions },
          { val: smallPrice, set: setSmallPrice, placeholder: smallPrice, type: 'numeric' as KeyboardTypeOptions },
          { val: mediumPrice, set: setMediumPrice, placeholder: mediumPrice, type: 'numeric' as KeyboardTypeOptions },
          { val: largePrice, set: setLargePrice, placeholder: largePrice, type: 'numeric' as KeyboardTypeOptions },
          { val: discountBase, set: setDiscountBase, placeholder: discountBase, type: 'numeric' as KeyboardTypeOptions }]
          .map(({ val, set, placeholder, type, multiline }, idx) => (
            <TextInput
              key={idx}
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              value={val}
              onChangeText={set}
              placeholder={placeholder}
              placeholderTextColor={theme.secondary}
              keyboardType={type}
              multiline={multiline}
            />
          ))}

        <View style={styles.switchRow}>
          <Text style={{ color: theme.text }}>Is Special</Text>
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
          onPress={() => router.push('./screens/main_menu')}
        >
          <Text style={styles.buttonText}>Zrušiť</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#c0392b' }]}
          onPress={deleteItem}
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
  container: {
    flex: 1,
    paddingTop: 60,
    alignItems: 'center',
  },
  triangleCorner: {
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
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  image: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#000',
    borderColor: '#ccc',
    fontSize: 14,
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
