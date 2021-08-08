const SHA256 = require('crypto-js/sha256');
const BlockClass = require('../src/block.js');
const BlockchainClass = require('../src/blockchain.js');

var chai = require('chai');
var expect = chai.expect;
const sinon = require("sinon");

var chaiAsPromised = require('chai-as-promised');
const { Blockchain } = require('../src/blockchain.js');
chai.use(chaiAsPromised);

describe ('Block', function() {
    describe ('validate()', function() {
        let block;
        beforeEach(function() {
            block = new BlockClass.Block("foo");
            block.hash = SHA256(JSON.stringify(block)).toString();
        });

        it('should be valid', function() {
            const result = block.validate();
            console.log(result);
            return expect(result).to.eventually.be.true;
        });

        it('should be invalid', function() {
            block.time = -1;

            const result = block.validate();
            return expect(result).to.eventually.be.false;
        });
    });

    describe ('getBData()', function() {    
        let block;
        before(function() {
            block = new BlockClass.Block("foo");            
        });

        it('should be non-genesis block', function() {
            block.height = 1;
            const result = block.getBData();
            return expect(result).to.eventually.equal("foo");
        });

        it('should be genesis block', function() {
            block.height = 0;
            const result = block.getBData();
            return expect(result).to.eventually.rejectedWith("Block is genesis block");
        });
    });   
});

describe ('Blockchain', function() {
    let blockchain;
    beforeEach(function() {
        blockchain = new BlockchainClass.Blockchain();
    });

    describe ('initializeChain()', function() {
        it('should create Genesis Block', function() {            
            const result = blockchain.chain[0];
            return expect(result.previousBlockHash).to.be.null &&
                expect(result.time).to.not.be.null &&
                expect(result.height).to.equal(0) &&
                expect(result.hash).to.not.be.null;
        });
    });

    describe ('requestMessageOwnershipVerification()', function() {
        it('should return message', function() {
            const result = blockchain.requestMessageOwnershipVerification("mpxAH46JQTkKUVJB2hnuFgVPQ2bAzY5PxkB");
            return expect(result).to.eventually.matches(/^mpxAH46JQTkKUVJB2hnuFgVPQ2bAzY5PxkB:.*:starRegistry$/);
        });
    });

    describe ('submitStar()', function() {
        const time = 1554145343000;
        const address = "n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC";
        const message = `n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC:${time.toString().slice(0, -3)}:starRegistry`;
        const signature = "IDw6dVmBEjmXgH7b8FvVlQgPGRLHw6JC2t63BNoQdZNMG4XxjUBN2C+rdROmsdo8L1JPI4yauRxvT/gI/JhEs1E=";
        const star = {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Testing the story 4"
        };
        const hash = "027c5ec0bc7c571264e91d04fbea28761b543f7afbe3862bbf89aff8d36ae71a";
        const body = "7b2264617461223a226e31575371506b444258576e563355477369456b7879754a76786152587266664c433a313535343134353334333a737461725265676973747279227d"
        const previousBlockHash = "a7a0cecfd2ba3221a33a6615780b299326eb7a837c63d7110a864cd092f193e3";
        var clock;

        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: time });
        });

        it('should return error that the time elapsed is more than 5 minutes', function() {   
            clock = sinon.useFakeTimers({ now: time + 301000 });
            const result = blockchain.submitStar(address, message, signature, star);            
            return expect(result).to.eventually.rejectedWith("The time elapsed is more than 5 minutes");
        });

        it('should return error that the bitcoin message is invalid', function() {              
            const invalid_signature = "foo";
            const result = blockchain.submitStar(address, message, invalid_signature, star);            
            return expect(result).to.eventually.rejectedWith("The bitcoin message is not valid");
        });

        it('should add new block', function() {              
            const result = blockchain.submitStar(address, message, signature, star);   
            return Promise.all([
                expect(result).to.eventually.have.property("hash", hash),
                expect(result).to.eventually.have.property("height", 1),                
                expect(result).to.eventually.have.property("body", body),
                expect(result).to.eventually.have.property("previousBlockHash", previousBlockHash)
            ])            
        });

        afterEach(function() {
            clock.restore();
        });
    });
}); 