import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomerPurchaseHistory = async (customerId: string) => {
  try {
    const sales = await prisma.sales.findMany({
      where: { customerId },
      include: { product: true },
      orderBy: { timestamp: 'desc' },
    });

    const prescriptions = await prisma.prescriptions.findMany({
      where: { customerId },
      orderBy: { date: 'desc' },
    });

    // Placeholder for other customer-specific details like frame preferences, insurance, etc.
    return {
      salesHistory: sales,
      prescriptionDetails: prescriptions,
      framePreferences: 'N/A',
      insuranceInformation: 'N/A',
      appointmentHistory: 'N/A',
      followUpDates: 'N/A',
      specialRequirements: 'N/A',
    };
  } catch (error) {
    console.error('Error fetching customer purchase history:', error);
    throw error;
  }
};

export const getSupplierInformation = async (associateId: string) => {
  try {
    // Assuming a way to link purchase orders or products supplied by this associateId
    // For now, it's a placeholder and might require more complex queries based on how suppliers are linked to products/purchases
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { associateId }, // Changed from supplier to associateId
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    // Placeholder for other supplier-specific details
    return {
      productCategoriesSupplied: 'N/A',
      priceHistory: 'N/A',
      orderHistoryWithStatus: purchaseOrders,
      qualityRatings: 'N/A',
      paymentTerms: 'N/A',
      leadTimes: 'N/A',
    };
  } catch (error) {
    console.error('Error fetching supplier information:', error);
    throw error;
  }
}; 