import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import prisma from '../lib/prisma';

// ─── GET /api/gallery?type=image|video&category=xxx&page=1&limit=24 ────────
export const listMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(60, Math.max(1, Number.parseInt(String(req.query.limit ?? '24'), 10) || 24));
    const { type, category } = req.query as { type?: string; category?: string };

    const where = {
      ...(type ? { mediaType: type } : {}),
      ...(category ? { category } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.instagramMedia.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.instagramMedia.count({ where }),
    ]);

    res.json({ items, total, page, pageSize: limit, hasMore: page * limit < total });
  } catch (err: unknown) {
    console.error('[Gallery] listMedia error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};

// ─── GET /api/gallery/:id ────────────────────────────────────────────────
export const getMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await prisma.instagramMedia.findUnique({ where: { id: req.params.id } });
    if (!item) {
      res.status(404).json({ error: 'Media not found' });
      return;
    }
    res.json({ item });
  } catch (err: unknown) {
    console.error('[Gallery] getMedia error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};

// ─── POST /api/gallery ── Admin: manual curation ────────────────────────
export const createMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      shortcode, mediaType, url, thumbnailUrl, caption, postedAt, sourceUrl, category, isFeatured,
    } = req.body as {
      shortcode?: string;
      mediaType?: string;
      url?: string;
      thumbnailUrl?: string;
      caption?: string;
      postedAt?: string;
      sourceUrl?: string;
      category?: string;
      isFeatured?: boolean;
    };

    if (!mediaType || !url) {
      res.status(400).json({ error: 'mediaType and url are required.' });
      return;
    }

    const item = await prisma.instagramMedia.create({
      data: {
        shortcode: shortcode?.trim() || `manual-${randomUUID()}`,
        mediaType,
        url,
        thumbnailUrl,
        caption,
        postedAt: postedAt ? new Date(postedAt) : new Date(),
        sourceUrl,
        category,
        isFeatured: !!isFeatured,
      },
    });

    res.status(201).json({ item });
  } catch (err: unknown) {
    console.error('[Gallery] createMedia error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};

// ─── PATCH /api/gallery/:id ── Admin: edit caption/category/featured ────
export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caption, category, isFeatured } = req.body as {
      caption?: string;
      category?: string;
      isFeatured?: boolean;
    };

    const item = await prisma.instagramMedia.update({
      where: { id: req.params.id },
      data: { caption, category, isFeatured },
    });

    res.json({ item });
  } catch (err: unknown) {
    console.error('[Gallery] updateMedia error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};

// ─── DELETE /api/gallery/:id ── Admin ────────────────────────────────────
export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.instagramMedia.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: unknown) {
    console.error('[Gallery] deleteMedia error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    res.status(500).json({ error: message });
  }
};
