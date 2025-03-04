/**
 * Business Activation Multi-Agent Solution Example
 * 
 * This example demonstrates how to use the Intellex Framework to solve a complex
 * business problem by discovering specialized agents, coordinating their collaboration,
 * validating their work, and managing payments for completed tasks.
 * 
 * The scenario involves a marketing campaign activation that requires multiple
 * specialized skills including market research, content creation, graphic design,
 * budget optimization, and performance tracking.
 */

const intellex = require('../intellex');
const fs = require('fs');
const path = require('path');

// Initialize the framework with required capabilities
const framework = intellex.init({
  nearNetwork: 'testnet',
  enableReputation: true,
  enableAgentDiscovery: true,
  enableNearAI: true,
  enableCrewAI: true,
  enableActivators: true,
  nearAIApiKey: process.env.NEAR_AI_API_KEY || 'your-api-key',
  nearAIDiscoveryApiKey: process.env.NEAR_AI_DISCOVERY_API_KEY || 'your-discovery-api-key',
  activatorsApiKey: process.env.ACTIVATORS_API_KEY || 'your-activators-api-key',
  activatorsPlatformUrl: process.env.ACTIVATORS_PLATFORM_URL || 'https://api.activators.near.org',
  autoInitialize: true
});

/**
 * Main function to run the business activation example
 */
async function runBusinessActivationExample() {
  console.log('=== Starting Business Activation Example ===');
  console.log('Scenario: Marketing Campaign Activation\n');
  
  try {
    // Step 1: Define the business activation and break it down into tasks
    const activation = defineBusinessActivation();
    console.log(`Defined business activation: ${activation.name}`);
    console.log(`Tasks: ${activation.tasks.length}`);
    
    // Step 2: Discover agents with required capabilities
    const agentsMap = await discoverAgentsForActivation(activation);
    console.log('\nDiscovered specialized agents for all required capabilities');
    
    // Step 3: Create an activator to manage the activation
    const activator = await createActivator(activation);
    console.log(`\nCreated activator: ${activator.name} (${activator.id})`);
    
    // Step 4: Connect agents to the activator
    await connectAgentsToActivator(agentsMap, activator);
    console.log('\nConnected all agents to the activator');
    
    // Step 5: Start the activation process
    const activationResult = await executeActivation(activator, activation);
    
    // Step 6: Validate the results and perform payments
    const validationResult = await validateAndPay(activationResult, agentsMap);
    
    console.log('\n=== Business Activation Example Completed ===');
    return { activation, agentsMap, activator, activationResult, validationResult };
  } catch (error) {
    console.error('Error running business activation example:', error);
    throw error;
  }
}

/**
 * Define the business activation and its tasks
 */
function defineBusinessActivation() {
  // Define the business activation
  const activation = {
    name: 'New Product Marketing Campaign',
    description: 'Launch marketing campaign for our new premium product',
    budget: 5000, // NEAR tokens
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    client: 'ACME Corporation',
    tasks: [
      {
        id: 'task-001',
        name: 'Market Research and Customer Segmentation',
        description: 'Conduct market research to identify target demographics and segment customers',
        requiredCapabilities: ['market_research', 'data_analysis', 'customer_segmentation'],
        deliverables: ['Market research report', 'Customer segmentation analysis'],
        compensation: 1000, // NEAR tokens
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        validationCriteria: {
          comprehensiveness: 0.8,
          accuracy: 0.85,
          insights: 0.7
        }
      },
      {
        id: 'task-002',
        name: 'Content Creation',
        description: 'Create engaging social media posts and promotional articles',
        requiredCapabilities: ['content_creation', 'copywriting', 'social_media_expertise'],
        deliverables: ['10 social media posts', '3 promotional articles'],
        compensation: 1200, // NEAR tokens
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        dependsOn: ['task-001'],
        validationCriteria: {
          engagement: 0.8,
          brandAlignment: 0.9,
          originality: 0.7
        }
      },
      {
        id: 'task-003',
        name: 'Graphic Design',
        description: 'Design visual assets for advertisements',
        requiredCapabilities: ['graphic_design', 'advertising_design', 'brand_identity'],
        deliverables: ['Banner ads set', 'Social media visuals', 'Print advertisement designs'],
        compensation: 1300, // NEAR tokens
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        dependsOn: ['task-001'],
        validationCriteria: {
          visualAppeal: 0.8,
          brandConsistency: 0.9,
          technicalQuality: 0.85
        }
      },
      {
        id: 'task-004',
        name: 'Budget Optimization and ROI Projections',
        description: 'Optimize budget allocation and provide ROI projections',
        requiredCapabilities: ['financial_planning', 'budget_optimization', 'roi_forecasting'],
        deliverables: ['Budget allocation plan', 'ROI projection report'],
        compensation: 800, // NEAR tokens
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        dependsOn: ['task-001', 'task-002', 'task-003'],
        validationCriteria: {
          costEfficiency: 0.85,
          forecastAccuracy: 0.75,
          optimizationLevel: 0.8
        }
      },
      {
        id: 'task-005',
        name: 'Campaign Performance Tracking Setup',
        description: 'Implement tracking systems and dashboards for campaign performance',
        requiredCapabilities: ['analytics_setup', 'performance_tracking', 'dashboard_creation'],
        deliverables: ['Tracking system implementation', 'Performance dashboard', 'Reporting framework'],
        compensation: 700, // NEAR tokens
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        dependsOn: ['task-004'],
        validationCriteria: {
          completeness: 0.8,
          usability: 0.85,
          dataAccuracy: 0.9
        }
      }
    ]
  };
  
  return activation;
}

/**
 * Discover agents with required capabilities for each task
 */
async function discoverAgentsForActivation(activation) {
  console.log('\n--- Discovering Specialized Agents ---');
  
  // Get NEAR AI Discovery to find agents
  const nearAIDiscovery = framework.getNearAIDiscovery();
  if (!nearAIDiscovery) {
    throw new Error('NEAR AI Discovery not available');
  }
  
  const agentsMap = new Map();
  
  // Collect all required capabilities across tasks
  const allRequiredCapabilities = new Set();
  activation.tasks.forEach(task => {
    task.requiredCapabilities.forEach(capability => {
      allRequiredCapabilities.add(capability);
    });
  });
  
  // Find the best agents for each capability
  for (const capability of allRequiredCapabilities) {
    // Discover agents with this capability and high reputation
    const agents = await framework.discoverAgents({
      capabilities: [capability],
      minReputationScore: 0.75,
      limit: 3
    });
    
    if (agents.length === 0) {
      throw new Error(`No suitable agents found for capability: ${capability}`);
    }
    
    // Select the agent with the highest reputation
    const bestAgent = agents.reduce((a, b) => 
      a.reputationScore > b.reputationScore ? a : b
    );
    
    // Get detailed agent capabilities
    const agentCapabilities = await framework.getAgentCapabilities(bestAgent.id);
    
    // Get agent history to evaluate past performance
    const agentHistory = await framework.getAgentHistory(bestAgent.id);
    
    // Enhance agent with additional information
    const enhancedAgent = {
      ...bestAgent,
      detailedCapabilities: agentCapabilities,
      history: agentHistory,
      successRate: calculateSuccessRate(agentHistory),
      assignedTasks: []
    };
    
    agentsMap.set(capability, enhancedAgent);
    console.log(`Selected agent for ${capability}: ${bestAgent.name} (${bestAgent.id}) - Reputation: ${bestAgent.reputationScore.toFixed(2)}`);
  }
  
  // Now also assign agents to tasks based on required capabilities
  activation.tasks.forEach(task => {
    const taskAgents = [];
    
    task.requiredCapabilities.forEach(capability => {
      const agent = agentsMap.get(capability);
      if (agent && !taskAgents.some(a => a.id === agent.id)) {
        taskAgents.push(agent);
        agent.assignedTasks.push(task.id);
      }
    });
    
    task.assignedAgents = taskAgents;
    console.log(`Task "${task.name}" assigned to ${taskAgents.length} agents`);
  });
  
  return agentsMap;
}

/**
 * Calculate agent success rate from history
 */
function calculateSuccessRate(agentHistory) {
  if (!agentHistory.tasks || agentHistory.tasks.length === 0) {
    return 0.5; // Default for agents with no history
  }
  
  const successfulTasks = agentHistory.tasks.filter(task => task.success);
  return successfulTasks.length / agentHistory.tasks.length;
}

/**
 * Create an activator to manage the business activation
 */
async function createActivator(activation) {
  console.log('\n--- Creating Activation Manager ---');
  
  const activatorsManagement = framework.getActivatorsManagement();
  if (!activatorsManagement) {
    throw new Error('Activators Management not available');
  }
  
  // Get available base agents as templates
  const baseAgents = await activatorsManagement.getAvailableBaseAgents();
  console.log(`Found ${baseAgents.length} available base agents as templates`);
  
  // Find a suitable base agent for activation management
  const baseAgent = baseAgents.find(agent => 
    agent.capabilities.includes('activation_management') && 
    agent.capabilities.includes('task_coordination')
  );
  
  if (!baseAgent) {
    throw new Error('No suitable base agent found for activation management');
  }
  
  // Create an activator based on the selected base agent
  const activator = await activatorsManagement.createActivator({
    name: `${activation.name} Manager`,
    baseAgentId: baseAgent.id,
    description: `Manages the ${activation.name} activation process`,
    capabilities: [
      'activation_management',
      'task_coordination',
      'quality_assurance',
      'payment_processing',
      'performance_tracking'
    ],
    configuration: {
      activationDetails: {
        name: activation.name,
        description: activation.description,
        budget: activation.budget,
        deadline: activation.deadline
      },
      taskValidation: true,
      autoPayment: true,
      communicationThreads: true
    }
  }, {
    deploymentRegion: 'us-west',
    highAvailability: true,
    resourceTier: 'standard'
  });
  
  console.log(`Created activator: ${activator.name} (${activator.id})`);
  return activator;
}

/**
 * Connect discovered agents to the activator
 */
async function connectAgentsToActivator(agentsMap, activator) {
  console.log('\n--- Connecting Agents to Activator ---');
  
  const activatorsManagement = framework.getActivatorsManagement();
  const connections = [];
  
  // Connect each unique agent to the activator
  const uniqueAgents = new Map();
  for (const agent of agentsMap.values()) {
    if (!uniqueAgents.has(agent.id)) {
      uniqueAgents.set(agent.id, agent);
    }
  }
  
  for (const agent of uniqueAgents.values()) {
    const connection = await activatorsManagement.connectActivatorToAgent(
      activator.id,
      agent.id,
      {
        role: 'specialist',
        permissions: ['task_execution', 'deliverable_submission', 'communication'],
        compensationModel: {
          type: 'task-based',
          currency: 'NEAR'
        }
      }
    );
    
    connections.push(connection);
    console.log(`Connected activator to agent: ${agent.name} (${agent.id})`);
  }
  
  return connections;
}

/**
 * Execute the activation process
 */
async function executeActivation(activator, activation) {
  console.log('\n--- Executing Activation Process ---');
  
  const activatorsManagement = framework.getActivatorsManagement();
  const communicationAdapter = framework.getCommunicationAdapter();
  
  // Create a main communication thread for the activation
  const mainThread = await communicationAdapter.createThread({
    title: activation.name,
    description: activation.description,
    participants: [activator.id],
    metadata: {
      activationType: 'marketing_campaign',
      clientName: activation.client,
      activationId: activation.name.toLowerCase().replace(/\s+/g, '-')
    }
  });
  
  console.log(`Created main communication thread: ${mainThread.id}`);
  
  // Assign all tasks to the activator
  const assignmentPromises = activation.tasks.map(task => 
    activatorsManagement.assignTask(activator.id, {
      id: task.id,
      name: task.name,
      description: task.description,
      deliverables: task.deliverables,
      compensation: task.compensation,
      deadline: task.deadline,
      dependsOn: task.dependsOn,
      validationCriteria: task.validationCriteria,
      assignedAgentIds: task.assignedAgents.map(agent => agent.id),
      communicationThreadId: mainThread.id
    })
  );
  
  const assignmentResults = await Promise.all(assignmentPromises);
  console.log(`Assigned ${assignmentResults.length} tasks to the activator`);
  
  // Simulate the execution of tasks with status updates
  console.log('\n--- Task Execution Simulation ---');
  
  // Create result storage directory if it doesn't exist
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // Simulate task execution based on dependencies
  const taskResults = {};
  const taskStatus = {};
  
  // Initialize all tasks as pending
  activation.tasks.forEach(task => {
    taskStatus[task.id] = 'pending';
  });
  
  // Process tasks in order of dependencies
  let remainingTasks = [...activation.tasks];
  const activationResult = {
    activationId: activation.name.toLowerCase().replace(/\s+/g, '-'),
    activatorId: activator.id,
    tasks: [],
    overallSuccess: false,
    startTime: new Date(),
    endTime: null,
    totalCompensation: 0
  };
  
  while (remainingTasks.length > 0) {
    // Find tasks that can be executed now (all dependencies resolved)
    const executableTasks = remainingTasks.filter(task => {
      if (!task.dependsOn || task.dependsOn.length === 0) {
        return true;
      }
      
      return task.dependsOn.every(depTaskId => taskStatus[depTaskId] === 'completed');
    });
    
    if (executableTasks.length === 0) {
      throw new Error('Dependency deadlock detected');
    }
    
    // Execute tasks in parallel
    const executionPromises = executableTasks.map(async task => {
      console.log(`\nExecuting task: ${task.name} (${task.id})`);
      taskStatus[task.id] = 'in-progress';
      
      // Simulate task execution by agents
      const taskStartTime = new Date();
      const execResult = await simulateTaskExecution(task, activator);
      
      // Create result file for deliverables
      const resultFilePath = path.join(resultsDir, `${task.id}_result.json`);
      fs.writeFileSync(resultFilePath, JSON.stringify(execResult, null, 2));
      
      // Add evidence URLs to the result
      execResult.evidenceUrls = [
        `file://${resultFilePath}`,
        `https://example.com/results/${task.id}`
      ];
      
      // Update task status
      taskStatus[task.id] = 'completed';
      taskResults[task.id] = execResult;
      
      // Record agent task executions
      await recordAgentExecutions(task, execResult);
      
      // Add to activation results
      activationResult.tasks.push({
        taskId: task.id,
        taskName: task.name,
        success: execResult.success,
        startTime: taskStartTime,
        endTime: new Date(),
        assignedAgents: task.assignedAgents.map(agent => ({ id: agent.id, name: agent.name })),
        compensation: execResult.success ? task.compensation : 0,
        resultFile: resultFilePath
      });
      
      if (execResult.success) {
        activationResult.totalCompensation += task.compensation;
      }
      
      console.log(`Task ${task.id} ${execResult.success ? 'completed successfully' : 'failed'}`);
      return execResult;
    });
    
    await Promise.all(executionPromises);
    
    // Remove executed tasks from remaining
    remainingTasks = remainingTasks.filter(task => 
      !executableTasks.includes(task)
    );
  }
  
  // Finalize activation result
  activationResult.endTime = new Date();
  activationResult.overallSuccess = activation.tasks.every(task => 
    (taskResults[task.id] && taskResults[task.id].success)
  );
  
  console.log(`\nActivation completed ${activationResult.overallSuccess ? 'successfully' : 'with some failures'}`);
  console.log(`Total compensation: ${activationResult.totalCompensation} NEAR tokens`);
  
  return activationResult;
}

/**
 * Simulate the execution of a task
 */
async function simulateTaskExecution(task, activator) {
  // Simulate work being done by agents
  console.log(`Agents working on "${task.name}"...`);
  
  // Create a task-specific communication thread
  const communicationAdapter = framework.getCommunicationAdapter();
  const taskThread = await communicationAdapter.createThread({
    title: `Task: ${task.name}`,
    description: task.description,
    participants: [
      activator.id,
      ...task.assignedAgents.map(agent => agent.id)
    ]
  });
  
  // Simulate agent communication
  for (const agent of task.assignedAgents) {
    await communicationAdapter.addMessage(taskThread.id, {
      role: 'assistant',
      content: `I'm starting to work on the ${task.name} task. My focus will be on ${agent.detailedCapabilities.capabilities.join(', ')}.`,
      agentId: agent.id
    });
  }
  
  // Activator coordinates
  await communicationAdapter.addMessage(taskThread.id, {
    role: 'assistant',
    content: `Task "${task.name}" is underway. Please collaborate and share your progress. The deadline is ${task.deadline.toISOString()}.`,
    agentId: activator.id
  });
  
  // Simulate task execution time
  const executionTime = 2000 + Math.random() * 3000;
  await new Promise(resolve => setTimeout(resolve, executionTime));
  
  // Generate simulated result based on agent reputations
  const averageReputation = task.assignedAgents.reduce((sum, agent) => 
    sum + agent.reputationScore, 0) / task.assignedAgents.length;
  
  // Higher reputation increases success chance
  const successProbability = 0.5 + (averageReputation * 0.5);
  const success = Math.random() < successProbability;
  
  const deliverables = {};
  task.deliverables.forEach(deliverable => {
    deliverables[deliverable] = {
      completed: success,
      qualityScore: success ? 0.7 + (Math.random() * 0.3) : 0.3 + (Math.random() * 0.4),
      feedback: success 
        ? "Meets requirements with high quality" 
        : "Does not meet all requirements, needs improvement"
    };
  });
  
  // Final messages in thread
  for (const agent of task.assignedAgents) {
    await communicationAdapter.addMessage(taskThread.id, {
      role: 'assistant',
      content: success 
        ? `I've completed my part of the ${task.name} task. All deliverables are ready for review.`
        : `I've made progress on the ${task.name} task but encountered some challenges. Review needed.`,
      agentId: agent.id
    });
  }
  
  // Activator validation
  await communicationAdapter.addMessage(taskThread.id, {
    role: 'assistant',
    content: success
      ? `Task "${task.name}" has been completed successfully. All deliverables meet the required criteria.`
      : `Task "${task.name}" completion review indicates some issues that need to be addressed.`,
    agentId: activator.id
  });
  
  return {
    taskId: task.id,
    success,
    deliverables,
    qualityScore: success ? 0.7 + (Math.random() * 0.3) : 0.3 + (Math.random() * 0.4),
    agentContributions: task.assignedAgents.map(agent => ({
      agentId: agent.id,
      contribution: 0.7 + (Math.random() * 0.3),
      feedback: success 
        ? "Excellent contribution to the task" 
        : "Contribution needs improvement"
    })),
    threadId: taskThread.id
  };
}

/**
 * Record agent task executions for reputation tracking
 */
async function recordAgentExecutions(task, execResult) {
  for (const agent of task.assignedAgents) {
    const agentContribution = execResult.agentContributions.find(c => c.agentId === agent.id);
    
    if (agentContribution) {
      await framework.recordAgentTask(agent.id, {
        taskId: task.id,
        description: task.description,
        success: execResult.success,
        performanceMetrics: {
          contribution: agentContribution.contribution,
          qualityScore: execResult.qualityScore
        },
        requesterId: task.client || 'ACME Corporation',
        evidence: {
          outputUrl: execResult.evidenceUrls[0]
        }
      });
      
      console.log(`Recorded execution for agent ${agent.name} (${agent.id})`);
    }
  }
}

/**
 * Validate results and process payments
 */
async function validateAndPay(activationResult, agentsMap) {
  console.log('\n--- Validating Results and Processing Payments ---');
  
  // Process payments for successful tasks
  const paymentResults = [];
  const nearIntegration = framework.getNearIntegration();
  
  const uniqueAgentCompensation = new Map();
  
  // Calculate compensation for each agent
  for (const taskResult of activationResult.tasks) {
    if (taskResult.success) {
      // Distribute compensation equally among assigned agents
      const agentCount = taskResult.assignedAgents.length;
      const compensationPerAgent = taskResult.compensation / agentCount;
      
      for (const assignedAgent of taskResult.assignedAgents) {
        const currentCompensation = uniqueAgentCompensation.get(assignedAgent.id) || 0;
        uniqueAgentCompensation.set(assignedAgent.id, currentCompensation + compensationPerAgent);
      }
    }
  }
  
  // Process payments to each agent
  console.log('Processing payments:');
  for (const [agentId, compensation] of uniqueAgentCompensation.entries()) {
    try {
      // Simulate payment via NEAR blockchain
      const paymentResult = await nearIntegration.transferTokens(
        'client.near', // Sender account
        `agent-wallet.${agentId}.near`, // Receiver account
        compensation.toString()
      );
      
      paymentResults.push({
        agentId,
        compensation,
        transactionId: paymentResult.transactionId,
        success: true
      });
      
      console.log(`  Paid ${compensation.toFixed(2)} NEAR to agent ${agentId} (TX: ${paymentResult.transactionId})`);
    } catch (error) {
      console.error(`  Failed to pay agent ${agentId}:`, error.message);
      paymentResults.push({
        agentId,
        compensation,
        error: error.message,
        success: false
      });
    }
  }
  
  // Summarize results
  const validationResult = {
    activationSuccess: activationResult.overallSuccess,
    totalPaid: [...uniqueAgentCompensation.values()].reduce((sum, val) => sum + val, 0),
    paymentsSucceeded: paymentResults.filter(p => p.success).length,
    paymentsFailed: paymentResults.filter(p => !p.success).length,
    payments: paymentResults
  };
  
  console.log(`\nValidation and payment summary:`);
  console.log(`- Activation success: ${validationResult.activationSuccess}`);
  console.log(`- Total paid: ${validationResult.totalPaid.toFixed(2)} NEAR`);
  console.log(`- Successful payments: ${validationResult.paymentsSucceeded}`);
  console.log(`- Failed payments: ${validationResult.paymentsFailed}`);
  
  return validationResult;
}

// Export the main function
module.exports = { 
  runBusinessActivationExample,
  defineBusinessActivation,
  discoverAgentsForActivation,
  createActivator,
  connectAgentsToActivator,
  executeActivation,
  validateAndPay
};

// Run the example if called directly
if (require.main === module) {
  runBusinessActivationExample()
    .then(() => console.log('Example completed successfully'))
    .catch(error => console.error('Example failed:', error));
} 