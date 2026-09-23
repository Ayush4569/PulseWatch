import {Pool} from "pg"

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_jPDFUdypLn28@ep-misty-morning-b3elho0l-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
if(!connectionString) throw new Error("DB URL ABSENT!!")

    
const pool = new Pool({
    connectionString,
    max:10,
    idleTimeoutMillis : 30000,
    connectionTimeoutMillis: 2000
})

pool.on('error',(error)=> {
     console.error('Unexpected error on idle pg client', error);
})

export default pool;