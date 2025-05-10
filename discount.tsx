
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

