let baseUrl = '192.168.0.102:5000'; // Default

export const setBaseUrl = (url: string) => {
  baseUrl = url;
};

export const getBaseUrl = () => baseUrl;