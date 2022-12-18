// для создания Аполло сервера
import {ApolloServer} from "apollo-server";
import {schema} from './schema';

import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"; //подключить Playground вместо ApolloStudio -1

const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()], //подключить Playground вместо ApolloStudio -2
})

const port = 3000;
server.listen({port}).then(({url}) => console.log('🚀 apollo server listening on',url ));
