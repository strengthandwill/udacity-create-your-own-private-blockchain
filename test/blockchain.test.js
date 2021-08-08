const BlockchainClass = require('../src/blockchain.js');

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const sinon = require('sinon');

describe('Blockchain', function() {
    const time = 1554145343000;
    const address = 'n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC';
    const message = `n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC:${time.toString().slice(0, -3)}:starRegistry`;
    const signature = 'IDw6dVmBEjmXgH7b8FvVlQgPGRLHw6JC2t63BNoQdZNMG4XxjUBN2C+rdROmsdo8L1JPI4yauRxvT/gI/JhEs1E=';
    const star = {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "Testing the story 4"
    };

    const secondBlockHash = '027c5ec0bc7c571264e91d04fbea28761b543f7afbe3862bbf89aff8d36ae71a';
    const secondBlockBody = '7b2264617461223a226e31575371506b444258576e563355477369456b7879754a76786152587266664c433a313535343134353334333a737461725265676973747279227d';
    const secondBlockPreviousBlockHash = 'a7a0cecfd2ba3221a33a6615780b299326eb7a837c63d7110a864cd092f193e3';

    let blockchain;
    let clock;

    beforeEach(function() {
        clock = sinon.useFakeTimers({ now: time });
        blockchain = new BlockchainClass.Blockchain();
    });

    describe('initializeChain()', function() {
        const hash = 'a7a0cecfd2ba3221a33a6615780b299326eb7a837c63d7110a864cd092f193e3';
        const body = '7b2264617461223a2247656e6573697320426c6f636b227d';
        
        it('should create Genesis Block', function() {            
            const result = blockchain.chain[0];
            return Promise.all([
                expect(result).to.have.property('hash', hash),
                expect(result).to.have.property('height', 0),                
                expect(result).to.have.property('body', body),
                expect(result).to.have.property('previousBlockHash', null)
            ]);            
        });
    });

    describe ('requestMessageOwnershipVerification()', function() {
        it('should return message', function() {
            const result = blockchain.requestMessageOwnershipVerification(address);
            return expect(result).to.eventually.be.equal(`${address}:${time.toString().slice(0, -3)}:starRegistry`);
        });
    });

    describe('submitStar()', function() {
        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: time });
        });

        it('should add new block', function() {              
            const result = blockchain.submitStar(address, message, signature, star);   
            return Promise.all([
                expect(result).to.eventually.have.property('hash', secondBlockHash),
                expect(result).to.eventually.have.property('height', 1),                
                expect(result).to.eventually.have.property('body', secondBlockBody),
                expect(result).to.eventually.have.property('previousBlockHash', secondBlockPreviousBlockHash)
            ]);            
        });

        it('should return error that the time elapsed is more than 5 minutes', function() {   
            clock = sinon.useFakeTimers({ now: time + 301000 });
            const result = blockchain.submitStar(address, message, signature, star);            
            return expect(result).to.eventually.rejectedWith('The time elapsed is more than 5 minutes');
        });

        it('should return error that the bitcoin message is invalid', function() {              
            const invalid_signature = 'foo';
            const result = blockchain.submitStar(address, message, invalid_signature, star);            
            return expect(result).to.eventually.rejectedWith('The bitcoin message is not valid');
        });        
    });


    describe('getBlockByHash', function() {
        beforeEach(function() {
            blockchain.submitStar(address, message, signature, star);
        });

        it('should return block as block is found', function() {
            const result = blockchain.getBlockByHash(secondBlockHash);
            return Promise.all([
                expect(result).to.eventually.have.property('hash', secondBlockHash),
                expect(result).to.eventually.have.property('height', 1),                
                expect(result).to.eventually.have.property('body', secondBlockBody),
                expect(result).to.eventually.have.property('previousBlockHash', secondBlockPreviousBlockHash)
            ]); 
        });

        it('should return null as block is not found', function() {
            const result = blockchain.getBlockByHash('foo');
            expect(result).to.eventually.be.null;
        });
    });

    afterEach(function() {
        clock.restore();
    });
}); 