import {arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg} from 'nexus';
import {Context} from "../context";

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
        t.field("findById", {   // 3
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

            async resolve(parent, args, context) {
                const userId = await checkPermissions("post", 0, context);

                return context.prisma.link.create({
                    data: {
                        description: args.description,
                        url: args.url,
                        postedBy: {connect: {id: userId}}   // подключит к конкретному юзеру (привяжет), если
                                                            // ... мы авторизованы - т.е. передали ЖБТ токен в заголовках
                    }
                });
            },
        });

        // обновить одну запись по id: update.

        t.nonNull.field("update", {
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
                newDescription: stringArg(),
                newUrl: stringArg(),
            },

            async resolve(parent, args, context) {
                const {id, newUrl, newDescription} = args;

                context = <Context>await checkPermissions("update", id, context);

                const result = await context.prisma.link.update({
                    where:{
                        id
                    },
                    data:{
                        url: newUrl,
                        description: newDescription
                    }
                })
                await context.prisma.$disconnect();
                return result;
            },
        });

        // удалить одну запись по id: delete. Возвращает id удалённого объекта или exception

         t.nonNull.field("delete", {
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
            },

            async resolve(parent, args, context) {
                const {id} = args;

                // context содержит экземпляр prisma-client: это удобно, чтобы делать $disconnect();
                context = <Context>await checkPermissions("delete", id, context);

                const result = await context.prisma.link.delete({
                    where:{
                        id:id
                    }
                });
                await context.prisma.$disconnect();
                return result;
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

async function checkPermissions(method:String = "post", id:Number,context:Context){
    // Делает проверки для мутаций. Возвращает userId либо context;
    // context содержит экземпляр prisma-client: это удобно, чтобы делать $disconnect();

    // Если нам не прилетел userId в контексте - значит, ошибка авторизации;
    const {userId} = context;
    if(!userId){
        throw new Error ("Пользователь не авторизован!");
    }

    // Если авторизован + метод = post, то вернём userId;
    if(method.toLowerCase() === "post"){
        return userId;
    }

    // Ищем id автора поста (поста, который ищём по переданному id);
    const linkByid = await context.prisma.link.findFirst({  // Находим пост;
        where:{
            id:id
        },
        select:{
            postedBy:true
        }
    })
    const authorId = linkByid.postedBy.id;  // Вытаскиваем id автора поста;

    if(userId !== authorId){    // Если user, пытающийся править пост, не является его автором (т.е. id не совпали) - ошибка.
        console.log('userId !== authorId', userId, authorId);
        throw new Error(`Cannot ${method} post of other user!`);
    }

    return context;
}

