import { Router } from "express";
import {
  createProduct,
  getProducts,
  updateProductStock,
  updateProduct,
  deleteProduct,
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrderStatus,
  updatePurchaseOrder,
  deletePurchaseOrder
} from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.patch("/:productId/stock", updateProductStock);
router.patch("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

// Purchase Order routes
router.post("/purchase-orders", createPurchaseOrder);
router.get("/purchase-orders", getPurchaseOrders);
router.patch("/purchase-orders/:orderId/status", updatePurchaseOrderStatus);
router.patch("/purchase-orders/:orderId", updatePurchaseOrder);
router.delete("/purchase-orders/:orderId", deletePurchaseOrder);

export default router;