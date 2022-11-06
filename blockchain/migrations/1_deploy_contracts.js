const Recorder = artifacts.require("Recorder")

module.exports = function (deployer) {
    deployer.deploy(Recorder)
}
