import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const APP_SECRET = process.env.APP_SECRET || 'show app_secret ERROR ';
//console.log(APP_SECRET);

export interface AuthTokenPayload {  // 1 - определили интерфейс (какБыТип) для полезного содержимого кокена
    userId: number;
}
    // превращает заголовок Authorization в полезное
export function decodeAuthHeader(authHeader: String): AuthTokenPayload { // 2
    const token = authHeader.replace("Bearer ", "");  // 3 - удаляем из заголовка слово про медвеБобра

    if (!token) {
        throw new Error("No token found");
    }
    return jwt.verify(token, APP_SECRET) as AuthTokenPayload;  // 4 - если всё норм, возвращаем полезное из кокена
}
