import {Router} from 'express';
import {prisma} from '../lib/prisma';
import {paginationSchema} from '../utils/pagination';

const router = Router();

/**
 * GET /groups?limit=&offset=
 * מחזיר { items, total, limit, offset }
 * items = [{ id, name, status, created_at, users: [{ id, name, email, created_at }, ...] }]
 */
router.get('/', async (req, res, next) => {
    try {
        const {limit, offset} = paginationSchema.parse(req.query);

        const [rows, total] = await Promise.all([
            prisma.group.findMany({
                skip: offset,
                take: limit,
                orderBy: {id: 'asc'},
                include: {
                    users: {
                        include: {user: true}
                    }
                }
            }),
            prisma.group.count()
        ]);

        const items = rows.map(g => ({
            id: g.id,
            name: g.name,
            status: g.status,
            created_at: g.created_at,
            users: g.users.map(u => u.user)
        }));

        res.json({items, total, limit, offset});
    } catch (err) {
        next(err);
    }
});
router.delete('/:groupId/users/:userId', async (req, res, next) => {
    const groupId = Number(req.params.groupId);
    const userId = Number(req.params.userId);
    if (!Number.isInteger(groupId) || !Number.isInteger(userId) || groupId <= 0 || userId <= 0) {
        return res.status(400).json({error: 'Invalid ids'});
    }

    try {
        await prisma.$transaction(async (tx) => {

            const link = await tx.userGroups.findUnique({
                where: {user_id_group_id: {user_id: userId, group_id: groupId}}
            });
            if (!link) {
                const err: any = new Error('User not in this group');
                err.statusCode = 404;
                throw err;
            }


            await tx.userGroups.delete({
                where: {user_id_group_id: {user_id: userId, group_id: groupId}}
            });


            const remain = await tx.userGroups.count({where: {group_id: groupId}});


            await tx.group.update({
                where: {id: groupId},
                data: {status: remain === 0 ? 'empty' : 'notEmpty'}
            });
        });

        res.status(200).json({
      message: 'User unlinked from group.',
      groupId,
      userId
    });
    } catch (err) {
        next(err);
    }
});
export default router;
