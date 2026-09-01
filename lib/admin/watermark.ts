import sharp from 'sharp';

export async function addWatermarkToImage(buffer: Buffer, text: string = 'akshayam'): Promise<Buffer> {
  // Get image metadata
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 800;
  const height = metadata.height || 800;

  const fontSize = Math.max(30, Math.floor(width / 20));
  const patternWidth = (text.length * fontSize * 0.6) + 100; // give horizontal gap
  const patternHeight = fontSize * 4; // give vertical gap

  // Create an SVG with a tiled pattern for the watermark
  const svgImage = `
    <svg width="${width}" height="${height}">
      <defs>
        <pattern id="watermark" x="0" y="0" width="${patternWidth}" height="${patternHeight}" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="0" y="${fontSize}" font-family="sans-serif" font-size="${fontSize}px" font-weight="bold" fill="rgba(255, 255, 255, 0.4)" stroke="rgba(0,0,0,0.1)" stroke-width="1">${text}</text>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#watermark)" />
    </svg>
  `;

  const svgBuffer = Buffer.from(svgImage);

  // Composite the watermark over the original image
  return await sharp(buffer)
    .composite([
      {
        input: svgBuffer,
        top: 0,
        left: 0,
      },
    ])
    .toBuffer();
}
