/**
 * Intellex Framework Interoperability Example
 * 
 * This example demonstrates how agents on different platforms (CrewAI, NEAR AI, SUI Blockchain)
 * can communicate and interact with each other using the Intellex Framework's
 * standardized interfaces and adapters.
 */

// Import the Intellex framework
const intellex = require('../intellex');

// Initialize the framework with configuration
const framework = intellex.init({
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: ['ethereum', 'near', 'sui'],
  intentProcessing: true,
  // SUI provider would be configured here in a real implementation
  suiProvider: {
    initialize: async () => console.log('Simulated SUI provider initialization'),
    // Other SUI provider methods would be implemented here
  },
  suiNetwork: 'testnet',
});

// Main function to run the example
async function runExample() {
  console.log('Intellex Framework Interoperability Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Initialize the agent registry
    console.log('\n1. Initializing agent registry...');
    const agentRegistry = framework.getAgentRegistry();
    
    // Create agents on different platforms
    console.log('\n2. Creating agents on different platforms...');
    
    // Create a CrewAI agent
    const crewAIAgent = await framework.createAgent('crewai', {
      name: 'Research Assistant',
      role: 'Research Assistant',
      goal: 'Find and analyze information on blockchain technologies',
      description: 'A CrewAI agent specialized in research tasks',
      tools: ['web-search', 'document-analysis'],
    });
    
    console.log(`Created CrewAI agent: ${crewAIAgent.name} (${crewAIAgent.id})`);
    
    // Create a NEAR AI agent
    const nearAIAgent = await framework.createAgent('nearai', {
      name: 'Blockchain Expert',
      role: 'Blockchain Expert',
      goal: 'Provide expertise on blockchain technologies',
      description: 'A NEAR AI agent specialized in blockchain technologies',
      modelId: 'near-ai-blockchain',
      tools: ['blockchain-explorer'],
    });
    
    console.log(`Created NEAR AI agent: ${nearAIAgent.name} (${nearAIAgent.id})`);
    
    // Create a SUI Blockchain agent
    const suiAgent = await framework.createAgent('sui', {
      name: 'Transaction Processor',
      role: 'Transaction Processor',
      goal: 'Process blockchain transactions',
      description: 'A SUI Blockchain agent for processing transactions',
      address: '0xsimulated_sui_address',
      objectId: 'simulated_object_id',
    });
    
    console.log(`Created SUI Blockchain agent: ${suiAgent.name} (${suiAgent.id})`);
    
    // Connect agents across platforms
    console.log('\n3. Connecting agents across platforms...');
    
    // Connect CrewAI agent to NEAR AI agent
    const connection1 = await framework.connectAgents(crewAIAgent.id, nearAIAgent.id, {
      title: 'Research and Blockchain Expertise Collaboration',
    });
    
    console.log(`Connected CrewAI agent to NEAR AI agent: ${connection1.status}`);
    
    // Connect NEAR AI agent to SUI Blockchain agent
    const connection2 = await framework.connectAgents(nearAIAgent.id, suiAgent.id, {
      title: 'Blockchain Expertise and Transaction Processing Collaboration',
    });
    
    console.log(`Connected NEAR AI agent to SUI Blockchain agent: ${connection2.status}`);
    
    // Run agents to perform tasks
    console.log('\n4. Running agents to perform tasks...');
    
    // Run the CrewAI agent
    const crewAITask = {
      description: 'Research the latest developments in blockchain interoperability',
      context: {
        focus_areas: ['cross-chain communication', 'bridge technologies', 'standards'],
      },
      expectedOutput: 'A summary of the latest developments in blockchain interoperability',
    };
    
    const crewAIResult = await framework.runAgent(crewAIAgent.id, crewAITask);
    
    console.log(`CrewAI agent task completed: ${crewAIResult.status}`);
    console.log(`Result: ${crewAIResult.result ? crewAIResult.result.substring(0, 100) + '...' : 'No result'}`);
    
    // Run the NEAR AI agent
    const nearAITask = {
      description: 'Analyze the technical aspects of blockchain interoperability',
      context: {
        focus_areas: ['protocols', 'security', 'scalability'],
      },
      expectedOutput: 'A technical analysis of blockchain interoperability',
    };
    
    const nearAIResult = await framework.runAgent(nearAIAgent.id, nearAITask);
    
    console.log(`NEAR AI agent task completed: ${nearAIResult.status}`);
    console.log(`Result: ${nearAIResult.result ? nearAIResult.result.substring(0, 100) + '...' : 'No result'}`);
    
    // Run the SUI Blockchain agent
    const suiTask = {
      description: 'Process a simulated cross-chain transaction',
      context: {
        sourceChain: 'ethereum',
        targetChain: 'sui',
        amount: '1.0',
        token: 'ETH',
      },
      expectedOutput: 'Transaction processing result',
    };
    
    const suiResult = await framework.runAgent(suiAgent.id, suiTask);
    
    console.log(`SUI Blockchain agent task completed: ${suiResult.status}`);
    console.log(`Result: ${suiResult.result ? suiResult.result.substring(0, 100) + '...' : 'No result'}`);
    
    // Get agent reputations
    console.log('\n5. Getting agent reputations...');
    
    const crewAIAgentWithRep = await framework.getAgent(crewAIAgent.id);
    console.log(`CrewAI agent reputation: ${crewAIAgentWithRep.reputation || 0}`);
    
    const nearAIAgentWithRep = await framework.getAgent(nearAIAgent.id);
    console.log(`NEAR AI agent reputation: ${nearAIAgentWithRep.reputation || 0}`);
    
    const suiAgentWithRep = await framework.getAgent(suiAgent.id);
    console.log(`SUI Blockchain agent reputation: ${suiAgentWithRep.reputation || 0}`);
    
    // Get all agents
    console.log('\n6. Getting all agents...');
    
    const allAgents = await framework.getAllAgents();
    console.log(`Total agents: ${allAgents.length}`);
    
    allAgents.forEach(agent => {
      console.log(`  ${agent.name} (${agent.id}) - Platform: ${agent.type || agent.metadata.platform}`);
    });
    
    console.log('\nInteroperability example completed successfully!');
    
  } catch (error) {
    console.error('Error running interoperability example:', error);
  }
}

// Run the example
runExample().catch(error => {
  console.error('Unhandled error:', error);
}); 