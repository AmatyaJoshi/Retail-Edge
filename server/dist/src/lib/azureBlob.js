"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToAzure = uploadToAzure;
exports.deleteFromAzureByUrl = deleteFromAzureByUrl;
const storage_blob_1 = require("@azure/storage-blob");
const fs_1 = __importDefault(require("fs"));
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw new Error('Azure Storage connection string not set');
}
const blobServiceClient = storage_blob_1.BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
async function uploadToAzure(containerName, fileData, fileName, mimetype) {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    let buffer;
    // If fileData is a string (file path), read the file
    if (typeof fileData === 'string') {
        buffer = fs_1.default.readFileSync(fileData);
    }
    else {
        // If fileData is already a Buffer, use it directly
        buffer = fileData;
    }
    // Check if buffer is empty
    if (!buffer || buffer.length === 0) {
        throw new Error('File data is empty or invalid');
    }
    console.log(`[AzureUpload] Uploading ${fileName} (${buffer.length} bytes) to container ${containerName}`);
    await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: mimetype }
    });
    return blockBlobClient.url;
}
async function deleteFromAzureByUrl(blobUrl) {
    try {
        const url = new URL(blobUrl);
        // The path is /container/blobname
        const [containerName, ...blobParts] = url.pathname.slice(1).split('/');
        const blobName = blobParts.join('/');
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
    }
    catch (err) {
        console.error('Failed to delete blob from Azure:', err);
    }
}
