export async function onRequest(context) {
  // 1. 【配置】你上传了多少张图片？
  const totalImages = 57; // 假设你有 5 张，请根据实际数量修改
  
  // 2. 【配置】图片路径
  const path = "/imgs/"; 

  // 3. 生成随机数
  const randomId = Math.floor(Math.random() * totalImages) + 1;

  // 4. 【关键修改】这里必须改成 .webp
  const imageUrl = `${path}${randomId}.webp`;

  try {
    const url = new URL(context.request.url);
    // 构造完整的内部请求地址
    const fullImageUrl = `${url.origin}${imageUrl}`;
    
    // 去获取图片
    const imageResponse = await fetch(fullImageUrl);

    // 如果找不到图片 (比如你填了 10 张，实际只有 5 张)，返回错误提示
    if (!imageResponse.ok) {
      return new Response(`Image not found: ${imageUrl}`, { status: 404 });
    }

    // 5. 返回图片
    return new Response(imageResponse.body, {
      headers: {
        // 【关键修改】告诉浏览器这是 webp 格式
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
}
