#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
画廊缩略图生成脚本
把 imgs/ 下的原图（4K 级）缩放成 640px 宽的 webp 缩略图，供 /elaina 画廊页使用。
原图保持不动 —— `GET /` 随机图 API 仍然返回原图。

运行方式（需要 Pillow）:
    python scripts/generate-thumbs.py

产物:
    imgs/thumb/<name>.webp          缩略图
    imgs/thumb/manifest.json        { thumbWidth, count, images:[{name,w,h}] }

该步骤在本地离线执行并提交产物，不并入 npm run build
（Cloudflare Pages 的构建镜像里没有 Pillow）。
"""

import json
import os
import sys
from datetime import datetime, timezone

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    sys.stderr.write("缺少 Pillow，请先安装：pip install Pillow\n")
    sys.exit(1)

# ===== 配置 =====
THUMB_WIDTH = 640          # 缩略图最大宽度（卡片约 279 CSS px 宽，DPR2 下 640 足够清晰）
THUMB_QUALITY = 78
THUMB_METHOD = 5           # 0(快) ~ 6(小)
IMAGE_EXTS = ('.webp', '.png', '.jpg', '.jpeg', '.gif')

# Windows 控制台默认可能是 GBK，遇到无法编码的字符不要让脚本崩掉
for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(errors='replace')
    except (AttributeError, ValueError):
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMGS_DIR = os.path.join(ROOT, 'imgs')
OUT_DIR = os.path.join(IMGS_DIR, 'thumb')
MANIFEST_PATH = os.path.join(OUT_DIR, 'manifest.json')


def sort_key(name):
    """数字文件名按数值排序，其余按字符串排序（与 generate-manifest.js 一致）"""
    stem = os.path.splitext(name)[0]
    try:
        return (0, int(stem), '')
    except ValueError:
        return (1, 0, stem)


def main():
    if not os.path.isdir(IMGS_DIR):
        sys.stderr.write('找不到图片目录: %s\n' % IMGS_DIR)
        return 1

    files = [f for f in os.listdir(IMGS_DIR)
             if f.lower().endswith(IMAGE_EXTS) and os.path.isfile(os.path.join(IMGS_DIR, f))]
    files.sort(key=sort_key)

    if not files:
        sys.stderr.write('imgs/ 下没有找到图片\n')
        return 1

    os.makedirs(OUT_DIR, exist_ok=True)

    images = []
    total_src = total_out = 0

    for filename in files:
        name = os.path.splitext(filename)[0]
        src = os.path.join(IMGS_DIR, filename)
        dst = os.path.join(OUT_DIR, name + '.webp')

        with Image.open(src) as im:
            im = im.convert('RGB')
            im.thumbnail((THUMB_WIDTH, THUMB_WIDTH), Image.LANCZOS)
            im.save(dst, 'WEBP', quality=THUMB_QUALITY, method=THUMB_METHOD)
            w, h = im.size

        size_src = os.path.getsize(src)
        size_out = os.path.getsize(dst)
        total_src += size_src
        total_out += size_out

        images.append({'name': name, 'w': w, 'h': h})
        print('  %-12s %4d x %-5d %7.1fKB -> %5.1fKB' % (
            filename, w, h, size_src / 1024, size_out / 1024))

    manifest = {
        'thumbWidth': THUMB_WIDTH,
        'count': len(images),
        'images': images,
        'generatedAt': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
    }

    with open(MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print('')
    print('[OK] 缩略图生成完成')
    print('[DIR] 输出目录: %s' % OUT_DIR)
    print('[IMG] 共 %d 张' % len(images))
    print('[SIZE] 原图 %.2f MB -> 缩略图 %.2f MB (%.1f%%)' % (
        total_src / 1048576, total_out / 1048576,
        100.0 * total_out / total_src if total_src else 0))
    print('[JSON] 清单: %s' % MANIFEST_PATH)
    return 0


if __name__ == '__main__':
    sys.exit(main())
