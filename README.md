## Elaina-random-img
伊雷娜随机图  
访问<https://elaina.haokun.me>就可以看到美丽的伊雷娜

# 欢迎提交PR！  
把要提交的图片转换成webp放在```/imgs```文件夹下，直接提交即可！

### 新增图片后请重跑缩略图脚本
画廊页只加载 640px 宽的缩略图（原图是 4K，直接加载会非常慢），原图仍然保留给随机图 API 使用。

```bash
npm run thumbs      # 等价于 python scripts/generate-thumbs.py，需要 Pillow
```

产物：`imgs/thumb/<name>.webp` 与 `imgs/thumb/manifest.json`，一并提交即可。

### 访问说明
- 浏览器访问 `/` 会自动跳转到 `/elaina` 画廊页面
- API 调用 `fetch('/')` 会直接返回随机图片（原图）

###### 图片来自网络

---

[English](README-en.md) | [繁體中文](README-zh-TW.md) | [日本語](README-ja.md)
