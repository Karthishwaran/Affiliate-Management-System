const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
exports.uploadToCloudinary = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `affiliate-system/${folder}`,
      resource_type: 'auto'
    });
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete file');
  }
};