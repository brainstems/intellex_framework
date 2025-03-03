/**
 * Comprehensive Example for Intellex Framework
 * 
 * This example demonstrates the full capabilities of the Intellex Framework,
 * including interoperability between agents on different platforms (CrewAI, NEAR AI, SUI Blockchain),
 * cross-chain communication, reputation tracking, and intent processing.
 */

const Intellex = require('../intellex');
const fs = require('fs');
const path = require('path');

// Initialize the Intellex Framework with all features enabled
const intellex = new Intellex({
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: true,
  intentProcessing: true,
  enableAITP: true,
  suiNetwork: 'testnet'
});

async function runComprehensiveExample() {
  console.log('Starting Comprehensive Intellex Framework Example...');
  
  try {
    // Access all integrations
    const agentRegistry = intellex.getAgentRegistry();
    const communicationHub = intellex.getCommunicationHub();
    const crewAI = intellex.getCrewAIIntegration();
    const nearAI = intellex.getNearAIIntegration();
    const suiAdapter = intellex.getSUIAdapter();
    const aitpAdapter = intellex.getAITPCommunicationAdapter();
    const intentProcessor = intellex.getIntentProcessor();
    const reputationSystem = intellex.getReputationSystem();
    const crossChainBridge = intellex.getCrossChainBridge();
    
    console.log('All integrations initialized successfully');
    
    // 1. Create agents on different platforms
    console.log('\n--- Creating Agents on Different Platforms ---');
    
    // CrewAI Agent - Data Analyst
    const dataAnalystAgent = await crewAI.createAgent({
      name: 'Data Analyst',
      role: 'Analyzes market data and provides insights',
      goal: 'Deliver accurate market analysis reports',
      backstory: 'Experienced financial analyst with expertise in crypto markets',
      verbose: true,
      allowDelegation: true,
      tools: ['web-search', 'calculator', 'data-visualization']
    });
    console.log(`Created CrewAI Agent: ${dataAnalystAgent.name} (ID: ${dataAnalystAgent.id})`);
    
    // NEAR AI Agent - Blockchain Expert
    const blockchainExpertAgent = await nearAI.createAgent({
      name: 'Blockchain Expert',
      modelId: 'near-ai-model-v1',
      specialization: 'NEAR Protocol architecture and smart contracts',
      capabilities: ['code-generation', 'contract-analysis', 'technical-explanation'],
      allowExternalCalls: true
    });
    console.log(`Created NEAR AI Agent: ${blockchainExpertAgent.name} (ID: ${blockchainExpertAgent.id})`);
    
    // SUI Blockchain Agent - Transaction Manager
    const transactionManagerAgent = await suiAdapter.createAgent({
      name: 'Transaction Manager',
      walletAddress: '0x123...abc',
      contractInteractions: ['0x456...def'],
      capabilities: ['transaction-execution', 'object-management', 'balance-checking'],
      permissionLevel: 'medium'
    });
    console.log(`Created SUI Blockchain Agent: ${transactionManagerAgent.name} (ID: ${transactionManagerAgent.id})`);
    
    // 2. Register all agents with the Agent Registry
    console.log('\n--- Registering Agents with Registry ---');
    await agentRegistry.registerAgent(dataAnalystAgent);
    await agentRegistry.registerAgent(blockchainExpertAgent);
    await agentRegistry.registerAgent(transactionManagerAgent);
    
    const registeredAgents = await agentRegistry.getAllAgents();
    console.log(`Total registered agents: ${registeredAgents.length}`);
    
    // 3. Create communication threads between agents
    console.log('\n--- Creating Communication Threads ---');
    
    // Thread between Data Analyst and Blockchain Expert
    const analysisThread = await communicationHub.createThread({
      name: 'Market Analysis Discussion',
      participants: [dataAnalystAgent.id, blockchainExpertAgent.id],
      capabilities: ['data-sharing', 'code-execution']
    });
    console.log(`Created thread: ${analysisThread.name} (ID: ${analysisThread.id})`);
    
    // Thread between Blockchain Expert and Transaction Manager
    const transactionThread = await communicationHub.createThread({
      name: 'Transaction Planning',
      participants: [blockchainExpertAgent.id, transactionManagerAgent.id],
      capabilities: ['transaction-approval', 'contract-interaction']
    });
    console.log(`Created thread: ${transactionThread.name} (ID: ${transactionThread.id})`);
    
    // 4. Send messages between agents
    console.log('\n--- Sending Messages Between Agents ---');
    
    // Data Analyst sends message to Blockchain Expert
    await communicationHub.sendMessage({
      threadId: analysisThread.id,
      senderId: dataAnalystAgent.id,
      content: 'I need information about NEAR Protocol transaction volumes for my market analysis. Can you provide recent data?',
      capabilities: ['data-request']
    });
    console.log('Data Analyst sent message to Blockchain Expert');
    
    // Blockchain Expert responds
    await communicationHub.sendMessage({
      threadId: analysisThread.id,
      senderId: blockchainExpertAgent.id,
      content: 'Here are the latest transaction volumes for NEAR Protocol: [data attached]. The network has seen a 15% increase in activity over the past month.',
      capabilities: ['data-response'],
      attachments: {
        data: {
          transactionVolume: '1.2M daily transactions',
          growth: '15% month-over-month',
          activeAccounts: '500K'
        }
      }
    });
    console.log('Blockchain Expert responded to Data Analyst');
    
    // Blockchain Expert communicates with Transaction Manager
    await communicationHub.sendMessage({
      threadId: transactionThread.id,
      senderId: blockchainExpertAgent.id,
      content: 'Based on the market analysis, we should prepare for executing a series of transactions on SUI. Can you verify the contract is ready?',
      capabilities: ['transaction-request']
    });
    console.log('Blockchain Expert sent message to Transaction Manager');
    
    // Transaction Manager responds
    await communicationHub.sendMessage({
      threadId: transactionThread.id,
      senderId: transactionManagerAgent.id,
      content: 'Contract verified and ready. I can execute the transactions when you provide the parameters.',
      capabilities: ['transaction-response'],
      attachments: {
        contractStatus: 'verified',
        gasEstimate: '0.01 SUI'
      }
    });
    console.log('Transaction Manager responded to Blockchain Expert');
    
    // 5. Process intents across platforms
    console.log('\n--- Processing Cross-Platform Intents ---');
    
    // Data Analyst creates an intent for data processing
    const dataProcessingIntent = await intentProcessor.createIntent({
      type: 'data-processing',
      creator: dataAnalystAgent.id,
      target: blockchainExpertAgent.id,
      data: {
        dataSource: 'NEAR Protocol Explorer',
        analysisType: 'transaction-volume',
        timeframe: 'last-30-days'
      },
      requiredCapabilities: ['data-analysis']
    });
    console.log(`Created intent: ${dataProcessingIntent.id} (Type: ${dataProcessingIntent.type})`);
    
    // Process the intent
    const processedIntent = await intentProcessor.processIntent(dataProcessingIntent.id);
    console.log(`Processed intent: ${processedIntent.id} (Status: ${processedIntent.status})`);
    
    // 6. Execute cross-chain operations
    console.log('\n--- Executing Cross-Chain Operations ---');
    
    // Prepare a cross-chain transaction from NEAR to SUI
    const crossChainTx = await crossChainBridge.prepareTransaction({
      sourceChain: 'near',
      targetChain: 'sui',
      sourceAddress: 'near-account.testnet',
      targetAddress: '0x123...abc',
      amount: '10',
      tokenSymbol: 'NEAR',
      memo: 'Cross-chain transfer initiated by agents'
    });
    console.log(`Prepared cross-chain transaction: ${crossChainTx.id}`);
    
    // Execute the transaction
    const txResult = await crossChainBridge.executeTransaction(crossChainTx.id);
    console.log(`Cross-chain transaction executed: ${txResult.status}`);
    
    // 7. Update agent reputations based on performance
    console.log('\n--- Updating Agent Reputations ---');
    
    // Update Data Analyst reputation
    await reputationSystem.updateReputation(dataAnalystAgent.id, {
      taskCompletion: 95,
      accuracy: 90,
      responseTime: 85,
      userFeedback: 4.8
    });
    console.log(`Updated reputation for Data Analyst`);
    
    // Update Blockchain Expert reputation
    await reputationSystem.updateReputation(blockchainExpertAgent.id, {
      taskCompletion: 98,
      accuracy: 95,
      responseTime: 92,
      userFeedback: 4.9
    });
    console.log(`Updated reputation for Blockchain Expert`);
    
    // Update Transaction Manager reputation
    await reputationSystem.updateReputation(transactionManagerAgent.id, {
      taskCompletion: 100,
      accuracy: 98,
      responseTime: 95,
      userFeedback: 4.7
    });
    console.log(`Updated reputation for Transaction Manager`);
    
    // 8. Retrieve and display agent reputations
    console.log('\n--- Retrieving Agent Reputations ---');
    
    const dataAnalystRep = await reputationSystem.getReputation(dataAnalystAgent.id);
    console.log(`Data Analyst Reputation: ${dataAnalystRep.overallScore}`);
    
    const blockchainExpertRep = await reputationSystem.getReputation(blockchainExpertAgent.id);
    console.log(`Blockchain Expert Reputation: ${blockchainExpertRep.overallScore}`);
    
    const transactionManagerRep = await reputationSystem.getReputation(transactionManagerAgent.id);
    console.log(`Transaction Manager Reputation: ${transactionManagerRep.overallScore}`);
    
    // 9. Create a task that requires collaboration between all agents
    console.log('\n--- Creating Collaborative Task ---');
    
    // Create a CrewAI task
    const collaborativeTask = await crewAI.createTask({
      name: 'Cross-Platform Market Analysis and Transaction',
      description: 'Analyze market data, prepare and execute a transaction based on findings',
      agentId: dataAnalystAgent.id,
      context: {
        marketData: 'NEAR and SUI market trends',
        transactionRequirements: 'Execute if NEAR price increases by 5%'
      },
      expectedOutput: 'Complete market analysis and transaction execution report'
    });
    console.log(`Created collaborative task: ${collaborativeTask.id}`);
    
    // Create a crew with all agents
    const analysisCrew = await crewAI.createCrew({
      name: 'Market Analysis and Transaction Crew',
      agents: [dataAnalystAgent.id, blockchainExpertAgent.id, transactionManagerAgent.id],
      tasks: [collaborativeTask.id],
      workflow: 'sequential',
      verbose: true
    });
    console.log(`Created crew: ${analysisCrew.name} (ID: ${analysisCrew.id})`);
    
    // Run the crew
    const crewResult = await crewAI.runCrew(analysisCrew.id);
    console.log(`Crew execution completed with status: ${crewResult.status}`);
    console.log(`Crew result: ${JSON.stringify(crewResult.output, null, 2)}`);
    
    // 10. Save execution results to a file
    console.log('\n--- Saving Execution Results ---');
    
    const executionResults = {
      agents: {
        dataAnalyst: {
          id: dataAnalystAgent.id,
          reputation: dataAnalystRep
        },
        blockchainExpert: {
          id: blockchainExpertAgent.id,
          reputation: blockchainExpertRep
        },
        transactionManager: {
          id: transactionManagerAgent.id,
          reputation: transactionManagerRep
        }
      },
      threads: {
        analysisThread: {
          id: analysisThread.id,
          messageCount: 2
        },
        transactionThread: {
          id: transactionThread.id,
          messageCount: 2
        }
      },
      intents: {
        dataProcessingIntent: {
          id: dataProcessingIntent.id,
          status: processedIntent.status
        }
      },
      crossChainTransactions: {
        transaction: {
          id: crossChainTx.id,
          status: txResult.status
        }
      },
      collaborativeTask: {
        id: collaborativeTask.id,
        crewId: analysisCrew.id,
        result: crewResult
      }
    };
    
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'comprehensive-example-results.json'),
      JSON.stringify(executionResults, null, 2)
    );
    console.log('Execution results saved to file');
    
    console.log('\n--- Example Completed Successfully ---');
    
  } catch (error) {
    console.error('Error in comprehensive example:', error);
  }
}

// Run the example
runComprehensiveExample()
  .then(() => console.log('Example execution completed'))
  .catch(err => console.error('Example execution failed:', err));

module.exports = { runComprehensiveExample }; 