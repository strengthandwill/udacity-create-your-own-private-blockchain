const SHA256 = require('crypto-js/sha256');
const BlockClass = require('../src/block.js');
const BlockchainClass = require('../src/blockchain.js');

var chai = require('chai');
var expect = chai.expect;

var chaiAsPromised = require('chai-as-promised');
const { Blockchain } = require('../src/blockchain.js');
chai.use(chaiAsPromised);

describe ('Block', function() {
    describe ('validate()', function() {
        let block;
        before(function() {
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
    describe ('initializeChain()', function() {
        it('should create Genesis Block', function() {
            let blockchain = new BlockchainClass.Blockchain();  
            const result = blockchain.chain[0];
            return expect(result.previousBlockHash).to.be.null &&
                expect(result.time).to.not.be.null &&
                expect(result.height).to.be.equal(0) &&
                expect(result.hash).to.not.be.null;
        });
    });
}); 