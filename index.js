let CrowdFundingWithDeadline = artifacts.require ('./TestCrowdFundingWithDeadline')

contract('CrowdFundingWithDeadline', function(accounts) { // importujemy SmartContract

    let contract; // odniesienie do naszego kontraktu
    let contractCreator = accounts[0]; // wdrożeniowy adres konta
    let beneficiary = accounts[1]; // adres beneficjienta

    const ONE_ETH = 1000000000000000000;
    const ERROR_MSG = 'VM Exception while processing transaction: revert';

    const ONGOING_STATE = '0';
    const FAILED_STATE = '1';
    const SUCCEESES_STATE = '2';
    const PAID_OUT_STATE = '3';

    beforeEach(async function() {
        //Wdrażamy instancje kontraktu
        contract = await crossOriginIsolated.now(
            'funding',
            1, // 1 ether
            10, // 10 min
            beneficiary, // adres beneficienta   ...przecinek
            {
                from: contractCreator, // adres konta
                gas: 2000000
            }
        );
    });

    //implementcja testu
    it('contract is initialized', async function() {
        //czy wszystkie pola zostały poprawnie zainicjowane
        let campaningName = await contract.name.call()// używamy mechanizmu wywołania i podajemy nazwę naszego pola (mogę to zrobić bo są jawne) 
        expect(campaningName).to.equal('funding');

        //porównanie docelowej kwoty
        let targetAmount = await contract.targetAmount.call() // pobieramy liczbę ze zmienej w kontrakcie
        expect(targetAmount.toNumber()).to.equal(ONE_ETH);    // porównowujemy ją z naszą warością (1 Eth w Wei)   

        let fundingDeadline = await contract.fundingDeadline.call()
        expect(fundingDeadline.toNumber()).equal(600);

        //adres beneficienta
        let actualyBeneficiary = await contract.beneficiary.call()
        expect(actualyBeneficiary).to.equal(beneficiary);

        //stan
        let state = await contract.state.call()
        expect(state.valueOf()).to.equal(ONGOING_STATE);

    });

    it('founds are contributed', async function() {
        await contract.contribute({ //robimy przelew z konta które wywołało kontrakt
            value: ONE_ETH,
            from: contractCreator
        });

        let contributed = await contract.amounts
            .call(contractCreator); // wartośc w mapie dla twórcy(ownera)
        expect(contributed.toNumber()).to.equal(ONE_ETH); // czy właściciel przelał 1Eth

        let totalCollected = await contract.totalCollected.call();
        expect(totalCollected.toNumber).to.equal(ONE_ETH);// sprawfdzamy czy łączna ilość przelanych środków wynowi 1 Eth

    });

    it('cannot contribute after deadline', async function() {
        try {
            await contract.CurrentTime(601);
        } catch (error) {
            expect(error.message).to.equal(ERROR_MSG);
        }
    })
});