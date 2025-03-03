/**
 * Intellex Framework CrewAI Example
 * 
 * This example demonstrates the integration with CrewAI's agent orchestration framework,
 * showing how to create CrewAI agents, assign tasks, and facilitate communication
 * between CrewAI agents and NEAR AI agents using AITP.
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
  console.log('Intellex Framework CrewAI Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Get the AITP integration
    console.log('\n1. Accessing AITP integration...');
    const aitp = framework.getAITPIntegration();
    await aitp.initialize();
    
    // Get the NEAR AI integration
    console.log('\n2. Accessing NEAR AI integration...');
    const nearAI = framework.getNearAIIntegration();
    await nearAI.initialize();
    
    // Get the CrewAI integration
    console.log('\n3. Accessing CrewAI integration...');
    const crewAI = framework.getCrewAIIntegration({
      aitpIntegration: aitp,
      nearAIIntegration: nearAI,
      processType: 'hierarchical',
    });
    
    // Initialize the CrewAI integration
    console.log('\n4. Initializing CrewAI integration...');
    const initialized = await crewAI.initialize();
    
    console.log(`CrewAI integration initialized: ${initialized}`);
    
    // Create CrewAI agents
    console.log('\n5. Creating CrewAI agents...');
    
    // Create a manager agent
    const managerAgent = crewAI.createAgent({
      name: 'Research Manager',
      role: 'Research Team Manager',
      goal: 'Coordinate the research team to produce a comprehensive report on NEAR Protocol',
      backstory: 'You are an experienced research manager with expertise in blockchain technology. You excel at coordinating teams and ensuring high-quality deliverables.',
      tools: ['web-search', 'document-analysis'],
    });
    
    console.log(`Manager agent created: ${managerAgent.id}`);
    console.log(`  Name: ${managerAgent.name}`);
    console.log(`  Role: ${managerAgent.role}`);
    console.log(`  Goal: ${managerAgent.goal}`);
    
    // Create a blockchain researcher agent
    const blockchainResearcher = crewAI.createAgent({
      name: 'Blockchain Researcher',
      role: 'Blockchain Technology Specialist',
      goal: 'Research and analyze NEAR Protocol\'s technical architecture and features',
      backstory: 'You are a blockchain expert with deep knowledge of consensus mechanisms, smart contracts, and blockchain architecture. You specialize in technical analysis of blockchain platforms.',
      tools: ['web-search', 'code-analysis'],
    });
    
    console.log(`Blockchain researcher agent created: ${blockchainResearcher.id}`);
    console.log(`  Name: ${blockchainResearcher.name}`);
    console.log(`  Role: ${blockchainResearcher.role}`);
    
    // Create a market analyst agent
    const marketAnalyst = crewAI.createAgent({
      name: 'Market Analyst',
      role: 'Blockchain Market Analyst',
      goal: 'Analyze NEAR Protocol\'s market position, adoption, and ecosystem growth',
      backstory: 'You are a market analyst with expertise in blockchain ecosystems. You excel at analyzing market trends, adoption metrics, and ecosystem development.',
      tools: ['web-search', 'data-analysis'],
    });
    
    console.log(`Market analyst agent created: ${marketAnalyst.id}`);
    console.log(`  Name: ${marketAnalyst.name}`);
    console.log(`  Role: ${marketAnalyst.role}`);
    
    // Create tasks for the agents
    console.log('\n6. Creating tasks for the agents...');
    
    // Technical research task
    const technicalResearchTask = crewAI.createTask({
      description: 'Research and analyze NEAR Protocol\'s technical architecture, focusing on consensus mechanism, sharding approach, and smart contract capabilities',
      agentId: blockchainResearcher.id,
      context: {
        focus_areas: ['consensus', 'sharding', 'smart contracts', 'runtime'],
        output_format: 'technical report section',
      },
      expectedOutput: 'A comprehensive technical analysis of NEAR Protocol\'s architecture',
    });
    
    console.log(`Technical research task created: ${technicalResearchTask.id}`);
    console.log(`  Description: ${technicalResearchTask.description}`);
    
    // Market analysis task
    const marketAnalysisTask = crewAI.createTask({
      description: 'Analyze NEAR Protocol\'s market position, ecosystem growth, developer adoption, and competitive advantages compared to other L1 blockchains',
      agentId: marketAnalyst.id,
      context: {
        focus_areas: ['market position', 'ecosystem', 'developer adoption', 'competitive analysis'],
        output_format: 'market analysis section',
      },
      expectedOutput: 'A detailed market analysis of NEAR Protocol\'s ecosystem',
    });
    
    console.log(`Market analysis task created: ${marketAnalysisTask.id}`);
    console.log(`  Description: ${marketAnalysisTask.description}`);
    
    // Final report compilation task
    const reportCompilationTask = crewAI.createTask({
      description: 'Compile the technical research and market analysis into a comprehensive report on NEAR Protocol, with executive summary and recommendations',
      agentId: managerAgent.id,
      context: {
        sections: ['executive summary', 'technical analysis', 'market analysis', 'recommendations'],
        output_format: 'final report',
      },
      expectedOutput: 'A complete report on NEAR Protocol with all sections integrated',
    });
    
    console.log(`Report compilation task created: ${reportCompilationTask.id}`);
    console.log(`  Description: ${reportCompilationTask.description}`);
    
    // Create a crew with the agents and tasks
    console.log('\n7. Creating a research crew...');
    const researchCrew = crewAI.createCrew({
      name: 'NEAR Protocol Research Team',
      agents: [managerAgent, blockchainResearcher, marketAnalyst],
      tasks: [technicalResearchTask.id, marketAnalysisTask.id, reportCompilationTask.id],
      process: 'hierarchical',
      verbose: true,
    });
    
    console.log(`Research crew created: ${researchCrew.id}`);
    console.log(`  Name: ${researchCrew.name}`);
    console.log(`  Agents: ${researchCrew.agents.length}`);
    console.log(`  Tasks: ${researchCrew.tasks.length}`);
    console.log(`  Process: ${researchCrew.process}`);
    
    // Connect a CrewAI agent to NEAR AI
    console.log('\n8. Connecting the blockchain researcher to NEAR AI...');
    const nearAIConnection = await crewAI.connectToNearAI(blockchainResearcher.id, {
      modelId: 'near-ai-blockchain',
      options: {
        specialization: 'blockchain-analysis',
      },
    });
    
    console.log(`Connected to NEAR AI: ${nearAIConnection.connected}`);
    console.log(`  CrewAI Agent ID: ${nearAIConnection.crewAgentId}`);
    console.log(`  NEAR AI Agent ID: ${nearAIConnection.nearAIAgentId}`);
    
    // Connect CrewAI agents using AITP
    console.log('\n9. Connecting agents using AITP...');
    const communicationThread = await crewAI.connectAgentsWithAITP(
      blockchainResearcher.id,
      marketAnalyst.id
    );
    
    console.log(`Communication thread created: ${communicationThread.id}`);
    console.log(`  Title: ${communicationThread.title}`);
    console.log(`  Participants: ${communicationThread.participants.join(', ')}`);
    
    // Add messages to the communication thread
    console.log('\n10. Adding messages to the communication thread...');
    
    // Blockchain researcher message
    aitp.addMessage(communicationThread.id, {
      role: 'assistant',
      content: 'Hello Market Analyst, I\'m researching NEAR Protocol\'s technical architecture. Could you share any insights on how their sharding approach impacts scalability from a market perspective?',
      metadata: {
        agentId: blockchainResearcher.id,
        agentName: blockchainResearcher.name,
      },
    });
    
    // Market analyst response
    aitp.addMessage(communicationThread.id, {
      role: 'assistant',
      content: 'Hello Blockchain Researcher, from a market perspective, NEAR\'s Nightshade sharding has been well-received by developers due to its ability to scale transaction throughput while maintaining low fees. This has attracted several DeFi projects that require high throughput. I\'m analyzing adoption metrics now and will share more detailed findings soon.',
      metadata: {
        agentId: marketAnalyst.id,
        agentName: marketAnalyst.name,
      },
    });
    
    // Run the crew to execute tasks
    console.log('\n11. Running the research crew...');
    const crewResults = await crewAI.runCrew(researchCrew.id, {
      research_topic: 'NEAR Protocol',
      depth: 'comprehensive',
      focus: 'technical and market analysis',
    });
    
    console.log(`Crew execution completed: ${crewResults.status}`);
    console.log(`  Results: ${crewResults.results.length} task results`);
    
    // Display task results
    crewResults.results.forEach((result, index) => {
      console.log(`\nTask Result ${index + 1}:`);
      console.log(`  Task ID: ${result.taskId}`);
      console.log(`  Agent ID: ${result.agentId}`);
      console.log(`  Result Summary: ${result.result.substring(0, 100)}...`);
    });
    
    // Get all agents
    console.log('\n12. Getting all agents...');
    const allAgents = crewAI.getAllAgents();
    
    console.log(`Total agents: ${allAgents.length}`);
    allAgents.forEach(agent => {
      console.log(`  ${agent.name} (${agent.role})`);
    });
    
    // Get all tasks
    console.log('\n13. Getting all tasks...');
    const allTasks = crewAI.getAllTasks();
    
    console.log(`Total tasks: ${allTasks.length}`);
    allTasks.forEach(task => {
      console.log(`  ${task.description.substring(0, 50)}... (${task.status})`);
    });
    
    // Get integration status
    console.log('\n14. Getting CrewAI integration status...');
    const status = crewAI.getStatus();
    
    console.log('CrewAI integration status:');
    console.log(`  Initialized: ${status.initialized}`);
    console.log(`  Process Type: ${status.processType}`);
    console.log(`  Crew Count: ${status.crewCount}`);
    console.log(`  Agent Count: ${status.agentCount}`);
    console.log(`  Task Count: ${status.taskCount}`);
    console.log(`  AITP Available: ${status.aitpAvailable}`);
    console.log(`  NEAR AI Available: ${status.nearAIAvailable}`);
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample().catch(console.error); 