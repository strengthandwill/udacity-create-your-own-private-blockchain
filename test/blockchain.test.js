const BlockchainClass = require('../src/blockchain.js');

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');

describe('BlockchainTest', function() {
    let blockchain;
    let clock;

    const data = {
        genesis: {
            time: 1554144743000,
            hash: 'd05de81ce1e904a581d5f25c8789c5e1fe61f5d647bdcdbc65dfc6ce57bf42ec',
            height: 0,
            body: '7b2264617461223a2247656e6573697320426c6f636b227d'
        },  
        one: {
            time: 1554145343000,
            address: 'n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC',
            message: 'n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC:1554145343:starRegistry',
            signature: 'IDw6dVmBEjmXgH7b8FvVlQgPGRLHw6JC2t63BNoQdZNMG4XxjUBN2C+rdROmsdo8L1JPI4yauRxvT/gI/JhEs1E=',
            star: {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Testing the story 4"
            },
            hash: 'c20dd0648ac674e7f87bfab13fdaf56dfd42a136c1de72662cc3d2f638cbff49',
            height: 1,
            body: '7b226f776e6572223a226e31575371506b444258576e563355477369456b7879754a76786152587266664c43222c2273746172223a7b22646563223a223638c2b0203532272035362e39222c227261223a223136682032396d20312e3073222c2273746f7279223a2254657374696e67207468652073746f72792034227d7d',
            previousHash: 'd05de81ce1e904a581d5f25c8789c5e1fe61f5d647bdcdbc65dfc6ce57bf42ec'
        },
        two: {
            time: 1554145943000,
            address: 'moHNUnnRBCVWVPWdwiyuFifEckbm7GP8cJ',
            message: 'moHNUnnRBCVWVPWdwiyuFifEckbm7GP8cJ:1554145943000:starRegistry',
            signature: 'H9Vw7/VbgpZSGgoHciYvm2GzBzM0fz2r4uszyNJIdhedaZ+qzoTuJBYOeVsCwzz4v1iPOHGpAV+r1fTpvDSgvB0=',
            star: {
                "dec": "86° 25' 96.5",
                "ra": "18h 40m 2.0s",
                "story": "Testing the story 5"
            },            
            hash: 'c7509a56b3365ccf3399c73917566e81d6cb17c9a99a5a7128a907543c49f091',
            height: 2,
            body: '7b226f776e6572223a226d6f484e556e6e5242435657565057647769797546696645636b626d37475038634a222c2273746172223a7b22646563223a223836c2b0203235272039362e35222c227261223a223138682034306d20322e3073222c2273746f7279223a2254657374696e67207468652073746f72792035227d7d',
            previousHash: 'c20dd0648ac674e7f87bfab13fdaf56dfd42a136c1de72662cc3d2f638cbff49'
        }
    };

    beforeEach(function() {
        clock = sinon.useFakeTimers({ now: data.genesis.time });
        blockchain = new BlockchainClass.Blockchain();
    });

    describe('initializeChain()', function() {        
        it('should create Genesis Block', function() {            
            const result = blockchain.chain[0];
            return Promise.all([
                expect(result).to.have.property('hash', data.genesis.hash),
                expect(result).to.have.property('height', data.genesis.height),
                expect(result).to.have.property('body', data.genesis.body),
                expect(result).to.have.property('previousBlockHash', null)
            ]);            
        });
    });

    describe ('requestMessageOwnershipVerification()', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: data.one.time });
        });

        it('should return message', function() {
            const result = blockchain.requestMessageOwnershipVerification(data.one.address);
            return expect(result).to.eventually.be.equal(data.one.message);
        });
    });

    describe('submitStar()', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: data.one.time });
        });

        it('should add new block', function() {        
            const result = blockchain.submitStar(data.one.address, data.one.message, 
                data.one.signature, data.one.star);      
            return Promise.all([
                expect(result).to.eventually.have.property('hash', data.one.hash),
                expect(result).to.eventually.have.property('height', data.one.height),                
                expect(result).to.eventually.have.property('body', data.one.body),
                expect(result).to.eventually.have.property('previousBlockHash', data.one.previousHash)
            ]);            
        });

        it('should return error that the time elapsed is more than 5 minutes', function() {   
            clock = sinon.useFakeTimers({ now: data.one.time + 301000 });
            const result = blockchain.submitStar(data.one.address, data.one.message, 
                data.one.signature, data.one.star);              
            return expect(result).to.eventually.rejectedWith('The time elapsed is more than 5 minutes');
        });

        it('should return error that the bitcoin message is invalid', function() {              
            const invalid_signature = 'foo';
            const result = blockchain.submitStar(data.one.address, data.one.message, 
                invalid_signature, data.one.star);              
            return expect(result).to.eventually.rejectedWith('The bitcoin message is not valid');
        });        
    });


    describe('getBlockByHash', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: data.one.time });
            blockchain.submitStar(data.one.address, data.one.message, 
                data.one.signature, data.one.star);
        });

        it('should return block as block is found', function() {
            const result = blockchain.getBlockByHash(data.one.hash);
            return Promise.all([
                expect(result).to.eventually.have.property('hash', data.one.hash),
                expect(result).to.eventually.have.property('height', data.one.height),                
                expect(result).to.eventually.have.property('body', data.one.body),
                expect(result).to.eventually.have.property('previousBlockHash', data.one.previousHash)
            ]); 
        });

        it('should return null as block is not found', function() {
            const result = blockchain.getBlockByHash('foo');
            expect(result).to.eventually.be.null;
        });
    });

    describe('getStarsByWalletAddress', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: data.one.time });
            blockchain.submitStar(data.one.address, data.one.message, 
                data.one.signature, data.one.star);
                clock = sinon.useFakeTimers({ now: data.two.time });
            blockchain.submitStar(data.two.address, data.two.message, 
                data.two.signature, data.two.star);  
        });

        it('should return stars that belongs to owner', function() {            
            const result = blockchain.getStarsByWalletAddress(data.one.address);            
            return Promise.all([
                expect(result).to.eventually.have.length(1),                
                expect(result).to.eventually.deep.include({ 
                    owner: data.one.address, 
                    star: data.one.star 
                })                        
            ]);             
        });
    });

    describe('validateChain', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: data.one.time });
            blockchain.submitStar(data.one.address, data.one.message, 
                data.one.signature, data.one.star);
                clock = sinon.useFakeTimers({ now: data.two.time });
            blockchain.submitStar(data.two.address, data.two.message, 
                data.two.signature, data.two.star);  
        });

        it('should return no error when chain is valid', function() {
            const result = blockchain.validateChain();
            return Promise.all([
                expect(result).to.eventually.have.length(0)
            ]);
        });

        it('should return error when there is invalid block(s)', function() { 
            blockchain.chain[1].body = 'foo';
            const result = blockchain.validateChain();
            return Promise.all([
                expect(result).to.eventually.have.length(1),
                expect(result).to.eventually.have.include(`Block ${data.one.hash} is invalid`)
            ]);           
        });

        it('should return error when the chain is broken', function() {
            blockchain.chain.splice(1, 1);
            const result = blockchain.validateChain();
            return Promise.all([
                expect(result).to.eventually.have.length(1),
                expect(result).to.eventually.have.include(`Block ${data.two.hash} is broken from the chain`)
            ]);
        });
    });

    afterEach(function() {
        clock.restore();
    });
}); 