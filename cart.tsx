import { Food } from "./food";

export type order_item = {
    name: string;
    size: string;
    price: GLfloat;
    count: number;
    meal: Food;
}

let cart: order_item[] = [];
let order_id: string|null = null;
let price: GLfloat = 0.0;

export const addItem = (new_item: order_item) => {
    cart.push(new_item);
  }

export const incItem = (item: order_item) => {
    const found_item = cart.find(cart_item=> cart_item.name === item.name && cart_item.size === item.size);
    if (found_item) {
        found_item.count += 1;
    }
}

export const decItem = (item: order_item) => {
    const found_item = cart.find(cart_item=> cart_item.name === item.name && cart_item.size === item.size);
    if (found_item && found_item.count > 1) {
        found_item.count -= 1;
    }
}

export const removeItem = (remItem: order_item) => {
    cart = cart.filter(cart_item => cart_item.name !== remItem.name || cart_item.size !== remItem.size);
}

  // Add or merge person by name
export const addOrMergeItem = (item: order_item) => {
    const existing = cart.find(cart_item=> cart_item.name === item.name && cart_item.size === item.size);
    if (existing) {
        existing.count += item.count;
    } else {
        addItem(item);
    }
}

export const setItemQuantity = (item: order_item, quantity: number) => {
    const existing = cart.find(cart_item=> cart_item.name === item.name);
    if (existing) {
        existing.count = quantity;
    }
}

export const getCartItems =(): order_item[] => {
    return cart;
}

export const getTotalCount = (): number => {
    return cart.reduce((sum, item) => sum + item.count, 0);
} 

let currentOrder: OrderInfo | null = null;

export const setCurrentOrder = (order: OrderInfo) => {
  currentOrder = order;
};

export const getCurrentOrder = (): OrderInfo | null => {
  return currentOrder;
};

export const clearCurrentOrder = () => {
  currentOrder = null;
};

// Update existing clear function to include order info
export const clearAllOrderInfo = () => {
  cart = [];
  order_id = null;
  price = 0.0;
  clearCurrentOrder();
};

// Add to your existing Order type definition
export type OrderInfo = {
    id: string;
    user: string;
    time: string;
    comment: string;
    price: GLfloat;
    discount_used: string;
    items_start: any;
    items_end: any;
    is_paid: boolean;
    discount_total: GLfloat;
};

export const setOrder_id = (newOrder_id: string) => {
  order_id = newOrder_id;
};

export const getOrder_id = () => order_id;

export const setOrder_price = (newPrice: GLfloat) => {
  price = newPrice;
};

export const getOrder_price = () => price;

