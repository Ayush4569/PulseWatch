import z from "zod";

export const rangeSchema = z.object({
    range : z.enum(["1h","6h","24h","3d"])
})
