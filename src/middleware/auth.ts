// import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import User from '../models/User.js';
// import ApiKey from '../models/ApiKey.js';
import mongoose from 'mongoose';

/*
  @Desc:   Authenticates a user.

  @Notes:  This function is how we differentiate between a user, guest, and 
           admin. 
           By calling this function in our routes, we can just pass either 
           protect, or admin into the route and it will protect  the route.
*/

const protect = (routes: any) => {
  // console.log(`routes: ${routes}`);
  // console.log(`protected route accessed`);
  return async (req: any, res: any, next: any) => {
    // console.log(`starting protect`);
    let token;
    // console.log(`req.headers.authorization:`);
    // console.log(req.headers['x-api-key']);
    // check the headers for an API key
    if (
      (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) ||
      req.headers['x-api-key']
    ) {
      // check for API key first
      token =
        req.headers['x-api-key'] || req.headers.authorization.split(' ')[1];
      // console.log(token);
      try {
        // now we need to verify the token, or api key
        // check the token to see if its a valid mongoDb id if it is, that means its an api key
        // console.log(`checking token`);
        if (mongoose.Types.ObjectId.isValid(token)) {
          // console.log(`token is valid`);
          // let key = await ApiKey.findById(token);
          // console.log(key);
          // if (!key) {
          //   // console.log(`no key found`);
          //   return res
          //     .status(401)
          //     .json({ message: 'Not authorized, token failed' });
          // }
          // here we need to check if the api key is active
          // if (!key.isActive) {
          //   // console.log(`key is not active`);
          //   return res
          //     .status(401)
          //     .json({ message: 'Not authorized, token failed' });
          // }
          // now we need to check if the list of routes is in the api key routes
          // this ensures that the api key can only access certain routes
          // if no routes are passed in, then we just let the api key access this route
          // the routes passed in will look like ['videos', 'users' ...routes]
          if (routes && routes.length > 0) {
            // console.log(`checking routes: ${routes}`);
            // check if the route is in the api key routes
            // we will need to check every route in the array
            // if the route is not in the array, then we will return a 401
            let valid = false;
            // routes.forEach((route: any) => {
            //   if (key.routes.includes(route)) {
            //     valid = true;
            //   }
            // });
            if (!valid) {
              // console.log(`route not valid`);
              return res
                .status(401)
                .json({ message: 'Not authorized, token failed' });
            }
          }
          // console.log(`key is valid`);
          // if we get here, then the api key is valid
          // req.user = await User.findById(key.user);
          // console.log(req.user);
        } else {
          // const decoded = jwt.verify(token, process.env.JWT_SECRET);
          // console.log(decoded);

          // req.user = await User.findById(decoded._id);
        }

        if (!req.user) {
          return res
            .status(500)
            .json({ message: 'Not authorized, token failed' });
        }

        if (req.user.isActive === false) {
          return res
            .status(401)
            .json({ message: 'Not authorized, token failed' });
        }
        req.user.token = token;

        next();
      } catch (e) {
        //console.log(e)
        res.status(403).json({ message: 'Not authorized, token failed' });
      }
    }
    if (!token) {
      res.status(403).json({ message: 'Not authorized, token failed' });
      next();
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
