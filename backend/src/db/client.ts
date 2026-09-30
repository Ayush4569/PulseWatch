import { config } from "../config/env.js"
import {Pool} from "pg"

const connectionString = config.DATABASE_URL
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