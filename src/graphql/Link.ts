import {extendType, intArg, nonNull, objectType, stringArg} from 'nexus';
import {NexusGenObjects} from '../../nexus-typegen'

export const Link = objectType({
    name: "Link",
    definition(t){
        t.nonNull.int("id");
        t.nonNull.string("description");
        t.nonNull.string("url");
    }
})

let links: NexusGenObjects["Link"][]= [   // 1
    {
        id: 1,
        url: "www.howtographql.com",
        description: "Fullstack tutorial for GraphQL",
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website",
    },
];

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        // получить все записи: feed
        t.nonNull.list.nonNull.field("feed", {   // 3
            type: "Link",   // тип единичный вроде
            resolve(parent, args, context, info) {    // 4
                return links;   // а выдаёт массив. Хотя его тип выше определён
            },
        });
        // получить одну запись по id: findOne
        t.field("findOne", {   // 3
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
            },
            resolve(parent, args, context, info) {    // 4
                const {id} = args;
                return links.filter(elem => elem.id === id)[0];
            },
        });
    },
});

export const LinkMutation = extendType({  // 1
    type: "Mutation",
    definition(t) {
        // добавить одну запись: post - и возвращаем эту запись
        t.nonNull.field("post", {  // 2
            type: "Link",
            args: {   // 3
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(parent, args, context) {
                const { description, url } = args;  // 4

                let idCount = links.length + 1;  // 5
                const link = {
                    id: idCount,
                    description: description,
                    url: url,
                };
                links.push(link);
                return link;
            },
        });
        // обновить одну запись по id: update
        t.nonNull.field("update", {  // 2
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
                newDescription: stringArg(),
                newUrl: stringArg(),
            },

            resolve(parent, args, context) {
                const {id, newUrl, newDescription} = args;

                const updIndex = links.findIndex(link => link.id === id);

                if(updIndex === -1){
                    return links[0];

                } else {
                    links[updIndex].url = newUrl || links[updIndex].url;
                    links[updIndex].description = newDescription || links[updIndex].description;
                    return links[updIndex];
                }
            },
        });
        // удалить одну запись по id: delete. Возвращаем обновлённый (или нет) массив Links
        t.nonNull.list.nonNull.field("delete", {  // 2
            type: "Link",
            args: {   // 3
                id: nonNull(intArg()),
            },

            resolve(parent, args, context) {
                const {id} = args;

                links = links.filter(el => el.id !== id);
                return links;
            },
        });
    },
});
