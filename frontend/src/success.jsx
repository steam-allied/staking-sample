import React from "react"
import { useEffect } from "react"
import "./success.css"

const Success = (props) => {
    useEffect(() => {
        document.addEventListener("click", ModalCloser)
        return () => {
            document.removeEventListener("click", ModalCloser)
        }
    }, [])

    useEffect(() => {
        if (props.show) {
            document.querySelector(".modal").style.display = "flex"
            document.body.style.backgroundColor = "rgb(145, 145, 145)"
        }
    }, [props.show])

    const ModalCloser = (e) => {
        if (
            e.target.className === "close" ||
            e.target.className === "scroll" ||
            e.target.closest(".modal") === null
        ) {
            document.querySelector(".modal").style.display = "none"
            document.body.style.backgroundColor = "white"
        }
    }

    return (
        <div className="modal" id="modal">
            <h2 className="success-heading">Transaction Successful!</h2>
            <div className="tx">
                <h4 className="hash">
                    hash:{" "}
                    <a href={`https://sepolia.etherscan.io/tx/${props.hash}`}>
                        {props.hash}
                    </a>
                </h4>
                <h4 className="data">
                    data:{" "}
                    {` ${JSON.stringify({
                        currency: props.currency,
                        amount: props.amount,
                        address: props.address
                    })}`}
                </h4>
            </div>
            <button
                className="scroll"
                onClick={() => {
                    window.scrollBy({
                        top: document.body.scrollHeight,
                        behavior: "smooth"
                    })
                }}
            >
                More Info
            </button>
            <button className="close">
                X
            </button>
        </div>
    )
}

export default Success
