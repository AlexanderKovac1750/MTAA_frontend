
export type Food = {
    id: string;
    title: string;
    description: string;
    image: string;
    discount_base: GLfloat;
    small_size: number;
    medium_size: number;
    large_size: number;
    small_price: GLfloat;
    medium_price: GLfloat;
    large_price: GLfloat;
    unit: string;
};


import { Alert } from 'react-native';
import { getBaseUrl, getToken } from './config';
export const removeFavourite = async(dish_name: string) => {
        try {
            const query = `?token=${getToken()}&dish_name=${dish_name}`;
            const url = `http://${getBaseUrl()}/favourite${query}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
                
            const responseText = await response.text(); 
            const data: any = JSON.parse(responseText);
            
            if (!response.ok) {
                console.log('❌ Error response:', data.message);
                Alert.alert('failed to remove dish_name: ', data.message);
            }
            else{
                console.log('✅ favorite removal successful !!:', data.dishes);
            }

        } catch (error) {
            console.error('🚨 favorite removal error:', error.message);
            Alert.alert('favorite removal Error', error.message);
        }
    }