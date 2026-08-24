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
