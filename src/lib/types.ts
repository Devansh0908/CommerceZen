
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

// New Types for Order History
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  priceAtPurchase: number; // Price of the item when the order was placed
}

export type OrderStatus = "Processing" | "Shipped" | "Out for Delivery" | "Delivered";

export interface Order {
  id: string; // Unique order ID
  userId: string; // To associate order with a user (e.g., user's email)
  date: string; // ISO date string when the order was placed
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: UserData; // Capture shipping address used for this order
  status: OrderStatus; // Mock delivery status
  estimatedDeliveryDate: string; // Mock estimated delivery date
}

