const Recorder = artifacts.require("Recorder")

contract("Recorder", (accounts) => {
    console.log(accounts)
    let instance = null
    before(async () => {
        instance = await Recorder.deployed()
        await instance.RecordTransaction(
            "9-8-2022",
            "bba04f6985f560446c122d235ed2e51bf7c10864",
            0,
            "0x00A7e65D40f030efeB90FBceDF385fbba24a70dE"
        )
        await instance.RecordTransaction(
            "9-8-2022",
            "bba04f6985f560446c122d235ed2e51bf7c10864",
            0,
            "0x00A7e65D40f030efeB90FBceDF385fbba24a70dE"
        )
    })
    
    it("ensures a transaction is recorded against the date, 9-8-2022", async () => {
        let count = await instance.TransactionsByDate.call("9-8-2022")
        assert.equal(Number(count), 2, "success!")
    })

    it("ensures a transaction is recorded against the wallet address, 0x00A7e65D40f030efeB90FBceDF385fbba24a70dE", async () => {
        let count = await instance.TransactionsByUser.call(
            "0x00A7e65D40f030efeB90FBceDF385fbba24a70dE"
        )
        assert.equal(Number(count), 2, "success!")
    })
})
