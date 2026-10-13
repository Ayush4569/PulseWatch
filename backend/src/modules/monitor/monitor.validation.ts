import z from "zod";

const createMonitorSchema = z.object({
    url: z.url({
        protocol: /^https$/,
        error: "Invalid url"
    }),
    interval: z.union([
        z.literal(30),
        z.literal(60),
        z.literal(300)
    ])
})
const updateMonitorSchema = z.object({
    url: z.url({
        protocol: /^https$/,
        error: "Invalid url"
    }).optional(),
    interval: z.union([
        z.literal(30),
        z.literal(60),
        z.literal(300)
    ]).optional()
})
    .refine(
        (data) => data.url != undefined || data.interval != undefined,
        {
            message: "At least one field must be provided for update"
        }
    )

export {
    createMonitorSchema,
    updateMonitorSchema
};