import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { paginationSchema } from '../utils/pagination';

const router = Router();

/**
 * GET /users?limit=&offset=
 * מחזיר { items, total, limit, offset }
 * items = [{ id, name, email, created_at, groups: [{ id, name, status, created_at }, ...] }]
 */
router.get('/', async (req, res, next) => {
  try {
    const { limit, offset } = paginationSchema.parse(req.query);

    const [rows, total] = await Promise.all([
      prisma.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { id: 'asc' },
        include: {
          groups: {
            include: { group: true }
          }
        }
      }),
      prisma.user.count()
    ]);


    const items = rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      created_at: u.created_at,
      groups: u.groups.map(g => g.group)
    }));

    res.json({ items, total, limit, offset });
  } catch (err) {
    next(err);
  }
});

export default router;
