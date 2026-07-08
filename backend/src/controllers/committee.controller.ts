import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// ─── GET /api/committees ── Public, used by registration/profile dropdowns ──
export const listCommittees = async (_req: Request, res: Response): Promise<void> => {
  try {
    const committees = await prisma.committee.findMany({ orderBy: { name: 'asc' } });
    res.json({ committees });
  } catch (err: unknown) {
    console.error('[Committee] listCommittees error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};

// ─── POST /api/committees ── Admin ──────────────────────────────────────
export const createCommittee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, nameAr } = req.body as { name?: string; nameAr?: string };
    if (!name?.trim()) {
      res.status(400).json({ error: 'name is required.' });
      return;
    }
    const committee = await prisma.committee.create({ data: { name: name.trim(), nameAr } });
    res.status(201).json({ committee });
  } catch (err: unknown) {
    console.error('[Committee] createCommittee error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};

// ─── PATCH /api/committees/:id ── Admin ─────────────────────────────────
export const updateCommittee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, nameAr } = req.body as { name?: string; nameAr?: string };
    const committee = await prisma.committee.update({
      where: { id: req.params.id },
      data: { name, nameAr },
    });
    res.json({ committee });
  } catch (err: unknown) {
    console.error('[Committee] updateCommittee error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};

// ─── DELETE /api/committees/:id ── Admin ────────────────────────────────
export const deleteCommittee = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.committee.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: unknown) {
    console.error('[Committee] deleteCommittee error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};
