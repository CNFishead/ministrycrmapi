import jwt from 'jsonwebtoken';

const generateToken = (_id: any, expiresAt?: string) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET!, {
    expiresIn: expiresAt || '30d',
  });
};

export default generateToken;
