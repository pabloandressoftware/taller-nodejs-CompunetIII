import { Router } from "express";

export const router = Router();

router.get('/test', (req, res) => {
  res.json({ message: 'API funcionando' });
});