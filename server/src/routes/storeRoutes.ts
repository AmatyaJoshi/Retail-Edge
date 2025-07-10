import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/store - fetch store settings (for now, just the first store)
router.get('/', async (req, res) => {
  try {
    const store = await prisma.stores.findFirst();
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store settings' });
  }
});

// PATCH /api/store - update store settings (for now, just the first store)
router.patch('/', async (req, res) => {
  try {
    const store = await prisma.stores.findFirst();
    if (!store) return res.status(404).json({ error: 'Store not found' });

    let updateData = { ...req.body };

    // Handle logo upload if present
    if (req.files && req.files.logo) {
      const file = req.files.logo as UploadedFile;
      // Only allow image files
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'Only image files are allowed for logo' });
      }
      // Generate unique filename
      const ext = path.extname(file.name);
      const fileName = `store-logo-${store.id}-${Date.now()}${ext}`;
      const uploadPath = path.join(__dirname, '../../../client/public/', fileName);
      // Move file to public directory
      await file.mv(uploadPath);
      // Set logo URL (relative to public)
      updateData.logo = `/${fileName}`;
    }

    const updated = await prisma.stores.update({
      where: { id: store.id },
      data: updateData,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

export default router; 