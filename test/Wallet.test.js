var Wallet = artifacts.require('./Wallet.sol');

contract("Wallet", function(accounts){
    var walletInstance;
    beforeEach(async() => {
        walletInstance = await Wallet.deployed();
    });
    it("initial state", async() => {
        assert.equal(typeof walletInstance.balance_at, 'undefined');
    });
    it("sendMoney transfers value 2 from owner to accounts[1]", async() => {
        const sender_old_balance = await walletInstance.checkBalance({from : accounts[0]});
        const receiver_old_balance = await walletInstance.checkBalance({from : accounts[1]});
        await walletInstance.sendMoney(accounts[1], 2, {from : accounts[0]});
        const result_history = await walletInstance.history(0);
        const sender_new_balance = await walletInstance.checkBalance({from : accounts[0]});
        const receiver_new_balance = await walletInstance.checkBalance({from : accounts[1]});
        assert(result_history.transaction_type === "sent" && result_history.amount == 2);
        assert((receiver_new_balance-receiver_old_balance) == 2 && (sender_old_balance-sender_new_balance) == 2 );
    });
});