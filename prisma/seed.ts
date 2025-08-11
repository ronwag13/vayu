import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

    const admins = await prisma.group.create({data: {name: 'Admins', status: 'notEmpty'}});
    const users = await prisma.group.create({data: {name: 'Users', status: 'notEmpty'}});

    const john = await prisma.user.create({data: {name: 'John Doe', email: 'john@example.com'}});
    const jane = await prisma.user.create({data: {name: 'Jane Smith', email: 'jane@example.com'}});


    await prisma.userGroups.create({data: {user_id: john.id, group_id: admins.id}});
    await prisma.userGroups.create({data: {user_id: jane.id, group_id: users.id}});
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
