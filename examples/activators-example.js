/**
 * Activators Management Platform Integration Example
 * 
 * This example demonstrates how to use the Intellex Framework with the
 * Activators Management Platform to create and manage activators,
 * which are swarms of agents (or single agents) that implement the Intellex 
 * framework to access and interoperate with other agents.
 * 
 * Activators serve as the operational unit in the Intellex AI protocol,
 * allowing agents across multiple platforms to work together efficiently.
 * 
 * Key features demonstrated in this example:
 * 1. Initializing the Intellex framework with Activators Platform configuration
 * 2. Creating agents on multiple supported platforms (CrewAI, NEAR AI, SUI)
 * 3. Creating and deploying specialized activators for different use cases
 * 4. Connecting activators with standard agents
 * 5. Assigning tasks to activators
 * 6. Monitoring activator performance metrics
 */

const intellex = require('../intellex');

// Define API key for accessing the Activators Management Platform
const ACTIVATORS_API_KEY = "your-activators-api-key";

// Initialize the Intellex Framework with Activators Management Platform configuration
const framework = intellex.init({
  // Standard configurations
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: ['ethereum', 'near', 'sui'],
  intentProcessing: true,
  
  // Activators Management Platform configurations
  activatorsApiKey: ACTIVATORS_API_KEY,
  activatorsRegion: 'global',
  activatorsPlatformUrl: 'https://api.activators.intellex.ai',
  
  // Optional resource limits for activators
  activatorsResourceLimits: {
    memory: '4GB',
    cpu: '2',
    storage: '20GB',
    bandwidth: '10GB',
  },
  
  // Security settings for activators
  activatorsSecuritySettings: {
    encryptionEnabled: true,
    authMethod: 'jwt',
    permissionLevel: 'advanced',
  },
});

// Example: Creating agents on different platforms (to be connected with activators)
async function createMultiPlatformAgents() {
  try {
    console.log("Creating agents on multiple platforms...");
    
    // Create a CrewAI agent
    const crewAiAgent = await framework.createAgent('crewai', {
      name: 'Analytics Expert',
      role: 'Data Analyst',
      goal: 'Analyze data patterns and provide insights',
      backstory: 'An experienced data scientist with expertise in pattern recognition',
      allowDelegation: true,
      verbose: true,
    });
    
    // Create a NEAR AI agent
    const nearAiAgent = await framework.createAgent('nearai', {
      name: 'Smart Contract Expert',
      capabilities: ['contract_auditing', 'security_analysis', 'optimization'],
      model: 'expert-v1',
      memoryEnabled: true,
    });
    
    // Create a SUI blockchain agent
    const suiAgent = await framework.createAgent('sui', {
      name: 'Transaction Processor',
      walletAddress: '0xexample-sui-address',
      capabilities: ['transaction_processing', 'asset_management'],
      executionMode: 'optimized',
    });
    
    console.log("Created agents successfully:");
    console.log(`- CrewAI Agent: ${crewAiAgent.id}`);
    console.log(`- NEAR AI Agent: ${nearAiAgent.id}`);
    console.log(`- SUI Agent: ${suiAgent.id}`);
    
    return {
      crewAiAgent,
      nearAiAgent,
      suiAgent
    };
  } catch (error) {
    console.error("Error creating agents:", error);
    throw error;
  }
}

// Example: Creating and deploying activators for different use cases
async function createActivators(baseAgents) {
  try {
    console.log("\nCreating and deploying activators...");
    
    // 1. Create an Inventory Optimization Activator
    const inventoryActivator = await framework.createActivator({
      name: "Inventory Intelligence",
      baseAgent: "inventory",
      availability: "40+ hrs/week",
      functionalities: ["pattern_recognition", "predictive_analytics", "adaptive_learning"],
      aptitudes: ["natural_language_processing", "database_management"],
      description: "An activator specialized in inventory optimization and supply chain management"
    }, {
      region: "us-east",
    });
    
    // 2. Create a Recipe Management Activator
    const recipeActivator = await framework.createActivator({
      name: "Recipe Master",
      baseAgent: "recipe",
      availability: "20-40 hrs/week",
      functionalities: ["content_generation", "knowledge_graph", "sentiment_analysis"],
      aptitudes: ["image_recognition", "recommendation_systems"],
      description: "An activator specialized in recipe creation, management, and optimization"
    }, {
      region: "eu-west",
    });
    
    // 3. Create a Demand Forecasting Activator
    const demandActivator = await framework.createActivator({
      name: "Demand Oracle",
      baseAgent: "demand",
      availability: "40+ hrs/week",
      functionalities: ["time_series_analysis", "anomaly_detection", "scenario_planning"],
      aptitudes: ["machine_learning", "data_visualization"],
      description: "An activator specialized in demand forecasting and market trend analysis"
    }, {
      region: "asia-east",
    });
    
    console.log("Created activators successfully:");
    console.log(`- Inventory Activator: ${inventoryActivator.id} (${inventoryActivator.staking})`);
    console.log(`- Recipe Activator: ${recipeActivator.id} (${recipeActivator.staking})`);
    console.log(`- Demand Activator: ${demandActivator.id} (${demandActivator.staking})`);
    
    return {
      inventoryActivator,
      recipeActivator,
      demandActivator
    };
  } catch (error) {
    console.error("Error creating activators:", error);
    throw error;
  }
}

// Example: Connect agents with activators
async function connectAgentsWithActivators(agents, activators) {
  try {
    console.log("\nConnecting agents with activators...");
    
    // Connect CrewAI agent with Inventory activator
    const connection1 = await framework.connectAgentToActivator(
      agents.crewAiAgent.id,
      activators.inventoryActivator.id,
      {
        connectionType: 'bidirectional',
        capabilities: ['data_analysis', 'recommendation'],
        title: 'Inventory Analysis Connection'
      }
    );
    
    // Connect NEAR AI agent with Recipe activator
    const connection2 = await framework.connectAgentToActivator(
      agents.nearAiAgent.id,
      activators.recipeActivator.id,
      {
        connectionType: 'bidirectional',
        capabilities: ['contract_integration', 'security_verification'],
        title: 'Recipe Contract Connection'
      }
    );
    
    // Connect SUI agent with Demand activator
    const connection3 = await framework.connectAgentToActivator(
      agents.suiAgent.id,
      activators.demandActivator.id,
      {
        connectionType: 'bidirectional',
        capabilities: ['transaction_verification', 'asset_management'],
        title: 'Demand Transaction Connection'
      }
    );
    
    console.log("Connected agents with activators successfully:");
    console.log(`- Connection 1: ${connection1.status}`);
    console.log(`- Connection 2: ${connection2.status}`);
    console.log(`- Connection 3: ${connection3.status}`);
    
    return {
      connection1,
      connection2,
      connection3
    };
  } catch (error) {
    console.error("Error connecting agents with activators:", error);
    throw error;
  }
}

// Example: Assign tasks to activators
async function assignTasksToActivators(activators) {
  try {
    console.log("\nAssigning tasks to activators...");
    
    // Assign task to Inventory activator
    const task1 = await framework.getActivatorsManagement().assignTask(
      activators.inventoryActivator.id,
      {
        description: "Analyze current inventory levels and recommend optimizations",
        context: {
          dataset: "inventory_q2_2023.csv",
          target: "reduce_overstock_by_15_percent",
          constraints: ["maintain_98_percent_availability", "minimize_storage_costs"]
        },
        priority: "high",
        deadline: new Date(Date.now() + 2 * 86400000).toISOString() // 2 days from now
      }
    );
    
    // Assign task to Recipe activator
    const task2 = await framework.getActivatorsManagement().assignTask(
      activators.recipeActivator.id,
      {
        description: "Generate a weekly meal plan focusing on Mediterranean cuisine",
        context: {
          preferences: ["vegetarian_options", "high_protein", "low_carb"],
          allergies: ["nuts", "shellfish"],
          nutrientGoals: { "protein": "high", "fiber": "high", "sodium": "low" }
        },
        priority: "medium",
        deadline: new Date(Date.now() + 1 * 86400000).toISOString() // 1 day from now
      }
    );
    
    // Assign task to Demand activator
    const task3 = await framework.getActivatorsManagement().assignTask(
      activators.demandActivator.id,
      {
        description: "Forecast demand for Q3 2023 based on historical data and market trends",
        context: {
          historicalData: "sales_2020_2023.csv",
          marketFactors: ["seasonal_variations", "competitor_actions", "marketing_campaigns"],
          confidenceInterval: 0.95
        },
        priority: "high",
        deadline: new Date(Date.now() + 3 * 86400000).toISOString() // 3 days from now
      }
    );
    
    console.log("Assigned tasks to activators successfully:");
    console.log(`- Task 1 ID: ${task1.id} (${task1.status})`);
    console.log(`- Task 2 ID: ${task2.id} (${task2.status})`);
    console.log(`- Task 3 ID: ${task3.id} (${task3.status})`);
    
    return {
      task1,
      task2,
      task3
    };
  } catch (error) {
    console.error("Error assigning tasks to activators:", error);
    throw error;
  }
}

// Example: Monitoring activator performance metrics
async function monitorActivatorPerformance(activators) {
  try {
    console.log("\nMonitoring activator performance metrics...");
    
    // Get metrics for all activators
    for (const [name, activator] of Object.entries(activators)) {
      const metrics = await framework.getActivatorsManagement().getActivatorMetrics(activator.id);
      
      console.log(`\nMetrics for ${name} (${activator.id}):`);
      console.log(`- Tasks Completed: ${metrics.tasksCompleted || 0}`);
      console.log(`- Tasks In Progress: ${metrics.tasksInProgress || 0}`);
      console.log(`- Average Completion Time: ${metrics.avgCompletionTime || 'N/A'}`);
      console.log(`- CPU Utilization: ${metrics.cpuUtilization || '0%'}`);
      console.log(`- Memory Utilization: ${metrics.memoryUtilization || '0%'}`);
      console.log(`- Efficiency Score: ${metrics.efficiencyScore || '0%'}`);
      console.log(`- Quality Score: ${metrics.qualityScore || '0/10'}`);
    }
    
    console.log("\nPerformance monitoring complete.");
  } catch (error) {
    console.error("Error monitoring activator performance:", error);
    throw error;
  }
}

// Example: List all available base agents for activators
async function listAvailableBaseAgents() {
  try {
    console.log("\nListing available base agents for activators...");
    
    const baseAgents = await framework.getActivatorsManagement().getAvailableBaseAgents();
    
    console.log("Available base agents:");
    for (const agent of baseAgents) {
      console.log(`- ${agent.id}: ${agent.name}`);
      console.log(`  Description: ${agent.description}`);
    }
    
    return baseAgents;
  } catch (error) {
    console.error("Error listing available base agents:", error);
    throw error;
  }
}

// Example: Managing activator lifecycle
async function manageActivatorLifecycle(activators) {
  try {
    console.log("\nManaging activator lifecycle...");
    
    // Update an activator configuration
    const updatedActivator = await framework.getActivatorsManagement().updateActivator(
      activators.inventoryActivator.id,
      {
        functionalities: [
          ...activators.inventoryActivator.functionalities,
          "real_time_monitoring"
        ],
        availability: "40+ hrs/week",
        description: "An enhanced activator specialized in inventory optimization with real-time monitoring capabilities"
      }
    );
    
    console.log(`Updated activator: ${updatedActivator.id}`);
    console.log(`- Added functionality: real_time_monitoring`);
    console.log(`- Updated description: ${updatedActivator.description}`);
    
    // Terminate an activator that's no longer needed
    console.log("\nTerminating the recipe activator...");
    const terminationResult = await framework.getActivatorsManagement().terminateActivator(
      activators.recipeActivator.id
    );
    
    console.log(`Termination result: ${terminationResult ? 'Successful' : 'Failed'}`);
    
    // List all remaining activators
    console.log("\nListing all remaining activators:");
    const remainingActivators = await framework.listActivators();
    
    for (const activator of remainingActivators) {
      console.log(`- ${activator.id}: ${activator.name} (${activator.status})`);
    }
  } catch (error) {
    console.error("Error managing activator lifecycle:", error);
    throw error;
  }
}

// Example: Advanced staking on activators to enhance performance and select tasks
async function stakeOnActivators(activators) {
  try {
    console.log("\nPerforming advanced staking on activators...");
    
    // Get staking details for the inventory activator
    const inventoryStakingDetails = await framework.getActivatorsManagement()
      .getActivatorStakingDetails(activators.inventoryActivator.id);
    
    console.log(`\nCurrent staking details for Inventory Activator:`);
    console.log(`- Current stake: ${inventoryStakingDetails.currentStake}`);
    console.log(`- Available boosts: ${Object.keys(inventoryStakingDetails.availableBoosts).join(', ')}`);
    console.log(`- Task type options: ${inventoryStakingDetails.taskTypeOptions.join(', ')}`);
    
    // Stake on inventory activator with focus on speed enhancement
    const enhancedInventoryActivator = await framework.getActivatorsManagement().stakeOnActivator(
      activators.inventoryActivator.id,
      {
        amount: 20, // Stake 20 additional $ITLX tokens
        performanceBoosts: {
          speed: true,  // Boost processing speed
          intelligence: false
        },
        taskTypes: ['inventory_optimization', 'supply_chain_planning'],
        activationFocus: 'operational_efficiency'
      }
    );
    
    console.log(`\nEnhanced Inventory Activator with additional stake:`);
    console.log(`- New total stake: ${enhancedInventoryActivator.staking}`);
    console.log(`- Enhanced processing speed: ${enhancedInventoryActivator.processingSpeed}`);
    console.log(`- Prioritized tasks: ${enhancedInventoryActivator.prioritizedTasks.join(', ')}`);
    console.log(`- Activation focus: ${enhancedInventoryActivator.activationFocus}`);
    
    // Get staking details for the recipe activator
    const recipeStakingDetails = await framework.getActivatorsManagement()
      .getActivatorStakingDetails(activators.recipeActivator.id);
    
    console.log(`\nCurrent staking details for Recipe Activator:`);
    console.log(`- Current stake: ${recipeStakingDetails.currentStake}`);
    console.log(`- Available boosts: ${Object.keys(recipeStakingDetails.availableBoosts).join(', ')}`);
    console.log(`- Task type options: ${recipeStakingDetails.taskTypeOptions.join(', ')}`);
    
    // Stake on recipe activator with focus on intelligence enhancement
    const enhancedRecipeActivator = await framework.getActivatorsManagement().stakeOnActivator(
      activators.recipeActivator.id,
      {
        amount: 25, // Stake 25 additional $ITLX tokens
        performanceBoosts: {
          speed: false,
          intelligence: true,  // Boost intelligence/accuracy
          custom: {
            creativity: 15,    // Custom boost to creativity parameter
            nutritionOptimization: 10
          }
        },
        taskTypes: ['recipe_creation', 'nutrition_analysis'],
        activationFocus: 'content_quality'
      }
    );
    
    console.log(`\nEnhanced Recipe Activator with additional stake:`);
    console.log(`- New total stake: ${enhancedRecipeActivator.staking}`);
    console.log(`- Enhanced intelligence: ${enhancedRecipeActivator.intelligence}`);
    console.log(`- Prioritized tasks: ${enhancedRecipeActivator.prioritizedTasks.join(', ')}`);
    console.log(`- Activation focus: ${enhancedRecipeActivator.activationFocus}`);
    
    // Get staking details for the demand activator
    const demandStakingDetails = await framework.getActivatorsManagement()
      .getActivatorStakingDetails(activators.demandActivator.id);
    
    console.log(`\nCurrent staking details for Demand Activator:`);
    console.log(`- Current stake: ${demandStakingDetails.currentStake}`);
    console.log(`- Available boosts: ${Object.keys(demandStakingDetails.availableBoosts).join(', ')}`);
    console.log(`- Task type options: ${demandStakingDetails.taskTypeOptions.join(', ')}`);
    
    // Stake on demand activator with balanced enhancement
    const enhancedDemandActivator = await framework.getActivatorsManagement().stakeOnActivator(
      activators.demandActivator.id,
      {
        amount: 30, // Stake 30 additional $ITLX tokens
        performanceBoosts: {
          speed: true,   // Boost processing speed
          intelligence: true,  // Boost intelligence/accuracy
          custom: {
            predictionAccuracy: 15,
            dataIntegrationCapacity: 10
          }
        },
        taskTypes: ['demand_forecasting', 'market_analysis', 'trend_prediction'],
        activationFocus: 'predictive_accuracy'
      }
    );
    
    console.log(`\nEnhanced Demand Activator with additional stake:`);
    console.log(`- New total stake: ${enhancedDemandActivator.staking}`);
    console.log(`- Enhanced processing speed: ${enhancedDemandActivator.processingSpeed}`);
    console.log(`- Enhanced intelligence: ${enhancedDemandActivator.intelligence}`);
    console.log(`- Prioritized tasks: ${enhancedDemandActivator.prioritizedTasks.join(', ')}`);
    console.log(`- Activation focus: ${enhancedDemandActivator.activationFocus}`);
    
    console.log("\nAdvanced staking complete. Activators have been enhanced with additional $ITLX tokens.");
    
    return {
      enhancedInventoryActivator,
      enhancedRecipeActivator,
      enhancedDemandActivator
    };
  } catch (error) {
    console.error("Error performing advanced staking on activators:", error);
    throw error;
  }
}

// Run the full example
async function runExample() {
  try {
    console.log("INTELLEX FRAMEWORK - ACTIVATORS MANAGEMENT PLATFORM EXAMPLE");
    console.log("==========================================================");
    
    // Step 1: List available base agents
    await listAvailableBaseAgents();
    
    // Step 2: Create agents on multiple platforms
    const agents = await createMultiPlatformAgents();
    
    // Step 3: Create activators
    const activators = await createActivators(agents);
    
    // Step 4: Connect agents with activators
    await connectAgentsWithActivators(agents, activators);
    
    // Step 5: Assign tasks to activators
    await assignTasksToActivators(activators);
    
    // Step 6: Monitor activator performance
    await monitorActivatorPerformance(activators);
    
    // Step 7: Manage activator lifecycle
    await manageActivatorLifecycle(activators);
    
    // Step 8: Perform advanced staking on activators
    const enhancedActivators = await stakeOnActivators(activators);
    
    console.log("\nExample completed successfully!");
  } catch (error) {
    console.error("Error running example:", error);
  }
}

// Run the example if this script is executed directly
if (require.main === module) {
  runExample();
}

module.exports = {
  runExample,
  createMultiPlatformAgents,
  createActivators,
  connectAgentsWithActivators,
  assignTasksToActivators,
  monitorActivatorPerformance,
  listAvailableBaseAgents,
  manageActivatorLifecycle,
  stakeOnActivators,
}; 