import express from "express"
import DbGen from "./db.mjs"
import cors from "cors"

const app = express()
const DbClient = DbGen()
// connecting to pg sever

DbClient.connect()
DbClient.on("connect", () =>
    console.log("connection with DB established through port 5432")
)

app.use(cors()) // middleware to allow requests
app.use(express.json()) // middleware to get json req body
app.listen(process.env.API_PORT, () =>
    console.log(`App listening on port ${process.env.API_PORT}`)
)

const PostTxData = () => {
    app.post("/tx-data", (req, res) => {
        DbClient.query(
            `INSERT INTO transactions(address,amount,content_hash,tx_hash,date,token)
    VALUES($1,$2,$3,$4,$5,$6) RETURNING*`,
            [
                req.body.address,
                req.body.amount,
                req.body.ContentHash,
                req.body.TxHash,
                req.body.date,
                req.body.currency
            ],
            (err, res) => {
                err ? console.log(err) : console.log(res)
            }
        )
        res.sendStatus(200) //OK
    })
}

const GetTxData = () => {
    app.post("/tx-by-address", (req, res) => {
        DbClient.query(
            `SELECT * FROM transactions
        WHERE address=$1`,
            [req.body.address],
            (err, response) => {
                err ? console.log(err) : res.send(response)
            }
        )
    })
}

const GetLatestTxId = () => {
    app.get("/latest-tx", (req, res) => {
        DbClient.query(
            `SELECT id FROM transactions
ORDER BY id DESC
LIMIT 1`,
            (err, response) => {
                err ? res.sendStatus(500) : res.send(response)
            }
        )
    })
}

export default { GetTxData, PostTxData, GetLatestTxId }
