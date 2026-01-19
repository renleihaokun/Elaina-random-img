export async function onRequest(context) {
  // 【配置】这里填你上传了多少张图片
  const totalImages = 51; 
  
  // 【配置】图片所在的文件夹路径 (如果放在根目录就留空字符串 "")
  const path = "/imgs/"; 

  // 1. 生成 1 到 totalImages 之间的随机整数
  const randomId = Math.floor(Math.random() * totalImages) + 1;

  // 2. 拼接图片地址
  // 例如：当前域名/imgs/3.jpg
  const imageUrl = `${path}${randomId}.jpg`;

  // 3. 两种返回方式，任选其一：

  // 方式一：重定向 (推荐，省资源，浏览器地址栏会变)
  // return Response.redirect(imageUrl, 302);

  // 方式二：反代 (地址栏不变，直接显示图片)
  // 注意：fetch 自己的站点资源需要用完整的 URL
  const url = new URL(context.request.url);
  const fullImageUrl = `${url.origin}${imageUrl}`;
  
  const imageResponse = await fetch(fullImageUrl);
  return new Response(imageResponse.body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
