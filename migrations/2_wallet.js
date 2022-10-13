var Wallet = artifacts.require("./Wallet.sol");

module.exports = function(deployer) {
  deployer.deploy(Wallet,{value: web3.utils.toWei('10', 'ether')});
};
