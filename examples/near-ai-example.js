/**
 * Intellex Framework NEAR AI Example
 * 
 * This example demonstrates the integration with NEAR AI's agent toolkit,
 * showing how to create, run, and deploy AI agents using NEAR AI.
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
  console.log('Intellex Framework NEAR AI Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Get the NEAR AI integration
    console.log('\n1. Accessing NEAR AI integration...');
    const nearAI = framework.getNearAIIntegration();
    
    // Initialize the NEAR AI integration
    console.log('\n2. Initializing NEAR AI integration...');
    const initialized = await nearAI.initialize();
    
    console.log(`NEAR AI integration initialized: ${initialized}`);
    
    // Get available agents
    console.log('\n3. Getting available agents from NEAR AI...');
    const availableAgents = nearAI.getAvailableAgents();
    
    console.log(`Available agents: ${availableAgents.length}`);
    availableAgents.forEach(agent => {
      console.log(`  ${agent.name}: ${agent.description}`);
      console.log(`    Capabilities: ${agent.capabilities.join(', ')}`);
    });
    
    // Get available models
    console.log('\n4. Getting available models from NEAR AI...');
    const availableModels = nearAI.getAvailableModels();
    
    console.log(`Available models: ${availableModels.length}`);
    availableModels.forEach(model => {
      console.log(`  ${model.name}: ${model.description}`);
      console.log(`    Capabilities: ${model.capabilities.join(', ')}`);
    });
    
    // Get available tools
    console.log('\n5. Getting available tools from NEAR AI...');
    const availableTools = nearAI.getAvailableTools();
    
    console.log(`Available tools: ${availableTools.length}`);
    availableTools.forEach(tool => {
      console.log(`  ${tool.name}: ${tool.description}`);
    });
    
    // Create a blockchain agent
    console.log('\n6. Creating a blockchain agent...');
    const blockchainAgent = await nearAI.createAgent({
      name: 'NEAR Transaction Analyzer',
      description: 'An agent that analyzes NEAR transactions and provides insights',
      modelId: 'near-ai-blockchain',
      tools: ['blockchain-explorer'],
      options: {
        specialization: 'near-protocol',
        dataAccess: 'public-only',
      },
    });
    
    console.log(`Blockchain agent created: ${blockchainAgent.id}`);
    console.log(`  Name: ${blockchainAgent.name}`);
    console.log(`  Model: ${blockchainAgent.modelId}`);
    console.log(`  Tools: ${blockchainAgent.tools.join(', ')}`);
    console.log(`  Created At: ${blockchainAgent.createdAt}`);
    
    // Create a data analysis agent
    console.log('\n7. Creating a data analysis agent...');
    const dataAgent = await nearAI.createAgent({
      name: 'NEAR Data Analyst',
      description: 'An agent that analyzes on-chain data and generates reports',
      modelId: 'near-ai-base',
      tools: ['blockchain-explorer', 'code-executor'],
      options: {
        specialization: 'data-analysis',
        outputFormat: 'json',
      },
    });
    
    console.log(`Data analysis agent created: ${dataAgent.id}`);
    console.log(`  Name: ${dataAgent.name}`);
    console.log(`  Model: ${dataAgent.modelId}`);
    console.log(`  Tools: ${dataAgent.tools.join(', ')}`);
    
    // Run the blockchain agent
    console.log('\n8. Running the blockchain agent...');
    const blockchainTask = {
      input: 'Analyze the latest transactions on NEAR Protocol and identify any unusual patterns',
      context: {
        timeframe: 'last 24 hours',
        network: 'mainnet',
      },
    };
    
    const blockchainResult = await nearAI.runAgent(blockchainAgent.id, blockchainTask);
    
    console.log(`Blockchain agent task completed: ${blockchainResult.id}`);
    console.log(`  Input: ${blockchainResult.input}`);
    console.log(`  Output: ${blockchainResult.output}`);
    console.log(`  Completed At: ${blockchainResult.completedAt}`);
    
    // Run the data analysis agent
    console.log('\n9. Running the data analysis agent...');
    const dataTask = {
      input: 'Generate a report on NEAR token transfers over the past week',
      context: {
        timeframe: 'last 7 days',
        network: 'mainnet',
        metrics: ['volume', 'unique_addresses', 'average_amount'],
      },
    };
    
    const dataResult = await nearAI.runAgent(dataAgent.id, dataTask);
    
    console.log(`Data analysis agent task completed: ${dataResult.id}`);
    console.log(`  Input: ${dataResult.input}`);
    console.log(`  Output: ${dataResult.output}`);
    console.log(`  Completed At: ${dataResult.completedAt}`);
    
    // Fine-tune a model
    console.log('\n10. Fine-tuning a NEAR AI model...');
    const trainingData = {
      examples: [
        {
          input: 'What is the current gas price on NEAR?',
          output: 'The current gas price on NEAR Protocol is 100 yoctoNEAR per gas unit.',
        },
        {
          input: 'How do I create a NEAR account?',
          output: 'To create a NEAR account, you can use NEAR Wallet or programmatically create one using the NEAR SDK.',
        },
        // More examples would be included here
      ],
    };
    
    const fineTunedModel = await nearAI.fineTuneModel('near-ai-blockchain', trainingData, {
      epochs: 3,
      learningRate: 0.0001,
    });
    
    console.log(`Model fine-tuning initiated: ${fineTunedModel.id}`);
    console.log(`  Base Model: ${fineTunedModel.baseModelId}`);
    console.log(`  Status: ${fineTunedModel.status}`);
    console.log(`  Created At: ${fineTunedModel.createdAt}`);
    
    // Deploy an agent to the NEAR AI Developer Hub
    console.log('\n11. Deploying an agent to the NEAR AI Developer Hub...');
    const deployment = await nearAI.deployAgent(blockchainAgent.id, {
      visibility: 'public',
      pricing: {
        type: 'free',
      },
      metadata: {
        tags: ['blockchain', 'near', 'analysis'],
        category: 'Finance',
      },
    });
    
    console.log(`Agent deployed: ${deployment.id}`);
    console.log(`  Agent ID: ${deployment.agentId}`);
    console.log(`  Status: ${deployment.status}`);
    console.log(`  URL: ${deployment.url}`);
    console.log(`  Deployed At: ${deployment.deployedAt}`);
    
    // Enable private & verifiable AI mode
    console.log('\n12. Enabling private & verifiable AI mode...');
    const privateMode = nearAI.enablePrivateMode(true);
    
    console.log(`Private & verifiable AI mode: ${privateMode ? 'Enabled' : 'Disabled'}`);
    
    // Get integration status
    console.log('\n13. Getting NEAR AI integration status...');
    const status = nearAI.getStatus();
    
    console.log('NEAR AI integration status:');
    console.log(`  Initialized: ${status.initialized}`);
    console.log(`  Environment: ${status.environment}`);
    console.log(`  Private Mode: ${status.privateMode}`);
    console.log(`  Agent Count: ${status.agentCount}`);
    console.log(`  Model Count: ${status.modelCount}`);
    console.log(`  Tool Count: ${status.toolCount}`);
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample().catch(console.error); 