import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import {
  registerPaymentRoutes,
  handleStripeWebhook,
  handleChargilyWebhook,
} from './src/server/payments.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: process.env.APP_URL ?? true,
  })
);

app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      await handleStripeWebhook(
        req.body as Buffer,
        req.headers['stripe-signature'] as string | undefined
      );
      res.json({ received: true });
    } catch (err) {
      console.error('Stripe webhook error:', err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }
);

app.post(
  '/api/webhooks/chargily',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      await handleChargilyWebhook(
        req.body as Buffer,
        req.headers['signature'] as string | undefined
      );
      res.json({ received: true });
    } catch (err) {
      console.error('Chargily webhook error:', err);
      res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'unknown'}`);
    }
  }
);

app.use(express.json());

registerPaymentRoutes(app);

app.get('/api/analysis', async (_req, res) => {
  try {
    const Parser = (await import('rss-parser')).default;
    const parser = new Parser({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    try {
      const feed = await parser.parseURL('https://www.investing.com/rss/news_1.rss');
      const analysis = feed.items.slice(0, 15).map((item) => {
        let summaryText = item.contentSnippet || item.content || '';
        if (summaryText.length < 20) {
          summaryText =
            'Click to read full analysis and market breakdown from our trusted financial sources.';
        }
        return {
          id: item.guid || item.link,
          title: item.title,
          summary: summaryText,
          link: item.link,
          date: item.pubDate || new Date().toISOString(),
          author: item.creator || item.author || 'Investing.com',
          category: item.categories?.[0] ?? 'Analysis',
        };
      });
      return res.json(analysis);
    } catch {
      return res.json(FALLBACK_ANALYSIS);
    }
  } catch (err) {
    console.error('Error fetching analysis:', err);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

const FALLBACK_ANALYSIS = [
  {
    id: '1',
    title: 'XAU/USD: Gold Trading Strategy for 2025',
    summary: 'Gold (XAU/USD) has been one of the most profitable instruments for professional traders...',
    link: 'https://www.dailyfx.com/gold',
    date: '2026-05-20T00:00:00Z',
    author: 'Market Analyst',
    category: 'Analysis',
  },
  {
    id: '2',
    title: 'Risk:Reward Ratios Explained',
    summary: 'The risk:reward ratio is the single most important concept in trading...',
    link: 'https://www.forexlive.com/education',
    date: '2026-05-20T00:00:00Z',
    author: 'Education Desk',
    category: 'Risk Management',
  },
];

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
