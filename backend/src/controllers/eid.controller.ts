import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../lib/prisma';

// ─── Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Gemini client factory
const getApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not configured in the environment.');
  return key;
};

const getAI = (): GoogleGenAI => new GoogleGenAI({ apiKey: getApiKey() });

// ─── POST /api/eid/generate ────────────────────────────────────────────
//  Body: { name, interests, dream, photoBase64?, photoMimeType? }
//  Returns: { imageDataUrl, compliment }
export const generate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, interests, dream, photoBase64, photoMimeType } = req.body as {
      name?: string;
      interests?: string;
      dream?: string;
      photoBase64?: string;
      photoMimeType?: string;
    };

    if (!name?.trim() || !interests?.trim() || !dream?.trim()) {
      res.status(400).json({ error: 'name, interests and dream are required.' });
      return;
    }

    const ai = getAI();

    const n = name.trim();
    const i = interests.trim();
    const d = dream.trim();
    const hasPhoto = !!(photoBase64 && photoMimeType);

    // ── Build image-generation prompt ──────────────────────────────────────
    const imagePromptText =
      `Draw a funny, exaggerated caricature illustration of a young Moroccan civic activist named "${n}" ` +
      `who is a proud member of Istiqlal Youth Academy, the youth initiative of the Istiqlal Party in Morocco. ` +
      `They are obsessed with ${i} and in 2030 they have become an unstoppable ${d}. ` +
      `Exaggerate their personality traits based on their interests (${i}) in a funny, affectionate way, ` +
      `for example an oversized microphone, a stack of books, a tiny scales-of-justice mascot at their side, etc. ` +
      `Setting: a festive Traditional Moroccan Eid Celebration in 2030, showing a grand Moroccan salon decorated for a civic gathering. ` +
      `They should be wearing a stylish traditional Moroccan Jellaba or Jabador with a touch of modern flair, ` +
      `perhaps holding a glowing cup of Moroccan mint tea or traditional Eid sweets (like Kaab el Ghazal). ` +
      `The scene should have warm festive lights mixing Moroccan zellige patterns with elegant civic/political motifs, ` +
      `and a banner visible in the scene that reads "Istiqlal Youth Academy" and "Eid Mubarak 2026". ` +
      (hasPhoto
        ? `IMPORTANT: Use the provided reference photo to accurately replicate their face, skin tone, hair style and color, and facial features. Keep them recognizable. `
        : `They look like a confident modern Moroccan person. `) +
      `Art style: vibrant Pixar/cartoon caricature, warm festive colors, fun and inspiring mood, high detail, digital illustration.`;

    const imageParts: Array<Record<string, unknown>> = [{ text: imagePromptText }];
    if (hasPhoto) {
      imageParts.push({ inlineData: { mimeType: photoMimeType, data: photoBase64 } });
    }

    // ── Build compliment prompt ───────────────────────────────────────────
    const complimentPrompt =
      `اكتب كلاما دافئا ومضحكا وممتعا للمعايدة بعيد الفطر أو الأضحى باللهجة المغربية الدارجة لشخص اسمه ${n}، ` +
      `وهو عضو نشيط في الأكاديمية الاستقلالية للشباب بالمغرب. ` +
      `هذا الشخص مهتم بـ ${i} ويحلم بأن يصبح ${d}. ` +
      `دخل شي مزحة خفيفة على اهتماماته (${i}) وكيفاش غايدوز العيد بأسلوب لطيف ومحب، وبارك ليه العيد. ` +
      `الطول: 2 إلى 3 جمل. اكتب فقط الكلام من غير أي شرح أو مقدمة.`;

    // ── Run both in parallel ──────────────────────────────────────────────
    const [imageResult, complimentResult] = await Promise.all([
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: imageParts }] as never,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: complimentPrompt,
      }),
    ]);

    // ── Extract image ─────────────────────────────────────────────────────
    let imageDataUrl: string | null = null;
    const candidate = imageResult.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts as Array<Record<string, unknown>>) {
        const id = part['inlineData'] as { data: string; mimeType: string } | undefined;
        if (id?.data) {
          imageDataUrl = `data:${id.mimeType ?? 'image/png'};base64,${id.data}`;
          break;
        }
      }
    }
    if (!imageDataUrl) {
      res.status(502).json({ error: 'AI did not return an image. Please try again.' });
      return;
    }

    // ── Extract compliment ─────────────────────────────────────────────────
    const compliment = (complimentResult as unknown as { text: string }).text?.trim();
    if (!compliment) {
      res.status(502).json({ error: 'AI did not return a compliment. Please try again.' });
      return;
    }

    // ── Upload generated image to Cloudinary ──────────────────────────────
    let savedImageUrl = imageDataUrl;
    try {
      const uploadResult = await cloudinary.uploader.upload(imageDataUrl, {
        folder: 'eid-submissions',
        resource_type: 'image',
      });
      savedImageUrl = uploadResult.secure_url;
    } catch (uploadErr) {
      console.error('[Eid] Cloudinary upload error (proceeding with base64):', uploadErr);
    }

    // ── Persist submission ─────────────────────────────────────────────────
    try {
      await prisma.eidSubmission.create({
        data: { name: n, interests: i, dream: d, imageUrl: savedImageUrl, compliment },
      });
    } catch (dbErr) {
      console.error('[Eid] DB save error (non-fatal):', dbErr);
    }

    res.json({ imageDataUrl: savedImageUrl, compliment });
  } catch (err: unknown) {
    console.error('[Eid] generate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ─── POST /api/eid/upload-photo ────────────────────────────────────────
export const uploadPhoto = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file as (Express.Multer.File & { path?: string }) | undefined;
    if (!file) {
      res.status(400).json({ error: 'No photo file provided.' });
      return;
    }
    const url: string = (file as unknown as { path: string }).path;
    res.json({ url });
  } catch (err: unknown) {
    console.error('[Eid] uploadPhoto error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

// ─── GET /api/eid/submissions ─────────────────────────────────────────
export const getSubmissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await prisma.eidSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ submissions });
  } catch (err: unknown) {
    console.error('[Eid] getSubmissions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
