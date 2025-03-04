/**
 * Agent Discovery and Communication Example
 * 
 * This example demonstrates how agents can discover each other based on capabilities,
 * evaluate reputation and historical behavior, and collaborate on tasks using the
 * NEAR AI Discovery network.
 * 
 * The example shows:
 * 1. Creating agents with specific capabilities
 * 2. Publishing capabilities to the NEAR AI Discovery network
 * 3. Discovering agents based on capability requirements
 * 4. Evaluating agents based on reputation and history
 * 5. Establishing communication and collaboration between agents
 */

const intellex = require('../intellex');

async function runAgentDiscoveryExample() {
  console.log('Starting Agent Discovery Example');
  
  // Initialize the framework with agent discovery enabled
  const framework = intellex.init({
    nearNetwork: 'testnet',
    enableReputation: true,
    enableAgentDiscovery: true,
    nearAIDiscoveryApiKey: process.env.NEAR_AI_API_KEY || 'your-discovery-api-key', // Use an environment variable in production
  });
  
  // Create various agents with different capabilities
  console.log('\n--- Creating agents with specialized capabilities ---');
  
  // Create a data analysis agent
  const dataAnalysisAgent = await framework.createAgent('crewai', {
    name: 'Data Analyst',
    role: 'Data Analyst',
    goal: 'Analyze and visualize data to extract insights',
    tools: ['data-processing', 'statistical-analysis', 'visualization'],
  });
  
  // Register capabilities for the data analysis agent using NEAR AI API
  await framework.registerAgentCapabilities(dataAnalysisAgent.id, [
    'data_analysis',
    'data_visualization',
    'pattern_recognition',
    'report_generation',
  ]);
  
  console.log(`Created agent: ${dataAnalysisAgent.name} (${dataAnalysisAgent.id})`);
  
  // Create a blockchain expert agent
  const blockchainAgent = await framework.createAgent('nearai', {
    name: 'Blockchain Expert',
    role: 'Blockchain Expert',
    goal: 'Provide expertise on blockchain technologies and smart contracts',
    modelId: 'gpt-4-turbo', // Using a model available through NEAR AI
  });
  
  // Register capabilities for the blockchain agent
  await framework.registerAgentCapabilities(blockchainAgent.id, [
    'smart_contract_analysis',
    'transaction_validation',
    'wallet_management',
    'blockchain_monitoring',
  ]);
  
  console.log(`Created agent: ${blockchainAgent.name} (${blockchainAgent.id})`);
  
  // Create a supply chain agent
  const supplyChainAgent = await framework.createAgent('sui', {
    name: 'Supply Chain Optimizer',
    role: 'Supply Chain Optimizer',
    goal: 'Optimize supply chain operations and logistics',
  });
  
  // Register capabilities for the supply chain agent
  await framework.registerAgentCapabilities(supplyChainAgent.id, [
    'inventory_optimization',
    'logistics_planning',
    'demand_forecasting',
    'cost_optimization',
  ]);
  
  console.log(`Created agent: ${supplyChainAgent.name} (${supplyChainAgent.id})`);
  
  // Create a natural language processing agent
  const nlpAgent = await framework.createAgent('crewai', {
    name: 'NLP Specialist',
    role: 'Natural Language Processing Specialist',
    goal: 'Process and analyze natural language text',
    tools: ['text-analysis', 'sentiment-analysis', 'language-translation'],
  });
  
  // Register capabilities for the NLP agent
  await framework.registerAgentCapabilities(nlpAgent.id, [
    'text_analysis',
    'sentiment_analysis',
    'language_translation',
    'entity_recognition',
  ]);
  
  console.log(`Created agent: ${nlpAgent.name} (${nlpAgent.id})`);
  
  // Record some historical task execution for the agents to build reputation
  console.log('\n--- Recording historical task execution for reputation building ---');
  
  await framework.recordAgentTask(dataAnalysisAgent.id, {
    taskId: 'task-001',
    description: 'Analyze quarterly sales data',
    success: true,
    performanceMetrics: {
      accuracy: 0.95,
      completionTime: 120, // seconds
    },
    requesterId: 'user-001',
    evidence: {
      outputUrl: 'https://example.com/reports/sales-analysis.pdf',
    },
  });
  
  await framework.recordAgentTask(blockchainAgent.id, {
    taskId: 'task-002',
    description: 'Audit smart contract security',
    success: true,
    performanceMetrics: {
      vulnerabilitiesFound: 3,
      completionTime: 180, // seconds
    },
    requesterId: 'user-002',
    evidence: {
      outputUrl: 'https://example.com/reports/contract-audit.pdf',
    },
  });
  
  // Add task histories for the other agents
  await framework.recordAgentTask(supplyChainAgent.id, {
    taskId: 'task-003',
    description: 'Optimize inventory levels across distribution centers',
    success: true,
    performanceMetrics: {
      costReduction: 0.12, // 12% cost reduction
      stockoutReduction: 0.35, // 35% reduction in stockouts
      completionTime: 240, // seconds
    },
    requesterId: 'user-003',
    evidence: {
      outputUrl: 'https://example.com/reports/inventory-optimization.pdf',
    },
  });
  
  await framework.recordAgentTask(nlpAgent.id, {
    taskId: 'task-004',
    description: 'Perform sentiment analysis on customer feedback',
    success: true,
    performanceMetrics: {
      accuracy: 0.91,
      insightsGenerated: 8,
      completionTime: 150, // seconds
    },
    requesterId: 'user-004',
    evidence: {
      outputUrl: 'https://example.com/reports/sentiment-analysis.pdf',
    },
  });
  
  console.log('Historical task execution recorded for all agents');
  
  // Now, let's discover agents based on specific capabilities using NEAR AI Discovery
  console.log('\n--- Discovering agents based on capabilities ---');
  
  // Get the NEAR AI Discovery integration to use directly
  const nearAIDiscovery = framework.getNearAIDiscovery();
  
  // Scenario 1: Looking for agents that can perform data analysis
  const dataAnalysisAgents = await framework.discoverAgents({
    capabilities: ['data_analysis'],
    minReputationScore: 0.5,
    limit: 5
  });
  
  console.log(`Found ${dataAnalysisAgents.length} agents capable of data analysis:`);
  dataAnalysisAgents.forEach(agent => {
    console.log(`- ${agent.name} (${agent.id}) - Reputation: ${agent.reputationScore.toFixed(2)}`);
  });
  
  // Scenario 2: Looking for agents that can perform blockchain operations
  const blockchainAgents = await framework.discoverAgents({
    capabilities: ['smart_contract_analysis', 'transaction_validation'],
    minReputationScore: 0.7,
    limit: 3
  });
  
  console.log(`\nFound ${blockchainAgents.length} agents capable of blockchain operations:`);
  blockchainAgents.forEach(agent => {
    console.log(`- ${agent.name} (${agent.id}) - Reputation: ${agent.reputationScore.toFixed(2)}`);
  });
  
  // Create a complex task that requires multiple capabilities
  console.log('\n--- Creating a complex task requiring multiple agents ---');
  
  const complexTask = {
    title: 'Blockchain-Based Supply Chain Optimization',
    description: 'Analyze supply chain data, identify optimization opportunities, and implement smart contracts for automation',
    requiredCapabilities: [
      'data_analysis',
      'smart_contract_analysis',
      'inventory_optimization'
    ],
  };
  
  console.log(`Complex task created: ${complexTask.title}`);
  console.log(`Required capabilities: ${complexTask.requiredCapabilities.join(', ')}`);
  
  // Find agents for each required capability using NEAR AI Discovery
  const taskAgents = {};
  
  for (const capability of complexTask.requiredCapabilities) {
    const agents = await framework.discoverAgents({
      capabilities: [capability],
      minReputationScore: 0.7,
      limit: 3
    });
    
    if (agents.length > 0) {
      // Select the agent with the highest reputation
      const bestAgent = agents.reduce((a, b) => 
        a.reputationScore > b.reputationScore ? a : b);
      
      taskAgents[capability] = bestAgent;
      console.log(`Selected agent for ${capability}: ${bestAgent.name} (${bestAgent.id}) - Reputation: ${bestAgent.reputationScore.toFixed(2)}`);
    } else {
      console.log(`No suitable agent found for capability: ${capability}`);
    }
  }
  
  // Connect agents for collaboration using NEAR AI's environment
  console.log('\n--- Connecting agents for collaboration ---');
  
  // Get the NEAR AI integration to use its environment capabilities
  const nearAIIntegration = framework.getNearAIIntegration();
  const environment = nearAIIntegration.createEnvironment({
    name: complexTask.title
  });
  
  // Create connections between all involved agents
  const connections = [];
  const agentIds = Object.values(taskAgents).map(agent => agent.id);
  
  for (let i = 0; i < agentIds.length; i++) {
    for (let j = i + 1; j < agentIds.length; j++) {
      const connection = await framework.connectAgents(
        agentIds[i],
        agentIds[j],
        { 
          title: `Collaboration for ${complexTask.title}`,
          environment: environment
        }
      );
      
      connections.push(connection);
      console.log(`Connected agents: ${agentIds[i]} and ${agentIds[j]}`);
    }
  }
  
  // Create a communication thread using NEAR AI's threading capabilities
  console.log('\n--- Creating communication thread for collaboration ---');
  
  const communicationAdapter = framework.getCommunicationAdapter();
  
  const thread = await communicationAdapter.createThread({
    title: complexTask.title,
    participants: agentIds,
    metadata: {
      taskId: 'complex-task-001',
      taskDescription: complexTask.description,
    },
  });
  
  console.log(`Created thread: ${thread.id}`);
  
  // Use NEAR AI's Environment to add messages to the thread
  await environment.add_system_log(`Task: ${complexTask.title}\n\nDescription: ${complexTask.description}`);
  
  // Data analysis agent provides insights
  const dataAnalysisAgentId = taskAgents['data_analysis']?.id;
  if (dataAnalysisAgentId) {
    await communicationAdapter.addMessage(thread.id, {
      role: 'assistant',
      content: 'I\'ve analyzed the supply chain data and identified several optimization opportunities:\n\n1. Inventory levels at distribution centers 3 and 5 are consistently too high, resulting in excess carrying costs.\n\n2. There\'s a cyclical demand pattern that isn\'t being properly accounted for in the current forecasting model.\n\n3. Transportation routes between facilities 2-4-7 have significant inefficiencies.\n\nI\'ve prepared a detailed analysis report with specific recommendations.',
      agentId: dataAnalysisAgentId,
    });
    
    console.log(`Added message from Data Analysis agent`);
  }
  
  // Blockchain expert agent responds
  const blockchainAgentId = taskAgents['smart_contract_analysis']?.id;
  if (blockchainAgentId) {
    await communicationAdapter.addMessage(thread.id, {
      role: 'assistant',
      content: 'Based on the data analysis, I can implement smart contracts to automate several processes:\n\n1. An inventory management contract that automatically triggers restocking when levels drop below the optimal threshold.\n\n2. A supplier agreement contract that adjusts order quantities based on the cyclical demand patterns identified.\n\n3. A transportation optimization contract that can dynamically route shipments based on current conditions and costs.\n\nI\'ll need to integrate with IoT data sources for real-time tracking and decision making.',
      agentId: blockchainAgentId,
    });
    
    console.log(`Added message from Blockchain Expert agent`);
  }
  
  // Supply chain optimizer agent responds
  const supplyChainAgentId = taskAgents['inventory_optimization']?.id;
  if (supplyChainAgentId) {
    await communicationAdapter.addMessage(thread.id, {
      role: 'assistant',
      content: 'I can implement the proposed optimization strategies and smart contracts into our existing supply chain systems:\n\n1. I\'ve created a revised inventory model that reduces carrying costs by 24% while maintaining service levels.\n\n2. The new forecasting algorithm incorporating cyclical patterns reduces forecast error by 18%.\n\n3. The optimized transportation routes will reduce logistics costs by approximately 12%.\n\nI recommend a phased implementation approach, starting with the inventory optimization at distribution centers 3 and 5.',
      agentId: supplyChainAgentId,
    });
    
    console.log(`Added message from Supply Chain Optimizer agent`);
  }
  
  // Retrieve and display the communication thread
  console.log('\n--- Retrieving communication thread ---');
  
  const threadMessages = await communicationAdapter.getThread(thread.id);
  console.log(`Thread: ${threadMessages.title}`);
  console.log('Messages:');
  
  if (threadMessages.messages) {
    threadMessages.messages.forEach((message, index) => {
      console.log(`\n[${index + 1}] ${message.role.toUpperCase()} ${message.agentId || '(System)'}`);
      console.log(`${message.content.substring(0, 100)}...`);
    });
  }
  
  console.log('\n--- Agent Discovery Example Completed ---');
  console.log('Demonstrated NEAR AI Discovery capabilities for finding and connecting specialized agents');
}

// Run the example
runAgentDiscoveryExample().catch(error => {
  console.error('Error running Agent Discovery Example:', error);
});

module.exports = { runAgentDiscoveryExample }; 