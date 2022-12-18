import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

const seed = async ()=> {
    await prisma.link.create({
        data: {
            description: 'Fullstack tutorial for GraphQL',
            url: 'www.howtographql.com',
        },
    })
}

seed().catch(e => console.log(e)).finally(async() => await prisma.$disconnect())
