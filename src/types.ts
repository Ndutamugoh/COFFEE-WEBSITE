export enum Category {
  WHOLE_BEAN = "WHOLE_BEAN",
  GROUND = "GROUND",
  INSTANT = "INSTANT",
  EQUIPMENT = "EQUIPMENT",
  MERCHANDISE = "MERCHANDISE",
}

export enum RoastLevel {
  LIGHT = "LIGHT",
  MEDIUM = "MEDIUM",
  MEDIUM_DARK = "MEDIUM_DARK",
  DARK = "DARK",
}

export enum GrindType {
  WHOLE_BEAN = "WHOLE_BEAN",
  COARSE = "COARSE",
  MEDIUM = "MEDIUM",
  FINE = "FINE",
  ESPRESSO = "ESPRESSO",
}

export interface ProductVariant {
  id: string;
  productId: string;
  grindType?: GrindType;
  weightGrams: number;
  weightLabel: string;
  priceKes: number;
  stockQty: number;
  sku: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: Category;
  origin: string;
  altitude?: string;
  process?: string;
  roastLevel: RoastLevel;
  tastingNotes: string[];
  brewingGuide?: string;
  bestFor: string[];
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  variants: ProductVariant[];
}

export enum OrderStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  DISPATCHED = "DISPATCHED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentMethod {
  MPESA = "MPESA",
  CARD = "CARD",
  CASH_ON_DELIVERY = "CASH_ON_DELIVERY",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  imageUrl: string;
  qty: number;
  unitPrice: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  feeKes: number;
  estimatedHours: number;
  description: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  status: OrderStatus;
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  deliveryZoneId: string;
  deliveryAddress?: string;
  notes?: string;
  promoCode?: string;
  discountKes?: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: {
    method: PaymentMethod;
    status: PaymentStatus;
    mpesaReceipt?: string;
    checkoutRequestId?: string;
  };
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  isActive: boolean;
}
