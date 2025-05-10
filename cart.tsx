import { Food } from "./food";

export type order_item = {
    name: string;
    size: string;
    price: GLfloat;
    count: number;
    meal: Food;
}

let cart: order_item[] = [];

export const addItem = (new_item: order_item) => {
    cart.push(new_item);
  }

export const incItem = (item: order_item) => {
    const found_item = cart.find(cart_item=> cart_item.name === item.name);
    if (found_item) {
        found_item.count += 1;
    }
}

export const decItem = (item: order_item) => {
    const found_item = cart.find(cart_item=> cart_item.name === item.name);
    if (found_item && found_item.count > 1) {
        found_item.count -= 1;
    }
}

export const removeItem = (remItem: order_item) => {
    cart = cart.filter(cart_item => cart_item.name !== remItem.name);
}

  // Add or merge person by name
export const addOrMergeItem = (item: order_item) => {
    const existing = cart.find(cart_item=> cart_item.name === item.name);
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
