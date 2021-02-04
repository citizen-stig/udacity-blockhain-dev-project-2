const StarNotary = artifacts.require("StarNotary");

contract('StarNotary', async accounts => {
    let user0 = accounts[0];
    let user1 = accounts[1];
    let user2 = accounts[2];
    let user3 = accounts[3];
    let starId = 1;

    let instance;

    beforeEach(async function () {
        instance = await StarNotary.deployed();
    });


    describe('basic star operations', function () {
        it('allows creating a new star', async function () {
            let thisStarId = starId;
            await instance.createStar('Awesome New Star!', thisStarId, {from: user0});
            starId += 1;
            assert.equal(await instance.tokenIdToStarInfo.call(thisStarId), 'Awesome New Star!');
        });
        it('forbids creating a duplicate star', async function () {
            let starName = 'Another Awesome Star!';
            await instance.createStar(starName, starId, {from: user0})
            starId += 1;
            try {
                await instance.createStar(starName, starId, {from: user1})
                assert.fail("Should not allow star with same name");
            } catch (error) {
                assert.equal('Star with this name already claimed', error.reason);
            }
        });
        it('can add the star name and star symbol properly', async function () {
            let [actualName, actualSymbol] = await Promise.all([
                instance.name.call(),
                instance.symbol.call()]);
            assert.equal('Nikolai Golub Star Notary Token', actualName);
            assert.equal('NGSNT', actualSymbol);
        });

        it('can lookup existing star by its id', async function () {
            let thisStarId = starId + 1000;
            let starName = 'Test Star Lookup';
            await instance.createStar(starName, thisStarId, {from: user0});
            let actualStarName = await instance.lookUpTokenIdToStarInfo(thisStarId);
            assert.equal(starName, actualStarName);
        });

        it('fails when lookup unknown star', async function () {
            try {
                await instance.lookUpTokenIdToStarInfo(31337);
                assert.fail("Should fail on lookup of unknown star");
            } catch (error) {
                // For some reason, `error.reason` is not present.
                let topOfTheStack = error.hijackedStack.split('\n')[0];
                assert.isTrue(topOfTheStack.includes("The star with given id is not found"));
            }
        });
    });

    describe('star selling', async function () {
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");

        let thisStarId;
        let balanceOfUser1BeforeTest;
        let balanceOfUser1AfterListing;
        let balanceOfUser2BeforeTest;


        before(async function () {
            thisStarId = starId;
            await instance.createStar('Sellable Star', thisStarId, {from: user1});
            starId += 1;
            [balanceOfUser1BeforeTest, balanceOfUser2BeforeTest] = await Promise.all([
                web3.eth.getBalance(user1),
                web3.eth.getBalance(user2)
            ]);
        });

        it('lets user1 put up their star for sale', async function () {
            assert.equal(await instance.starsForSale.call(thisStarId), 0);
            await instance.putStarUpForSale(thisStarId, starPrice, {from: user1, gasPrice: 0});
            let [expectedStarForSalePrice, user1Balance] = await Promise.all([
                instance.starsForSale.call(thisStarId),
                web3.eth.getBalance(user1)
            ])
            assert.equal(expectedStarForSalePrice, starPrice);
            balanceOfUser1AfterListing = user1Balance;
        });

        it('handles transactions', async function () {
            await instance.buyStar(thisStarId, {from: user2, value: balance, gasPrice: 0});
        });

        it('increases user1 balance after the sale', async function () {
            let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
            let expectedBalance = Number(balanceOfUser1AfterListing) + Number(starPrice);
            let actualBalance = Number(balanceOfUser1AfterTransaction);
            assert.equal(expectedBalance, actualBalance);
        });

        it('decreases user2 balance in ether', async function () {
            const balanceOfUser2AfterTransaction = await web3.eth.getBalance(user2);
            let expectedChange = Number(balanceOfUser2BeforeTest) - Number(balanceOfUser2AfterTransaction);
            assert.equal(expectedChange, starPrice);
        });

        // Edge cases
        it('prevents user2 from selling not her own star', async function () {
            try {
                await instance.putStarUpForSale(thisStarId, starPrice, {from: user3});
                assert.fail("Should not allow putting others stars for sale");
            } catch (error) {
                assert.equal("You can't sale the Star you don't owned", error.reason);
            }
        });
    });

    describe('star exchange', async function () {
        it('lets 2 users exchange stars', async function () {
            // 1. create 2 Stars with different tokenId
            // 2. Call the exchangeStars functions implemented in the Smart Contract
            // 3. Verify that the owners changed
            this.skip();
        });

        it('lets a user transfer a star', async function () {
            // 1. create a Star with different tokenId
            // 2. use the transferStar function implemented in the Smart Contract
            // 3. Verify the star owner changed.
            this.skip();
        });
    });
});
