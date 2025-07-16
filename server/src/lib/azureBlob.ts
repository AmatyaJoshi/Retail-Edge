import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING as string;

if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('Azure Storage connection string not set');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

export async function uploadToAzure(containerName: string, fileData: Buffer | string, fileName: string, mimetype: string): Promise<string> {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  let buffer: Buffer;
  
  // If fileData is a string (file path), read the file
  if (typeof fileData === 'string') {
    buffer = fs.readFileSync(fileData);
  } else {
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

export async function deleteFromAzureByUrl(blobUrl: string): Promise<void> {
  try {
    const url = new URL(blobUrl);
    // The path is /container/blobname
    const [containerName, ...blobParts] = url.pathname.slice(1).split('/');
    const blobName = blobParts.join('/');
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  } catch (err) {
    console.error('Failed to delete blob from Azure:', err);
  }
} 