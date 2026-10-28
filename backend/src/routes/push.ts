import type { Express } from 'express';
import { requireAuth } from '../middlewares/auth';
import { registerPushDevice, unregisterPushDevice } from '../services/push';
export function pushRoutes(app: Express) {
  app.put('/api/push/devices', requireAuth, async (req, res) => res.json(await registerPushDevice(req.userId!, req.sessionId!, req.body)));
  app.delete('/api/push/devices/:id', requireAuth, async (req, res) => {
    await unregisterPushDevice(req.userId!, String(req.params.id), req.body?.secret); res.status(204).end();
  });
}
