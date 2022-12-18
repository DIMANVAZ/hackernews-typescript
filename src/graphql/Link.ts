import {extendType, intArg, nonNull, objectType, stringArg} from 'nexus';

export const Link = objectType({
    name: "Link",
    definition(t){
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    }
})

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        // получить все записи: feed
        t.nonNull.list.nonNull.field("feed", {   // 3
            type: "Link",   // тип единичный вроде
            resolve(parent, args, context, info) {    // 4
                return context.prisma.link.findMany();   // а выдаёт массив. Хотя его тип выше определён
            },
        });
        // получить одну запись по id: findFirst
        t.field("findFirst", {   // 3
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
            },
            resolve(parent, args, context, info) {    // 4
                const {id} = args;
                return context.prisma.link.findFirst({
                    where: {
                        id: id
                    }
                });
            },
        });
    },
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {

        // добавить одну запись: post - и возвращаем эту запись
        t.nonNull.field("post", {
            type: "Link",
            args: {   // 3
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(parent, args, context) {
                const { description, url } = args;  // просто для примера, что args можно деструктурить

                return context.prisma.link.create({
                    data: {
                        description: args.description,
                        url: args.url
                    }
                })
            },
        });

        // обновить одну запись по id: update
        t.nonNull.field("update", {
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
                newDescription: stringArg(),
                newUrl: stringArg(),
            },

            resolve(parent, args, context) {
                const {id, newUrl, newDescription} = args;

                return context.prisma.link.update({
                    where:{
                        id:id
                    },
                    data:{
                        url: newUrl,
                        description: newDescription
                    }
                })
            },
        });

        // удалить одну запись по id: delete. Возвращаем обновлённый (или нет) массив Links
        t.nonNull.field("delete", {
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
            },

            resolve(parent, args, context) {
                const {id} = args;

                return context.prisma.link.delete({
                    where:{
                        id:id
                    }
                })
            },
        });
    },
});
