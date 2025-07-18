"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bwip_js_1 = __importDefault(require("bwip-js"));
const router = express_1.default.Router();
// GET /api/barcode/:code
router.get('/:code', async (req, res) => {
    const { code } = req.params;
    if (!/^[0-9]{12}$/.test(code)) {
        return res.status(400).json({ error: 'Barcode must be exactly 12 digits.' });
    }
    try {
        // Generate barcode as PNG
        const png = await bwip_js_1.default.toBuffer({
            bcid: 'ean13', // Barcode type
            text: code, // Barcode value (12 digits, check digit auto)
            scale: 3, // 3x scaling
            height: 10, // Bar height, mm
            includetext: true,
            textxalign: 'center',
        });
        res.set('Content-Type', 'image/png');
        res.send(png);
    }
    catch (err) {
        res.status(400).json({ error: 'Invalid barcode or generation error.' });
    }
});
exports.default = router;
