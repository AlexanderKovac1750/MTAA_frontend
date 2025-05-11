let baseUrl = '192.168.0.102:5000'; // Default
let token = ''; // Default
let fav_pulled = false;
let userType: string = 'registered';
let offlineMode: boolean = true;

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


export const setUserType = (newUserType: string) => {
  userType = newUserType;
};

export const getUserType = () => userType;

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function extractFloat(input: string): number {
  const match = input.match(/[\d.]+/g); // Match digits and dots
  if (!match) return 0;

  // Join matched parts and parse as float
  const floatStr = match.join('');
  const parsed = parseFloat(floatStr);

  return isNaN(parsed) ? 0 : parsed;
}

export const setOfflineMode = (isOffline: boolean) => {
  offlineMode = isOffline;
};

export const getOfflineMode = () => offlineMode;

export function extractNumberFromMoneyString(moneyString: string): number {
  const numberString = moneyString.replace(/[^\d.-]/g, '');
  const extractedNumber = parseFloat(numberString);
  if (isNaN(extractedNumber)) {
    return 0;
  }
  return extractedNumber;
}