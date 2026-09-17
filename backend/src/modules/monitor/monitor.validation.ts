import z from "zod";

const urlSchema = z.object({
    url : z.url({protocol:/^https$/,
        error:"Invalid url"
    }),
    interval : z.number().min(30,{error:"Min interval must be 30s"})
})

export default urlSchema;