import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';

/*
  @Desc:   Authenticates a user.

  @Notes:  This function is how we differentiate between a user, guest, and 
           admin. 
           By calling this function in our routes, we can just pass either 
           protect, or admin into the route and it will protect  the route.
*/

interface JwtPayload {
  _id: string;
  iat: number;
  exp: number;
}
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
            .json({ message: 'Not authorized, token failed3' });
        }
        req.user.token = token;
        next();
      } catch (e) {
        //console.log(e)
        return res.status(403).json({ message: 'Not authorized, token failed4' });
      }
    }
    if (!token) {
      return res.status(403).json({ message: 'Not authorized, token failed5' });
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
