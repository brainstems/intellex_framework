/**
 * Intellex Framework Agent Management Example
 * 
 * This example demonstrates the agent management capabilities of the Intellex Framework,
 * including agent creation, task assignment, reputation tracking, and monitoring.
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
  console.log('Intellex Framework Agent Management Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Get the agent manager
    console.log('\n1. Accessing the agent manager...');
    const agentManager = framework.getAgentManager();
    
    // Create a transfer agent
    console.log('\n2. Creating a transfer agent...');
    const transferAgent = await agentManager.createAgent({
      name: 'TransferAgent',
      description: 'An agent that handles token transfers across different chains',
      capabilities: ['transfer', 'swap'],
      chains: ['near', 'ethereum', 'aurora'],
      reputationThreshold: 0.7,
    });
    
    console.log(`Transfer agent created: ${transferAgent.id}`);
    console.log(`  Name: ${transferAgent.name}`);
    console.log(`  Capabilities: ${transferAgent.capabilities.join(', ')}`);
    console.log(`  Supported Chains: ${transferAgent.chains.join(', ')}`);
    console.log(`  Reputation Threshold: ${transferAgent.reputationThreshold}`);
    
    // Create a data agent
    console.log('\n3. Creating a data agent...');
    const dataAgent = await agentManager.createAgent({
      name: 'DataAgent',
      description: 'An agent that processes and analyzes on-chain data',
      capabilities: ['data-analysis', 'reporting'],
      chains: ['near'],
      reputationThreshold: 0.8,
    });
    
    console.log(`Data agent created: ${dataAgent.id}`);
    console.log(`  Name: ${dataAgent.name}`);
    console.log(`  Capabilities: ${dataAgent.capabilities.join(', ')}`);
    console.log(`  Supported Chains: ${dataAgent.chains.join(', ')}`);
    console.log(`  Reputation Threshold: ${dataAgent.reputationThreshold}`);
    
    // Create a contract agent
    console.log('\n4. Creating a contract agent...');
    const contractAgent = await agentManager.createAgent({
      name: 'ContractAgent',
      description: 'An agent that interacts with smart contracts',
      capabilities: ['contract-call', 'contract-deploy'],
      chains: ['near', 'aurora'],
      reputationThreshold: 0.9,
    });
    
    console.log(`Contract agent created: ${contractAgent.id}`);
    console.log(`  Name: ${contractAgent.name}`);
    console.log(`  Capabilities: ${contractAgent.capabilities.join(', ')}`);
    console.log(`  Supported Chains: ${contractAgent.chains.join(', ')}`);
    console.log(`  Reputation Threshold: ${contractAgent.reputationThreshold}`);
    
    // Get all agents
    console.log('\n5. Getting all agents...');
    const allAgents = await agentManager.getAllAgents();
    
    console.log(`Total agents: ${allAgents.length}`);
    
    // Assign a transfer task to the transfer agent
    console.log('\n6. Assigning a transfer task to the transfer agent...');
    const transferTask = await agentManager.assignTask(transferAgent.id, {
      type: 'transfer',
      params: {
        sourceChain: 'near',
        targetChain: 'ethereum',
        token: 'USDC',
        amount: '10.0',
        sender: 'example.testnet',
        recipient: '0x1234567890abcdef1234567890abcdef12345678',
      },
    });
    
    console.log(`Transfer task assigned: ${transferTask.id}`);
    console.log(`  Type: ${transferTask.type}`);
    console.log(`  Status: ${transferTask.status}`);
    console.log(`  Assigned Agent: ${transferTask.agentId}`);
    
    // Assign a data analysis task to the data agent
    console.log('\n7. Assigning a data analysis task to the data agent...');
    const dataTask = await agentManager.assignTask(dataAgent.id, {
      type: 'data-analysis',
      params: {
        chain: 'near',
        contract: 'analytics.example.testnet',
        startBlock: 12345678,
        endBlock: 12345778,
        metrics: ['transactions', 'users', 'volume'],
      },
    });
    
    console.log(`Data task assigned: ${dataTask.id}`);
    console.log(`  Type: ${dataTask.type}`);
    console.log(`  Status: ${dataTask.status}`);
    console.log(`  Assigned Agent: ${dataTask.agentId}`);
    
    // Assign a contract call task to the contract agent
    console.log('\n8. Assigning a contract call task to the contract agent...');
    const contractTask = await agentManager.assignTask(contractAgent.id, {
      type: 'contract-call',
      params: {
        chain: 'near',
        contract: 'nft.example.testnet',
        method: 'nft_mint',
        args: {
          token_id: '123',
          metadata: {
            title: 'Example NFT',
            description: 'An NFT created by the ContractAgent',
            media: 'https://example.com/nft.png',
          },
          receiver_id: 'recipient.testnet',
        },
        gas: '300000000000000',
        deposit: '10000000000000000000000',
      },
    });
    
    console.log(`Contract task assigned: ${contractTask.id}`);
    console.log(`  Type: ${contractTask.type}`);
    console.log(`  Status: ${contractTask.status}`);
    console.log(`  Assigned Agent: ${contractTask.agentId}`);
    
    // Simulate task execution
    console.log('\n9. Simulating task execution...');
    
    // Simulate transfer task completion
    console.log('\n   Simulating transfer task completion...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transferTaskResult = await agentManager.completeTask(transferTask.id, {
      success: true,
      result: {
        transactionHash: 'HZgzuUEpmTBCwVa3iZP8c5fFD7YxbWEJm8J5XYSjVxZZ',
        sourceChainTxHash: 'HZgzuUEpmTBCwVa3iZP8c5fFD7YxbWEJm8J5XYSjVxZZ',
        targetChainTxHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        completionTime: new Date().toISOString(),
      },
    });
    
    console.log(`Transfer task completed: ${transferTaskResult.success}`);
    console.log(`  Status: ${transferTaskResult.status}`);
    console.log(`  Completion Time: ${transferTaskResult.result.completionTime}`);
    
    // Simulate data task completion
    console.log('\n   Simulating data task completion...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dataTaskResult = await agentManager.completeTask(dataTask.id, {
      success: true,
      result: {
        metrics: {
          transactions: 1234,
          users: 567,
          volume: 89012.34,
        },
        analysisTime: new Date().toISOString(),
        reportUrl: 'https://example.com/reports/near-analysis-12345678-12345778',
      },
    });
    
    console.log(`Data task completed: ${dataTaskResult.success}`);
    console.log(`  Status: ${dataTaskResult.status}`);
    console.log(`  Analysis Time: ${dataTaskResult.result.analysisTime}`);
    console.log(`  Transactions: ${dataTaskResult.result.metrics.transactions}`);
    console.log(`  Users: ${dataTaskResult.result.metrics.users}`);
    console.log(`  Volume: ${dataTaskResult.result.metrics.volume}`);
    
    // Simulate contract task failure
    console.log('\n   Simulating contract task failure...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const contractTaskResult = await agentManager.completeTask(contractTask.id, {
      success: false,
      error: {
        code: 'ContractError',
        message: 'Insufficient deposit for minting NFT',
        details: 'Required deposit: 100000000000000000000000, provided: 10000000000000000000000',
      },
    });
    
    console.log(`Contract task failed: ${!contractTaskResult.success}`);
    console.log(`  Status: ${contractTaskResult.status}`);
    console.log(`  Error Code: ${contractTaskResult.error.code}`);
    console.log(`  Error Message: ${contractTaskResult.error.message}`);
    
    // Get task status
    console.log('\n10. Getting task statuses...');
    
    const transferTaskStatus = await agentManager.getTaskStatus(transferTask.id);
    console.log(`Transfer task status: ${transferTaskStatus.status}`);
    
    const dataTaskStatus = await agentManager.getTaskStatus(dataTask.id);
    console.log(`Data task status: ${dataTaskStatus.status}`);
    
    const contractTaskStatus = await agentManager.getTaskStatus(contractTask.id);
    console.log(`Contract task status: ${contractTaskStatus.status}`);
    
    // Get agent reputation
    console.log('\n11. Getting agent reputations...');
    
    const transferAgentReputation = await agentManager.getAgentReputation(transferAgent.id);
    console.log(`Transfer agent reputation: ${transferAgentReputation.score}`);
    console.log(`  Total Tasks: ${transferAgentReputation.totalTasks}`);
    console.log(`  Successful Tasks: ${transferAgentReputation.successfulTasks}`);
    console.log(`  Failed Tasks: ${transferAgentReputation.failedTasks}`);
    
    const dataAgentReputation = await agentManager.getAgentReputation(dataAgent.id);
    console.log(`Data agent reputation: ${dataAgentReputation.score}`);
    console.log(`  Total Tasks: ${dataAgentReputation.totalTasks}`);
    console.log(`  Successful Tasks: ${dataAgentReputation.successfulTasks}`);
    console.log(`  Failed Tasks: ${dataAgentReputation.failedTasks}`);
    
    const contractAgentReputation = await agentManager.getAgentReputation(contractAgent.id);
    console.log(`Contract agent reputation: ${contractAgentReputation.score}`);
    console.log(`  Total Tasks: ${contractAgentReputation.totalTasks}`);
    console.log(`  Successful Tasks: ${contractAgentReputation.successfulTasks}`);
    console.log(`  Failed Tasks: ${contractAgentReputation.failedTasks}`);
    
    // Find agents by capability
    console.log('\n12. Finding agents by capability...');
    
    const transferCapableAgents = await agentManager.findAgentsByCapability('transfer');
    console.log(`Agents with 'transfer' capability: ${transferCapableAgents.length}`);
    transferCapableAgents.forEach(agent => {
      console.log(`  ${agent.name} (${agent.id})`);
    });
    
    const contractCallCapableAgents = await agentManager.findAgentsByCapability('contract-call');
    console.log(`Agents with 'contract-call' capability: ${contractCallCapableAgents.length}`);
    contractCallCapableAgents.forEach(agent => {
      console.log(`  ${agent.name} (${agent.id})`);
    });
    
    // Find agents by chain
    console.log('\n13. Finding agents by chain...');
    
    const nearAgents = await agentManager.findAgentsByChain('near');
    console.log(`Agents supporting 'near' chain: ${nearAgents.length}`);
    nearAgents.forEach(agent => {
      console.log(`  ${agent.name} (${agent.id})`);
    });
    
    const auroraAgents = await agentManager.findAgentsByChain('aurora');
    console.log(`Agents supporting 'aurora' chain: ${auroraAgents.length}`);
    auroraAgents.forEach(agent => {
      console.log(`  ${agent.name} (${agent.id})`);
    });
    
    // Update agent capabilities
    console.log('\n14. Updating agent capabilities...');
    
    const updatedTransferAgent = await agentManager.updateAgentCapabilities(
      transferAgent.id,
      ['transfer', 'swap', 'liquidity-provision']
    );
    
    console.log(`Updated transfer agent capabilities: ${updatedTransferAgent.capabilities.join(', ')}`);
    
    // Deactivate an agent
    console.log('\n15. Deactivating an agent...');
    
    const deactivationResult = await agentManager.deactivateAgent(dataAgent.id);
    
    console.log(`Agent deactivation result: ${deactivationResult.success}`);
    console.log(`  Agent status: ${deactivationResult.status}`);
    
    // Get agent status
    console.log('\n16. Getting agent statuses...');
    
    const transferAgentStatus = await agentManager.getAgentStatus(transferAgent.id);
    console.log(`Transfer agent status: ${transferAgentStatus.status}`);
    console.log(`  Active: ${transferAgentStatus.active}`);
    console.log(`  Last Active: ${transferAgentStatus.lastActive}`);
    
    const dataAgentStatus = await agentManager.getAgentStatus(dataAgent.id);
    console.log(`Data agent status: ${dataAgentStatus.status}`);
    console.log(`  Active: ${dataAgentStatus.active}`);
    console.log(`  Last Active: ${dataAgentStatus.lastActive}`);
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample().catch(console.error); 