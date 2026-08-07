# Lunar Talisman 独立站运营接入清单

当前项目已经具备前台展示、后台管理、商品上传、本地订单导出、基础 SEO 与法务页面。正式商用前建议按下面顺序接入真实服务。

## 1. 域名与 SEO

- 在 `public/sitemap.xml` 中把 `https://lunar-talisman.netlify.app` 替换成你的正式域名。
- 在 `public/robots.txt` 中同步替换 sitemap 地址。
- 到 Google Search Console 提交正式域名和 sitemap。

## 2. 后台安全

当前 `/admin` 是前端本地登录预览。正式上线前必须改成后端鉴权：

- 管理账号和密码放到后端或身份服务，不能写在前端代码里。
- 推荐：Supabase Auth / Firebase Auth / Netlify Identity / 自建 API。
- 后台数据接口需要校验登录态。

## 3. 商品与图片

当前后台上传商品保存到浏览器 localStorage。正式上线前建议：

- 商品表：id、名称、系列、价格、库存、图片、状态、描述、SEO 字段。
- 图片存储：Cloudinary / Supabase Storage / S3。
- 前台读取数据库中的 `上架` 商品。

## 4. 支付与订单

已预留环境变量：

```env
VITE_API_BASE_URL=
VITE_CHECKOUT_URL=
```

建议流程：

1. 前台提交购物车到后端 `/checkout`。
2. 后端创建 Stripe / PayPal 支付会话。
3. 支付成功 webhook 写入订单数据库。
4. 后台订单管理读取真实订单。

## 5. 邮件通知

建议接入 Resend / Brevo / Klaviyo：

- 下单成功
- 发货通知
- Newsletter 订阅
- 满月仪式指南
- 弃购提醒

## 6. 数据分析

已预留：

```env
VITE_GA_MEASUREMENT_ID=
```

填入 GA4 Measurement ID 后会自动启用页面访问追踪。

## 7. 必做验收

- 首页、系列页、商品页、法务页、后台均可访问。
- 后台商品上传后能在前台 `/series/crystals` 出现。
- 商品详情能打开。
- 订单 CSV 可下载，包含客户地址。
- 构建通过：`npm run build`。
