export async function addWatermarkToImage(buffer: Buffer, text: string = 'akshayam'): Promise<Buffer> {
  // Bypassed watermarking completely to fix sharp DLOPEN failure on Vercel
  // Directly returns the original image buffer without any processing
  return buffer;
}
