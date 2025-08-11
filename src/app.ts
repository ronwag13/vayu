import express from 'express';
import { errorMiddleware } from './middleware/error';
import usersRouter from './routes/users';
import groupsRouter from './routes/groups';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/users', usersRouter);
app.use('/groups', groupsRouter);

app.use(errorMiddleware);
export default app;
