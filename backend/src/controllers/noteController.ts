import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export async function getNote(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const problemId = String(req.params.problemId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const note = await prisma.note.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId
        }
      }
    });

    return res.json({ markdownText: note?.markdownText || '' });
  } catch (error: any) {
    console.error('Get note error:', error);
    return res.status(500).json({ error: 'Failed to retrieve note' });
  }
}

export async function saveNote(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const problemId = String(req.params.problemId);
    const { markdownText } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (markdownText === undefined) {
      return res.status(400).json({ error: 'markdownText is required' });
    }

    const note = await prisma.note.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId
        }
      },
      update: {
        markdownText
      },
      create: {
        userId,
        problemId,
        markdownText
      }
    });

    return res.json({ message: 'Note saved successfully', note });
  } catch (error: any) {
    console.error('Save note error:', error);
    return res.status(500).json({ error: 'Failed to save note' });
  }
}

export async function deleteNote(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const problemId = String(req.params.problemId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.note.deleteMany({
      where: {
        userId,
        problemId
      }
    });

    return res.json({ message: 'Note deleted successfully' });
  } catch (error: any) {
    console.error('Delete note error:', error);
    return res.status(500).json({ error: 'Failed to delete note' });
  }
}
