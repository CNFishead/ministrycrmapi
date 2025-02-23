import asyncHandler from "../../middleware/asyncHandler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";
import slugify from "slugify";
import path from "path";
import { UploadedFile } from "express-fileupload";
import Ministry, { MinistryType } from "../../models/Ministry"; 
import error from "../../middleware/error";
import fs from "fs";

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
    console.log(`running uploadPhoto.ts`);
    if (!req.files) {
      return res.status(400).json({ message: `Please upload a file` });
    }

    const file = req.files.file as UploadedFile;
    // make sure image is a photo
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({ message: `Please make sure to upload an image` });
    }
    // Check file size
    if (file.size > parseInt(process.env.MAX_FILE_UPLOAD!, 10)) {
      return res.status(400).json({
        message: `File was too large, please upload an image less than ${process.env.MAX_FILE_UPLOAD} or 10MB in size`,
      });
    }

    // ***NOTE*** Path.parse() returns a {}, youll need to .name to access {name: String} for slugify
    const fileName = path.parse(file.name);
    console.log(req.body);

    const ministry = (await Ministry.findOne({ name: req.body.ministryName })) as MinistryType;

    if (!ministry) {
      return res.status(400).json({ message: `Ministry not found` });
    }

    // slugify the ministry name
    const ministryName = slugify(`${ministry.name}`, { lower: true });
    // Create custom filename
    file.name = slugify(`${fileName.name}`, { lower: true }) + "-photo.png";
    //console.log(`slugged Name: ${file.name}`)
    // move file to the public images folder
    // check the folder exists
    fs.mkdirSync(`public/images/${ministryName}`, { recursive: true });
    file.mv(`public/images/${ministryName}/${file.name}`, async (err: any) => {
      if (err) {
        return res.status(500).json({ message: `Problem with file being moved to filesystem` });
      }
    });

    // use the hostname to get the full url
    const hostname = req.headers!.host;
    // protocol is http or https
    const protocol = req.protocol;
    const imageUrl = `${protocol}://${hostname}/images/${ministryName}/${file.name}`;

    return res.json({ imageUrl, message: `Image Uploaded successfully`, filename: file.name });
  } catch (err: any) {
    console.log(err);
    error(err, req, res);
  }
});
