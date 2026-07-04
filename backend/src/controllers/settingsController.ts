import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export async function getSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          darkMode: true,
          preferredLanguage: 'Java'
        }
      });
    }

    return res.json({ settings });
  } catch (error: any) {
    console.error('Get settings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { darkMode, preferredLanguage } = req.body;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        darkMode: typeof darkMode === 'boolean' ? darkMode : undefined,
        preferredLanguage: preferredLanguage || undefined
      },
      create: {
        userId,
        darkMode: typeof darkMode === 'boolean' ? darkMode : true,
        preferredLanguage: preferredLanguage || 'Java'
      }
    });

    return res.json({ settings });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
}
