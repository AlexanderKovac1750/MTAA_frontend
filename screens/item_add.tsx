import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useThemeColors } from '../resources/themes/themeProvider';
import { useRouter } from 'expo-router';
import { getBaseUrl, getToken } from '../config';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

export default function AddItemScreen() {
  const { theme } = useThemeColors();
  const router = useRouter();
  const token = getToken();

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
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSpecial, setIsSpecial] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to continue');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setImage(asset.uri);
      setImageBase64(asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
    }
  };

  const submitNewItem = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please provide a title for the item.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        token: token,
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
      };

      const url = `http://${getBaseUrl()}/add_dish`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (isSpecial) {
          await fetch(`http://${getBaseUrl()}/todays_special`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, special: title }),
          });
        }
        Alert.alert('Item Added', 'The new item has been created.');
        // router.push('../screens/main_menu');
        router.back()
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add item.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Connection Error', 'Could not connect to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Dish Title:</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={title}
            onChangeText={setTitle}
            placeholder="insert food title here"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        {/* Image */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Dish Image:</Text>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={
                image ? { uri: image } : require('../resources/images/sample-dish.png')
              }
              style={styles.image}
            />
          </TouchableOpacity>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Category:</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={category}
            onChangeText={setCategory}
            placeholder="insert food category here"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Description:</Text>
          <TextInput
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.border, minHeight: 100, textAlignVertical: 'top' },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="insert food description here"
            placeholderTextColor={theme.placeholder}
            multiline
          />
        </View>

        {/* Portions */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>Portion Sizes:</Text>
          <View style={styles.row}>
            {['Small', 'Medium', 'Large'].map((label, i) => {
              const portionState = [smallPortion, mediumPortion, largePortion];
              const priceState = [smallPrice, mediumPrice, largePrice];
              const setPortion = [setSmallPortion, setMediumPortion, setLargePortion];
              const setPrice = [setSmallPrice, setMediumPrice, setLargePrice];

              return (
                <View key={label} style={styles.sizeContainer}>
                  <Text style={[styles.subLabel, { color: theme.text }]}>{label}</Text>
                  <TextInput
                    style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                    value={portionState[i]}
                    onChangeText={setPortion[i]}
                    placeholder="Size"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                    value={priceState[i]}
                    onChangeText={setPrice[i]}
                    placeholder="Price"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="numeric"
                  />
                </View>
              );
            })}
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
                placeholder="insert portion unit (g/ml)"
                placeholderTextColor={theme.placeholder}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={[styles.label, { color: theme.text }]}>Discount Base:</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                value={discountBase}
                onChangeText={setDiscountBase}
                placeholder="discount %"
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
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Zrušiť</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#c79a55' }]}
          onPress={submitNewItem}
          disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pridať</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
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
//     triangleCorner: {
//     width: 0,
//     height: 0,
//     position: 'absolute',
//     backgroundColor: 'transparent',
//     borderStyle: 'solid',
//     borderTopWidth: 12,
//     borderBottomWidth: 12,
//     borderRightWidth: 18,
//     borderTopColor: 'transparent',
//     borderBottomColor: 'transparent',
//     borderRightColor: '#f4e4d4',
// },
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
