#!/usr/bin/env node
/**
 * 图片清单生成脚本
 * 自动扫描 imgs 目录下的图片，生成 manifest.json
 * 运行方式: node scripts/generate-manifest.js
 */

const fs = require('fs');
const path = require('path');

const imgsDir = path.join(__dirname, '..', 'imgs');
const manifestPath = path.join(imgsDir, 'manifest.json');

try {
  // 读取 imgs 目录
  const files = fs.readdirSync(imgsDir);

  // 过滤出图片文件（支持 webp、png、jpg、jpeg、gif）
  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.webp', '.png', '.jpg', '.jpeg', '.gif'].includes(ext);
  });

  // 提取文件名（不含扩展名）并排序
  const imageNames = imageFiles
    .map(file => path.basename(file, path.extname(file)))
    .sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      // 如果都是数字，按数字排序
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      // 否则按字符串排序
      return a.localeCompare(b);
    });

  // 生成清单
  const manifest = {
    count: imageNames.length,
    images: imageNames,
    generatedAt: new Date().toISOString()
  };

  // 写入 manifest.json
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`✅ 成功生成图片清单！`);
  console.log(`📁 扫描目录: ${imgsDir}`);
  console.log(`🖼️  发现图片: ${manifest.count} 张`);
  console.log(`📄 清单位置: ${manifestPath}`);

} catch (err) {
  console.error('❌ 生成清单失败:', err.message);
  process.exit(1);
}
