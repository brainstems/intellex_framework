# Getting Started with Intellex Framework

This guide will help you get started with the Intellex Framework, a comprehensive solution for building decentralized AI agent systems with reputation tracking, cross-chain interoperability, and intent-based interactions.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- A NEAR account (for blockchain integration)

## Installation

Install the Intellex Framework using npm:

```bash
npm install intellex-framework
```

## Basic Setup

Create a new file (e.g., `app.js`) and add the following code to initialize the framework:

```javascript
const intellex = require('intellex-framework');

// Initialize the framework
const framework = intellex.init({
  nearNetwork: 'testnet', // Use 'mainnet' for production
  enableReputation: true,
  crossChainSupport: ['ethereum', 'near'],
});

console.log(`Intellex Framework initialized (v${intellex.getVersion()})`);
```

## Creating an AI Agent

To create an AI agent, use the `createAgent` method:

```javascript
// Create an AI agent
const agent = framework.createAgent({
  name: 'MyFirstAgent',
  capabilities: ['text-processing', 'data-analysis'],
  reputationThreshold: 0.7,
});

console.log(`Agent created: ${agent.name} (${agent.id})`);
```

## Deploying an Agent

After creating an agent, you can deploy it to the network:

```javascript
// Deploy the agent
async function deployAgent() {
  try {
    const deployResult = await agent.deploy();
    console.log(`Agent deployed: ${deployResult}`);
  } catch (error) {
    console.error('Failed to deploy agent:', error);
  }
}

deployAgent();
```

## Working with the Reputation System

The reputation system allows you to track and verify agent performance:

```javascript
// Get the reputation system
const reputationSystem = framework.getReputationSystem();

// Register the agent with the reputation system
reputationSystem.registerAgent(agent.id, 0.5); // Start with a neutral score

// Submit ratings for the agent
reputationSystem.submitRating(agent.id, 0.8, 'user1', { task: 'text-analysis' });
reputationSystem.submitRating(agent.id, 0.9, 'user2', { task: 'data-processing' });

// Get the agent's reputation score
const score = reputationSystem.getReputationScore(agent.id);
console.log(`Agent reputation score: ${score}`);

// Verify the agent's reputation
const isVerified = reputationSystem.verifyAgentReputation(agent.id, 0.7);
console.log(`Agent reputation verified: ${isVerified}`);
```

## Cross-Chain Operations

The cross-chain bridge allows you to interact with multiple blockchains:

```javascript
// Get the cross-chain bridge
const crossChainBridge = framework.getCrossChainBridge();

// Get supported chains
const supportedChains = crossChainBridge.getSupportedChains();
console.log(`Supported chains: ${supportedChains.join(', ')}`);

// Perform a cross-chain transfer
async function performTransfer() {
  try {
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
    
    console.log(`Transfer initiated: ${transferResult.transferId}`);
  } catch (error) {
    console.error('Failed to perform transfer:', error);
  }
}

performTransfer();
```

## Processing Natural Language Intents

The intent processor allows you to handle natural language inputs:

```javascript
// Get the intent processor
const intentProcessor = framework.getIntentProcessor();

// Process a natural language intent
async function processIntent(text) {
  try {
    const result = await intentProcessor.processText(text);
    
    console.log(`Intent processed: ${result.success}`);
    console.log(`Intent type: ${result.intent.intentType}`);
    console.log(`Confidence: ${result.intent.confidence}`);
    
    return result;
  } catch (error) {
    console.error('Failed to process intent:', error);
  }
}

// Example intents
processIntent('What is the reputation score of MyFirstAgent?');
processIntent('Create a new agent for data analysis');
processIntent('Execute text processing task with MyFirstAgent');
```

## Executing Tasks with an Agent

Once an agent is deployed, you can execute tasks with it:

```javascript
// Execute a task with the agent
async function executeTask() {
  try {
    const taskResult = await agent.executeTask({
      type: 'data-analysis',
      data: { values: [1, 2, 3, 4, 5] },
      options: { method: 'average' },
    });
    
    console.log(`Task executed: ${taskResult.success}`);
    console.log(`Result: ${taskResult.result}`);
  } catch (error) {
    console.error('Failed to execute task:', error);
  }
}

executeTask();
```

## NEAR Blockchain Integration

The NEAR integration allows you to interact with the NEAR blockchain:

```javascript
// Get the NEAR integration
const nearIntegration = framework.getNearIntegration();

// Get network status
async function checkNetworkStatus() {
  try {
    const status = await nearIntegration.getNetworkStatus();
    console.log(`Connected to NEAR ${status.network}`);
    console.log(`Block height: ${status.blockHeight}`);
  } catch (error) {
    console.error('Failed to get network status:', error);
  }
}

checkNetworkStatus();
```

## Next Steps

Now that you've learned the basics of the Intellex Framework, you can:

1. Explore the [API Documentation](../api/README.md) for detailed information about all available methods
2. Check out the [Examples](../../examples) directory for more complex usage examples
3. Learn about [Smart Contract Integration](./smart-contract-integration.md) for advanced blockchain functionality
4. Discover how to [Customize Agent Behavior](./customizing-agents.md) for your specific use case

## Troubleshooting

If you encounter issues:

1. Make sure you're using the latest version of the framework
2. Check that your NEAR account is properly configured
3. Verify that you have the necessary permissions for blockchain operations
4. Consult the [FAQ](./faq.md) for common issues and solutions

## Support

If you need help or have questions, you can:

- Open an issue on the [GitHub repository](https://github.com/yourusername/intellex-framework/issues)
- Join our community Discord server
- Contact us at support@intellexframework.com 