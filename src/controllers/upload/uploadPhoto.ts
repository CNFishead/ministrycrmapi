import asyncHandler from '../../middleware/asyncHandler';
import User from '../../models/User';
import {AuthenticatedRequest} from '../../types/AuthenticatedRequest';
import { Response, Request } from 'express';
import error from '../../middleware/error';
import slugify from 'slugify';
import path from 'path';
import sharp from 'sharp';
import UserType from '../../types/UserType';
import fs from 'fs';

/**
 * @description: This function will return the full user details to the front
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 * @returns     {object} user: The user object we need to return to the front
 * 
 * @author - Austin Howard
 * @since - 1.0
 * @version 1.0
 * @lastModified - 2023-04-30T15:26:22.000-05:00
 * 
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
     console.log(req)
     if (!req.files) {
      return res.status(400).json({ message: `Please upload a file` })
    }

    const file = req.files.file
    // make sure image is a photo
    if (!file.mimetype.startsWith('image')) {
      return res
        .status(400)
        .json({ message: `Please make sure to upload an image` })
    }
    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD!) {
      return res.status(400).json({
        message: `File was too large, please upload an image less than ${process.env.MAX_FILE_UPLOAD} or 10MB in size`,
      })
    }

    // ***NOTE*** Path.parse() returns a {}, youll need to .name to access {name: String} for slugify
    const fileName = path.parse(file.name)

    // Create custom filename
    file.name = slugify(`${fileName.name}`, { lower: true }) + '-photo.png'
    //console.log(`slugged Name: ${file.name}`)
    // move file to the public images folder
    file.mv(`public/images/${file.name}`, async (err: any) => {
      if (err) {
        return res
          .status(500)
          .json({ message: `Problem with file being moved to filesystem` })
      }
    })
    //---------------------------------------------------------------------//
    //   Lines 71-82 make it so the uploaded image fits inside whatever the
    //   container size is. So that is doesn't cut off the image.
    //---------------------------------------------------------------------//
    // let width = await sharp(file.data)
    //   .metadata()
    //   .then((metadata: any) => {
    //     return metadata.width > 300 ? 300 : metadata.width < 300 ? 300 : 300
    //   })
    // //console.log('width: ', width)
    // let height = await sharp(file.data)
    //   .metadata()
    //   .then((metadata) => {
    //     // metadata.height = null
    //     return metadata.height
    //   })
    // //console.log(`height: ${height}`)
    // const sharpz = await sharp(file.data)
    //   .resize(width, height)
    //   .toFormat('webp', { palette: true }) //png or webp instead of jpeg
    //   .toFile(`public/images/${file.name}`)

    //console.log('sharpz: ', sharpz)

    const user = await User.findOne({ _id: req.user._id }) as UserType
    // console.log(user)
    const username = user.username
    
    // use the hostname to get the full url
    const hostname = req.headers!.host
    // protocol is http or https
    const protocol = req.protocol
    const imageUrl = `${protocol}://${hostname}/images/${file.name}`

    res.json({ imageUrl, message: `Image Uploaded successfully`, filename: file.name })
  } catch (error: any) {
    console.log(error);
    error(error, res);
  }
})