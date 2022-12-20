// создаём новый scalar для nexus (берём из библиотеки скаляров)

import {GraphQLDateTime} from "graphql-scalars"
import { asNexusMethod } from "nexus";

export const GQLDate = asNexusMethod(GraphQLDateTime, "dateTime");  // 2
