
export enum MealType {
  BREAKFAST = '早餐',
  LUNCH = '午餐',
  DINNER = '晚餐',
  SNACK = '加餐'
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface OrderRecord {
  id: string;
  dishName: string;
  storeName: string;
  date: string;
  price: number;
  nutrition: Nutrition;
  mealType: MealType;
  imageUrl?: string;
}

export interface Dish {
  id: string;
  storeName: string;
  name: string;
  price: number;
  deliveryTimeMinutes: number;
  category: string;
  nutrition: Nutrition;
}

export enum Page {
  DASHBOARD = 'DASHBOARD',
  SCAN_MENU = 'SCAN_MENU',
  DISH_CATALOG = 'DISH_CATALOG',
  HISTORY = 'HISTORY',
  NUTRITION = 'NUTRITION',
  ANALYZE_FOOD = 'ANALYZE_FOOD',
  ROULETTE = 'ROULETTE' // 新增：幸运大转盘页面
}
