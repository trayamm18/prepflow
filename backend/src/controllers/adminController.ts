import { Request, Response } from 'express';
import { PrismaClient, ProblemDifficulty } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'prepflow_super_access_secret_key_2026';
const ACCESS_TOKEN_EXPIRY = '15m';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function adminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate token with role: 'admin'
    const accessToken = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    return res.json({
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error during admin login' });
  }
}

export async function addProblem(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      title,
      category,
      difficulty,
      problemStatement,
      sampleInput,
      sampleOutput,
      hint1,
      hint2,
      codeTemplate,
      isStriverSheet,
      striverStep,
      striverTopic,
      topics, // Array of strings (names)
      companies // Array of strings (names)
    } = req.body;

    if (!title || !category || !difficulty || !problemStatement || !sampleInput || !sampleOutput || !codeTemplate) {
      return res.status(400).json({ error: 'All core problem fields are required' });
    }

    // Create topic and company connections
    const topicConnect = topics && Array.isArray(topics)
      ? topics.map((name: string) => ({
          where: { name },
          create: { name }
        }))
      : [];

    const companyConnect = companies && Array.isArray(companies)
      ? companies.map((name: string) => ({
          where: { name },
          create: { name }
        }))
      : [];

    const problem = await prisma.problem.create({
      data: {
        title,
        slug: slugify(title) + '-' + Math.floor(1000 + Math.random() * 9000),
        category,
        difficulty: String(difficulty).toUpperCase() as ProblemDifficulty,
        problemStatement,
        sampleInput,
        sampleOutput,
        hint1: hint1 || null,
        hint2: hint2 || null,
        codeTemplate,
        isStriverSheet: !!isStriverSheet,
        striverStep: striverStep || null,
        striverTopic: striverTopic || null,
        topics: {
          connectOrCreate: topicConnect
        },
        companies: {
          connectOrCreate: companyConnect
        }
      },
      include: {
        topics: true,
        companies: true
      }
    });

    return res.status(201).json({
      message: 'Coding problem created successfully',
      problem
    });
  } catch (error: any) {
    console.error('Add problem error:', error);
    return res.status(500).json({ error: 'Failed to create coding problem' });
  }
}

export async function editProblem(req: AuthenticatedRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const {
      title,
      category,
      difficulty,
      problemStatement,
      sampleInput,
      sampleOutput,
      hint1,
      hint2,
      codeTemplate,
      isStriverSheet,
      striverStep,
      striverTopic,
      topics, // Array of strings (names)
      companies // Array of strings (names)
    } = req.body;

    const existingProblem = await prisma.problem.findUnique({
      where: { id }
    });

    if (!existingProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Update topic and company connections
    const topicConnect = topics && Array.isArray(topics)
      ? topics.map((name: string) => ({
          where: { name },
          create: { name }
        }))
      : [];

    const companyConnect = companies && Array.isArray(companies)
      ? companies.map((name: string) => ({
          where: { name },
          create: { name }
        }))
      : [];

    const problem = await prisma.problem.update({
      where: { id },
      data: {
        title: title || undefined,
        slug: title ? slugify(title) + '-' + id.slice(0, 4) : undefined,
        category: category || undefined,
        difficulty: difficulty ? (String(difficulty).toUpperCase() as ProblemDifficulty) : undefined,
        problemStatement: problemStatement || undefined,
        sampleInput: sampleInput || undefined,
        sampleOutput: sampleOutput || undefined,
        hint1: hint1 !== undefined ? hint1 : undefined,
        hint2: hint2 !== undefined ? hint2 : undefined,
        codeTemplate: codeTemplate || undefined,
        isStriverSheet: isStriverSheet !== undefined ? !!isStriverSheet : undefined,
        striverStep: striverStep !== undefined ? striverStep : undefined,
        striverTopic: striverTopic !== undefined ? striverTopic : undefined,
        topics: topics ? {
          set: [], // clear existing
          connectOrCreate: topicConnect
        } : undefined,
        companies: companies ? {
          set: [], // clear existing
          connectOrCreate: companyConnect
        } : undefined
      },
      include: {
        topics: true,
        companies: true
      }
    });

    return res.json({
      message: 'Coding problem updated successfully',
      problem
    });
  } catch (error: any) {
    console.error('Edit problem error:', error);
    return res.status(500).json({ error: 'Failed to update coding problem' });
  }
}

export async function deleteProblem(req: AuthenticatedRequest, res: Response) {
  try {
    const id = String(req.params.id);

    const existingProblem = await prisma.problem.findUnique({
      where: { id }
    });

    if (!existingProblem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    await prisma.problem.delete({
      where: { id }
    });

    return res.json({ message: 'Problem deleted successfully' });
  } catch (error: any) {
    console.error('Delete problem error:', error);
    return res.status(500).json({ error: 'Failed to delete coding problem' });
  }
}
