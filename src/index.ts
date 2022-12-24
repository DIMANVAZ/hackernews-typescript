// для создания Аполло сервера
import {ApolloServer} from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"; //подключить Playground вместо ApolloStudio -1
import {schema} from './schema';
import {context} from "./context";

const server = new ApolloServer({
    schema,
    context,
    introspection: true,                                      // 1
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()], //подключить Playground вместо ApolloStudio -2
})

const port = process.env.port || 3000;
server.listen({port}).then(({url}) => console.log('🚀 apollo server listening on',url ));
