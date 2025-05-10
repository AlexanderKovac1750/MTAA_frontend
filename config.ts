let baseUrl = '192.168.0.102:5000'; // Default
let token = ''; // Default
let fav_pulled = false;

export const setBaseUrl = (url: string) => {
  baseUrl = url;
};

export const getBaseUrl = () => baseUrl;


export const setToken = (new_token: string) => {
  token = new_token;
};

export const getToken = () => token;


export const checkFavePulled = (): boolean => {
  const was_pulled=fav_pulled;
  fav_pulled=true;
  return was_pulled;
};


import {Food} from './food'
let selectedFood: Food|null=null;
export const selectFood = (new_SF: Food) => {
  selectedFood = new_SF;
};
export const resetSelectedFood = () =>{
  selectedFood=null;
}
export const getSelectedFood = () => selectedFood;
