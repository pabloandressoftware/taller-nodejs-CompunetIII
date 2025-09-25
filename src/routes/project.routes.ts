import { Router } from "express";

export const projectRouter = Router();

projectRouter.get('/test', (req, res) => {
  res.json({ message: 'API funcionando en project' });
});