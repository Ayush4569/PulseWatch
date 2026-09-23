import z from "zod";

const urlSchema = z.object({
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

export default urlSchema;