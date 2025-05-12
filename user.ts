export type UserAccountInfo = {
  name: string;
  discount_points: number;
  loyalty_points: number;
  level: number;
  favourite_capacity: number;
  favourite_free: number;
  language: string;
  darkmode: boolean;
  high_contrast: boolean;
};

export namespace UserAccountInfo {
  export function getPoints(user: UserAccountInfo) {
    return {
      discount_points: user.discount_points,
      loyalty_points: user.loyalty_points
    };
  }
}

let leveled_up: boolean = false;
export const setLeveled_up = (hasLVLUP: boolean)=>{
  leveled_up=hasLVLUP;
}
export const getLeveled_up = () => {return leveled_up;}