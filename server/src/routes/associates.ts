import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getAssociateAnalytics } from '../controllers/analyticsController';
import { getCustomerPurchaseHistory, getSupplierInformation } from '../controllers/associateHistoryController';
import { UploadedFile } from 'express-fileupload';

const prisma = new PrismaClient();
const router = Router();

// Validation schemas
const createAssociateSchema = z.object({
  type: z.enum(['SUPPLIER', 'BUYER', 'BOTH']),
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().optional().or(z.literal('')),
  email: z.string().email("Invalid email address").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  gstNumber: z.string().optional().or(z.literal('')),
  panNumber: z.string().optional().or(z.literal('')),
  creditLimit: z.number().optional(),
  currentBalance: z.number().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  notes: z.string().optional().or(z.literal('')),
  joinedDate: z.string().datetime().optional(), // Make optional for client to omit
  paymentTerms: z.string().optional().or(z.literal('')),
});

const contactSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(1).optional().or(z.literal('')),
  isPrimary: z.boolean().default(false),
});

const contractSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional().or(z.literal('')),
  contractDuration: z.string().optional().or(z.literal('')),
  status: z.string().default("ACTIVE"),
  notes: z.string().optional().or(z.literal('')),
});

const documentSchema = z.object({
  contractId: z.string().optional().or(z.literal('')),
  associateId: z.string().optional().or(z.literal('')),
  name: z.string().min(1),
  url: z.string().url(),
  fileType: z.string().min(1),
  category: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

const communicationSchema = z.object({
  type: z.enum(["MEETING", "CALL", "EMAIL", "NOTE"]),
  subject: z.string().min(1),
  content: z.string().min(1),
  date: z.string().datetime(),
  createdBy: z.string().min(1),
});

const transactionSchema = z.object({
  type: z.enum(['PURCHASE', 'SALE', 'CREDIT_NOTE', 'DEBIT_NOTE']),
  amount: z.number().positive(),
  status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']),
  date: z.string().datetime(),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  reference: z.string().optional().or(z.literal('')),
});

const updateAssociateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  contactPerson: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  type: z.enum(["SUPPLIER", "BUYER", "BOTH"]).optional(),
  gstNumber: z.string().optional().or(z.literal("")),
  panNumber: z.string().optional().or(z.literal("")),
  creditLimit: z.number().optional(),
  currentBalance: z.number().optional(), // Changed to optional for updates
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  notes: z.string().optional().or(z.literal('')),
  joinedDate: z.string().datetime().optional().or(z.literal('')),
  paymentTerms: z.string().optional().or(z.literal('')),
});

// Get all associate partners
router.get('/', async (req, res) => {
  try {
    const include = req.query.include ? (req.query.include as string).split(',') : [];
    const includeOptions: any = {};

    // Only include relations that are requested and exist in the schema
    if (include.includes('contacts')) includeOptions.contacts = true;
    if (include.includes('transactions')) includeOptions.transactions = true;
    if (include.includes('communications')) includeOptions.communications = true;
    if (include.includes('contracts')) {
      includeOptions.contracts = {
        include: {
          documents: true
        }
      };
    }
    if (include.includes('documents')) includeOptions.documents = true;
    if (include.includes('purchaseOrders')) includeOptions.purchaseOrders = true; // Added purchaseOrders

    const associates = await prisma.associates.findMany({
      include: includeOptions
    });

    // Transform data to include totalTransactions for client
    const transformedAssociates = associates.map((associate: any) => ({
      ...associate,
      // Calculate totalTransactions if transactions are included
      totalTransactions: associate.transactions ? associate.transactions.length : 0,
      // Ensure currentBalance is a number, default to 0 if null/undefined
      currentBalance: associate.currentBalance ?? 0,
    }));

    res.json(transformedAssociates);
  } catch (error) {
    console.error('Error fetching associates:', error);
    res.status(500).json({ error: 'Failed to fetch associate partners' });
  }
});

// Get associate partner by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const associate = await prisma.associates.findUnique({
      where: { associateId: id }, // Use associateId as the unique identifier
      include: {
        contacts: true,
        transactions: true,
        communications: true,
        contracts: {
          include: {
            documents: true
          }
        },
        documents: true,
        purchaseOrders: true
      }
    });

    if (!associate) {
      return res.status(404).json({ error: 'Associate partner not found' });
    }
    res.json(associate);
  } catch (error) {
    console.error('Error fetching associate:', error);
    res.status(500).json({ error: 'Failed to fetch associate partner' });
  }
});

// Get analytics for an associate partner
router.get('/:id/analytics', async (req, res) => {
  try {
    const analytics = await getAssociateAnalytics(req.params.id);
    res.json(analytics);
  } catch (error) {
    console.error('Error in analytics route:', error);
    res.status(500).json({ error: 'Failed to fetch associate analytics' });
  }
});

// Get customer purchase history for an associate partner
router.get('/:id/customer-history', async (req, res) => {
  try {
    // This should now correctly handle cases where the associate type is not CUSTOMER
    if (req.params.id) {
      const associate = await prisma.associates.findUnique({
        where: { associateId: req.params.id },
        select: { type: true },
      });

      if (!associate) {
        return res.status(404).json({ error: 'Associate partner not found' });
      }

      // Only fetch customer history if the type is CUSTOMER or BOTH
      if (associate.type === "BUYER" || associate.type === "BOTH") {
        const history = await getCustomerPurchaseHistory(req.params.id);
        return res.json(history);
      } else {
        return res.status(200).json({ message: 'Not a customer associate type.', salesHistory: [], prescriptionDetails: [] });
      }
    } else {
      return res.status(400).json({ error: 'Associate ID is required.' });
    }
  } catch (error) {
    console.error('Error in customer-history route:', error);
    res.status(500).json({ error: 'Failed to fetch customer purchase history' });
  }
});

// Get supplier information for an associate partner
router.get('/:id/supplier-info', async (req, res) => {
  try {
    if (req.params.id) {
      const associate = await prisma.associates.findUnique({
        where: { associateId: req.params.id },
        select: { type: true },
      });

      if (!associate) {
        return res.status(404).json({ error: 'Associate partner not found' });
      }

      if (associate.type === "SUPPLIER" || associate.type === "BOTH") {
        const supplierInfo = await getSupplierInformation(req.params.id);
        return res.json(supplierInfo);
      } else {
        return res.status(200).json({ message: 'Not a supplier associate type.', orderHistoryWithStatus: [] });
      }
    } else {
      return res.status(400).json({ error: 'Associate ID is required.' });
    }
  } catch (error) {
    console.error('Error in supplier-info route:', error);
    res.status(500).json({ error: 'Failed to fetch supplier information' });
  }
});

// Create new associate partner
router.post('/', async (req, res) => {
  try {
    const data = createAssociateSchema.parse(req.body);
    const associate = await prisma.associates.create({
      data: {
        ...data,
        joinedDate: data.joinedDate ? new Date(data.joinedDate) : new Date(),
        status: data.status || "ACTIVE",
        currentBalance: data.currentBalance ?? 0, // Ensure currentBalance is set
      },
    });
    res.status(201).json(associate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating associate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update associate partner
router.put('/:id', async (req, res) => {
  try {
    const data = updateAssociateSchema.parse(req.body);
    const associate = await prisma.associates.update({
      where: { associateId: req.params.id }, // Changed id to associateId
      data: {
        ...data,
        joinedDate: data.joinedDate ? new Date(data.joinedDate) : undefined,
        currentBalance: data.currentBalance ?? undefined, // Handle currentBalance updates
      },
    });
    res.json(associate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating associate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete associate partner
router.delete('/:id', async (req, res) => {
  try {
    await prisma.associates.delete({
      where: { associateId: req.params.id }, // Changed id to associateId
    });
    res.status(204).send(); // No content
  } catch (error) {
    console.error('Error deleting associate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add contact to associate partner
router.post('/:id/contacts', async (req, res) => {
  try {
    const { id } = req.params;
    const contactData = contactSchema.parse(req.body);

    // Check if this is the first contact or if isPrimary is true
    const existingContacts = await prisma.associateContact.findMany({
      where: { associateId: id }
    });

    // If this is the first contact or isPrimary is true, update other contacts
    if (contactData.isPrimary || existingContacts.length === 0) {
      await prisma.associateContact.updateMany({
        where: { associateId: id },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.associateContact.create({
      data: {
        ...contactData,
        associateId: id,
        isPrimary: contactData.isPrimary || existingContacts.length === 0
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error adding contact:', error);
    res.status(500).json({ error: 'Failed to add contact' });
  }
});

// Update contact
router.put('/:id/contacts/:contactId', async (req, res) => {
  try {
    const { id, contactId } = req.params;
    const contactData = contactSchema.parse(req.body);

    // If setting this contact as primary, update other contacts
    if (contactData.isPrimary) {
      await prisma.associateContact.updateMany({
        where: { 
          associateId: id,
          id: { not: contactId }
        },
        data: { isPrimary: false }
      });
    }

    const contact = await prisma.associateContact.update({
      where: { id: contactId },
      data: contactData
    });

    res.json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// Delete contact
router.delete('/:id/contacts/:contactId', async (req, res) => {
  try {
    const { id, contactId } = req.params;

    // Check if the contact being deleted is primary
    const contact = await prisma.associateContact.findUnique({
      where: { id: contactId }
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // If deleting primary contact, make another contact primary
    if (contact.isPrimary) {
      const nextContact = await prisma.associateContact.findFirst({
        where: {
          associateId: id,
          id: { not: contactId }
        }
      });

      if (nextContact) {
        await prisma.associateContact.update({
          where: { id: nextContact.id },
          data: { isPrimary: true }
        });
      }
    }

    await prisma.associateContact.delete({
      where: { id: contactId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Add contract to associate partner
router.post('/:id/contracts', async (req, res) => {
  try {
    const { id } = req.params;
    const data = contractSchema.parse(req.body);
    const contract = await prisma.contract.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        associate: {
          connect: { associateId: id },
        },
      },
    });
    res.status(201).json(contract);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating associate contract:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contract for associate partner
router.put('/:associateId/contracts/:contractId', async (req, res) => {
  try {
    const { associateId, contractId } = req.params;
    const data = contractSchema.partial().parse(req.body);
    const updatedContract = await prisma.contract.update({
      where: { id: contractId, associateId: associateId },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
    res.json(updatedContract);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating associate contract:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contract from associate partner
router.delete('/:associateId/contracts/:contractId', async (req, res) => {
  try {
    const { associateId, contractId } = req.params;
    await prisma.contract.delete({
      where: { id: contractId, associateId: associateId },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting associate contract:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add document for associate partner or contract
router.post('/:id/documents', async (req, res) => {
  try {
    const data = documentSchema.parse(req.body);
    // Ensure either associateId or contractId is provided
    if (!data.associateId && !data.contractId) {
      return res.status(400).json({ error: 'Either associateId or contractId must be provided for the document.' });
    }
    const document = await prisma.document.create({
      data: {
        ...data,
        // If associateId is not provided in data, use the one from params
        associateId: data.associateId || req.params.id,
      },
    });
    res.status(201).json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to add document' });
  }
});

// Update document for associate partner or contract
router.put('/:associateId/documents/:documentId', async (req, res) => {
  try {
    const data = documentSchema.partial().parse(req.body);
    const document = await prisma.document.update({
      where: { id: req.params.documentId, associateId: req.params.associateId },
      data,
    });
    res.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document from associate partner or contract
router.delete('/:associateId/documents/:documentId', async (req, res) => {
  try {
    await prisma.document.delete({
      where: { id: req.params.documentId, associateId: req.params.associateId },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Add transaction for associate partner
router.post('/:id/transactions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = transactionSchema.parse(req.body);
    const newTransaction = await prisma.associateTransactions.create({
      data: {
        ...data,
        associateId: id,
      },
    });
    res.json(newTransaction);
  } catch (error) {
    next(error);
  }
});

// Update transaction for associate partner
router.put('/:associateId/transactions/:transactionId', async (req, res, next) => {
  try {
    const { associateId, transactionId } = req.params;
    const data = transactionSchema.partial().parse(req.body);
    const updatedTransaction = await prisma.associateTransactions.update({
      where: { id: transactionId, associateId: associateId },
      data: {
        ...data,
      },
    });
    res.json(updatedTransaction);
  } catch (error) {
    next(error);
  }
});

// Delete transaction from associate partner
router.delete('/:associateId/transactions/:transactionId', async (req, res, next) => {
  try {
    const { associateId, transactionId } = req.params;
    await prisma.associateTransactions.delete({
      where: { id: transactionId, associateId: associateId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Add communication for associate partner
router.post('/:id/communications', async (req, res) => {
  try {
    const { id } = req.params;
    const data = communicationSchema.parse(req.body);
    const communication = await prisma.associateCommunication.create({
      data: {
        ...data,
        date: new Date(data.date),
        associate: {
          connect: { associateId: id },
        },
      },
    });
    res.status(201).json(communication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error creating associate communication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update communication for associate partner
router.put('/:associateId/communications/:communicationId', async (req, res) => {
  try {
    const { associateId, communicationId } = req.params;
    const data = communicationSchema.partial().parse(req.body);
    const updatedCommunication = await prisma.associateCommunication.update({
      where: { id: communicationId, associateId: associateId },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
    res.json(updatedCommunication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Error updating associate communication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete communication from associate partner
router.delete('/:associateId/communications/:communicationId', async (req, res) => {
  try {
    const { associateId, communicationId } = req.params;
    await prisma.associateCommunication.delete({
      where: { id: communicationId, associateId: associateId },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting associate communication:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analytics routes
router.get('/:associateId/analytics', getAssociateAnalytics);
router.get('/:associateId/customer-history', getCustomerPurchaseHistory);
router.get('/:associateId/supplier-info', getSupplierInformation);

// Get transactions for associate partner
router.get('/:id/transactions', async (req, res, next) => {
  try {
    const { id } = req.params;
    const transactions = await prisma.associateTransactions.findMany({
      where: { associateId: id },
      orderBy: { date: 'desc' },
    });
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Export associates
router.post('/export', async (req, res) => {
  try {
    const { format, data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const headers = ["associateId", "type", "name", "contactPerson", "email", "phone", "address", "gstNumber", "panNumber", "creditLimit", "currentBalance", "status", "notes", "joinedDate", "paymentTerms", "customPaymentTerms", "updatedAt"];
    const rows = data.map(associate => 
      headers.map(header => {
        let value = associate[header as keyof typeof associate];
        if (value === null || value === undefined) {
          return '';
        }
        if (['joinedDate', 'updatedAt'].includes(header) && typeof value === 'string') {
          return new Date(value).toISOString();
        }
        return value;
      })
    );

    let buffer: Buffer;
    let mimeType: string;
    let fileName: string;

    switch (format) {
      case 'csv':
        const csvContent = [headers.join(','),
          ...rows.map(row => 
            row.map(cell => {
              if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                return `"${cell.replace(/"/g, '""')}"`;
              }
              return cell;
            }).join(',')
          )
        ].join('\n');
        buffer = Buffer.from(csvContent);
        mimeType = 'text/csv';
        fileName = 'associates.csv';
        break;

      case 'xlsx':
        const XLSX = require('xlsx');
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Associates");
        buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = 'associates.xlsx';
        break;

      case 'pdf':
        // TODO: Implement PDF export
        return res.status(501).json({ error: 'PDF export not implemented yet' });

      case 'doc':
        // TODO: Implement DOC export
        return res.status(501).json({ error: 'DOC export not implemented yet' });

      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting associates:', error);
    res.status(500).json({ error: 'Failed to export associates' });
  }
});

// Import associates
router.post('/import', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file;
    
    // Type guard to ensure file is a single file, not an array
    if (Array.isArray(file)) {
      return res.status(400).json({ error: 'Multiple files not supported' });
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    let parsedData: any[] = [];

    if (fileExtension === 'csv') {
      const Papa = require('papaparse');
      const csvContent = file.data.toString();
      const result = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      });
      parsedData = result.data;
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      const XLSX = require('xlsx');
      const workbook = XLSX.read(file.data, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheet found in the Excel file');
      }
      const worksheet = workbook.Sheets[sheetName];
      parsedData = XLSX.utils.sheet_to_json(worksheet);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    if (parsedData.length === 0) {
      return res.status(400).json({ error: 'No data found in file' });
    }

    // Transform and validate data
    const associatesToImport = parsedData.map(row => ({
      name: row.name || '',
      type: ['SUPPLIER', 'BUYER', 'BOTH'].includes(row.type) ? row.type : 'BUYER',
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      contactPerson: row.contactPerson || '',
      gstNumber: row.gstNumber || '',
      panNumber: row.panNumber || '',
      creditLimit: parseFloat(row.creditLimit) || 0,
      currentBalance: parseFloat(row.currentBalance) || 0,
      status: ['ACTIVE', 'INACTIVE'].includes(row.status) ? row.status : 'ACTIVE',
      notes: row.notes || '',
      joinedDate: row.joinedDate ? new Date(row.joinedDate) : new Date(),
      paymentTerms: row.paymentTerms || '',
      customPaymentTerms: row.customPaymentTerms || '',
    }));

    // Bulk create associates
    const createdAssociates = await prisma.associates.createMany({
      data: associatesToImport,
      skipDuplicates: true,
    });

    res.json({ 
      message: 'Import successful',
      imported: createdAssociates.count,
      total: parsedData.length
    });
  } catch (error) {
    console.error('Error importing associates:', error);
    res.status(500).json({ error: 'Failed to import associates' });
  }
});

export default router;
