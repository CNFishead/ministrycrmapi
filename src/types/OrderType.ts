import UserType from "./UserType";

export default interface OrderType {
  _id: string;
  user: UserType; // user who the transaction is for
  transactionId: string;
  description: string;
  orderInformation: {
    subTotal: number;
    total: number;
    tax?: number;
    shipping?: number;
    fee?: number;
    currency?: string; //last 4 digits of the card used
    last4?: string;
    paymentMethod?: string;
  };
  status?: string;
  orderNumber?: string;
  shipped?: boolean;
  shippedDate?: Date;
  trackingNumber?: string;
  orderType?: string;
  customer: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  items?: [{ product: any; quantity: number; price: number; total: number }];
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  paymentProcessor: string;
  createdAt: Date;
  updatedAt: Date;
}
