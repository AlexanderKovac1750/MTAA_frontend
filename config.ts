let baseUrl = '192.168.0.102:5000'; // Default
let token = ''; // Default

export const setBaseUrl = (url: string) => {
  baseUrl = url;
};

export const getBaseUrl = () => baseUrl;


export const setToken = (new_token: string) => {
  token = new_token;
};

export const getToken = () => token;