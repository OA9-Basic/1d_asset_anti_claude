# 📚 دليل الاختبار والإنتاج - نظام الدفع بالعملات المشفرة

## 🎯 نظرة عامة

هذا الدليل يساعدك على اختبار نظام الدفع بالعملات المشفرة في بيئة التطوير قبل نقله إلى الإنتاج.

---

## ✅ الخطوة 1: التحقق من صحة الكود

### 1.1 تشغيل ESLint
```bash
npm run lint
```
**النتيجة المتوقعة**: فقط تحذيرات (warnings) وليست أخطاء (errors)

### 1.2 تشغيل TypeScript Type Check
```bash
npm run type-check
```

**ملاحظة**: إذا ظهرت أخطاء تتعلق بـ Prisma، قم بتشغيل:
```bash
npx prisma generate
```

### 1.3 تشغيل Prisma Migration
```bash
npx prisma migrate dev --name add_crypto_payment_system
npx prisma generate
```

---

## 🔧 الخطوة 2: إعداد البيئة

### 2.1 إنشاء ملف `.env.local`

انسخ `.env.example` إلى `.env.local`:

```bash
cp .env.example .env.local
```

### 2.2 الحصول على مفاتيح API

#### A. Alchemy API Keys (مطلوب)

1. اذهب إلى https://dashboard.alchemy.com/
2. سجّل حساب جديد
3. أنشئ app جديد لكل شبكة:
   - **Polygon Mainnet**
   - **BNB Smart Chain**
4. انسخ API keys إلى `.env.local`

#### B. CoinGecko API Key (اختياري لكن موصى به)

1. اذهب إلى https://www.coingecko.com/en/api
2. سجّل حساب مجاني
3. احصل على API key (النسخة المجانية: 100 call/دقيقة)
4. أضفه إلى `.env.local`

### 2.3 إنشاء HD Wallet Mnemonic (⚠️ مهم جداً!)

**تحذير أمني**: يجب عمل هذا على جهاز **غير متصل بالإنترنت** (air-gapped)

```bash
# على جهاز OFFLINE
node -e "const bip39 = require('bip39'); console.log(bip39.generateMnemonic());"

# OUTPUT EXAMPLE (لا تستخدم هذا أبداً):
abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about

# اكتب الكلمات الـ 12 على ورقة
# NEVER تخزنها رقمياً أو على الإنترنت
# هذا هو seed principal لجميع العناوين
```

أضف الـ mnemonic إلى `.env.local`:
```env
HD_WALLET_MNEMONIC="your_twelve_word_mnemonic_here"
```

### 2.4 إنشاء Encryption Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

أضف الناتج إلى `.env.local`:
```env
ENCRYPTION_KEY="your_32_character_hex_key_here"
```

### 2.5 إنشاء Webhook Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

أضف الناتج إلى `.env.local`:
```env
ALCHEMY_WEBHOOK_SECRET="your_random_webhook_secret"
```

---

## 🧪 الخطوة 3: اختبار النظام محلياً

### 3.1 تشغيل الخادم

```bash
npm run dev
```

### 3.2 اختبار API Endpoints

#### A. إنشاء Deposit Order

```bash
curl -X POST http://localhost:3000/api/wallet/deposit-order \
  -H "Content-Type: application/json" \
  -d '{
    "usdAmount": 10,
    "cryptoCurrency": "USDT_POLYGON"
  }'
```

**النتيجة المتوقعة**:
```json
{
  "success": true,
  "depositOrder": {
    "id": "clx1234567890",
    "usdAmount": 10,
    "cryptoAmount": "10.101010",
    "cryptoCurrency": "USDT_POLYGON",
    "network": "Polygon Mainnet",
    "depositAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "qrCode": "ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "expiresAt": "2024-01-26T22:30:00.000Z",
    "priceLocked": {
      "usdPrice": 1.00,
      "expiresAt": "2024-01-26T22:30:00.000Z"
    },
    "confirmationsRequired": 30
  }
}
```

#### B. الحصول على Deposit Orders

```bash
curl -X GET http://localhost:3000/api/wallet/deposit-order
```

### 3.3 اختبار Webhook (محاكاة)

```bash
curl -X POST http://localhost:3000/api/webhooks/alchemy \
  -H "Content-Type: application/json" \
  -H "x-alchemy-signature: test_signature" \
  -d '{
    "webhookId": "wh_test123",
    "id": "evt_test456",
    "createdAt": "2024-01-26T20:00:00.000Z",
    "type": "ADDRESS_ACTIVITY",
    "event": {
      "network": "MATIC_MAINNET",
      "activity": [{
        "fromAddress": "0xSender...",
        "toAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "value": "0xde0b6b3a7640000",
        "hash": "0xabc123..."
      }]
    }
  }'
```

---

## 🌐 الخطوة 4: الاختبار على Testnet

### 4.1 إعداد Testnet في Alchemy

1. في Alchemy Dashboard، أنشئ apps لـ:
   - **Polygon Mumbai Testnet**
   - **BSC Testnet**

2. أضف مفاتيح الـ testnet إلى `.env.local`:
```env
ALCHEMY_API_KEY_TESTNET="your_mumbai_testnet_key"
ALCHEMY_API_KEY_BSC_TESTNET="your_bsc_testnet_key"
```

### 4.2 الحصول على Test Crypto

#### Polygon Mumbai (MATIc)
```bash
# اذهب إلى
https://faucet.polygon.technology/

# أو
curl -X POST https://faucet.polygon.technology/v1/claim \
  -H "Content-Type: application/json" \
  -d '{"address":"YOUR_WALLET_ADDRESS"}'
```

#### BSC Testnet (tBNB)
```bash
# اذهب إلى
https://testnet.bnbchain.org/faucet-smart
```

### 4.3 اختبار كامل على Testnet

1. أنشئ deposit order بعملة testnet
2. أرسل test crypto إلى العنوان
3. راقب الـ webhook logs في قاعدة البيانات
4. تحقق من تحديث رصيد المحفظة

---

## 🚀 الخطوة 5: النشر إلى الإنتاج

### 5.1 اختيار منصة الاستضافة

#### الخيار A: Vercel (موصى به لـ Next.js)
```bash
npm install -g vercel
vercel
```

#### الخيار B: Railway
```bash
npm install -g railway
railway login
railway init
railway up
```

#### الخيار C: VPS (مثل DigitalOcean, AWS, etc.)

```bash
# Build
npm run build

# Start
npm run start
# أو باستخدام PM2
pm2 start npm --name "1d-asset" -- start
```

### 5.2 إعداد Environment Variables في الإنتاج

**تحذير**: لا تضع أبداً:
- HD_WALLET_MNEMONIC الحقيقي
- ENCRYPTION_KEY الحقيقي
- ALCHEMY_WEBHOOK_SECRET الحقيقي

في الكود أو في git!

استخدم متغيرات البيئة في platform الخاص بك:

#### في Vercel:
```bash
vercel env add HD_WALLET_MNEMONIC
vercel env add ENCRYPTION_KEY
vercel env add ALCHEMY_WEBHOOK_SECRET
# ... etc
```

#### في Railway:
اذهب إلى Dashboard > Variables > Add New Variable

### 5.3 تشغيل Database Migration في الإنتاج

```bash
# على خادم الإنتاج
npx prisma migrate deploy
npx prisma generate
```

### 5.4 إعداد Alchemy Webhooks في الإنتاج

#### A. الحصول على Webhook URL

عنوان الـ webhook سيكون:
```
https://your-domain.com/api/webhooks/alchemy
```

#### B. إنشاء Webhook في Alchemy

```bash
# باستخدام Alchemy Notify API
curl -X POST https://dashboard.alchemyapi.io/api/create-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ALCHEMY_API_KEY" \
  -d '{
    "webhookUrl": "https://your-domain.com/api/webhooks/alchemy",
    "webhookType": "ADDRESS_ACTIVITY",
    "networks": ["MATIC_MAINNET", "BNB_SMART_CHAIN"],
    "addresses": ["YOUR_DEPOSIT_ADDRESS"]
  }'
```

أو عبر Dashboard:
1. اذهب إلى https://dashboard.alchemy.com/
2. اختر Notify > Webhooks
3. أنشئ webhook جديد
4. أضف عنوان الـ webhook
5. أضف العناوين التي تريد مراقبتها

---

## ✅ الخطوة 6: التحقق قبل الإطلاق

### 6.1 Checklist الأمان

- [ ] تم إنشاء HD_WALLET_MNEMONIC على جهاز OFFLINE
- [ ] تم كتابة الـ mnemonic على ورقة فقط
- [ ] xpub فقط مخزن على السيرفر (not xpriv)
- [ ] المفاتيح الخاصة مشفرة بـ AES-256
- [ ] ENCRYPTION_KEY في env فقط
- [ ] تم تفعيل webhook signature verification
- [ ] تم تفعيل rate limiting على deposit API
- [ ] جميع inputs موثقة (validated)
- [ ] تم تفعيل audit logging
- [ ] تم اختبار webhooks على testnet أولاً

### 6.2 Checklist الأداء

- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] جميع الصور محسّنة
- [ ] lazy loading مفعّل
- [ ] code splitting يعمل بشكل صحيح

### 6.3 Checklist الوظائف

- [ ] إنشاء deposit order يعمل
- [ ] عرض QR code يعمل
- [] عداد الوقت يعمل (15 minutes)
- [ ] Webhook يستقبل notifications
- [ ] Transaction verification يعمل
- [ ] رصيد المحفظة يتحدث بشكل صحيح
- [ ] Audit logs تسجل كل شيء

---

## 📊 الخطوة 7: المراقبة والصيانة

### 7.1 مراقبة Webhooks

تحقق من:
- عدد webhooks المستلمة
- معدل النجاح/الفشل
- وقت المعالجة

```sql
-- Check webhook logs
SELECT * FROM WebhookLog
ORDER BY receivedAt DESC
LIMIT 100;

-- Check success rate
SELECT
  processed,
  COUNT(*) as count
FROM WebhookLog
GROUP BY processed;
```

### 7.2 مراقبة الودائع

```sql
-- Check recent deposits
SELECT * FROM DepositOrder
WHERE status = 'COMPLETED'
ORDER BY completedAt DESC
LIMIT 50;

-- Check pending deposits
SELECT * FROM DepositOrder
WHERE status IN ('CREATED', 'AWAITING_PAYMENT', 'CONFIRMING')
AND expiresAt > datetime('now');
```

### 7.3 مراقبة الأمان

```sql
-- Check audit logs for suspicious activity
SELECT * FROM AuditLog
WHERE severity IN ('ERROR', 'CRITICAL')
ORDER BY createdAt DESC
LIMIT 100;

-- Check failed transactions
SELECT * FROM AuditLog
WHERE action LIKE '%FAILED%'
OR success = false
ORDER BY createdAt DESC;
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Invalid signature" على webhook

**الحل**:
1. تحقق من أن ALCHEMY_WEBHOOK_SECRET متطابق في env و Alchemy dashboard
2. تأكد من أن Webhook URL صحيح
3. تحقق من headers: `x-alchemy-signature`

### المشكلة: "Transaction not found"

**الحل**:
1. انتظر بضع ثوانٍ - Alchemy قد يكون لم يفهرسه بعد
2. تحقق من network parameter صحيح
3. تأكد من txHash صحيح

### المشكلة: "Price expired"

**الحل**:
1. المستخدم يجب أن ينشئ deposit order جديد بجديدة جديدة
2. وقت الصلاحية 15 دقيقة افتراضياً

### المشكلة: "Amount mismatch"

**الحل**:
1. المستخدم أرسل مبلغ مختلف قليلاً
2. النظام لديه tolerance 1%
3. تحقق من slippageTolerance

### المشكلة: Webhook لا يستقبل notifications

**الحل**:
1. تحقق من أن Alchemy webhook URL صحيح
2. تأكد من أن السيرفر accessible من الإنترنت
3. تحقق من firewall rules
4. استخدم ngrok أو similar للاختبار محلياً:
```bash
ngrok http 3000
```

---

## 🔗 روابط مفيدة

- [Alchemy Documentation](https://www.alchemy.com/docs)
- [CoinGecko API](https://www.coingecko.com/en/api)
- [Ethers.js v6](https://docs.ethers.org/v6/)
- [BIP44 Standard](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## 💬 الدعم

إذا واجهت أي مشاكل:
1. راجع CRYPTO_PAYMENT_IMPLEMENTATION.md
2. تحقق من logs في قاعدة البيانات
3. راجع Alchemy dashboard
4. تحقق من environment variables

**تذكر**: هذا نظام مالي - اختبه دائماً على testnet قبل mainnet!
