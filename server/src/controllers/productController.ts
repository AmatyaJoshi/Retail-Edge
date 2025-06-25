import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { searchTerm, sortField, sortOrder } = req.query;

    const where: any = {};
    const orderBy: any = {};

    if (searchTerm) {
      const searchString = searchTerm.toString();
      where.OR = [
        { name: { contains: searchString, mode: 'insensitive' } },
        { category: { contains: searchString, mode: 'insensitive' } },
        { brand: { contains: searchString, mode: 'insensitive' } },
        { sku: { contains: searchString, mode: 'insensitive' } },
        { description: { contains: searchString, mode: 'insensitive' } },
      ];
    }

    if (sortField) {
      orderBy[sortField.toString()] = sortOrder === "desc" ? "desc" : "asc";
    } else {
      // Default sorting if no sortField is provided
      orderBy.name = "asc"; // Default to alphabetical by name
    }

    const products = await prisma.products.findMany({
      where,
      orderBy,
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: "Error retrieving products", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, name, price, rating, stockQuantity, category, brand, sku, description, imageUrl } = req.body;

    // Check if a product with the same name already exists
    let product = await prisma.products.findUnique({
      where: { name: name }, // Assuming name is unique or used for identification
    });

    if (product) {
      // If product exists, update its stock quantity
      product = await prisma.products.update({
        where: { name: name },
        data: {
          stockQuantity: product.stockQuantity + stockQuantity, // Increment existing stock
          price,
          rating,
          category,
          brand,
          sku,
          description,
          imageUrl
        },
      });
      res.status(200).json({ message: "Product stock updated successfully", product });
    } else {
      // If product does not exist, create a new one
      product = await prisma.products.create({
      data: {
        productId,
        name,
        price,
        rating,
        stockQuantity,
          category: category || 'uncategorized',
          brand,
          sku,
          description,
          imageUrl
      },
    });
      res.status(201).json({ message: "Product created successfully", product });
    }
  } catch (error) {
    console.error('Error creating/updating product:', error);
    res.status(500).json({ message: "Error creating/updating product", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateProductStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { stockQuantity } = req.body;

    const product = await prisma.products.update({
      where: { productId },
      data: { stockQuantity },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ 
      message: "Error updating product stock", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { name, price, rating, stockQuantity, category, brand, sku, description, imageUrl } = req.body;

    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: {
        name,
        price,
        rating,
        stockQuantity,
        category,
        brand,
        sku,
        description,
        imageUrl
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: "Error updating product",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    await prisma.products.delete({
      where: { productId },
    });

    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: "Error deleting product",
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const createPurchaseOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, quantity, associateId, expectedDeliveryDate, notes } = req.body;

    // Create purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        productId,
        quantity,
        associateId,
        expectedDeliveryDate: new Date(expectedDeliveryDate),
        notes,
        status: 'PENDING'
      },
    });

    res.status(201).json(purchaseOrder);
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ 
      message: "Error creating purchase order", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getPurchaseOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ 
      message: "Error retrieving purchase orders", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updatePurchaseOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: { status },
      include: {
        product: true
      }
    });

    // If order is received, update product stock
    if (status === 'RECEIVED') {
      await prisma.products.update({
        where: { productId: purchaseOrder.productId },
        data: {
          stockQuantity: {
            increment: purchaseOrder.quantity
          }
        }
      });
    }

    res.json(purchaseOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ 
      message: "Error updating purchase order", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const updatePurchaseOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { productId, quantity, associateId, expectedDeliveryDate, status, notes } = req.body;

    const updatedPurchaseOrder = await prisma.purchaseOrder.update({
      where: { id: orderId },
      data: {
        productId,
        quantity,
        associateId,
        expectedDeliveryDate: new Date(expectedDeliveryDate),
        status,
        notes
      },
    });

    res.status(200).json(updatedPurchaseOrder);
  } catch (error) {
    console.error('Error updating purchase order:', error);
    res.status(500).json({ 
      message: "Error updating purchase order", 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const deletePurchaseOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;

    await prisma.purchaseOrder.delete({
      where: { id: orderId },
    });

    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    res.status(500).json({
      message: "Error deleting purchase order",
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};