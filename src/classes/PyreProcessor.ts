import axios from "axios"; 
import { CommonTransactionType } from "../types/CommonTransactionType";
import PaymentProcessor from "./PaymentProcess";
import UserType from "../types/UserType";
import CommonCaptureTypes from "../types/CommonCaptureTypes";
import CommonVoidTypes from "../types/CommonVoidTypes";
import CommonRefundTypes from "../types/CommonRefundTypes";

/**
 * @description PyreProcessing class, this class extends the PaymentProcessor class
 *              and implements the processPayment method to process payments with the nmi
 *              payment gateway.
 * @class PyreProcessing
 * @extends PaymentProcessor
 * @export
 * @version 1.0.0
 * @since 1.0.0
 *
 */
class PyreProcessing extends PaymentProcessor {
  constructor() {
    super();
  }

  processPayment(details: CommonTransactionType, user: UserType) {}

  async captureTransaction(details: CommonCaptureTypes, user: UserType) {}
  async voidTransaction(details: CommonVoidTypes, order: any) {}
  async refundTransaction(details: CommonRefundTypes, order: any) {}
  async createVault(
    details: {
      security_key: string;
      first_name: string;
      last_name: string;
      address1: string;
      address2: string;
      city: string;
      state: string;
      zip: string;
      country: string;
      phone: string;
      email: string;
      currency: string;
      ccDetails?: {
        ccnumber?: string;
        ccexp?: string;
      };
      achDetails?: {
        checkname: string;
        checkaba: string;
        checkaccount: string;
        account_holder_type: string;
        account_type: string;
      };
      payment?: "creditcard" | "ach";
      customer_vault?: string;
    },
    merchant: string,
    customer: string
  ) {}
  async deleteVault(vaultId: string, security_key: string) {}
  async vaultTransaction(details: {
    customer_vault_id: string;
    security_key: string;
    amount: number;
    currency?: string;
    initiated_by?: string;
    stored_credential_indicator?: string;
  }) {}
  // create a function to return the name of the processor
  getProcessorName() {
    return "pyreprocessing";
  }
}

export default PyreProcessing;
