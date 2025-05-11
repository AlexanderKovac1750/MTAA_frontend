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
import { useRouter } from 'expo-router';
import { useThemeColors } from '../resources/themes/themeProvider';
import {
  getSelectedFood,
  resetSelectedFood,
  getBaseUrl,
  getToken,
  extractFloat,
} from '../config';
import * as ImagePicker from 'expo-image-picker';
import { getFullFoodInfo, resetFoodInfo } from '../food';

const { width } = Dimensions.get('window');

export default function ItemEditScreen() {
    const { theme, fontScale } = useThemeColors();
    const router = useRouter();
    const token = getToken();

    let [food, setMeal] = useState<{ id: number; [key: string]: any } | null>(
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

    const [originalImageBase64, setOriginalImageBase64] = useState<string | null>(null);

useEffect(() => {
  const fetchItem = async () => {
    const selected = getSelectedFood();
    if (!selected || !selected.id) {
      Alert.alert('Error', 'No item selected.');
      return;
    }

    try {
      // Clear cached/global info before fetching new
      resetFoodInfo();

      const fullFoodInfo = await getFullFoodInfo(selected.id);

        if (fullFoodInfo) {
            const base64Pic = fullFoodInfo.pic ? `data:image/png;base64,${fullFoodInfo.pic}` : null;

            setMeal(fullFoodInfo);
            setImage(base64Pic);
            setOriginalImageBase64(fullFoodInfo.pic || null);
            setOriginalImageBase64(fullFoodInfo.pic || null);
            setTitle(fullFoodInfo.title || '');
            setDescription(fullFoodInfo.description || '');
            setCategory(fullFoodInfo.category || '');
            setPortionUnit(fullFoodInfo.portion_unit || '');
            setSmallPortion(fullFoodInfo.small_portion?.toString() ?? '');
            setMediumPortion(fullFoodInfo.medium_portion?.toString() ?? '');
            setLargePortion(fullFoodInfo.large_portion?.toString() ?? '');
            setSmallPrice(fullFoodInfo.small_price?.extractFloat ?? '');
            setMediumPrice(fullFoodInfo.medium_price?.extractFloat ?? '');
            setLargePrice(fullFoodInfo.large_price?.extractFloat ?? '');
            setDiscountBase(fullFoodInfo.discount_base?.toString() ?? '');
            setIsSpecial(fullFoodInfo.isSpecial || false);
            setImage(fullFoodInfo.pic || null);
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Failed to fetch item data');
      } finally {
        setLoading(false);
      }

      setImage(selected.image)
    };

    fetchItem();
  }, []);

        const pickImage = async () => {
        // Request permissions first (important on Android)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'We need access to your photos to continue');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images', // Corrected string
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            const base64 = result.assets[0].base64;
            setImage(result.assets[0].uri);
            setImageBase64(base64 ? `data:image/jpeg;base64,${base64}` : null);
        }
        };

        // const pickImage = async () => {
        //     const result = await ImagePicker.launchImageLibraryAsync({
        //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //         allowsEditing: true,
        //         quality: 0.8,
        //         base64: true,
        //     });

        //     // console.log('Picker result:', result); // Debug log

        //     if (!result.canceled && result.assets?.[0]) {
        //         const asset = result.assets[0];
        //         if (asset.base64) {
        //         setImage(asset.uri);
        //         setImageBase64(`data:image/jpeg;base64,${asset.base64}`);
        //         } else {
        //         // Handle case where base64 isn't available
        //         setImage(asset.uri);
        //         setImageBase64(null);
        //         }
        //     }
        //     };

  const saveChanges = async () => {
    if (!food || !food.id) {
      Alert.alert('Error', 'Meal data is missing.');
      return;
    }

    // const selfod=getSelectedFood();
    try {
        const payload = {
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
            image_base64: imageBase64 || originalImageBase64,
        };

        const url = `http://${getBaseUrl()}/edit_dish`;
        const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        });


      if (isSpecial) {
        const specialUrl = `http://${getBaseUrl()}/todays_special`;
        await fetch(specialUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token, special: title }),
        });
      }
        if (response.ok) {
            const updated = await response.json();
            if (updated.dish?.pic) {
                setImage(`data:image/jpeg;base64,${updated.dish.pic}`);
            }
            Alert.alert('Changes saved');
            router.back();
            } else {
            const error = await response.json();
            Alert.alert('Error', error.message || 'Failed to save changes');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to connect to server');
        }

        // Handle special separately
        if (isSpecial) {
            try {
            const specialUrl = `http://${getBaseUrl()}/todays_special`;
            await fetch(specialUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, special: title }),
            });
            } catch (e) {
            console.error('Special update failed:', e);
            }
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
      {/* Triangle in top-left corner
      <View style={styles.triangleCorner} /> */}

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
                image?.startsWith('data:image') ? { uri: image } : 
                image ? { uri: image } : 
                require('../resources/images/sample-dish.png')
            }
            style={styles.image}
            onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
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