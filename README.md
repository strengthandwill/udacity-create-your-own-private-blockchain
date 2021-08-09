# Create Your Own Private Blockchain

## Complete unfinished block.js implementation
- Tests for block.js are written in `block.test.gs`.
- Run the tests using the command `npm test -- --grep "BlockTest"`.
![](/images/test1-block.png)

## Complete unfinished blockchain.js implementation
- Tests for blockchain.js are written in `blockchain.test.js`.
- Run the tests using the command  `npm test -- --grep "BlockchainTest"`.
![](/images/test2-blockchain.png)

## Test your App functionality
- Tests for BlockchainController.js are written in `blockchain.controller.test.js`.
- Run the tests using the command  `npm test -- --grep "BlockchainControllerTest"`.
![](/images/test3-blockchain-controller.png)

### Screenshots
1. Must use a GET call to request the Genesis block:
    ![](/images/screenshot1-must-use-a-get-call-to-request-the-genesis-block.png)
2. Must use a POST call to requestValidation:
    ![](/images/screenshot2-must-use-a-post-call-to-requestvalidation.png)
4. Must sign message with your wallet:
    ![](/images/screenshot3-must-sign-message-with-your-wallet.png)
5. Must submit your Star:
     ![](/images/screenshot4-must-submit-your-star.png)
6. Must use GET call to retrieve starts owned by a particular address
    ![](/images/screenshot5-must-use-get-call-to-retrieve-starts-owned-by-a-particular-address.png)