import { Router } from "express";

export const playlistRouter = Router();

playlistRouter.get('/test', (req, res) => {
  res.json({ message: 'API funcionando en playlist' });
});