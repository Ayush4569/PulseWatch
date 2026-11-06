import z from "zod";

const normalizeUrl = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return trimmed;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const createMonitorSchema = z.object({
    url: z
        .string()
        .min(1, "URL is required")
        .transform(normalizeUrl)
        .pipe(z.string().url("Please provide a valid URL or domain")),
    interval: z.union([
        z.literal(30),
        z.literal(60),
        z.literal(300)
    ])
});

const updateMonitorSchema = z
    .object({
        url: z
            .string()
            .min(1)
            .transform(normalizeUrl)
            .pipe(z.string().url("Please provide a valid URL or domain"))
            .optional(),
        interval: z
            .union([
                z.literal(30),
                z.literal(60),
                z.literal(300)
            ])
            .optional()
    })
    .refine(
        (data) => data.url !== undefined || data.interval !== undefined,
        {
            message: "At least one field must be provided for update"
        }
    );

export {
    createMonitorSchema,
    updateMonitorSchema
};
