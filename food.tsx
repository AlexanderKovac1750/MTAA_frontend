
export type Food = {
    id: string;
    title: string;
    category: string;
    isSpecial: boolean;
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
    pic: string;
};

let favourites: Food[] = [];

const addFav = (newFood: Food): void => {
  if (!favourites.includes(newFood)) {
    favourites.push(newFood);
  }
};

const removeFav = (remFood: Food): void => {
  favourites = favourites.filter(food => food !== remFood);
};

export const getFavs = (): Food[] => {
  return [...favourites]; // return a copy to avoid external mutation
};

export const isFav = (food: Food): boolean => {
  return favourites.some(fav_food => fav_food.id === food.id);;
  
};

export const setFavs = (favs: Food[]) => {
  favourites=favs;
};

import { Alert } from 'react-native';
import { getBaseUrl, getToken, sleep } from './config';
export const removeFavourite = async(remFood: Food) => {
        try {
            const query = `?token=${getToken()}&dish_name=${remFood.title}`;
            const url = `http://${getBaseUrl()}/favourite${query}`;
            const response = await fetch(url, {
                method: 'DELETE',
            });
                
            const responseText = await response.text(); 
            const data: any = JSON.parse(responseText);
            
            if (!response.ok) {
                console.log('❌ Error response:', data.message);
                Alert.alert('failed to remove fav dish_name: ', data.message);
                if(response.status===404){
                    addFav(remFood);
                }
            }
            else{
                console.log('✅ favorite removal successful !!:', data.dishes);
                removeFav(remFood);
            }

        } catch (error) {
            console.error('🚨 favorite removal error:', error.message);
            Alert.alert('favorite removal Error', error.message);
        }
    }

export async function getFullFoodInfo(id: string) {
    try {
        const token = await getToken();
        // console.log('Id:', id);
        const query = `?token=${token}&dish_id=${id}`;
        const response = await fetch(
        `http://${getBaseUrl()}/dish_full_info${query}`
        );

        if (!response.ok) {
        throw new Error(`❌ Failed to fetch full dish info (id ${id})`);
        }

        const food = await response.json();
        console.log('✅ Full dish info:', food.id, food.title, food.category, food.isSpecial, food.description, food.image, food.discount_base, food.small_size, food.medium_size, food.large_size, food.small_price, food.medium_price, food.large_price, food.unit);
        return food;
    } catch (error) {
        console.error('🚨 Error fetching full dish info:', error);
        return null;
    }

}    

export const addFavourite = async(addFood: Food) => {
        try {
            const query = `?token=${getToken()}&dish_name=${addFood.title}`;
            const url = `http://${getBaseUrl()}/favourite${query}`;
            const response = await fetch(url, {
                method: 'POST',
            });
                
            const responseText = await response.text(); 
            const data: any = JSON.parse(responseText);
            
            if (!response.ok) {
                console.log('❌ Error response:', data.message);
                Alert.alert('failed to add fav dish_name: ', data.message);
                if(response.status===409){
                    addFav(addFood);
                }
            }
            else{
                console.log('✅ favorite add successful !!:', data.dishes);
                addFav(addFood);
            }

        } catch (error) {
            console.error('🚨 favorite add error:', error.message);
            Alert.alert('favorite add Error', error.message);
        }
    }

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const pullFavs = async () => {
        await sleep(500);
        try {
            const query = `?token=${getToken()}`;
            const url = `http://${getBaseUrl()}/favourite${query}`;
            const response = await fetch(url, {
                method: 'GET',
            });
                
            const responseText = await response.text(); 
            const data: any = JSON.parse(responseText);
            
            if (!response.ok) {
                console.log('❌ Error response:', data.message);
                Alert.alert('failed to load favourites: ', data.message);
            }
            else{
                console.log('✅ favourites load successful !!:', data.dishes);
        
                if (Array.isArray(data.dishes)) {
                setFavs(data.dishes as Food[]);
                } else {
                console.error('Invalid food data');
                }
            }

        } catch (error) {
            console.error('🚨 favourites load error:', error.message);
            Alert.alert('favourites load Error', error.message);
        }
        
};


export const resetFoodInfo = (): Food => {
  return {
    id: '',
    title: '',
    category: '',
    isSpecial: false,
    description: '',
    image: '',
    discount_base: 0,
    small_size: 0,
    medium_size: 0,
    large_size: 0,
    small_price: 0,
    medium_price: 0,
    large_price: 0,
    unit: '',
    pic: ''
  };
};