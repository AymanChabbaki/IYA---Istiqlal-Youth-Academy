import { Request, Response } from 'express';
import prisma from '../lib/prisma';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

// ─── System prompt: grounds the assistant in the academy's real structure ──
const buildSystemPrompt = (committeeNames: string[]): string => `You are the friendly virtual assistant for Istiqlal Youth Academy (الأكاديمية الاستقلالية للشباب), the youth wing of the Istiqlal Party in Morocco. Your job is to help visitors and members with questions about the academy: its mission (Reflection, Inclusion, Advocacy), its 19 committees, events, membership/registration, and how the site works.

Known committees: ${committeeNames.join(', ')}.

Site sections you can point people to: /events (upcoming events), /gallery (Instagram media), /members, /register (join the academy, choose a committee/region/city), /contact, /blog, /podcasts, /polls.

Rules:
- Keep answers concise (2-4 sentences unless asked for detail), warm, and encouraging of civic participation.
- If asked something outside the academy's scope, answer briefly and steer back to how the academy might relate.
- If unsure about a specific fact (exact dates, staff names), say so honestly and suggest checking /events or /contact rather than inventing details.
- Respond in the same language the user writes in (Arabic, French, or English).`;

// ─── POST /api/chat ── Public chatbot proxy to Groq ────────────────────────
export const sendChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body as { messages?: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required.' });
      return;
    }
    if (messages.length > 20) {
      res.status(400).json({ error: 'Conversation too long.' });
      return;
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: 'Chat is not configured yet.' });
      return;
    }

    const committees = await prisma.committee.findMany({ select: { name: true }, orderBy: { name: 'asc' } });

    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(committees.map((c) => c.name)) },
          ...messages.slice(-20).map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) })),
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('[Chat] Groq API error:', groqRes.status, errText);
      res.status(502).json({ error: 'Chat service is unavailable right now.' });
      return;
    }

    const data = (await groqRes.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      res.status(502).json({ error: 'Chat service returned an empty response.' });
      return;
    }

    res.json({ reply });
  } catch (err: unknown) {
    console.error('[Chat] sendChatMessage error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
