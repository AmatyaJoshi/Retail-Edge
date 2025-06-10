import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSales = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      ...(startDate && endDate ? {
        timestamp: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      } : {})
    };

    const sales = await prisma.sales.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            category: true,
            price: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    res.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
};

export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    
    const sale = await prisma.sales.findUnique({
      where: { saleId },
      include: {
        product: {
          select: {
            name: true,
            category: true,
            price: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
};

export const createSale = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      customerId,
      quantity,
      unitPrice,
      totalAmount,
      paymentMethod
    } = req.body;

    // Validate product exists
    const product = await prisma.products.findUnique({
      where: { productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Validate customer exists if provided
    if (customerId) {
      const customer = await prisma.customers.findUnique({
        where: { customerId: customerId }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
    }

    // Generate saleId
    const saleId = `SALE-${productId.substring(0, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const sale = await prisma.sales.create({
      data: {
        saleId,
        productId,
        customerId,
        quantity,
        unitPrice,
        totalAmount,
        paymentMethod: paymentMethod || 'CARD',
        status: 'COMPLETED',
        timestamp: new Date(),
      },
      include: {
        product: {
          select: {
            name: true,
            category: true,
            price: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Update product stock
    await prisma.products.update({
      where: { productId },
      data: {
        stockQuantity: {
          decrement: quantity
        }
      }
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
};

export const updateSaleStatus = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['COMPLETED', 'PENDING', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const sale = await prisma.sales.update({
      where: { saleId },
      data: { status },
      include: {
        product: {
          select: {
            name: true,
            category: true,
            price: true
          }
        },
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // If status is REFUNDED, restore product stock
    if (status === 'REFUNDED') {
      await prisma.products.update({
        where: { productId: sale.productId },
        data: {
          stockQuantity: {
            increment: sale.quantity
          }
        }
      });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error updating sale status:', error);
    res.status(500).json({ error: 'Failed to update sale status' });
  }
};

export const updateSale = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const {
      productId,
      customerId,
      quantity,
      unitPrice,
      totalAmount,
      paymentMethod,
      status,
      timestamp
    } = req.body;

    const updatedSale = await prisma.sales.update({
      where: { saleId },
      data: {
        productId: productId || undefined,
        customerId: customerId || undefined,
        quantity: quantity || undefined,
        unitPrice: unitPrice || undefined,
        totalAmount: totalAmount || undefined,
        paymentMethod: paymentMethod || undefined,
        status: status || undefined,
        // timestamp: timestamp ? new Date(timestamp) : undefined, // Uncomment if you want to allow updating timestamp
      },
      include: {
        product: true,
        customer: true,
      }
    });

    res.status(200).json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: 'Failed to update sale' });
  }
};

export const deleteSale = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;

    await prisma.sales.delete({
      where: { saleId },
    });

    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
}; 