import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { paginationSchema } from '../utils/pagination';

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const {limit, offset} = paginationSchema.parse(req.query);

        const [rows, total] = await Promise.all([
            prisma.user.findMany({
                skip: offset,
                take: limit,
                orderBy: {id: 'asc'},
                include: {
                    groups: {
                        include: {group: true}
                    }
                }
            }),
            prisma.user.count()
        ]);


        const items = rows.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            status: u.status,
            created_at: u.created_at,
            groups: u.groups.map(g => g.group)
        }));

        res.json({items, total, limit, offset});
    } catch (err) {
        next(err);
    }
});


const statusEnum = z.enum(['pending', 'active', 'blocked']);
const bulkSchema = z.object({
    updates: z.array(z.object({
        id: z.number().int().positive(),
        status: statusEnum
    })).min(1).max(500)
});

router.patch('/status', async (req, res, next) => {
    try {
        const {updates} = bulkSchema.parse(req.body);

        await prisma.$transaction(async (tx) => {
            for (const u of updates) {
                await tx.user.update({
                    where: {id: u.id},
                    data: {status: u.status}
                });
            }
        });

        res.status(200).json({updated: updates.length});
    } catch (err) {
        next(err);
    }
});


export default router;
