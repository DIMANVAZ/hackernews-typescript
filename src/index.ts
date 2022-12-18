// для создания Аполло сервера
import {ApolloServer} from "apollo-server";
import {schema} from './schema';
import {context} from "./context";

import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"; //подключить Playground вместо ApolloStudio -1

const server = new ApolloServer({
    schema,
    context,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()], //подключить Playground вместо ApolloStudio -2
})

const port = 3000;
server.listen({port}).then(({url}) => console.log('🚀 apollo server listening on',url ));
