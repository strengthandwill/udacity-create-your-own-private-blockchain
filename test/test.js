const SHA256 = require('crypto-js/sha256');
const BlockClass = require('../src/block.js');

var chai = require('chai');
var expect = chai.expect;

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe ('Block', function() {
    describe ('validate()', function() {        
        before(function() {
            block = new BlockClass.Block("foo");
            block.hash = SHA256(JSON.stringify(block)).toString();
        });

        it('should be valid', function() {
            result = block.validate();
            return expect(result).to.eventually.equal(true);
        });

        it('should be invalid', function() {
            block.time = -1;

            result = block.validate();
            return expect(result).to.eventually.equal(false);
        });
    });
});