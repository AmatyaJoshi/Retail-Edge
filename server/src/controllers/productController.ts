import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateSKU, generateUniqueBarcode, isSKUUnique, isBarcodeUnique } from "../lib/productUtils";
import { uploadToAzure, deleteFromAzureByUrl } from '../lib/azureBlob';
import path from 'path';
import { UploadedFile } from 'express-fileupload';

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
        { barcode: { contains: searchString, mode: 'insensitive' } },
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

export const getProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    const product = await prisma.products.findUnique({
      where: { productId },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: "Error retrieving product", error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { productId, name, price, rating, stockQuantity, category, brand, sku, description, imageUrl, barcode } = req.body;

    // Handle image file upload if present
    if (req.files && req.files.image) {
      const file = req.files.image as UploadedFile;
      if (!file.mimetype.startsWith('image/')) {
        res.status(400).json({ error: 'Only image files are allowed for product image' });
        return;
      }
      const ext = path.extname(file.name);
      const fileName = `product-image-${name.replace(/\s+/g, '-')}-${Date.now()}${ext}`;
      // Use tempFilePath since express-fileupload is configured with useTempFiles: true
      imageUrl = await uploadToAzure('product-images', file.tempFilePath, fileName, file.mimetype);
    }

    // Check if a product with the same name already exists
    let product = await prisma.products.findUnique({
      where: { name: name },
    });

    if (product) {
      // If product exists, update its stock quantity
      product = await prisma.products.update({
        where: { name: name },
        data: {
          stockQuantity: product.stockQuantity + stockQuantity,
          price,
          rating,
          category,
          brand,
          sku: sku || product.sku,
          description,
          imageUrl,
          barcode: barcode || product.barcode
        },
      });
      res.status(200).json({ message: "Product stock updated successfully", product });
      return;
    } else {
      // Generate SKU and barcode if not provided
      let generatedSKU = sku;
      let generatedBarcode = barcode;

      if (!generatedSKU) {
        generatedSKU = await generateSKU(category, brand);
        // Ensure SKU is unique
        let counter = 1;
        while (!(await isSKUUnique(generatedSKU))) {
          generatedSKU = await generateSKU(category, brand);
          counter++;
          if (counter > 100) break; // Prevent infinite loop
        }
      } else {
        // Check if provided SKU is unique
        if (!(await isSKUUnique(generatedSKU))) {
          res.status(400).json({ 
            message: "SKU already exists",
            error: "SKU_DUPLICATE"
          });
          return;
        }
      }

      if (!generatedBarcode) {
        generatedBarcode = await generateUniqueBarcode();
      } else {
        // Check if provided barcode is unique
        if (!(await isBarcodeUnique(generatedBarcode))) {
          res.status(400).json({ 
            message: "Barcode already exists",
            error: "BARCODE_DUPLICATE"
          });
          return;
        }
      }

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
          sku: generatedSKU,
          description,
          imageUrl,
          barcode: generatedBarcode
        },
      });
      res.status(201).json({ message: "Product created successfully", product });
      return;
    }
  } catch (error) {
    console.error('Error creating/updating product:', error);
    res.status(500).json({ message: "Error creating/updating product", error: error instanceof Error ? error.message : 'Unknown error' });
    return;
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
    let { name, price, rating, stockQuantity, category, brand, sku, description, imageUrl, barcode } = req.body;

    // Fetch the current product to get the old imageUrl
    const currentProduct = await prisma.products.findUnique({ where: { productId } });

    // Handle image file upload if present
    if (req.files && req.files.image) {
      // Delete old image if it exists
      if (currentProduct && currentProduct.imageUrl) {
        await deleteFromAzureByUrl(currentProduct.imageUrl);
      }
      const file = req.files.image as UploadedFile;
      if (!file.mimetype.startsWith('image/')) {
        res.status(400).json({ error: 'Only image files are allowed for product image' });
        return;
      }
      const ext = path.extname(file.name);
      const fileName = `product-image-${name?.replace(/\s+/g, '-') || productId}-${Date.now()}${ext}`;
      imageUrl = await uploadToAzure('product-images', file.tempFilePath, fileName, file.mimetype);
    }

    // Handle image removal (imageUrl set to empty string)
    if (imageUrl === "" && currentProduct && currentProduct.imageUrl) {
      await deleteFromAzureByUrl(currentProduct.imageUrl);
    }

    // Check if SKU or barcode already exists for another product
    if (sku) {
      const existingProductWithSKU = await prisma.products.findFirst({
        where: {
          sku: sku,
          productId: { not: productId }
        }
      });
      if (existingProductWithSKU) {
        res.status(400).json({ 
          message: "SKU already exists for another product",
          error: "SKU_DUPLICATE"
        });
        return;
      }
    }

    if (barcode) {
      const existingProductWithBarcode = await prisma.products.findFirst({
        where: {
          barcode: barcode,
          productId: { not: productId }
        }
      });
      if (existingProductWithBarcode) {
        res.status(400).json({ 
          message: "Barcode already exists for another product",
          error: "BARCODE_DUPLICATE"
        });
        return;
      }
    }

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
        imageUrl,
        barcode
      },
    });

    res.status(200).json(updatedProduct);
    return;
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: "Error updating product",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return;
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