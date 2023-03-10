// для генерации схемы GraphQL в Nexus
// Auto-generated GraphQL SDL (schema.graphql file)

import {makeSchema} from "nexus";
import {join} from "path";
import * as types from './graphql'; // объект types, в нём свойства - сущности из папки graphql

export const schema = makeSchema({
    types,
    outputs:{
        schema: join(process.cwd(), "schema.graphql"),
        typegen: join(process.cwd(), "nexus-typegen.ts"),
    },
    contextType:{
        module: join(process.cwd(), "./src/context.ts"),
        export: "Context"
    }
})
