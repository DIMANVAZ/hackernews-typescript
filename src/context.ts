import {PrismaClient} from "@prisma/client";
export const prisma = new PrismaClient();
import { decodeAuthHeader, AuthTokenPayload } from "./utils/auth";
import { Request } from "express";

export interface Context {
    prisma: PrismaClient,
    userId?: number;  //  - так как в контексте появился и userId
}
    // экспортируем контекст типа (интерфейса) Context
export const context = ({ req }: { req: Request }): Context => {   // 2
    const token =
        req && req.headers.authorization
            ? decodeAuthHeader(req.headers.authorization)
            : null;

    return {
        prisma,
        userId: token?.userId,
    };
};
