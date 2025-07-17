import express from 'express';
import { PrismaClient } from '@prisma/client';
import clerk from '@clerk/clerk-sdk-node';
import { getAppwriteUsers } from '../lib/appwriteAuth';
import { uploadToAzure, deleteFromAzureByUrl } from '../lib/azureBlob';
import path from 'path';
import { UploadedFile } from 'express-fileupload';
const prisma = new PrismaClient();
const router = express.Router();

// TODO: Replace with real authentication middleware
function getCurrentUser(req: any) {
  // Example: return { id: '...', role: 'Owner' };
  // In production, extract from req.user or req.auth
  return req.user || { role: 'Owner' }; // TEMP: always owner for now
}

// GET /employees — List all employees (with role-based filtering)
router.get('/', async (req, res) => {
  const currentUser = getCurrentUser(req);
  if (!['Owner', 'Manager'].includes(currentUser.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const where = currentUser.role === 'Manager'
    ? { role: { not: 'Owner' } }
    : {};
  const employees = await prisma.users.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      address: true,
      photoUrl: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(employees);
});

// PATCH /employees/:id — Edit employee details/role
router.patch('/:id', async (req, res) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  if (!['Owner', 'Manager'].includes(currentUser.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Managers cannot edit Owners or themselves
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (currentUser.role === 'Manager' && (user.role === 'Owner' || user.id === currentUser.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  let { firstName, lastName, phone, address, photoUrl } = req.body;

  // Handle avatar file upload if present
  if (req.files && req.files.avatar) {
    // Delete old avatar if it exists
    if (user.photoUrl) {
      await deleteFromAzureByUrl(user.photoUrl);
    }
    const file = req.files.avatar as UploadedFile;
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Only image files are allowed for avatar' });
    }
    const ext = path.extname(file.name);
    const fileName = `user-avatar-${id}-${Date.now()}${ext}`;
    // Use tempFilePath since express-fileupload is configured with useTempFiles: true
    photoUrl = await uploadToAzure('user-avatars', file.tempFilePath, fileName, file.mimetype);
  }

  const updated = await prisma.users.update({
    where: { id },
    data: { firstName, lastName, phone, address, photoUrl },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true, role: true, createdAt: true, address: true, photoUrl: true
    }
  });
  res.json(updated);
});

// DELETE /employees/:id — Delete employee
router.delete('/:id', async (req, res) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  if (!['Owner', 'Manager'].includes(currentUser.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Managers cannot delete Owners or themselves
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (currentUser.role === 'Manager' && (user.role === 'Owner' || user.id === currentUser.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Delete from Clerk
  try {
    if (user.clerkId) {
      await clerk.users.deleteUser(user.clerkId);
    }
  } catch (err) {
    console.error('Failed to delete user from Clerk:', err);
  }
  // Delete from Appwrite
  try {
    if (user.appwriteId) {
      const appwriteUsers = getAppwriteUsers();
      await appwriteUsers.delete(user.appwriteId);
    }
  } catch (err) {
    console.error('Failed to delete user from Appwrite:', err);
  }
  // Delete from DB
  await prisma.users.delete({ where: { id } });
  res.json({ success: true });
});

// POST /employees/:id/assign-role — Assign/change role
router.post('/:id/assign-role', async (req, res) => {
  const currentUser = getCurrentUser(req);
  const { id } = req.params;
  const { role } = req.body;
  if (!['Owner', 'Manager'].includes(currentUser.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Managers cannot assign Owner role or change their own role
  if (currentUser.role === 'Manager' && (role === 'Owner' || id === currentUser.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  await prisma.users.update({ where: { id }, data: { role } });
  res.json({ success: true });
});

export default router; 