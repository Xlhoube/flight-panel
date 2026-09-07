const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, drawFn) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG structure
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT
  // Filter byte 0 for each scanline
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0; // None filter
    buffer.copy(
      scanlines,
      y * (width * 4 + 1) + 1,
      y * width * 4,
      (y + 1) * width * 4
    );
  }

  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Simple CRC32 implementation
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = c ^ buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function drawAviationIcon(x, y, w, h) {
  // Normalize
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const distSq = nx * nx + ny * ny;

  // Background: Deep dark slate with subtle vignette
  let r = 10, g = 12, b = 16, a = 255;

  // Rounded squircle border
  const cornerDist = Math.pow(Math.abs(nx), 4) + Math.pow(Math.abs(ny), 4);
  if (cornerDist > 0.85) {
    return [0, 0, 0, 0]; // transparent outside squircle
  }

  // Gold / Amber border
  if (cornerDist > 0.76 && cornerDist <= 0.85) {
    return [245, 158, 11, 255];
  }

  // Draw airplane shape (simple geometric airplane pointing up-right or up)
  // Distance to vertical fuselage
  const isFuselage = Math.abs(nx) < 0.1 && ny > -0.65 && ny < 0.65;
  // Wings
  const isWings = ny > 0.0 && ny < 0.18 && Math.abs(nx) < 0.7;
  // Tail
  const isTail = ny > 0.45 && ny < 0.65 && Math.abs(nx) < 0.35;
  // Nose
  const isNose = ny < -0.55 && ny > -0.75 && Math.abs(nx) < (0.75 + ny);

  if (isFuselage || isWings || isTail || isNose) {
    return [255, 255, 255, 255]; // White airplane
  }

  return [r, g, b, a];
}

const publicDir = path.join(__dirname, '..', 'public');
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPNG(192, 192, drawAviationIcon));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPNG(512, 512, drawAviationIcon));
console.log('Icons generated successfully in public/');
