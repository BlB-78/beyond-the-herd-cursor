var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_cors = __toESM(require("cors"), 1);
var import_vite = require("vite");

// src/server/payments.ts
var import_stripe = __toESM(require("stripe"), 1);

// src/server/supabaseAdmin.ts
var import_supabase_js = require("@supabase/supabase-js");
var url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
var serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
function getSupabaseAdmin() {
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY and Supabase URL are required on the server.");
  }
  return (0, import_supabase_js.createClient)(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
async function getUserFromBearer(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const admin = getSupabaseAdmin();
  const {
    data: { user },
    error
  } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// src/server/fulfillment.ts
async function fulfillPurchase(userId, courseId, provider, providerCheckoutId, amount, currency) {
  const admin = getSupabaseAdmin();
  const { data: existing } = await admin.from("enrollments").select("id").eq("user_id", userId).eq("course_id", courseId).maybeSingle();
  if (!existing) {
    await admin.from("enrollments").insert({ user_id: userId, course_id: courseId });
  }
  await admin.from("payments").upsert(
    {
      user_id: userId,
      course_id: courseId,
      provider,
      provider_checkout_id: providerCheckoutId,
      amount,
      currency,
      status: "completed"
    },
    { onConflict: "provider,provider_checkout_id" }
  );
}
async function recordPendingPayment(userId, courseId, provider, providerCheckoutId, amount, currency) {
  const admin = getSupabaseAdmin();
  await admin.from("payments").upsert(
    {
      user_id: userId,
      course_id: courseId,
      provider,
      provider_checkout_id: providerCheckoutId,
      amount,
      currency,
      status: "pending"
    },
    { onConflict: "provider,provider_checkout_id" }
  );
}
function usdToDzd(amountUsd) {
  const rate = Number(process.env.CHARGILY_DZD_PER_USD || 135);
  return Math.max(100, Math.round(amountUsd * rate));
}

// src/server/chargily.ts
var import_crypto = __toESM(require("crypto"), 1);
function getChargilyKey() {
  return process.env.CHARGILY_API_KEY || null;
}
function chargilyApiBase() {
  const mode = process.env.CHARGILY_MODE === "live" ? "live" : "test";
  return `https://pay.chargily.net/${mode}/api/v2`;
}
async function chargilyFetch(path2, init) {
  const key = getChargilyKey();
  if (!key) throw new Error("CHARGILY_API_KEY not configured");
  const res = await fetch(`${chargilyApiBase()}${path2}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...init?.headers
    }
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = typeof data === "object" && data && "message" in data ? String(data.message) : `Chargily API error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
function appOrigin() {
  return process.env.APP_URL || "http://localhost:3000";
}
function isChargilyConfigured() {
  return !!getChargilyKey();
}
function registerChargilyRoutes(app2) {
  app2.post("/api/checkout/chargily/create-session", async (req, res) => {
    try {
      if (!isChargilyConfigured()) {
        return res.status(503).json({
          error: "Chargily is not configured. Add CHARGILY_API_KEY to .env.local."
        });
      }
      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: "Sign in required" });
      const { courseId, paymentMethod } = req.body;
      if (!courseId) return res.status(400).json({ error: "courseId required" });
      const admin = getSupabaseAdmin();
      const { data: course, error: courseErr } = await admin.from("courses").select("id, title, price").eq("id", courseId).maybeSingle();
      if (courseErr || !course) {
        return res.status(404).json({ error: "Course not found" });
      }
      const priceUsd = Number(course.price);
      if (priceUsd <= 0) {
        return res.status(400).json({ error: "This course is free \u2014 enroll directly." });
      }
      const { data: enrolled } = await admin.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
      if (enrolled) {
        return res.status(400).json({ error: "Already enrolled in this course" });
      }
      const amountDzd = usdToDzd(priceUsd);
      const origin = appOrigin();
      const body = {
        amount: amountDzd,
        currency: "dzd",
        success_url: `${origin}/checkout/success?provider=chargily`,
        failure_url: `${origin}/courses/${courseId}`,
        webhook_endpoint: `${origin}/api/webhooks/chargily`,
        description: `${course.title} \u2014 Beyond The Herd`,
        locale: "fr",
        metadata: {
          userId: user.id,
          courseId
        }
      };
      if (paymentMethod === "edahabia" || paymentMethod === "cib") {
        body.payment_method = paymentMethod;
      }
      const checkout = await chargilyFetch("/checkouts", {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (!checkout.checkout_url || !checkout.id) {
        return res.status(500).json({ error: "Invalid Chargily checkout response" });
      }
      await recordPendingPayment(
        user.id,
        courseId,
        "chargily",
        checkout.id,
        amountDzd,
        "dzd"
      );
      res.json({
        url: checkout.checkout_url,
        checkoutId: checkout.id,
        amountDzd,
        currency: "dzd"
      });
    } catch (err) {
      console.error("chargily create-session:", err);
      res.status(500).json({
        error: err instanceof Error ? err.message : "Chargily checkout failed"
      });
    }
  });
  app2.post("/api/checkout/chargily/verify", async (req, res) => {
    try {
      if (!isChargilyConfigured()) {
        return res.status(503).json({ error: "Chargily not configured" });
      }
      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: "Sign in required" });
      const { checkoutId } = req.body;
      if (!checkoutId) return res.status(400).json({ error: "checkoutId required" });
      const checkout = await chargilyFetch(`/checkouts/${checkoutId}`);
      const meta = checkout.metadata ?? {};
      if (meta.userId !== user.id) {
        return res.status(403).json({ error: "Checkout does not belong to this account" });
      }
      if (checkout.status !== "paid") {
        return res.status(400).json({
          error: "Payment not completed yet",
          status: checkout.status
        });
      }
      const courseId = meta.courseId;
      if (!courseId) {
        return res.status(400).json({ error: "Invalid checkout metadata" });
      }
      await fulfillPurchase(
        user.id,
        courseId,
        "chargily",
        checkout.id,
        checkout.amount,
        checkout.currency || "dzd"
      );
      res.json({ enrolled: true, courseId });
    } catch (err) {
      console.error("chargily verify:", err);
      res.status(500).json({ error: "Verification failed" });
    }
  });
}
async function handleChargilyWebhook(rawBody, signature) {
  const key = getChargilyKey();
  if (!key) throw new Error("Chargily not configured");
  if (!signature) throw new Error("Missing signature header");
  const computed = import_crypto.default.createHmac("sha256", key).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signature, "utf8");
  const compBuf = Buffer.from(computed, "utf8");
  if (sigBuf.length !== compBuf.length || !import_crypto.default.timingSafeEqual(sigBuf, compBuf)) {
    throw new Error("Invalid Chargily webhook signature");
  }
  const event = JSON.parse(rawBody.toString("utf8"));
  if (event.type === "checkout.paid") {
    const checkout = event.data;
    const userId = checkout.metadata?.userId;
    const courseId = checkout.metadata?.courseId;
    if (userId && courseId && checkout.id) {
      await fulfillPurchase(
        userId,
        courseId,
        "chargily",
        checkout.id,
        checkout.amount,
        checkout.currency || "dzd"
      );
    }
  }
  return { received: true };
}

// src/server/payments.ts
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new import_stripe.default(key);
}
function appOrigin2() {
  return process.env.APP_URL || "http://localhost:3000";
}
function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY;
}
function registerPaymentRoutes(app2) {
  app2.get("/api/checkout/providers", (_req, res) => {
    res.json({
      stripe: isStripeConfigured(),
      chargily: isChargilyConfigured()
    });
  });
  registerChargilyRoutes(app2);
  app2.post("/api/checkout/create-session", async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(503).json({
          error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local."
        });
      }
      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: "Sign in required" });
      const { courseId } = req.body;
      if (!courseId) return res.status(400).json({ error: "courseId required" });
      const admin = getSupabaseAdmin();
      const { data: course, error: courseErr } = await admin.from("courses").select("id, title, price").eq("id", courseId).maybeSingle();
      if (courseErr || !course) {
        return res.status(404).json({ error: "Course not found" });
      }
      const price = Number(course.price);
      if (price <= 0) {
        return res.status(400).json({ error: "This course is free \u2014 enroll directly." });
      }
      const { data: enrolled } = await admin.from("enrollments").select("id").eq("user_id", user.id).eq("course_id", courseId).maybeSingle();
      if (enrolled) {
        return res.status(400).json({ error: "Already enrolled in this course" });
      }
      const origin = appOrigin2();
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: Math.round(price * 100),
              product_data: {
                name: course.title,
                description: "Beyond The Herd \u2014 course enrollment"
              }
            },
            quantity: 1
          }
        ],
        success_url: `${origin}/checkout/success?provider=stripe&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/courses/${courseId}`,
        client_reference_id: user.id,
        metadata: {
          courseId,
          userId: user.id
        }
      });
      if (!session.url) {
        return res.status(500).json({ error: "Failed to create checkout session" });
      }
      await recordPendingPayment(user.id, courseId, "stripe", session.id, price, "usd");
      res.json({ url: session.url, provider: "stripe" });
    } catch (err) {
      console.error("stripe create-session:", err);
      res.status(500).json({ error: "Checkout failed" });
    }
  });
  app2.post("/api/checkout/verify", async (req, res) => {
    try {
      const stripe = getStripe();
      if (!stripe) {
        return res.status(503).json({ error: "Stripe not configured" });
      }
      const user = await getUserFromBearer(req.headers.authorization);
      if (!user) return res.status(401).json({ error: "Sign in required" });
      const { sessionId } = req.body;
      if (!sessionId) return res.status(400).json({ error: "sessionId required" });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.metadata?.userId !== user.id) {
        return res.status(403).json({ error: "Session does not belong to this account" });
      }
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed yet" });
      }
      const courseId = session.metadata?.courseId;
      if (!courseId) {
        return res.status(400).json({ error: "Invalid session metadata" });
      }
      await fulfillPurchase(
        user.id,
        courseId,
        "stripe",
        session.id,
        (session.amount_total ?? 0) / 100,
        session.currency ?? "usd"
      );
      res.json({ enrolled: true, courseId, provider: "stripe" });
    } catch (err) {
      console.error("stripe verify:", err);
      res.status(500).json({ error: "Verification failed" });
    }
  });
}
async function handleStripeWebhook(rawBody, signature) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    throw new Error("Stripe webhook not configured");
  }
  const event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;
    if (userId && courseId && session.id) {
      await fulfillPurchase(
        userId,
        courseId,
        "stripe",
        session.id,
        (session.amount_total ?? 0) / 100,
        session.currency ?? "usd"
      );
    }
  }
  return { received: true };
}

// server.ts
import_dotenv.default.config({ path: ".env.local" });
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(
  (0, import_cors.default)({
    origin: process.env.APP_URL ?? true
  })
);
app.post(
  "/api/webhooks/stripe",
  import_express.default.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      await handleStripeWebhook(
        req.body,
        req.headers["stripe-signature"]
      );
      res.json({ received: true });
    } catch (err) {
      console.error("Stripe webhook error:", err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }
);
app.post(
  "/api/webhooks/chargily",
  import_express.default.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      await handleChargilyWebhook(
        req.body,
        req.headers["signature"]
      );
      res.json({ received: true });
    } catch (err) {
      console.error("Chargily webhook error:", err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }
);
app.use(import_express.default.json());
registerPaymentRoutes(app);
app.get("/api/analysis", async (_req, res) => {
  try {
    const Parser = (await import("rss-parser")).default;
    const parser = new Parser({
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    try {
      const feed = await parser.parseURL("https://www.investing.com/rss/news_1.rss");
      const analysis = feed.items.slice(0, 15).map((item) => {
        let summaryText = item.contentSnippet || item.content || "";
        if (summaryText.length < 20) {
          summaryText = "Click to read full analysis and market breakdown from our trusted financial sources.";
        }
        return {
          id: item.guid || item.link,
          title: item.title,
          summary: summaryText,
          link: item.link,
          date: item.pubDate || (/* @__PURE__ */ new Date()).toISOString(),
          author: item.creator || item.author || "Investing.com",
          category: item.categories?.[0] ?? "Analysis"
        };
      });
      return res.json(analysis);
    } catch {
      return res.json(FALLBACK_ANALYSIS);
    }
  } catch (err) {
    console.error("Error fetching analysis:", err);
    res.status(500).json({ error: "Failed to fetch analysis" });
  }
});
var FALLBACK_ANALYSIS = [
  {
    id: "1",
    title: "XAU/USD: Gold Trading Strategy for 2025",
    summary: "Gold (XAU/USD) has been one of the most profitable instruments for professional traders...",
    link: "https://www.dailyfx.com/gold",
    date: "2026-05-20T00:00:00Z",
    author: "Market Analyst",
    category: "Analysis"
  },
  {
    id: "2",
    title: "Risk:Reward Ratios Explained",
    summary: "The risk:reward ratio is the single most important concept in trading...",
    link: "https://www.forexlive.com/education",
    date: "2026-05-20T00:00:00Z",
    author: "Education Desk",
    category: "Risk Management"
  }
];
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
