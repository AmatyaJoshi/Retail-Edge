import express from 'express';
import bwipjs from 'bwip-js';

const router = express.Router();

// GET /api/barcode/:code
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  if (!/^[0-9]{12}$/.test(code)) {
    return res.status(400).json({ error: 'Barcode must be exactly 12 digits.' });
  }
  try {
    // Generate barcode as PNG
    const png = await bwipjs.toBuffer({
      bcid: 'ean13', // Barcode type
      text: code,    // Barcode value (12 digits, check digit auto)
      scale: 3,      // 3x scaling
      height: 10,    // Bar height, mm
      includetext: true,
      textxalign: 'center',
    });
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (err) {
    res.status(400).json({ error: 'Invalid barcode or generation error.' });
  }
});

export default router;
