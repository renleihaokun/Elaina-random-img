// 图片清单缓存
let manifestCache = null;
let manifestCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟缓存

/**
 * 获取图片清单
 * @param {string} origin - 站点根 URL
 * @returns {Promise<Object>} 清单对象 { count, images }
 */
async function getManifest(origin) {
  const now = Date.now();

  // 如果缓存有效，直接返回
  if (manifestCache && (now - manifestCacheTime) < CACHE_DURATION) {
    return manifestCache;
  }

  try {
    const response = await fetch(`${origin}/imgs/manifest.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status}`);
    }
    const manifest = await response.json();

    // 更新缓存
    manifestCache = manifest;
    manifestCacheTime = now;

    return manifest;
  } catch (err) {
    // 如果获取失败但有缓存，返回缓存
    if (manifestCache) {
      console.warn('Using cached manifest due to error:', err.message);
      return manifestCache;
    }
    throw err;
  }
}

export async function onRequest(context) {
  // 0. 【内容协商分流】检查请求来源
  const accept = context.request.headers.get('Accept') || '';

  // 如果是浏览器访问（Accept 包含 text/html），重定向到前端页面
  if (accept.includes('text/html')) {
    return Response.redirect(`${new URL(context.request.url).origin}/elaina`, 302);
  }

  try {
    const url = new URL(context.request.url);

    // 1. 获取图片清单
    const manifest = await getManifest(url.origin);

    if (!manifest.count || manifest.count === 0) {
      return new Response('No images available', { status: 503 });
    }

    // 2. 生成随机数并选择图片
    const randomIndex = Math.floor(Math.random() * manifest.count);
    const imageName = manifest.images[randomIndex];

    // 3. 构造图片 URL（使用清单中的文件名，需要找到实际文件扩展名）
    // 由于清单存储的是不含扩展名的文件名，我们需要尝试常见扩展名
    const extensions = ['.webp', '.png', '.jpg', '.jpeg', '.gif'];
    let imageUrl = null;
    let imageResponse = null;

    for (const ext of extensions) {
      const testUrl = `${url.origin}/imgs/${imageName}${ext}`;
      const response = await fetch(testUrl);
      if (response.ok) {
        imageUrl = testUrl;
        imageResponse = response;
        break;
      }
    }

    // 如果找不到图片，返回错误提示
    if (!imageResponse || !imageResponse.ok) {
      return new Response(`Image not found: ${imageName}`, { status: 404 });
    }

    // 4. 返回图片
    return new Response(imageResponse.body, {
      headers: {
        "Content-Type": imageResponse.headers.get('Content-Type') || 'image/webp',
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
}
