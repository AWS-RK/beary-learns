const sharp = require('sharp');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

const iconSvg = Buffer.from(`
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#FFF9F0"/>
  <circle cx="512" cy="530" r="280" fill="#8B6914"/>
  <circle cx="310" cy="300" r="110" fill="#8B6914"/>
  <circle cx="714" cy="300" r="110" fill="#8B6914"/>
  <circle cx="310" cy="300" r="65" fill="#C49A3C"/>
  <circle cx="714" cy="300" r="65" fill="#C49A3C"/>
  <ellipse cx="512" cy="560" rx="210" ry="190" fill="#C49A3C"/>
  <circle cx="435" cy="480" r="38" fill="#2D1B00"/>
  <circle cx="589" cy="480" r="38" fill="#2D1B00"/>
  <circle cx="448" cy="468" r="13" fill="white"/>
  <circle cx="602" cy="468" r="13" fill="white"/>
  <ellipse cx="512" cy="590" rx="52" ry="38" fill="#2D1B00"/>
  <path d="M 465 635 Q 512 685 559 635" stroke="#2D1B00" stroke-width="12" fill="none" stroke-linecap="round"/>
</svg>
`);

const adaptiveSvg = Buffer.from(`
<svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
  <circle cx="512" cy="530" r="280" fill="#8B6914"/>
  <circle cx="310" cy="300" r="110" fill="#8B6914"/>
  <circle cx="714" cy="300" r="110" fill="#8B6914"/>
  <circle cx="310" cy="300" r="65" fill="#C49A3C"/>
  <circle cx="714" cy="300" r="65" fill="#C49A3C"/>
  <ellipse cx="512" cy="560" rx="210" ry="190" fill="#C49A3C"/>
  <circle cx="435" cy="480" r="38" fill="#2D1B00"/>
  <circle cx="589" cy="480" r="38" fill="#2D1B00"/>
  <circle cx="448" cy="468" r="13" fill="white"/>
  <circle cx="602" cy="468" r="13" fill="white"/>
  <ellipse cx="512" cy="590" rx="52" ry="38" fill="#2D1B00"/>
  <path d="M 465 635 Q 512 685 559 635" stroke="#2D1B00" stroke-width="12" fill="none" stroke-linecap="round"/>
</svg>
`);

async function main() {
  await sharp(iconSvg)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(OUT_DIR, 'icon.png'));
  console.log('✅ assets/images/icon.png');

  await sharp(adaptiveSvg)
    .resize(1024, 1024)
    .png()
    .toFile(path.join(OUT_DIR, 'adaptive-icon.png'));
  console.log('✅ assets/images/adaptive-icon.png');
}

main().catch((err) => { console.error(err); process.exit(1); });
