/**
 * Imports media scraped by `instagram-media-scraper/scraper.js` into the
 * `InstagramMedia` table: uploads each file to Cloudinary and upserts a row
 * keyed on its per-file `shortcode` (idempotent — safe to re-run as new
 * posts get scraped). Also writes a classification report grouping items
 * by month with a simple event-keyword heuristic, so old/past events can be
 * manually promoted into real `Event` records via the Admin Create Event screen.
 *
 * Usage: npx tsx scripts/import-instagram-media.ts [path-to-downloads-dir]
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm', 'mkv']);

const EVENT_KEYWORDS = [
  // Arabic
  'ورشة', 'ندوة', 'لقاء', 'تكوين', 'دورة', 'مؤتمر', 'اجتماع', 'ملتقى',
  // French
  'atelier', 'conférence', 'formation', 'séminaire', 'rencontre', 'congrès',
  // English
  'workshop', 'seminar', 'conference', 'training', 'meetup', 'event',
];

interface SidecarMeta {
  shortcode?: string;
  media_id?: string;
  description?: string;
  date?: string;
  post_date?: string;
  post_url?: string;
  username?: string;
  extension?: string;
}

interface ImportedRow {
  shortcode: string;
  mediaType: string;
  caption: string | null;
  postedAt: Date;
  sourceUrl: string | null;
  url: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

function suggestCategory(caption: string | null): 'event' | 'announcement' {
  if (!caption) return 'announcement';
  const lower = caption.toLowerCase();
  return EVENT_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase())) ? 'event' : 'announcement';
}

async function uploadToCloudinary(filePath: string, shortcode: string, mediaType: string) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 'instagram-media',
    resource_type: mediaType === 'video' ? 'video' : 'image',
    public_id: shortcode,
    overwrite: false,
  });

  const thumbnailUrl =
    mediaType === 'video' ? result.secure_url.replace(/\.[^./]+$/, '.jpg') : undefined;

  return { url: result.secure_url as string, thumbnailUrl };
}

async function main() {
  const downloadsDir = path.resolve(
    process.argv[2] || path.join(__dirname, '../../instagram-media-scraper/downloads'),
  );

  if (!fs.existsSync(downloadsDir)) {
    console.error(`Downloads directory not found: ${downloadsDir}`);
    process.exit(1);
  }

  console.log(`Scanning ${downloadsDir} for scraped media...`);
  const sidecarFiles = walk(downloadsDir).filter((f) => {
    const mediaFile = f.slice(0, -'.json'.length);
    return fs.existsSync(mediaFile);
  });
  console.log(`Found ${sidecarFiles.length} media files with metadata.`);

  let imported = 0;
  let skipped = 0;
  const failed: Array<{ file: string; reason: string }> = [];
  const importedRows: ImportedRow[] = [];

  for (const sidecarFile of sidecarFiles) {
    const mediaFile = sidecarFile.slice(0, -'.json'.length);
    try {
      const meta: SidecarMeta = JSON.parse(fs.readFileSync(sidecarFile, 'utf-8'));
      const shortcode = meta.shortcode || meta.media_id;
      if (!shortcode) {
        failed.push({ file: mediaFile, reason: 'No shortcode/media_id in metadata' });
        continue;
      }

      const existing = await prisma.instagramMedia.findUnique({ where: { shortcode } });
      if (existing) {
        skipped++;
        continue;
      }

      const extension = (meta.extension || path.extname(mediaFile).slice(1)).toLowerCase();
      const mediaType = VIDEO_EXTENSIONS.has(extension) ? 'video' : 'image';
      const caption = meta.description?.trim() || null;
      const postedAt = new Date(meta.date || meta.post_date || Date.now());
      const sourceUrl = meta.post_url || null;

      const { url, thumbnailUrl } = await uploadToCloudinary(mediaFile, shortcode, mediaType);

      await prisma.instagramMedia.create({
        data: { shortcode, mediaType, url, thumbnailUrl, caption, postedAt, sourceUrl },
      });

      importedRows.push({ shortcode, mediaType, caption, postedAt, sourceUrl, url });
      imported++;
      console.log(`  imported: ${shortcode} (${mediaType})`);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      failed.push({ file: mediaFile, reason });
      console.error(`  FAILED: ${mediaFile} — ${reason}`);
    }
  }

  console.log(`\nDone. Imported ${imported}, skipped ${skipped} (already imported), failed ${failed.length}.`);

  writeReport(importedRows, failed);
}

function writeReport(rows: ImportedRow[], failed: Array<{ file: string; reason: string }>) {
  const outDir = path.join(__dirname, 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const reportPath = path.join(outDir, 'instagram-import-report.md');

  const byMonth = new Map<string, ImportedRow[]>();
  for (const row of rows) {
    const key = `${row.postedAt.getFullYear()}-${String(row.postedAt.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(row);
  }
  const months = [...byMonth.keys()].sort().reverse();

  let md = `# Instagram Import Report\n\nGenerated ${new Date().toISOString()}\n\n`;
  md += `Imported this run: **${rows.length}**. Failed: **${failed.length}**.\n\n`;
  md += `This groups newly-imported media by month with a simple keyword-based suggestion `;
  md += `("event" vs "announcement"). Review the "event" rows and manually create matching `;
  md += `\`Event\` records for real past events via the Admin → Create Event screen, using the Cloudinary URL as the event image.\n\n`;

  for (const month of months) {
    const items = byMonth.get(month)!;
    md += `## ${month} (${items.length} items)\n\n`;
    md += `| Date | Type | Caption | Suggested | Cloudinary URL | Source post |\n`;
    md += `|---|---|---|---|---|---|\n`;
    for (const item of items) {
      const snippet = (item.caption || '').replace(/\s+/g, ' ').slice(0, 80).replace(/\|/g, '\\|');
      const category = suggestCategory(item.caption);
      md += `| ${item.postedAt.toISOString().slice(0, 10)} | ${item.mediaType} | ${snippet} | ${category} | [link](${item.url}) | ${item.sourceUrl ? `[link](${item.sourceUrl})` : ''} |\n`;
    }
    md += `\n`;
  }

  if (failed.length) {
    md += `## Failed\n\n`;
    for (const f of failed) {
      md += `- \`${f.file}\`: ${f.reason}\n`;
    }
  }

  fs.writeFileSync(reportPath, md, 'utf-8');
  console.log(`Report written to ${reportPath}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
