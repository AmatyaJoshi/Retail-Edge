"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const azureBlob_1 = require("../lib/azureBlob");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// GET /api/store - fetch store settings (for now, just the first store)
router.get('/', async (req, res) => {
    try {
        const store = await prisma.stores.findFirst();
        if (!store)
            return res.status(404).json({ error: 'Store not found' });
        res.json(store);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch store settings' });
    }
});
// PATCH /api/store - update store settings (for now, just the first store)
router.patch('/', async (req, res) => {
    try {
        const store = await prisma.stores.findFirst();
        if (!store)
            return res.status(404).json({ error: 'Store not found' });
        let updateData = { ...req.body };
        // Handle logo upload if present
        if (req.files && req.files.logo) {
            const file = req.files.logo;
            // Only allow image files
            if (!file.mimetype.startsWith('image/')) {
                return res.status(400).json({ error: 'Only image files are allowed for logo' });
            }
            // Generate unique filename
            const ext = path_1.default.extname(file.name);
            const fileName = `store-logo-${store.id}-${Date.now()}${ext}`;
            // Upload to Azure Blob Storage - use tempFilePath since express-fileupload is configured with useTempFiles: true
            const url = await (0, azureBlob_1.uploadToAzure)('product-images', file.tempFilePath, fileName, file.mimetype);
            // Set logo URL to Azure Blob URL
            updateData.logo = url;
        }
        const updated = await prisma.stores.update({
            where: { id: store.id },
            data: updateData,
        });
        res.json(updated);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update store settings' });
    }
});
exports.default = router;
