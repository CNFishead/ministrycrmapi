import mongoose, { Model, Schema } from 'mongoose';
import OrderType from '../types/OrderType';

interface OrderAttributes extends OrderType {}

const OrderSchema = new Schema<OrderAttributes>(
  {
    merchant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    transactionId: { type: String },
    description: { type: String },
    orderInformation: {
      subTotal: { type: Number, required: true },
      total: { type: Number, required: true },
      tax: { type: Number },
      shipping: { type: Number },
      fee: { type: Number },
      currency: { type: String, required: true },
      last4: { type: String },
    },
    status: {
      type: String,
      default: 'pending',
      enum: [
        'pending',
        'shipped',
        'cancelled',
        'failed',
        'processing',
        'success',
        'refunded',
      ],
    },
    orderType: {
      type: String,
      enum: ['service-sale', 'ecommerce', 'donation', 'transaction'],
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Inventory' },
        name: { type: String }, // this is the name of the product at the time of purchase, in case the product is deleted or changed
        quantity: { type: Number }, // this is the quantity of the product at the time of purchase, in case the product is deleted or changed
        price: { type: Number }, // this is the price of the product at the time of purchase, in case the product is deleted or changed
        total: { type: Number }, // this is the total purchase price of the product at the time of purchase, in case the product is deleted or changed
      },
    ],
    customer: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phoneNumber: { type: String, required: true, trim: true },
    },
    shipped: { type: Boolean, default: false },
    shippedDate: { type: Date },
    trackingNumber: { type: String },
    shippingAddress: {
      name: { type: String },
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      zipcode: { type: String },
      country: { type: String },
    },
    billingAddress: {
      name: { type: String },
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      zipcode: { type: String },
      country: { type: String },
    },
    paymentProcessor: { type: String, required: true }, // associates the receipt with the payment processor
  },
  { timestamps: true }
);

export default mongoose.model<OrderAttributes>('Order', OrderSchema);
