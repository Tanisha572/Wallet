var Wallet = artifacts.require('./Wallet.sol');

contract("Wallet", function(accounts){
    var walletInstance;
    beforeEach(async() => {
        walletInstance = await Wallet.deployed();
    });
    it("initial state", async() => {
        var owner_address = await walletInstance.owner.call();
        console.log(owner_address);
        var deployer_address = accounts[0];
        assert.equal(owner_address, deployer_address);  //owner successfully set
        assert.equal(await walletInstance.noOfTransactions(), 1);   //transaction logged
        assert.equal(web3.utils.fromWei(await walletInstance.checkBalance(), 'ether'), 10); //correct amount transferred to wallet
        
    });
    it("transferAmount of 2 ether from owner wallet to accounts[1]", async() => {
        const wallet_old_balance = await web3.utils.fromWei(await web3.eth.getBalance(walletInstance.address),"ether");
        const receiver_old_balance = await web3.utils.fromWei(await web3.eth.getBalance(accounts[1]),"ether");
        const old_history_length = await walletInstance.noOfTransactions();
        //console.log(sender_old_balance);
        await walletInstance.transferAmount(accounts[1], web3.utils.toWei('2', 'ether'), {from : accounts[0]});

        const wallet_new_balance = await web3.utils.fromWei(await web3.eth.getBalance(walletInstance.address),"ether");
        const receiver_new_balance = await web3.utils.fromWei(await web3.eth.getBalance(accounts[1]),"ether");
        const new_history_length = await walletInstance.noOfTransactions();

        assert((new_history_length-old_history_length) == 1);   //new log added to transaction history
        assert((receiver_new_balance-receiver_old_balance) == 2 && (wallet_old_balance-wallet_new_balance) == 2); //correct amount was sent
        //gas is deducted from the owner's address and not the owner's wallet address. so the specified amount of ether is cut from the wallet
    });
    it("disallows an address to send value to same address", async() => {
        try{
            await walletInstance.transferAmount(accounts[0], 2, {from : accounts[0]});
            assert(false);
        } catch(err){
            assert(err);
        }
    });
    it("disallows other addresses to transferAmount", async() => {
        //other addresses can send ether to only the contract and only via receive()
        try{
            await walletInstance.transferAmount(accounts[0], 2, {from : accounts[1]});
            assert(false);
        } catch(err){
            assert(err);
        }
    });
    it("disallows an address to send value more than it owns", async() => {
        try{
            const current_balance = walletInstance.address.balance();
            await walletInstance.transferAmount(accounts[1], current_balance+5);
            assert(false);
        }catch(err){
            assert(err);
        }
    });
    it("widthdrawal works correctly", async() => {
        const wallet_old_balance = await web3.utils.fromWei(await web3.eth.getBalance(walletInstance.address),"ether");
        const owner_old_balance = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]),"ether");
        const old_history_length = await walletInstance.noOfTransactions();

        await walletInstance.widthdrawAmount(web3.utils.toWei('2', 'ether'), {from : accounts[0]});

        const wallet_new_balance = await web3.utils.fromWei(await web3.eth.getBalance(walletInstance.address),"ether");
        const owner_new_balance = await web3.utils.fromWei(await web3.eth.getBalance(accounts[0]),"ether");
        const new_history_length = await walletInstance.noOfTransactions();

        assert((new_history_length-old_history_length) == 1);   //new log added to transaction history
        assert((wallet_old_balance-wallet_new_balance) == 2 && (owner_new_balance-owner_old_balance) < 2); //gas is deducted as well
    });
    it("contract receives value correctly" , async() => {
        const wallet_old_balance = await web3.utils.fromWei(await web3.eth.getBalance(walletInstance.address),"ether");
        const sender_old_balance = await web3.utils.fromWei(await web3.eth.getBalance(accounts[1]),"ether");
        const old_history_length = await walletInstance.noOfTransactions();

        await web3.eth.sendTransaction({from : accounts[1], 
                                        to : walletInstance.address, 
                                        value : await web3.utils.toWei('5', "ether"),
                                        gas: '1000000'});

        const wallet_new_balance = await web3.utils.fromWei(await web3.eth.getBalance(walletInstance.address),"ether");
        const sender_new_balance = await web3.utils.fromWei(await web3.eth.getBalance(accounts[1]),"ether");
        const new_history_length = await walletInstance.noOfTransactions();

        assert((new_history_length-old_history_length) == 1);   //new log added to transaction history
        assert((wallet_new_balance-wallet_old_balance) == 5 && (sender_old_balance-sender_new_balance) > 5); //gas is deducted as well

    })
});