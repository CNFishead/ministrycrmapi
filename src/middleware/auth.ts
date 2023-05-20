import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';


interface JwtPayload {
  _id: string;
  iat: number;
  exp: number;
}

/**
 * @description middleware to check if the user is logged in, if the token is invalid or expired, it will return a 403 error
 * @param routes a list of routes that require the user to be logged in with
 * @returns a middleware function
 * 
 * @author Austin Howard
 * @version 1.0
 * @since 1.0
 * @lastModified 2023-05-08T16:41:52.000-05:00
 */
const protect = (routes?: any) => {
  return async (req: any, res: any, next: any) => {
    let token;
    // check the headers for an API key
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        // get the token from the headers
        token = req.headers.authorization.split(' ')[1];
        // decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        // find the user in the database
        req.user = await User.findById((decoded as JwtPayload)._id).select('-password');
        // check to see if the user is active
        if (req.user.isActive === false) {
          return res
            .status(401)
            .json({ message: 'Not authorized, token failed' });
        }
        req.user.token = token;
        next();
      } catch (e) {
        //console.log(e)
        return res.status(403).json({ message: 'Not authorized, token failed' });
      }
    }
    if (!token) {
      return res.status(403).json({ message: 'Not authorized, token failed' });
    }
  };
};

const admin = (...roles: any[]) => {
  // console.log(`roles: ${roles}`)
  return (req: any, res: any, next: any) => {
    // req.user.role can have multiple roles separated by a space e.g. "admin user" or "admin"
    // check to see if the user.role field is an array, if not, make it an array
    if (!Array.isArray(req.user.role)) {
      req.user.roles = req.user.role.split(' ');
    }
    // check to see if the req.user.roles array container a role that matches a role in the roles array
    // if it doesnt, return a 403 error
    // we need to loop through the roles array and check if the req.user.roles array contains the role
    let valid = false;
    roles.forEach((role) => {
      console.log(`checking role: ${role}`)
      if (req.user.roles.includes(role)) {
        valid = true;
      }
    });

    if (!valid) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};

export { protect, admin };
