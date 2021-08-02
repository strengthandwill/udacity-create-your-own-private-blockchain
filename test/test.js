const SHA256 = require('crypto-js/sha256');
const BlockClass = require('../src/block.js');

var chai = require('chai');
var expect = chai.expect;

var chaiAsPromised = require('chai-as-promised');
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
            return expect(result).to.eventually.equal(true);
        });

        it('should be invalid', function() {
            block.time = -1;

            const result = block.validate();
            return expect(result).to.eventually.equal(false);
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