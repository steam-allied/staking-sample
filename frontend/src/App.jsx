import React, { useState, useEffect, useRef } from "react"
import Web3 from "web3"
import sha1 from "sha1"
import axios from "axios"
import { ethers } from "ethers"
import recorder from "./ABIs/Recorder.json"
import token from "./ABIs/Trax.json"
import Success from "./success"
import domain from "./config.json"
import "./App.css"

function App() {
    const [currency, setcurrency] = useState("")
    const [amount, setAmount] = useState(NaN)
    const [accounts, setAccounts] = useState([])
    const [contracts, setContracts] = useState([])
    const [transactions, setTransactions] = useState([])
    const [TxHash, setTxHash] = useState("")
    const w3 = useRef()
    const ShowPopup = useRef(false)

    useEffect(() => {
        ;(async () => {
            try {
                // Get network provider and web3 instance.
                const web3 = await new Web3(window.ethereum)
                // Use web3 to get the user's accounts.
                await web3.eth.requestAccounts((err, res) => {
                    err ? console.log(err) : console.log(res)
                })
                const accounts = await web3.eth.getAccounts()
                // Get the contract instance.
                const TxContract = new web3.eth.Contract(
                    recorder.abi,
                    recorder.networks["11155111"].address
                )
                const TokenContract = new web3.eth.Contract(
                    token.abi,
                    token.networks["11155111"].address
                )
                const response = await axios.post(
                    `http://${domain.local}:4000/tx-by-address`,
                    {
                        address: accounts[0]
                    }
                )
                // reloading the page upon change of account on metamask
                window.ethereum.on("accountsChanged", async () => {
                    window.location.reload()
                })
                setTransactions(response.data.rows)
                setAccounts(accounts)
                setContracts([TxContract, TokenContract])
                w3.current = web3
            } catch (error) {
                console.error(error)
            }
        })()
    }, [])

    const SubmitHandle = (e) => {
        e.preventDefault()
        ShowLoading()
        // approving allowance for recorder contract
        contracts[1].methods.GetBalance(accounts[0]).call((err, res) => {
            if (err) {
                console.log(err)
            } else {
                console.log("balance", res)
                if (res >= 10) {
                    contracts[1].methods
                        .GetAllowance(
                            accounts[0],
                            recorder.networks["11155111"].address
                        )
                        .call(async (err, res) => {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log("allowance", res)
                                if (res < 10) {
                                    alert(
                                        "your allowance is insuficient for this transaction! in order to go through with this transaction  you must approve allowance through you wallet"
                                    )
                                    contracts[1].methods
                                        .approve(
                                            recorder.networks["11155111"]
                                                .address,
                                            ethers.utils.parseEther("100")
                                        )
                                        .send(
                                            { from: accounts[0] },
                                            (err, res) => {
                                                if (err) {
                                                    console.log(err)
                                                } else {
                                                    // recording transaction onto blockchain
                                                    console.log("approval", res)
                                                    transaction()
                                                }
                                            }
                                        )
                                } else {
                                    // recording transaction onto blockchain
                                    transaction()
                                }
                            }
                        })
                } else {
                    alert(
                        "insufficent trax balance! your wallet should have at least 10 TRX in order to go through with this transaction "
                    )
                    HideLoading()
                }
            }
        })
    }

    const CurrencyHandle = (e) => {
        setcurrency(e.target.value)
    }

    const AmountHandle = (e) => {
        setAmount(e.target.valueAsNumber)
    }

    const ShowLoading = () => {
        const animation = document.querySelector(".pending")
        const submit = document.querySelector("#transact")
        animation.style.display = "flex"
        submit.disabled = true
    }

    const HideLoading = () => {
        const animation = document.querySelector(".pending")
        const submit = document.querySelector("#transact")
        animation.style.display = "none"
        submit.disabled = false
    }

    const transaction = async () => {
        const hash = sha1(
            JSON.stringify({
                currency,
                amount,
                address: accounts[0]
            })
        )
        let date = new Date()
        date = `${date.getDate().toString()}-${date
            .getMonth()
            .toString()}-${date.getFullYear().toString()}`
        const res = await axios.get(`http://${domain.local}:4000/latest-tx`)
        const id = res.data.rows[0].id + 1
        let TxHash = ""
        contracts[0].methods
            .RecordTransaction(
                token.networks["11155111"].address,
                date,
                hash,
                id,
                accounts[0]
            )
            .send({ from: accounts[0] }, async (err, res) => {
                if (err) {
                    console.log(err)
                    throw err
                } else {
                    console.log("tx hash", res)
                    TxHash = res
                    setTxHash(res)
                }
            })
            .on("receipt", async (receipt) => {
                console.log("successful tx!", receipt)
                const block = await w3.current.eth.getBlock(receipt.blockNumber)
                await axios
                    .post(`http://${domain.local}:4000/tx-data`, {
                        address: accounts[0],
                        amount,
                        ContentHash: hash,
                        TxHash,
                        date,
                        currency,
                        ts: block.timestamp
                    })
                    .then((res) => {
                        console.log(res)
                    })
                ShowPopup.current = true
                const response = await axios.post(
                    `http://${domain.local}:4000/tx-by-address`,
                    {
                        address: accounts[0]
                    }
                )
                setTransactions(response.data.rows)
                HideLoading()
            })
    }

    return (
        <div className="App">
            <div className="FormWrapper">
                <h1>TRAX</h1>
                <form onSubmit={SubmitHandle}>
                    <div className="currency">
                        <label htmlFor="currency">Currency</label>
                        <select
                            name="currency"
                            id="currency"
                            onChange={CurrencyHandle}
                        >
                            <option value="" selected disabled hidden>
                                Select crypto token
                            </option>
                            <option value="bitcoin">BTC</option>
                            <option value="dogecoin">DOGE</option>
                            <option value="shiba inu">SHIB</option>
                            <option value="polygon">MATIC</option>
                            <option value="tether">USDT</option>
                        </select>
                    </div>
                    <div className="amount">
                        <label htmlFor="amount">Amount</label>
                        <input
                            type="number"
                            step="any"
                            id="amount"
                            name="amount"
                            placeholder="type in the amount you wish to trade"
                            onChange={AmountHandle}
                        />
                    </div>
                    <input
                        type="submit"
                        name="transact"
                        id="transact"
                        value="Transact"
                    />
                </form>
                <div className="pending">
                    <div className="spinner"></div>
                    <span className="loading-msg">Transaction pending</span>
                </div>
            </div>
            <Success
                show={ShowPopup.current}
                hash={TxHash}
                currency={currency}
                amount={amount}
                address={accounts[0]}
            />
            <div className="transactions">
                <h2>Transactions By {accounts[0]}</h2>
                {transactions.map((tx) => (
                    <div className="transaction" key={tx.id}>
                        <h5>
                            Transaction Hash:{" "}
                            <a
                                href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`}
                            >
                                {tx.tx_hash}
                            </a>
                        </h5>
                        <ul>
                            <li>ID: {tx.id}</li>
                            <li>token: {tx.token}</li>
                            <li>amount: {tx.amount}</li>
                            <li>content hash: {tx.content_hash}</li>
                            <li>date: {tx.date}</li>
                            <li>timestamp: {tx.timestamp}</li>
                            <li>
                                data:
                                {` ${JSON.stringify({
                                    currency: tx.token,
                                    amount: Number(tx.amount),
                                    address: accounts[0]
                                })}`}
                            </li>
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default App
