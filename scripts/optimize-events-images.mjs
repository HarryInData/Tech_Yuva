import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const MAX_WIDTH = 1600;
const MAX_FILE_SIZE_KB = 250;
const EVENTS_DIR = path.resolve('public/events');

async function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      continue;
    }

    const baseName = path.basename(entry.name, ext);
    const webpPath = path.join(dirPath, `${baseName}.webp`);

    try {
      const stats = fs.statSync(fullPath);
      const originalSizeKb = Math.round(stats.size / 1024);

      const image = sharp(fullPath);
      const metadata = await image.metadata();

      const pipeline = image.rotate(); // auto-orient based on EXIF

      if (metadata.width && metadata.width > MAX_WIDTH) {
        pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }

      await pipeline.webp({ quality: 82, effort: 4 }).toFile(webpPath);

      const webpStats = fs.statSync(webpPath);
      const webpSizeKb = Math.round(webpStats.size / 1024);

      console.log(
        `✓ Optimized: ${path.relative('public', fullPath)} (${originalSizeKb} KB) -> ${path.relative('public', webpPath)} (${webpSizeKb} KB)`
      );

      if (webpSizeKb > MAX_FILE_SIZE_KB) {
        console.warn(
          `⚠️ WARNING: Optimized image is ${webpSizeKb} KB, exceeding recommended ${MAX_FILE_SIZE_KB} KB limit: ${webpPath}`
        );
      }
    } catch (err) {
      console.error(`Failed to optimize ${fullPath}:`, err.message);
    }
  }
}

async function run() {
  console.log(`Starting Event Images Optimization for: ${EVENTS_DIR}`);
  if (!fs.existsSync(EVENTS_DIR)) {
    console.error(`Directory not found: ${EVENTS_DIR}`);
    return;
  }
  await processDirectory(EVENTS_DIR);
  console.log('Finished image optimization.');
}

run();
