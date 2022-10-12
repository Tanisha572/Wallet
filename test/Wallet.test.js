var Wallet = artifacts.require('./Wallet.sol');

contract("Wallet", function(accounts){
    var walletInstance;
    beforeEach(async() => {
        walletInstance = await Wallet.deployed();
    });
    it("initial state", async() => {
        var owner_address = await walletInstance.owner.call();
        var deployer_address = accounts[0];
        assert.equal(owner_address, deployer_address);  //owner successfully set
        assert.equal(typeof walletInstance.balance_at, 'undefined');
        //balance_at, though initialised in constructor, is undefined here because balance_at is not public. So, it is not visible here, thus undefined.
    });
    it("sendMoney transfers value 2 from owner to accounts[1]", async() => {
        const sender_old_balance = await walletInstance.checkBalance({from : accounts[0]});
        const receiver_old_balance = await walletInstance.checkBalance({from : accounts[1]});
        const old_history_length = await walletInstance.noOfTransactions();

        await walletInstance.sendMoney(accounts[1], 2, {from : accounts[0]});

        const sender_new_balance = await walletInstance.checkBalance({from : accounts[0]});
        const receiver_new_balance = await walletInstance.checkBalance({from : accounts[1]});
        const new_history_length = await walletInstance.noOfTransactions();

        assert((new_history_length-old_history_length) == 1);   //new log added to transaction history
        assert((receiver_new_balance-receiver_old_balance) == 2 && (sender_old_balance-sender_new_balance) == 2 ); //correct amount was sent
    });
    it("disallows an address to send value to itself", async() => {
        try{
            await walletInstance.sendMoney(accounts[1], 2, {from : accounts[1]});
            assert(false);
        } catch(err){
            assert(err);
        }
    })
    it("disallows an address to send value more than it owns", async() => {
        try{
            const current_balance = walletInstance.checkBalance({from : accounts[0]});
            await walletInstance.sendMoney(accounts[0], current_balance+5, {from : accounts[0]});
            assert(false);
        }catch(err){
            assert(err);
        }
    })
});