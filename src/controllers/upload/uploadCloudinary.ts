import { v2 as cloudinary } from "cloudinary";
import asyncHandler from "../../middleware/asyncHandler";
import error from "../../middleware/error";
import path from "path";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";
import streamifier from "streamifier";
import formatBytes from "../../utils/formatBytes";

/**
 * @description: This function will upload to cloudinary a photo
 * @param       {object} req: The request object from the client
 * @param       {object} res: The response object from the server
 *
 * @access      Private
 * @route       POST /api/v1/upload/cloudinary
 * @returns     {object} photo: The photo object we need to return to the front, for saving
 *             to the database
 * @version     1.0
 * @author      Austin Howard
 * @since       1.0
 * @lastModified 2023-09-17T14:36:59.000-05:00
 *
 */
export default asyncHandler(async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    if (!req.files) {
      return res.status(400).json({ message: `Please upload a file` });
    }
    const file = req.files.file as any;
    // make sure image is a photo
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({ message: `Please make sure to upload an image` });
    }
    if (file.size > process.env.MAX_FILE_UPLOAD!) {
      return res.status(400).json({
        message: `File was too large size: ${formatBytes(file.size)}, please upload an image less than ${
          process.env.MAX_FILE_UPLOAD
        } or 10MB in size`,
      });
    }
    const fileName = path.parse(file.name.toString());

    // convert the file.data to buffer and create a readstream
    const buffer = Buffer.from(file.data);

    // create a readstream that sends the buffer to cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `shepherdscms/${req.body.username}/${req.body.folder}`,
        public_id: fileName.name,
        overwrite: true,
        resource_type: "image",
        format: "webp",
        quality: 75,
      },
      (err: any, result: any) => {
        if (err) {
          console.log(err);
          return res.status(400).json({ message: `Error uploading file` });
        }
        return res.json({ imageUrl: result?.secure_url, message: `Image Uploaded successfully`, filename: file.name });
      }
    );

    // pipe the buffer to the readstream
    const response = await streamifier.createReadStream(buffer).pipe(stream);
  } catch (err) {
    console.log(err);
    error(err, req, res, next);
  }
});
