import { objectType, extendType, nonNull, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { APP_SECRET } from "../utils/auth";

export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.string("token");
        t.nonNull.field("user", {
            type: "User",
        });
    },
});


export const AuthMutation = extendType({
    type: "Mutation",
    definition(t) {
        // ----- логин: передаём имейл и сырой пароль --------------
        t.nonNull.field("login", {
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                // 1 - ищем юзера по базе в призме
                const user = await context.prisma.user.findUnique({
                    where: { email: args.email },
                });
                if (!user) {
                    throw new Error("No such user found");
                }

                // 2 - сравниваем сырой пароль с хешем из базы
                const valid = await bcrypt.compare(
                    args.password,
                    user.password,
                );
                if (!valid) {
                    throw new Error("Invalid password");
                }

                // 3 - если и юзер есть такой, и пароль верный - генерим токен-кокен
                const token = jwt.sign({ userId: user.id }, APP_SECRET);

                // 4 - ... и возвращаем токен и юзера
                return {
                    token,
                    user,
                };
            },
        });
        // ------ регистрация -------------
        t.nonNull.field("signup", { // 1
            type: "AuthPayload",
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg()),
                name: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const { email, name } = args;
                // 2 = хешируем пасс
                const password = await bcrypt.hash(args.password, 10);

                // 3 - создаём юзера в Призме базе
                const user = await context.prisma.user.create({
                    data: { email, name, password },
                });

                // 4 - генерим токен-кокен
                const token = jwt.sign({ userId: user.id }, APP_SECRET);

                // 5 - ... возвращаем кокен и юзера
                return {
                    token,
                    user,
                };
            },
        });
    },
});

// то есть при любом варианте - и регистрация, и логин - генерим кокен
