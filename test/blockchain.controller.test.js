// Import the dependencies for testing
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const sinon = require('sinon');

const server = require('../app.js');
const app = server.app;
const blockchain = server.blockchain;

describe('BlockchainController', () => {
    const data = { 
        one: {
            time: 1554145343000,
            address: 'n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC',
            message: 'n1WSqPkDBXWnV3UGsiEkxyuJvxaRXrffLC:1554145343:starRegistry',
            signature: 'IDw6dVmBEjmXgH7b8FvVlQgPGRLHw6JC2t63BNoQdZNMG4XxjUBN2C+rdROmsdo8L1JPI4yauRxvT/gI/JhEs1E=',
            star: {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Testing the story 4"
            }            
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
            }            
        }
    }

    let clock;

    beforeEach(function() {
        clock = sinon.useFakeTimers({ now: data.one.time });  
    });

    describe('getBlockByHeight', () => {        
        it('should get the genesis block', (done) => {
            const height = 0;         
            chai.request(app)
                .get(`/block/height/${height}`)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.height).to.equals(0);
                    done();
                });                
         });
    });

    describe('requestOwnership', () => {
        it('should return the message', (done) => {                      
            chai.request(app)
                .post('/requestValidation')
                .send({ 'address': data.one.address })
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).equals(data.one.message);
                    done();
                });                
         });
    });

    describe('submitStar', () => {
        it('should add new star', (done) => {
            const length = blockchain.chain.length;
            chai.request(app)
                .post('/submitstar')
                .send({
                    'address': data.one.address,
                    'message': data.one.message,
                    'signature': data.one.signature,
                    'star': data.one.star
                })
                .end(function (err, res) {
                    console.log(res.body);
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(blockchain.chain.length).equals(length+1);
                    done();
                });                
         });
    });

    describe('getStarsByOwner', () => {
        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: data.two.time });
            blockchain.submitStar(
                data.two.address,
                data.two.message,
                data.two.signature,
                data.two.star
            );
        });

        it('should get star(s) by addressr', (done) => {  
            const address = data.two.address;
            chai.request(app)
                .get(`/blocks/${address}`)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.length).equals(1);
                    expect(res.body[0].owner).equals(data.two.address);
                    done();
                });                                          
         });
    });

    describe('validateChain', () => {
        let block;

        beforeEach(function() {
            clock = sinon.useFakeTimers({ now: data.one.time });
            blockchain.submitStar(
                data.one.address,
                data.one.message,
                data.one.signature,
                data.one.star
            );
        });

        it('should return no error when the the chain is valid', (done) => {  
            chai.request(app)
                .get('/validateChain')
                .end(function (err, res) {                   
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.text).equals('The chain is valid.');
                    done();
                });                                          
         });

         it('should return error(s) when the chain is not valid', (done) => {  
            let block = blockchain.chain[blockchain.chain.length-1];
            block.body = 'foo';
            
            chai.request(app)
                .get('/validateChain')
                .end(function (err, res) {
                    console.log(res.body);                    
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body.length).equals(1);
                    expect(res.body).to.include(`Block ${block.hash} is invalid`);
                    done();
                });                                          
         });
    });


    afterEach(function() {
        clock.restore();
    });
});