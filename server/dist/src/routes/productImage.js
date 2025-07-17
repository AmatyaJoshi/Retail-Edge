"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_blob_1 = require("@azure/storage-blob");
const router = express_1.default.Router();
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const AZURE_PRODUCT_IMAGES_CONTAINER = process.env.AZURE_PRODUCT_IMAGES_CONTAINER || 'product-images';
if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING is not set in environment variables');
}
const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(AZURE_PRODUCT_IMAGES_CONTAINER);
// GET /api/product-image/:blobName
router.get('/:blobName', async (req, res) => {
    const { blobName } = req.params;
    try {
        console.log(`[ProductImage] Requested blob:`, blobName);
        console.log(`[ProductImage] Container:`, AZURE_PRODUCT_IMAGES_CONTAINER);
        const blobClient = containerClient.getBlobClient(blobName);
        const exists = await blobClient.exists();
        console.log(`[ProductImage] Blob exists:`, exists);
        if (!exists) {
            return res.status(404).json({ error: 'Image not found' });
        }
        const downloadBlockBlobResponse = await blobClient.download();
        // Set content type from blob properties
        const contentType = downloadBlockBlobResponse.contentType || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        if (!downloadBlockBlobResponse.readableStreamBody) {
            return res.status(500).json({ error: 'Image stream not available' });
        }
        // Stream the image to the response
        downloadBlockBlobResponse.readableStreamBody.pipe(res);
    }
    catch (error) {
        console.error(`[ProductImage] Error fetching blob:`, error);
        res.status(500).json({ error: 'Failed to fetch image', details: error.message });
    }
});
exports.default = router;
