// pages/api/uploadVideo.js
var cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async (req, res) => {
  const videoDataUrl = req.body.videoDataUrl;

  let publicId = "";

  await cloudinary.uploader.upload(
    videoDataUrl,
    { resource_type: "video", video_codec: "auto" },
    function (error, result) {
      if (result) {
        publicId = result.public_id;
        res.status(200).json(publicId);
      }
      if (error) {
        console.error(error);
        res.status(400).json(error);
      }
    }
  );
};