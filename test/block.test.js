const SHA256 = require('crypto-js/sha256');
const BlockClass = require('../src/block.js');

const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('Block', function() {
    let block;

    beforeEach(function() {
        block = new BlockClass.Block('foo');
        block.hash = SHA256(JSON.stringify(block)).toString();
    });

    describe('validate()', function() {
        it('should be valid', function() {
            const result = block.validate();
            return expect(result).to.eventually.be.true;
        });

        it('should be invalid', function() {
            block.time = -1;
            const result = block.validate();
            return expect(result).to.eventually.be.false;
        });
    });

    describe('getBData()', function() {    
        it('should be non-genesis block', function() {
            block.height = 1;
            const result = block.getBData();
            return expect(result).to.eventually.equal('foo');
        });

        it('should return error that the block is genesis block', function() {
            block.height = 0;
            const result = block.getBData();
            return expect(result).to.eventually.rejectedWith('The block is a genesis block');
        });
    });   
});