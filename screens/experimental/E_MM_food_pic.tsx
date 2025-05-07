// app/login.tsx or app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Button } from 'react-native';
import { useRouter } from 'expo-router'; 
import { useState } from 'react';
import { getBaseUrl, setBaseUrl } from '../../config';
import React from 'react';

export default function E_FoodPicScreen() {
  const router = useRouter();
    const [food_name, setFood_name] = useState('vodka');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState(getBaseUrl());
  
    const GetFoodPic = async () => {
      try {
        setLoading(true);
    
        const query = `/picture?dish=${food_name}`;
        const url = `http://${address}/dish${query}`;
        const response = await fetch(url);
        const blob = await response.blob();
    
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setImageUri(base64data); // base64data includes the data URI prefix
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load image.');
      } finally {
        setLoading(false);
      }
    };

  return (

    <View style={styles.container}>
        <Text style={styles.title}>EEE Food pic</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>◀</Text>
        </TouchableOpacity>
    
        <TextInput
            style={styles.input}
            placeholder="Type your message here..."
            value={food_name}
            onChangeText={setFood_name}
        />
        <Text>Choose food you want image of</Text>
        <Text>f.e. vodka, zemiaky</Text>
    
        <TouchableOpacity style={styles.button} onPress={GetFoodPic}>
            <Text style={styles.buttonText}>get image</Text>
        </TouchableOpacity>

        <Button title={loading ? 'Loading...' : 'Get Picture'} onPress={GetFoodPic} disabled={loading} />

        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
    </View>
  );
}

// styles ... your same StyleSheet


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3c2e23', alignItems: 'center', paddingTop: 100 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  backButtonText: { fontSize: 24, color: '#fff' },
  title: { fontSize: 24, color: '#fff', marginBottom: 20 },
  logoPlaceholder: { marginVertical: 20 },
  logoText: { fontSize: 48 },
  input: { backgroundColor: '#8b6f47', color: '#fff', width: 250, padding: 10, marginVertical: 10, borderRadius: 8 },
  button: { backgroundColor: '#8b6f47', paddingVertical: 10, paddingHorizontal: 40, borderRadius: 8, marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18 },
  image: {
    marginTop: 24,
    width: '100%',
    height: 250,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
});
