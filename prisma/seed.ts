import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

const seed = async ()=> {
    await prisma.link.create({
        data: {
            description: 'онлайн рисовать связи таблиц SQL',
            url: 'https://drawsql.app/',
        },
    });
    await prisma.link.create({
        data: {
            description: 'онлайн тренажёр по SQL',
            url: 'https://sql-academy.org/ru',
        },
    });
    await prisma.link.create({
        data: {
            description: 'консоль яндекс облака',
            url: 'https://console.cloud.yandex.ru/',
        },
    });
}

seed().catch(e => console.log(e)).finally(async() => await prisma.$disconnect())
