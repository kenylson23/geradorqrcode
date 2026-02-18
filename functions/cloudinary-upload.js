const cloudinary = require('cloudinary').v2;
const parser = require('lambda-multipart-parser');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const result = await parser.parse(event);
    const file = result.files[0];

    if (!file) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nenhum arquivo enviado' }),
      };
    }

    const uploadResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.content);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      }),
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Falha no upload para Cloudinary' }),
    };
  }
};
