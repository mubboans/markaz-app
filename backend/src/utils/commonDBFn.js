import { eq, and, asc, desc } from "drizzle-orm";

import { db } from "../db/index.js";

// export async function getData(
//     model,
//     query = {},
//     limit = 10,
//     offset = 0,
//     orderByKey = "id",
//     orderDirection = "desc"
// ) {
//     try {
//         // let q = db.select().from(model);
//         const findAllRecord = await db.query[model].findMany({
//             where: query,
//             limit: limit,
//             offset: offset,
//             orderBy: {
//                 [orderByKey]: orderDirection === "desc" ? desc() : asc()
//             }
//         });
//         // if (findAllRecord?.length) {
//         //     console.log(`Found ${findAllRecord.length} records in ${model.name}`);
//         // };
//         // if (Object.keys(query).length) {
//         //     const conditions = Object.entries(query).map(([key, value]) =>
//         //         eq(model[key], value)
//         //     );
//         //     q = conditions.length === 1 ? q.where(conditions[0]) : q.where(and(...conditions));
//         // }

//         // // ✅ Only apply orderBy if column exists
//         // const orderColumn = model[orderByKey];
//         // if (orderColumn) {
//         //     q =
//         //         orderDirection === "desc"
//         //             ? q.orderBy(desc(orderColumn))
//         //             : q.orderBy(asc(orderColumn));
//         // }

//         // q = q.limit(limit).offset(offset);
//         // const buildQuery = q.toSQL();
//         // console.log("Generated SQL Query:", buildQuery.sql);
//         return await findAllRecord;
//     } catch (error) {
//         console.error("Error executing query:", error);
//         throw error;
//     }
// }

export async function getData(
    modelName, // e.g. db.query.users
    options = {}
) {
    const {
        query = {},
        limit,
        offset,
        orderByKey,
        orderDirection = "asc",
        withRelations,
        extras,
    } = options;

    try {
        // Build dynamic where clause
        const whereClause =
            Object.keys(query).length > 0
                ? (table, operators) => {
                    const conditions = Object.entries(query).map(([key, value]) =>
                        operators.eq(table[key], value)
                    );
                    return conditions.length > 1 ? and(...conditions) : conditions[0];
                }
                : undefined;

        // Build dynamic options object
        const findManyOptions = {};
        if (whereClause) findManyOptions.where = whereClause;
        if (limit !== undefined) findManyOptions.limit = limit;
        if (offset !== undefined) findManyOptions.offset = offset;
        if (orderByKey) {
            findManyOptions.orderBy = (table, { asc, desc }) => [
                orderDirection === "asc" ? asc(table[orderByKey]) : desc(table[orderByKey]),
            ];
        }
        if (withRelations) findManyOptions.with = withRelations;
        if (extras) findManyOptions.extras = extras;

        // Debug log SQL
        const queryObj = await db.query[modelName]?.findMany(findManyOptions);
        // console.log("SQL:", queryObj?.toSQL()?.sql);
        // console.log("Params:", queryObj?.toSQL()?.params);

        return await queryObj;
    } catch (error) {
        console.error("DBHelper getData error:", error);
        throw error;
    }
}

export async function updateData(){
    try {
        
    } catch (error) {
        throw error;
    }
}