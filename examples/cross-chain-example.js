/**
 * Intellex Framework Cross-Chain Example
 * 
 * This example demonstrates cross-chain operations using the OmniBridge integration,
 * allowing for seamless interaction between NEAR, Ethereum, and Aurora networks.
 */

// Import the Intellex framework
const intellex = require('../intellex');

// Initialize the framework with configuration
const framework = intellex.init({
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: ['ethereum', 'near', 'aurora'],
  intentProcessing: true,
});

// Main function to run the example
async function runExample() {
  console.log('Intellex Framework Cross-Chain Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Get the cross-chain bridge
    console.log('\n1. Accessing the cross-chain bridge...');
    const crossChainBridge = framework.getCrossChainBridge();
    
    // Get the OmniBridge integration
    console.log('\n2. Accessing the OmniBridge integration...');
    const omniBridge = new intellex.OmniBridgeIntegration({
      nearNetwork: 'testnet',
      ethereumNetwork: 'goerli',
      auroraNetwork: 'testnet',
    });
    
    // Simulate a key pair for signing
    const keyPair = {
      sign: (message) => Buffer.from(`signed_${Date.now()}`),
      publicKey: 'ed25519:5FwoV3MFB94ExfgycBvUQaTEToaLMTLkpaMzWDXYBRXh',
    };
    
    // Create a cross-chain message from NEAR to Ethereum
    console.log('\n3. Creating a cross-chain message from NEAR to Ethereum...');
    const nearToEthMessage = crossChainBridge.createCrossChainMessage(
      'near',
      'ethereum',
      {
        action: 'transfer',
        token: 'USDC',
        amount: '10.0',
        recipient: '0x1234567890abcdef1234567890abcdef12345678',
      },
      keyPair,
      'example.testnet'
    );
    
    console.log(`Cross-chain message created: ${nearToEthMessage.id}`);
    console.log(`  Source Chain: ${nearToEthMessage.sourceChain}`);
    console.log(`  Target Chain: ${nearToEthMessage.targetChain}`);
    console.log(`  Action: ${nearToEthMessage.payload.action}`);
    console.log(`  Token: ${nearToEthMessage.payload.token}`);
    console.log(`  Amount: ${nearToEthMessage.payload.amount}`);
    console.log(`  Recipient: ${nearToEthMessage.payload.recipient}`);
    
    // Send the cross-chain message
    console.log('\n4. Sending the cross-chain message...');
    const sendResult = await omniBridge.sendMessage(nearToEthMessage);
    
    console.log(`Message sent: ${sendResult.success}`);
    console.log(`  Transaction Hash: ${sendResult.transactionHash}`);
    console.log(`  Estimated Time: ${sendResult.estimatedTimeMinutes} minutes`);
    
    // Create a cross-chain message from Ethereum to NEAR
    console.log('\n5. Creating a cross-chain message from Ethereum to NEAR...');
    const ethToNearMessage = crossChainBridge.createCrossChainMessage(
      'ethereum',
      'near',
      {
        action: 'call_contract',
        contract: 'nft.example.testnet',
        method: 'mint',
        args: {
          token_id: '123',
          metadata: {
            title: 'Cross-Chain NFT',
            description: 'An NFT created via cross-chain call',
            media: 'https://example.com/nft.png',
          },
          receiver_id: 'recipient.testnet',
        },
      },
      keyPair,
      '0x9876543210abcdef9876543210abcdef98765432'
    );
    
    console.log(`Cross-chain message created: ${ethToNearMessage.id}`);
    console.log(`  Source Chain: ${ethToNearMessage.sourceChain}`);
    console.log(`  Target Chain: ${ethToNearMessage.targetChain}`);
    console.log(`  Action: ${ethToNearMessage.payload.action}`);
    console.log(`  Contract: ${ethToNearMessage.payload.contract}`);
    console.log(`  Method: ${ethToNearMessage.payload.method}`);
    
    // Create a cross-chain message from NEAR to Aurora
    console.log('\n6. Creating a cross-chain message from NEAR to Aurora...');
    const nearToAuroraMessage = crossChainBridge.createCrossChainMessage(
      'near',
      'aurora',
      {
        action: 'deploy_contract',
        bytecode: '0x608060405234801561001057600080fd5b50...',
        constructorArgs: ['Example Contract', 'EXC'],
      },
      keyPair,
      'example.testnet'
    );
    
    console.log(`Cross-chain message created: ${nearToAuroraMessage.id}`);
    console.log(`  Source Chain: ${nearToAuroraMessage.sourceChain}`);
    console.log(`  Target Chain: ${nearToAuroraMessage.targetChain}`);
    console.log(`  Action: ${nearToAuroraMessage.payload.action}`);
    
    // Check message status
    console.log('\n7. Checking message status...');
    const messageStatus = await omniBridge.getMessageStatus(nearToEthMessage.id);
    
    console.log(`Message status: ${messageStatus.status}`);
    console.log(`  Progress: ${messageStatus.progress}%`);
    console.log(`  Confirmations: ${messageStatus.confirmations}`);
    
    // Demonstrate token bridging
    console.log('\n8. Bridging tokens from NEAR to Ethereum...');
    const bridgeResult = await omniBridge.bridgeTokens({
      sourceChain: 'near',
      targetChain: 'ethereum',
      token: 'USDC',
      amount: '50.0',
      sender: 'example.testnet',
      recipient: '0x1234567890abcdef1234567890abcdef12345678',
      keyPair,
    });
    
    console.log(`Token bridge initiated: ${bridgeResult.success}`);
    console.log(`  Transaction Hash: ${bridgeResult.transactionHash}`);
    console.log(`  Estimated Completion Time: ${bridgeResult.estimatedTimeMinutes} minutes`);
    
    // Get supported tokens
    console.log('\n9. Getting supported tokens...');
    const supportedTokens = await omniBridge.getSupportedTokens();
    
    console.log('Supported tokens:');
    supportedTokens.forEach(token => {
      console.log(`  ${token.symbol} (${token.name})`);
      console.log(`    NEAR: ${token.addresses.near}`);
      console.log(`    Ethereum: ${token.addresses.ethereum}`);
      console.log(`    Aurora: ${token.addresses.aurora}`);
    });
    
    // Get bridge fees
    console.log('\n10. Getting bridge fees...');
    const bridgeFees = await omniBridge.getBridgeFees({
      sourceChain: 'near',
      targetChain: 'ethereum',
      token: 'USDC',
      amount: '100.0',
    });
    
    console.log(`Bridge fees:`);
    console.log(`  Base Fee: ${bridgeFees.baseFee} ${bridgeFees.feeToken}`);
    console.log(`  Gas Fee: ${bridgeFees.gasFee} ${bridgeFees.feeToken}`);
    console.log(`  Total Fee: ${bridgeFees.totalFee} ${bridgeFees.feeToken}`);
    
    // Demonstrate multi-chain signature verification
    console.log('\n11. Verifying multi-chain signatures...');
    
    // Create a message to be signed
    const message = {
      action: 'approve',
      nonce: Date.now(),
      data: {
        contract: '0x1234567890abcdef1234567890abcdef12345678',
        method: 'setApprovalForAll',
        params: {
          operator: '0x9876543210abcdef9876543210abcdef98765432',
          approved: true,
        },
      },
    };
    
    // Sign the message on NEAR
    const nearSignature = await omniBridge.signMessage(message, 'near', keyPair, 'example.testnet');
    
    console.log(`Message signed on NEAR: ${nearSignature.signature}`);
    
    // Verify the signature on Ethereum
    const verificationResult = await omniBridge.verifySignature(
      message,
      nearSignature.signature,
      'near',
      'ethereum',
      'example.testnet'
    );
    
    console.log(`Signature verification on Ethereum: ${verificationResult.valid}`);
    console.log(`  Verification proof: ${verificationResult.proof}`);
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample().catch(console.error); 