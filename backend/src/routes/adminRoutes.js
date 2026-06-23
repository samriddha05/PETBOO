const express = require('express');
const { mockDB } = require('../utils/mockData');

const db = require('../utils/db');
let generateEmbedding = null;

try {
  generateEmbedding = require('../utils/embedder').generateEmbedding;
} catch {
  console.log('[adminRoutes] Embedder unavailable — knowledge will be stored without vectors.');
}

const router = express.Router();

router.post('/knowledge', async (req, res) => {
  try {
    const textContext = req.body.text || req.body.content;
    const text = textContext;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text/content is required' });
    }

    /* ── Try real DB with embeddings ── */
    if (process.env.DATABASE_URL) {
      try {
        let embeddingString = null;
        if (generateEmbedding) {
          const embeddingArray = await generateEmbedding(text);
          embeddingString = `[${embeddingArray.join(',')}]`;
        }

        if (embeddingString) {
          await db.query(
            'INSERT INTO "KnowledgeDocument" (id, text, embedding, "createdAt") VALUES (gen_random_uuid(), $1, $2::vector, NOW())',
            [text, embeddingString]
          );
        } else {
          await db.query(
            'INSERT INTO "KnowledgeDocument" (id, text, "createdAt") VALUES (gen_random_uuid(), $1, NOW())',
            [text]
          );
        }

        return res.status(201).json({ message: 'Knowledge document ingested successfully' });
      } catch (dbErr) {
        console.warn('[adminRoutes] DB ingestion failed, falling back to mock:', dbErr.message);
      }
    }

    /* ── Fallback: store in memory ── */
    mockDB.addKnowledge(text);
    return res.status(201).json({ message: 'Knowledge document ingested successfully (in-memory mode)' });
  } catch (error) {
    console.error('Error ingesting knowledge document:', error);
    return res.status(500).json({ error: 'Failed to ingest knowledge document', details: error.message });
  }
});
// Dev-only endpoint to trigger/preview emails (works in simulator mode or with SMTP configured)
if (process.env.ENABLE_DEV_ENDPOINTS === 'true' || process.env.NODE_ENV !== 'production') {
  router.post('/dev/send-test-email', async (req, res) => {
    try {
      const payload = req.body || {};
      const { sendAppointmentConfirmationEmail } = require('../utils/mailer');

      await sendAppointmentConfirmationEmail({
        userEmail: payload.userEmail || 'test@petsphere.app',
        userName: payload.userName || 'Test User',
        petName: payload.petName || 'Buddy',
        vetName: payload.vetName || 'Dr. Demo',
        date: payload.date || new Date().toISOString(),
        time: payload.time || '10:00 AM',
        type: payload.type || 'chat',
        notes: payload.notes || 'Test email from dev endpoint',
      });

      return res.status(200).json({ success: true, message: 'Test email dispatched/simulated.' });
    } catch (err) {
      console.error('[adminRoutes] /dev/send-test-email error:', err.message);
      return res.status(500).json({ error: 'Failed to send test email', details: err.message });
    }
  });
}
module.exports = router;
