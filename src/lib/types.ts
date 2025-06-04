
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  imageHint: string; 
  featured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserData {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1-5
  text: string;
  date: string; // ISO date string
}
