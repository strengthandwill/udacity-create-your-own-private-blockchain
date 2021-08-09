const BlockchainClass = require('../src/blockchain.js');

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');

describe('Blockchain', function() {
    let blockchain;
    let clock;

    const data = {
        genesisBlock: {
            time: 1554144743000,
            hash: 'd05de81ce1e904a581d5f25c8789c5e1fe61f5d647bdcdbc65dfc6ce57bf42ec',
            height: 0,
            body: '7b2264617461223a2247656e6573697320426c6f636b227d'
        },  
        secondBlock: {
            time: 1554145343000,
            address: 'n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC',
            message: 'n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC:1554145343:starRegistry',
            signature: 'IDw6dVmBEjmXgH7b8FvVlQgPGRLHw6JC2t63BNoQdZNMG4XxjUBN2C+rdROmsdo8L1JPI4yauRxvT/gI/JhEs1E=',
            star: {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Testing the story 4"
            },
            hash: 'ced50b721368addc8cdd0d5aeebaddd33282db481e326e40fb83ca105e4eae5f',
            height: 1,
            body: '7b2264617461223a226e31575371506b444258576e563355477369456b7879754a76786152587266664c433a313535343134353334333a737461725265676973747279227d',
            previousHash: 'd05de81ce1e904a581d5f25c8789c5e1fe61f5d647bdcdbc65dfc6ce57bf42ec'
        },
        thirdBlock: {
            time: 1554145943000,
            address: 'moHNUnnRBCVWVPWdwiyuFifEckbm7GP8cJ',
            message: 'moHNUnnRBCVWVPWdwiyuFifEckbm7GP8cJ:1554145943000:starRegistry',
            signature: 'H9Vw7/VbgpZSGgoHciYvm2GzBzM0fz2r4uszyNJIdhedaZ+qzoTuJBYOeVsCwzz4v1iPOHGpAV+r1fTpvDSgvB0=',
            star: {
                "dec": "86° 25' 96.5",
                "ra": "18h 40m 2.0s",
                "story": "Testing the story 5"
            },            
            hash: 'af9faf7494f76d067d4de8a1cab5cc3f45bd7f3fb12507534aff29b3dea10fbb',
            height: 2,
            body: '7b2264617461223a226d6f484e556e6e5242435657565057647769797546696645636b626d37475038634a3a313535343134353934333030303a737461725265676973747279227d',
            previousHash: 'ced50b721368addc8cdd0d5aeebaddd33282db481e326e40fb83ca105e4eae5f'
        }
    };

    beforeEach(function() {
        clock = sinon.useFakeTimers({ now: data.genesisBlock.time });
        blockchain = new BlockchainClass.Blockchain();
    });

    describe('initializeChain()', function() {        
        it('should create Genesis Block', function() {            
            const result = blockchain.chain[0];
            return Promise.all([
                expect(result).to.have.property('hash', data.genesisBlock.hash),
                expect(result).to.have.property('height', data.genesisBlock.height),
                expect(result).to.have.property('body', data.genesisBlock.body),
                expect(result).to.have.property('previousBlockHash', null)
            ]);            
        });
    });

    describe ('requestMessageOwnershipVerification()', function() {
        it('should return message', function() {
            clock.tick(600000);
            const result = blockchain.requestMessageOwnershipVerification(data.secondBlock.address);
            return expect(result).to.eventually.be.equal(data.secondBlock.message);
        });
    });

    describe('submitStar()', function() {
        beforeEach(function() {
            clock.tick(600000);
        });

        it('should add new block', function() {              
            const result = blockchain.submitStar(data.secondBlock.address, data.secondBlock.message, 
                data.secondBlock.signature, data.secondBlock.star);   
            return Promise.all([
                expect(result).to.eventually.have.property('hash', data.secondBlock.hash),
                expect(result).to.eventually.have.property('height', data.secondBlock.height),                
                expect(result).to.eventually.have.property('body', data.secondBlock.body),
                expect(result).to.eventually.have.property('previousBlockHash', data.secondBlock.previousHash)
            ]);            
        });

        it('should return error that the time elapsed is more than 5 minutes', function() {   
            clock = sinon.useFakeTimers({ now: data.secondBlock.time + 301000 });
            const result = blockchain.submitStar(data.secondBlock.address, data.secondBlock.message, 
                data.secondBlock.signature, data.secondBlock.star);              
            return expect(result).to.eventually.rejectedWith('The time elapsed is more than 5 minutes');
        });

        it('should return error that the bitcoin message is invalid', function() {              
            const invalid_signature = 'foo';
            const result = blockchain.submitStar(data.secondBlock.address, data.secondBlock.message, 
                invalid_signature, data.secondBlock.star);              
            return expect(result).to.eventually.rejectedWith('The bitcoin message is not valid');
        });        
    });


    describe('getBlockByHash', function() {
        beforeEach(function() {
            clock.tick(600000);
            blockchain.submitStar(data.secondBlock.address, data.secondBlock.message, 
                data.secondBlock.signature, data.secondBlock.star);
        });

        it('should return block as block is found', function() {
            const result = blockchain.getBlockByHash(data.secondBlock.hash);
            return Promise.all([
                expect(result).to.eventually.have.property('hash', data.secondBlock.hash),
                expect(result).to.eventually.have.property('height', data.secondBlock.height),                
                expect(result).to.eventually.have.property('body', data.secondBlock.body),
                expect(result).to.eventually.have.property('previousBlockHash', data.secondBlock.previousHash)
            ]); 
        });

        it('should return null as block is not found', function() {
            const result = blockchain.getBlockByHash('foo');
            expect(result).to.eventually.be.null;
        });
    });

    describe('getStarsByWalletAddress', function() {
        beforeEach(function() {
            clock.tick(600000);
            blockchain.submitStar(data.secondBlock.address, data.secondBlock.message, 
                data.secondBlock.signature, data.secondBlock.star);
            clock.tick(600000);
            blockchain.submitStar(data.thirdBlock.address, data.thirdBlock.message, 
                data.thirdBlock.signature, data.thirdBlock.star);            
        });

        it('should return stars that belongs to owner', function() {            
            const result = blockchain.getStarsByWalletAddress(data.secondBlock.address);            
            return Promise.all([
                expect(result).to.eventually.have.length(1),                
                expect(result).to.eventually.deep.include({ 
                    owner: data.secondBlock.address, 
                    star: data.secondBlock.star 
                })                        
            ]);             
        });
    });

    afterEach(function() {
        clock.restore();
    });
}); 