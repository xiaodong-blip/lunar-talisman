# Lunar Talisman · production handoff

The storefront is prepared for a server-verified PayPal checkout, secure orders, shipment updates, support requests, transactional email, and real storefront metrics. No payment or email credential is stored in the client bundle.

## What to configure in Netlify

Open **Site configuration → Environment variables**, add the values from `.env.example`, then redeploy. Do not create variables with a `VITE_` prefix unless they are intentionally public.

| Variable | Required for | Notes |
| --- | --- | --- |
| `SITE_URL` | payment returns and email links | `https://lunartalisman.com` |
| `PAYPAL_ENVIRONMENT` | PayPal | Start with `sandbox`; use `live` only after testing |
| `PAYPAL_CLIENT_ID` | PayPal | Server-only |
| `PAYPAL_CLIENT_SECRET` | PayPal | Server-only; never paste it into chat or source code |
| `PAYPAL_WEBHOOK_ID` | independent payment confirmation | Created after registering the webhook |
| `RESEND_API_KEY` | transactional email | Optional until email is ready |
| `ORDER_EMAIL_FROM` | transactional email | Must use a verified Resend domain |
| `ORDER_NOTIFICATION_EMAIL` | internal order alerts | Your brand operations inbox |
| `BRAND_SUPPORT_EMAIL` | customer support | Public support mailbox |
| `LUNAR_ADMIN_*` | admin login | Keep the existing secure values; rotate any password exposed previously |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | GA4 + Search Console reporting | Entire service-account JSON; server-only |
| `GOOGLE_OAUTH_CLIENT_ID` | GA4 + Search Console reporting alternative | Use together with the OAuth secret and refresh token |
| `GOOGLE_OAUTH_CLIENT_SECRET` | GA4 + Search Console reporting alternative | Server-only Netlify secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | GA4 + Search Console reporting alternative | Server-only Netlify secret with Analytics + Search Console read scopes |
| `GA4_PROPERTY_ID` | GA4 reporting | Numeric GA4 property ID, not `G-...` measurement ID |
| `GSC_SITE_URL` | Search Console reporting | Exact verified property, e.g. `https://lunartalisman.com/` |

## Daily traffic reporting

The protected `/admin` traffic view always shows the latest seven-day storefront-event
integrity data. This source is useful for confirming that the storefront records
page views and checkout events, but it does not represent users, sessions, traffic
source, country, device, or organic search.

To show official Google data in the same view, use either a service account or
an OAuth refresh-token credential:

1. Create a Google Cloud service account and download its JSON key.
2. Add the service account email as **Viewer** to the GA4 property and **Owner** or
   **Full user** to the verified Search Console property.
3. In Netlify, add `GOOGLE_SERVICE_ACCOUNT_JSON`, `GA4_PROPERTY_ID`, and
   `GSC_SITE_URL`, then redeploy.
4. Open `/admin` → `流量监控`. The page reports GA4 users, sessions, page views,
   events, and Search Console clicks, impressions, CTR, and average position for
   the most recent complete seven-day UTC range. It displays a configuration or
   access error instead of inventing missing data.

If the service-account key download is unavailable, an OAuth refresh-token
credential can be used instead. Add `GOOGLE_OAUTH_CLIENT_ID`,
`GOOGLE_OAUTH_CLIENT_SECRET`, and `GOOGLE_OAUTH_REFRESH_TOKEN` as Netlify
secrets, grant the token the `analytics.readonly` and `webmasters.readonly`
scopes, and keep `GA4_PROPERTY_ID` and `GSC_SITE_URL` configured.

The deployed `daily-analytics-snapshot` Scheduled Function runs at 09:00
Asia/Shanghai every day and retains the last 90 daily snapshots in Netlify Blob
storage. The protected Admin traffic page shows the most recent 14 snapshots for
the preceding complete UTC day. Search Console can lag the current calendar date
because Google processes search reporting asynchronously.

## PayPal setup: exact sequence

1. In PayPal Developer, create a **Sandbox Business** account and a REST API app.
2. Put its Client ID and Secret into the Netlify variables above and set `PAYPAL_ENVIRONMENT=sandbox`.
3. Redeploy the site. The cart will now show **Pay securely with PayPal**.
4. In the PayPal app's Webhooks section, register:

   `https://lunartalisman.com/.netlify/functions/paypal-webhook`

5. Subscribe to at least `PAYMENT.CAPTURE.COMPLETED`; copy the generated Webhook ID into `PAYPAL_WEBHOOK_ID`.
6. Test the complete buyer journey with a Sandbox buyer:
   - add a real listed product;
   - complete PayPal payment;
   - return to `/cart`;
   - confirm a paid order appears in `/admin`;
   - confirm the tracking page works using the order number and checkout email;
   - issue one test refund from Admin and check PayPal Sandbox.
7. Only after all tests pass, create the **Live** PayPal app, replace Client ID/Secret/Webhook ID, set `PAYPAL_ENVIRONMENT=live`, and repeat a low-value live verification purchase.

The platform verifies paid amount, currency, local order reference, capture status, and webhook signature. It does not trust a browser payment-success message.

## Email setup

1. Create a Resend account and verify a sending domain.
2. Add `RESEND_API_KEY`, a verified `ORDER_EMAIL_FROM`, and `ORDER_NOTIFICATION_EMAIL`.
3. Test:
   - payment confirmation to customer and operations;
   - shipment status update from Admin;
   - Contact Us and Refund & Returns request confirmations.

## Operations now supported

- Pending orders are created server-side and become paid only after PayPal capture verification.
- The Admin console can update fulfilment and tracking data; customer shipment emails are sent when Resend is configured.
- The Admin console can submit a PayPal refund for a paid PayPal order.
- Public tracking requires both order number and checkout email; it never returns address, phone, notes, or payment details.
- Contact and refund forms write securely to server storage and can notify your operations inbox.
- Admin metrics use real server-side storefront events and confirmed paid orders rather than sample revenue.
- IndexNow is enabled. Every admin product create, price/stock/status edit, or removal notifies
  the canonical home page, crystal collection, and affected product detail URLs. The **商品上传**
  panel also has a manual **提交给搜索引擎** button for re-submitting the current published
  admin catalogue. The public key file is intentionally deployed at the site root.

## Release checks

- `npm run build`
- `npm run lint`
- A Sandbox PayPal purchase/cancel/refund test
- Customer email / internal order alert test
- CSV order export test
- Check Netlify Function logs after the first transaction
- Keep Netlify, PayPal, Resend, GitHub, registrar, and email-account MFA enabled
