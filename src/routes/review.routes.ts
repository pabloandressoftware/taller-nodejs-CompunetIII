import { Router } from "express";

export const reviewRouter = Router();

reviewRouter.get('/test', (req, res) => {
  res.json({ message: 'API funcionando en review' });
});