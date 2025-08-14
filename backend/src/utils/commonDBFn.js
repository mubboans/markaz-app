import { eq, and, asc, desc } from "drizzle-orm";

import { db } from "../db/index.js";

export async function getData(
    model,
    query = {},
    limit = 10,
    offset = 0,
    orderByKey = "id",
    orderDirection = "asc"
) {
    try {
        let q = db.select().from(model);

        if (Object.keys(query).length) {
            const conditions = Object.entries(query).map(([key, value]) =>
                eq(model[key], value)
            );

            if (conditions.length === 1) {
                q = q.where(conditions[0]); // ✅ FIXED
            } else {
                q = q.where(and(...conditions));
            }
        }

        q =
            orderDirection === "desc"
                ? q.orderBy(desc(model[orderByKey]))
                : q.orderBy(asc(model[orderByKey]));

        q = q.limit(limit).offset(offset);

        return await q;
    } catch (error) {
        console.error("Error executing query:", error);
        throw error;
    }
}

export async function updateData(){
    try {
        
    } catch (error) {
        throw error;
    }
}