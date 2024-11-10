import asyncHandler from '../../middleware/asyncHandler';
import Ministry from '../../models/Ministry';
import User from '../../models/User';
import { Response, Request } from 'express';
import userObject from '../../utils/userObject';
import Member from '../../models/Member';
import createCustomer from '../paymentControllers/createCustomer';
import createVault from '../paymentControllers/createVault';
import removeCustomer from '../paymentControllers/removeCustomer';
import PaymentProcessorFactory from '../../factory/PaymentProcessorFactory';
import moment from 'moment';
import sendEmail from '../../utils/sendEmail';
/**
 * @description: this function registers a new account to the database.
 *               It will check if the email is already in use, if it is, it will throw an error
 *               if the email is not in use, it will create a new user document in the database
 *               and return the user object to the front
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 * @throws:     If the email is already in use
 * @throws:     If the user is not found
 *
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-04-22T18:50:56.000-05:00
 *
 */
export default asyncHandler(async (req: Request, res: Response) => {
  try {
    // first check if the required fields are in the request body
    const { email, password, firstName, lastName } = req.body.userInfo;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    const processor = new PaymentProcessorFactory().chooseProcessor(
      'pyreprocessing'
    );
    // check if the email is already in use
    // @ts-ignore
    const userExists = await User.findOne({ email }); // returns a user object if the email is in use
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // TODO: add payment info to registration

    // create a new user object
    const newUser = await User.create({
      ...req.body.userInfo,
      features: req.body.features,
    });

    const member = await Member.create({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      user: newUser._id,
      ...req.body.ministryInfo,
    });

    // we need to send a request to pyre to create a customer
    const customerResponse = await createCustomer(newUser);

    // if the customerResponse is not successful we need to delete the user, throw an error and return
    if (!customerResponse.success) {
      await removeCustomerData([newUser.id, User], [member.id, Member]);
      return res.status(400).json({ message: customerResponse.message });
    }

    // update the user with the customerId from pyre
    newUser.customerId = customerResponse?.payload?._id;

    // create a vault for the user
    const vaultResponse = await processor.createVault(newUser, {
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      email: newUser.email,
      paymentMethod: req.body.billingDetails.paymentMethod,
      address1: req.body.billingDetails.address1,
      address2: req.body.billingDetails.address2,
      city: req.body.billingDetails.city,
      state: req.body.billingDetails.state,
      zip: req.body.billingDetails.zip,
      country: req.body.billingDetails.country,
      phone: newUser.phoneNumber,
      creditCardDetails: req.body.billingDetails.creditCardDetails,
      achDetails: req.body.billingDetails.achDetails,
    });

    // if the vaultResponse is not successful we need to delete the user, throw an error and return
    if (!vaultResponse.success) {
      await removeCustomerData([newUser.id, User], [member.id, Member]);
      return res.status(400).json({ message: vaultResponse.message });
    }

    // on registration we need to create a ministry object for the user who created the account
    // pass in the ministry object from the request body
    const ministry = await Ministry.create({
      leader: member._id,
      ...req.body.ministryInfo,
    });

    // if the ministry object is not created, we need to delete the user and member objects
    if (!ministry) {
      await removeCustomerData([newUser.id, User], [member.id, Member]);
      return res.status(400).json({ message: 'Error Creating Ministry' });
    }

    // set the next payment date for the user, from two weeks from the current date
    newUser.nextPayment = moment().add(2, 'weeks').toDate();
    // save the user object
    await newUser.save();

    // send emails to the user and the admin
    // send email verification
    // set the hostname for the email validation link, if we are in development send it to localhost
    let hostName = 'https://auth.shepherdscms.com';
    if (process.env.NODE_ENV === 'development') {
      hostName = 'http://localhost:3003';
    }
    await sendEmail({
      personalizations: [
        {
          to: [{ email: newUser.email, name: newUser.fullName }],
        },
      ],
      from: 'info@shepherdscms.com',
      dynamicTemplateData: {
        subject: `Please complete your registration, by verifying your email!`,
        verifyEmailUrl: `${hostName}/resend-verification?verify=${newUser.emailVerificationToken}`,
        firstName: newUser.fullName,
      },
      templateId: 'd-82805d3a5688402883118c35d3c9ea81',
    });

    const admin = await User.findOne({
      role: {
        $in: ['admin', 'superadmin'],
      },
    });
    if (admin) {
      // send email to admin
      await sendEmail({
        personalizations: [
          {
            to: [{ email: admin.email, name: admin.fullName }],
          },
        ],
        from: 'info@shepherdscms.com',
        dynamicTemplateData: {
          subject: `New User Registration - ${newUser.fullName}`,
          fullName: newUser.fullName,
          ministryBannerLogoUrl:
            ministry?.ministryImageUrl || 'https://via.placeholder.com/150',
          date: moment().format('YYYY'),
        },
        templateId: 'd-b864795c5046489d9f07bc5c3c74127c ',
      });
    }

    return res.status(201).json({
      message: 'User Created',
      success: true,
    });
  } catch (error: any) {
    console.log(error);
    return res
      .status(500)
      .json({ message: `Something Went Wrong: ${error.message}` });
  }
});

/**
 * @description helper function to remove user data from the database if the customer registration fails
 * @param args - any number of arguments, each argument is an id of a document, and the document that they want to remove from
 * @example removeCustomerData([id1, document1], [id2, document2], [id3, document3])
 * @returns void
 */
const removeCustomerData = async (
  // there can be numerous parameters here
  ...args: [string, any][]
) => {
  try {
    // loop through the arguments
    for (const [id, document] of args) {
      // delete the document from the database
      await document.findByIdAndDelete(id);
    }
  } catch (error: any) {
    // if there is an error, log it
    console.log(error);
    throw new Error('Error Deleting Customer Data');
  }
};
