import { Router } from "express";

export const taskRouter = Router();

taskRouter.get('/test', (req, res) => {
  res.json({ message: 'API funcionando en task' });
});