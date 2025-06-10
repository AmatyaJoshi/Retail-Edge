import { Router } from "express";
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer, getCustomerSales } from "../controllers/customerController";

const router = Router();

router.get("/", getCustomers);
router.get("/:customerId", getCustomerById);
router.get("/:customerId/sales", getCustomerSales);
router.post("/", createCustomer);
router.patch("/:customerId", updateCustomer);
router.delete("/:customerId", deleteCustomer);

export default router;