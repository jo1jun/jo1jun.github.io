// Deterministic composition: use the real portrait, never a generated face.
// Requires @napi-rs/canvas. Run: node scripts/build-social-card.cjs
// Optional: SOCIAL_CARD_FONT=/path/to/Arial.ttf for a reproducible font.
const { writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');

async function main() {
  const root = resolve(__dirname, '..');
  const font = process.env.SOCIAL_CARD_FONT;
  if (font && !GlobalFonts.registerFromPath(font, 'Social Card')) {
    throw new Error('Could not load the requested font.');
  }
  const family = font ? '"Social Card"' : 'Arial';
  const [background, portrait] = await Promise.all([
    loadImage(resolve(root, 'images/personal-hero.webp')),
    loadImage(resolve(root, 'images/profile.webp')),
  ]);
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');

  // Match the homepage's cover crop and vertical position (40%).
  const scale = Math.max(canvas.width / background.width, canvas.height / background.height);
  const width = background.width * scale;
  const height = background.height * scale;
  ctx.drawImage(background, (canvas.width - width) / 2, (canvas.height - height) * 0.4, width, height);

  // Darken only the background, before adding the unmodified portrait.
  const shade = ctx.createLinearGradient(0, 0, 850, 0);
  shade.addColorStop(0, 'rgba(2, 8, 20, 0.64)');
  shade.addColorStop(0.5, 'rgba(2, 8, 20, 0.30)');
  shade.addColorStop(1, 'rgba(2, 8, 20, 0)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const photo = { x: 72, y: 110, size: 220 };
  const crop = { x: 0, y: 60, size: 240 };
  if (portrait.width !== 240 || portrait.height !== 320) {
    throw new Error('Portrait dimensions changed; review its crop before rebuilding.');
  }
  const reference = createCanvas(photo.size, photo.size);
  const refCtx = reference.getContext('2d');
  refCtx.drawImage(portrait, crop.x, crop.y, crop.size, crop.size, 0, 0, photo.size, photo.size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(photo.x + photo.size / 2, photo.y + photo.size / 2, photo.size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(reference, photo.x, photo.y);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(photo.x + photo.size / 2, photo.y + photo.size / 2, photo.size / 2, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `60px ${family}`;
  ctx.fillText('Wonjun Jo', 72, 408);
  ctx.font = `28px ${family}`;
  ctx.fillText('Toward Embodied AI Agent', 72, 452);

  // Assert that compositing did not retouch/recolor any interior portrait pixels.
  const expected = refCtx.getImageData(0, 0, photo.size, photo.size).data;
  const actual = ctx.getImageData(photo.x, photo.y, photo.size, photo.size).data;
  let verified = 0;
  for (let y = 0; y < photo.size; y++) {
    for (let x = 0; x < photo.size; x++) {
      if (Math.hypot(x + 0.5 - photo.size / 2, y + 0.5 - photo.size / 2) >= photo.size / 2 - 3) continue;
      const offset = (y * photo.size + x) * 4;
      for (let c = 0; c < 4; c++) {
        if (actual[offset + c] !== expected[offset + c]) throw new Error('Portrait pixel mismatch.');
      }
      verified++;
    }
  }
  const destination = resolve(root, 'images/og-card-v6.jpg');
  await writeFile(destination, await canvas.encode('jpeg', 96));
  console.log(`Saved ${destination} (1200 x 630); ${verified} portrait pixels verified before JPEG encoding.`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
