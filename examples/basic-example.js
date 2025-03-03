/**
 * Intellex Framework Basic Example
 * 
 * This example demonstrates the basic usage of the Intellex framework,
 * including agent creation, reputation tracking, and cross-chain operations.
 */

// Import the Intellex framework
const intellex = require('../intellex');

// Initialize the framework with configuration
const framework = intellex.init({
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: ['ethereum', 'near'],
  intentProcessing: true,
});

// Main function to run the example
async function runExample() {
  console.log('Intellex Framework Basic Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Create an AI agent
    console.log('\n1. Creating an AI agent...');
    const agent = framework.createAgent({
      name: 'ExampleAgent',
      capabilities: ['text-processing', 'data-analysis'],
      reputationThreshold: 0.7,
    });
    
    console.log(`Agent created: ${agent.name} (${agent.id})`);
    
    // Deploy the agent
    console.log('\n2. Deploying the agent...');
    const deployResult = await agent.deploy();
    console.log(`Agent deployed: ${deployResult}`);
    
    // Get the reputation system
    console.log('\n3. Accessing the reputation system...');
    const reputationSystem = framework.getReputationSystem();
    
    // Register the agent with the reputation system
    console.log('\n4. Registering agent with reputation system...');
    const registrationResult = reputationSystem.registerAgent(agent.id, 0.5);
    console.log(`Agent registered: ${registrationResult}`);
    
    // Submit ratings for the agent
    console.log('\n5. Submitting ratings for the agent...');
    reputationSystem.submitRating(agent.id, 0.8, 'user1', { task: 'text-analysis' });
    reputationSystem.submitRating(agent.id, 0.9, 'user2', { task: 'data-processing' });
    reputationSystem.submitRating(agent.id, 0.7, 'user3', { task: 'question-answering' });
    
    // Get the agent's reputation score
    const score = reputationSystem.getReputationScore(agent.id);
    console.log(`Agent reputation score: ${score}`);
    
    // Verify the agent's reputation
    const isVerified = reputationSystem.verifyAgentReputation(agent.id, 0.7);
    console.log(`Agent reputation verified: ${isVerified}`);
    
    // Get the cross-chain bridge
    console.log('\n6. Accessing the cross-chain bridge...');
    const crossChainBridge = framework.getCrossChainBridge();
    
    // Get supported chains
    const supportedChains = crossChainBridge.getSupportedChains();
    console.log(`Supported chains: ${supportedChains.join(', ')}`);
    
    // Perform a cross-chain transfer
    console.log('\n7. Performing a cross-chain transfer...');
    const transferResult = await crossChainBridge.transferCrossChain(
      'ethereum',
      'near',
      {
        sourceAddress: '0x1234567890abcdef1234567890abcdef12345678',
        targetAddress: 'example.near',
        amount: '1.0',
        asset: 'ETH',
      }
    );
    
    console.log('Transfer initiated:');
    console.log(`  Transfer ID: ${transferResult.transferId}`);
    console.log(`  Source Chain: ${transferResult.sourceChain}`);
    console.log(`  Target Chain: ${transferResult.targetChain}`);
    console.log(`  Status: ${transferResult.status}`);
    
    // Get the intent processor
    console.log('\n8. Processing natural language intents...');
    const intentProcessor = framework.getIntentProcessor();
    
    // Process some example intents
    const queryResult = await intentProcessor.processText('What is the reputation score of ExampleAgent?');
    console.log('Query intent processed:');
    console.log(`  Success: ${queryResult.success}`);
    console.log(`  Intent Type: ${queryResult.intent.intentType}`);
    console.log(`  Confidence: ${queryResult.intent.confidence}`);
    
    const actionResult = await intentProcessor.processText('Execute data analysis task with ExampleAgent');
    console.log('Action intent processed:');
    console.log(`  Success: ${actionResult.success}`);
    console.log(`  Intent Type: ${actionResult.intent.intentType}`);
    console.log(`  Action: ${actionResult.intent.action}`);
    
    // Execute a task with the agent
    console.log('\n9. Executing a task with the agent...');
    const taskResult = await agent.executeTask({
      type: 'data-analysis',
      data: { values: [1, 2, 3, 4, 5] },
      options: { method: 'average' },
    });
    
    console.log('Task executed:');
    console.log(`  Success: ${taskResult.success}`);
    console.log(`  Result: ${taskResult.result}`);
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample().catch(console.error); 