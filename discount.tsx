import { Alert } from "react-native";
import { getBaseUrl, getToken, sleep } from "./config";

export type Discount = {
    id: string;
    effectivness: GLfloat;
    cost: number;
}

let avaiable_discounts : Discount[]=[];
let chosen_discount : Discount|null=null;
let discount_points : number;

export const setAvaiableDiscounts = (new_avaiable_discounts: Discount[]) => {
  avaiable_discounts = new_avaiable_discounts;
};

export const getAvaiableDiscounts = ():Discount[]  => avaiable_discounts;


export const chooseDiscount = (new_chosen_discount: Discount|null) => {
  chosen_discount = new_chosen_discount;
};

export const getChosenDiscount = ():Discount|null  => { return chosen_discount};


export const addDP = (delta: number) => {
  discount_points = discount_points + delta;
};

export const fetchDiscounts = async() => {
  sleep(500);
  try {
            const query = `?token=${getToken()}`;
            const url = `http://${getBaseUrl()}/discounts${query}`;
            const response = await fetch(url, {
                method: 'GET',
            });
                
            const responseText = await response.text(); 
            const data: any = JSON.parse(responseText);
            
            if (!response.ok) {
                console.log('❌ Error response:', data.message);
                Alert.alert('failed fetch discounts: ', data.message);
            }
            else{
                console.log('✅ discounts fetched !!:', data.discounts);
                if (Array.isArray(data.discounts)) {
                  avaiable_discounts=data.discounts;
                }
            }

        } catch (error) {
            console.error('🚨 discount fetch error:', error.message);
            Alert.alert('discount fetch Error', error.message);
        }
}