import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customers.findMany();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving customers" });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const customer = await prisma.customers.findUnique({
      where: { customerId },
    });

    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer by ID:', error);
    res.status(500).json({ message: "Error retrieving customer" });
  }
};

export const getCustomerSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    
    const sales = await prisma.sales.findMany({
      where: {
        customerId,
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    res.json(sales);
  } catch (error) {
    console.error('Error fetching customer sales:', error);
    res.status(500).json({ message: "Error retrieving customer sales" });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !phone) {
      res.status(400).json({ message: "Name and phone are required" });
      return;
    }

    // Validate phone number format (Indian mobile number)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json({ message: "Invalid phone number format" });
      return;
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    const customerData: Prisma.CustomersCreateInput = {
      customerId: uuidv4(),
      name,
      phone,
      joinedDate: new Date(),
      ...(email && { email }),
    };

    const newCustomer = await prisma.customers.create({
      data: customerData,
    });

    res.status(201).json(newCustomer);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ message: "Email already exists" });
    } else {
      res.status(500).json({ message: "Error creating customer" });
    }
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !phone) {
      res.status(400).json({ message: "Name and phone are required" });
      return;
    }

    // Validate phone number format (Indian mobile number)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json({ message: "Invalid phone number format" });
      return;
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: "Invalid email format" });
      return;
    }

    const updatedCustomer = await prisma.customers.update({
      where: { customerId },
      data: {
        name,
        email,
        phone,
      },
    });

    res.status(200).json(updatedCustomer);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ message: "Email already exists or phone number is in use" });
    } else {
      res.status(500).json({ message: "Error updating customer" });
    }
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;

    await prisma.customers.delete({
      where: { customerId },
    });

    res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: "Error deleting customer" });
  }
};