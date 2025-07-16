import express from 'express';
import { BlobServiceClient } from '@azure/storage-blob';

const router = express.Router();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_USER_AVATARS_CONTAINER = process.env.AZURE_USER_AVATARS_CONTAINER || 'user-avatars';

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set in environment variables');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(AZURE_USER_AVATARS_CONTAINER);

// GET /api/user-avatar/:blobName
router.get('/:blobName', async (req, res) => {
  const { blobName } = req.params;
  try {
    console.log(`[UserAvatar] Requested blob:`, blobName);
    console.log(`[UserAvatar] Container:`, AZURE_USER_AVATARS_CONTAINER);
    const blobClient = containerClient.getBlobClient(blobName);
    const exists = await blobClient.exists();
    console.log(`[UserAvatar] Blob exists:`, exists);
    if (!exists) {
      return res.status(404).json({ error: 'Avatar not found' });
    }
    const downloadBlockBlobResponse = await blobClient.download();
    // Set content type from blob properties
    const contentType = downloadBlockBlobResponse.contentType || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    if (!downloadBlockBlobResponse.readableStreamBody) {
      return res.status(500).json({ error: 'Avatar stream not available' });
    }
    // Stream the avatar to the response
    downloadBlockBlobResponse.readableStreamBody.pipe(res);
  } catch (error: any) {
    console.error(`[UserAvatar] Error fetching blob:`, error);
    res.status(500).json({ error: 'Failed to fetch avatar', details: error.message });
  }
});

export default router; 