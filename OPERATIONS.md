# Lunar Talisman 独立站运营接入清单

当前项目已经具备前台展示、后台管理、商品上传、服务端订单存储、订单导出、基础 SEO 与法务页面。正式商用前建议按下面顺序接入真实服务。

## 1. 域名与 SEO

- 在 `public/sitemap.xml` 中把 `https://lunar-talisman.netlify.app` 替换成你的正式域名。
- 在 `public/robots.txt` 中同步替换 sitemap 地址。
- 到 Google Search Console 提交正式域名和 sitemap。

## 2. 后台安全

当前 `/admin` 已改为 Netlify Functions 服务端鉴权。正式部署后请在 Netlify 设置以下环境变量：

```env
LUNAR_ADMIN_ACCOUNT=Lunar Talisman
LUNAR_ADMIN_PASSWORD=你的后台密码
LUNAR_ADMIN_SESSION_SECRET=至少32位随机字符串
```

注意：

- 不要把后台密码写入前端代码。
- 不要使用 `VITE_` 前缀保存后台密码，`VITE_` 会暴露到浏览器。
- `/admin` 已设置 `X-Robots-Tag: noindex, nofollow, noarchive`，并在 `robots.txt` 中禁止抓取。

## 3. 商品与图片

当前后台上传商品会通过 Netlify Functions 保存到 Netlify Blobs，并同步到前台已上架商品入口。后续如果商品规模变大，建议升级到 Supabase / Neon / PlanetScale 等数据库。

- 商品表：id、名称、系列、价格、库存、图片、状态、描述、SEO 字段。
- 图片存储：Cloudinary / Supabase Storage / S3。
- 前台读取数据库中的 `上架` 商品。

## 4. 支付与订单

当前前台商品详情页会创建服务端订单，后台订单管理会从服务端读取订单，并支持 CSV 下载，字段包含客户地址。

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

## 8. 阿里云域名隐私保护

域名隐私保护需要在阿里云控制台完成，代码无法代替注册商设置。建议检查：

1. 阿里云控制台 → 域名 → 域名列表 → 选择你的域名。
2. 开启“域名隐私保护 / WHOIS 信息保护”（如果该后缀支持）。
3. 域名持有人信息不要填写个人住址，优先使用品牌/公司可公开地址。
4. 域名联系人邮箱使用品牌邮箱，不要使用个人邮箱。
5. 开启阿里云账号 MFA / 二次验证。
6. DNS 解析只保留必要记录，删除无用 A/CNAME/TXT 记录。
7. Netlify 后台开启 HTTPS，确认 SSL 证书状态为 Active。
8. 如果使用 Cloudflare，可再开启代理、防爬、WAF 与隐藏源站能力。
