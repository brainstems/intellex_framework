/**
 * Intellex Framework NEAR Integration Example
 * 
 * This example demonstrates the integration with NEAR Protocol's Chain Abstraction features,
 * including Intents, Chain Signatures, and cross-chain capabilities.
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
  console.log('Intellex Framework NEAR Integration Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Get the NEAR integration
    console.log('\n1. Accessing NEAR integration...');
    const nearIntegration = framework.getNearIntegration();
    
    // Create a NEAR account
    console.log('\n2. Creating a NEAR account...');
    const account = await nearIntegration.createAccount('example.testnet', {
      accessKeys: [
        {
          publicKey: 'ed25519:5FwoV3MFB94ExfgycBvUQaTEToaLMTLkpaMzWDXYBRXh',
          permission: 'FullAccess',
        },
      ],
    });
    
    console.log(`Account created: ${account.accountId}`);
    
    // Create a function call access key
    console.log('\n3. Creating a function call access key...');
    const accessKey = await nearIntegration.createFunctionCallAccessKey(
      'example.testnet',
      'counter.testnet',
      ['increment', 'decrement', 'get_count'],
      '10000000000000000000000' // 0.01 NEAR
    );
    
    console.log(`Function call access key created: ${accessKey.publicKey}`);
    
    // Get all access keys
    console.log('\n4. Getting all access keys...');
    const accessKeys = nearIntegration.getAccessKeys('example.testnet');
    
    console.log(`Number of access keys: ${accessKeys.length}`);
    accessKeys.forEach((key, index) => {
      console.log(`Key ${index + 1}: ${key.publicKey} (${key.permission.permission})`);
    });
    
    // Create a subaccount
    console.log('\n5. Creating a subaccount...');
    const subaccount = await nearIntegration.createSubaccount('example.testnet', 'sub');
    
    console.log(`Subaccount created: ${subaccount.accountId}`);
    
    // Get the NEAR Intents integration
    console.log('\n6. Accessing NEAR Intents integration...');
    const nearIntents = new intellex.NearIntentsIntegration({
      nearNetwork: 'testnet',
    });
    
    // Create a transfer intent
    console.log('\n7. Creating a transfer intent...');
    const transferIntent = nearIntents.createIntent('transfer', {
      receiver: 'recipient.testnet',
      amount: '1000000000000000000000000', // 1 NEAR
    }, {
      sender: 'example.testnet',
    });
    
    console.log(`Transfer intent created: ${transferIntent.id}`);
    console.log(`  Type: ${transferIntent.type}`);
    console.log(`  Sender: ${transferIntent.sender}`);
    console.log(`  Receiver: ${transferIntent.params.receiver}`);
    console.log(`  Amount: ${transferIntent.params.amount} yoctoNEAR`);
    
    // Simulate a key pair for signing
    const keyPair = {
      sign: (message) => Buffer.from(`signed_${Date.now()}`),
      publicKey: 'ed25519:5FwoV3MFB94ExfgycBvUQaTEToaLMTLkpaMzWDXYBRXh',
    };
    
    // Sign the intent
    console.log('\n8. Signing the transfer intent...');
    const signedIntent = await nearIntents.signIntent(
      transferIntent,
      'example.testnet',
      keyPair
    );
    
    console.log(`Intent signed: ${signedIntent.signature}`);
    
    // Verify the intent signature
    console.log('\n9. Verifying the intent signature...');
    const isValid = nearIntents.verifyIntentSignature(signedIntent);
    
    console.log(`Signature valid: ${isValid}`);
    
    // Get the cross-chain bridge
    console.log('\n10. Accessing the cross-chain bridge...');
    const crossChainBridge = framework.getCrossChainBridge();
    
    // Create a cross-chain message
    console.log('\n11. Creating a cross-chain message...');
    const crossChainMessage = crossChainBridge.createCrossChainMessage(
      'near',
      'ethereum',
      {
        action: 'transfer',
        token: 'ETH',
        amount: '0.1',
        recipient: '0x1234567890abcdef1234567890abcdef12345678',
      },
      keyPair,
      'example.testnet'
    );
    
    console.log(`Cross-chain message created: ${crossChainMessage.id}`);
    console.log(`  Source Chain: ${crossChainMessage.sourceChain}`);
    console.log(`  Target Chain: ${crossChainMessage.targetChain}`);
    console.log(`  Sender: ${crossChainMessage.sender}`);
    console.log(`  Signature: ${crossChainMessage.signature}`);
    
    // Verify the cross-chain message
    console.log('\n12. Verifying the cross-chain message...');
    const isMessageValid = crossChainBridge.verifyCrossChainMessage(crossChainMessage);
    
    console.log(`Message valid: ${isMessageValid}`);
    
    // Process a natural language intent
    console.log('\n13. Processing a natural language intent...');
    const intentProcessor = framework.getIntentProcessor();
    
    const intentResult = await intentProcessor.processText(
      'Transfer 1 NEAR from example.testnet to recipient.testnet'
    );
    
    console.log(`Intent processed: ${intentResult.success}`);
    console.log(`  Intent type: ${intentResult.intent.intentType}`);
    console.log(`  Confidence: ${intentResult.intent.confidence}`);
    
    if (intentResult.success && intentResult.result.nearIntent) {
      console.log(`  NEAR Intent created: ${intentResult.result.nearIntent.id}`);
      console.log(`  NEAR Intent type: ${intentResult.result.nearIntent.type}`);
    }
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample().catch(console.error); 