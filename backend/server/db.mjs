import pg from "pg"
import "dotenv/config"

const DbGen = () => {
    // creating new pg client instance
    const DbClient = new pg.Client({
        host: process.env.HOST,
        port: process.env.PORT,
        user: process.env.DBUSER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    })
    return DbClient
}

export default DbGen
