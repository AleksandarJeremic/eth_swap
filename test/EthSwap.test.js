const { assert } = require('chai');

// import Token.sol and EthSwap.sol
const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

//import testing lib chai
require('chai').use(require('chai-as-promised')).should()

 // konvertuje iz ethera u wei(dinar u paru)
 function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

//40:55
// dep and inv accounts
contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap

    //before all tests
    before(async() => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address, tokens('1000000'))
    })

    // Token deployed and has the correct name. DApp Token
    describe('Token deployment', async() => {
        it('contract has a name', async() =>{
            const name = await token.name()
            assert.equal(name, 'DApp Token')
        })
    })
    
    // ethSwap token deployed and has the correct name. Balance is one million
    describe('EthSwap deployment', async() => {
        it('contract has a name', async() =>{
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('contract has tokens', async() => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buyTokens()', async() => {
        let result

        before(async() => {
            result = await ethSwap.buyTokens({
                from: investor, value: web3.utils.toWei('1', 'ether')
            })
        })

        it('Allows user to instantly purchase tokens from EthSwap for a fixed price',
        async() => {
            //Check invest token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            //Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1','Ether'))

            //console.log(result.logs) (result.logs[0].args)
            const event = (result.logs[0].args)
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

        })
    })
    

    describe('sellTokens()', async() => {
        let result

        before(async() => {
            //Investor must approve tokens before the purchase
            await token.approve(ethSwap.address, tokens('100'), { from: investor })
            //Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), { from:investor })
        })
        
        it('Allows user to instantly sell tokens from EthSwap for a fixed price',
        async() => {
            //check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            //Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0','Ether'))

            //Check logs to ensure event was emitted with correct data
            const event = (result.logs[0].args)
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //Fail
            await ethSwap.sellTokens(tokens('500'), { from: investor }).should.be.rejected;
        })
    })
})

//end on 56:13

// for last desc 1:19:26