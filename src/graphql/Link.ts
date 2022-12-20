import {arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg} from 'nexus';

export const Link = objectType({    // определение объектного типа Link cо всеми её полями
    name: "Link",
    definition(t){
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
        t.nonNull.dateTime("createdAt");
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {  // 1
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            }
        })
    }
})

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        //: feed - получить все записи с возможностью фильтрации (передаём в аргументы строку, по которой ищется совпадение)
        t.nonNull.field("feed", {  // 1
            type: "Feed",
            args:{
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),  // 1
            },
            async resolve(parent, args, context, info) {    // 4
                const where = args.filter   // 2
                    ? {
                        OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } },
                        ],
                    }
                    : {};
                const links = await context.prisma.link.findMany({
                    where,  // если where={}, то вернёт все записи
                    skip: args?.skip as number | undefined,
                    take: args?.skip as number | undefined,
                    orderBy: args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,  // 2
                });

                const count = await context.prisma.link.count({ where });  // посчитает кол-во Link в базе, подпадающих под условия фильтрации
                const id = `main-feed:${JSON.stringify(args)}`;  // уникальное id, складывающееся из приставки и динамической части

                return {
                    links,
                    count,
                    id
                }
            },
        });
        // получить одну запись по id: findFirst - устарело, переделать в соотв. с "feed"
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
                const { userId } = context;

                if(!userId){
                    throw new Error("Cannot post without logging in!")
                }

                return context.prisma.link.create({
                    data: {
                        description: args.description,
                        url: args.url,
                        postedBy: {connect: {id: userId}}
                    }
                });
            },
        });

        // обновить одну запись по id: update
        // УСТАРЕЛО ,ПЕРЕДЕЛАТЬ!!!!! в соответствии с "post", если есть критичные разницы
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
        // УСТАРЕЛО ,ПЕРЕДЕЛАТЬ!!!!! в соответствии с "post", если есть критичные разницы
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

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: Link }); // 1
        t.nonNull.int("count"); // 2
        t.id("id");  // 3
    },
});
