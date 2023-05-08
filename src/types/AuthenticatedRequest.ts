import { Request } from "express-validator/src/base";

export interface AuthenticatedRequest extends Request {
  user: {
    _id: any;
  };
}