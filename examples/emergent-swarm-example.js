/**
 * Emergent Swarm Intelligence Example for Intellex Framework
 * 
 * This example demonstrates how to create and run a swarm of agents with
 * stigmergic communication and stochastic behavior patterns. Unlike traditional
 * orchestrated approaches, this system relies on emergent intelligence through
 * environment-mediated coordination and probabilistic decision-making.
 */

const Intellex = require('../intellex');
const fs = require('fs');
const path = require('path');

// Initialize the Intellex Framework with environment support
const intellex = new Intellex({
  enableEnvironment: true, // Enable the shared environment for stigmergic communication
  stochasticAgents: true,  // Enable stochastic behavior support
  swarmSize: 100,          // Number of agents in the swarm
  visualize: true,         // Enable visualization of the environment and agents
  dataCollection: true     // Collect data for analysis
});

async function runEmergentSwarmExample() {
  console.log('Starting Emergent Swarm Intelligence Example...');
  
  try {
    // Access required components
    const environmentManager = intellex.getEnvironmentManager();
    const swarmManager = intellex.getSwarmManager();
    const visualizer = intellex.getVisualizer();
    const dataCollector = intellex.getDataCollector();
    
    // 1. Create a 2D grid environment with resources
    const environment = await environmentManager.createEnvironment({
      type: '2d-grid',
      dimensions: [100, 100],
      wrap: true, // Toroidal world (edges wrap around)
      diffusion: {
        enabled: true,
        rate: 0.1
      },
      decay: {
        enabled: true,
        rate: 0.95 // Pheromone decay rate per step
      }
    });
    
    console.log('Created environment');
    
    // 2. Add resources to the environment
    await environment.addResources([
      { type: 'food', position: [25, 25], value: 100 },
      { type: 'food', position: [75, 75], value: 100 },
      { type: 'water', position: [25, 75], value: 100 },
      { type: 'water', position: [75, 25], value: 100 },
      { type: 'obstacle', position: [50, 50], radius: 10 }
    ]);
    
    console.log('Added resources to environment');
    
    // 3. Create a swarm of forager agents with stigmergic and stochastic behavior
    const swarm = await swarmManager.createSwarm({
      name: 'ForagerSwarm',
      size: 100,
      agentType: 'forager',
      initialPositions: 'random', // Randomly distribute agents in the environment
      baseConfig: {
        speed: 1,
        senseRadius: 3,
        maxEnergy: 100,
        currentEnergy: 100,
        energyConsumptionRate: 0.1,
        pheromoneStrength: 1.0
      }
    });
    
    console.log(`Created swarm with ${swarm.agents.length} agents`);
    
    // 4. Define behavior probabilities for agents
    const behaviorDistribution = {
      explore: 0.3,     // Random exploration
      followTrail: 0.4, // Follow pheromone trails
      returnToNest: 0.2, // Return to nest location
      rest: 0.1         // Stay in place to conserve energy
    };
    
    // 5. Set up the home base (nest) for the agents
    const nest = { position: [50, 10], radius: 5 };
    await environment.addStructure({
      type: 'nest',
      position: nest.position,
      radius: nest.radius,
      properties: {
        restoreEnergy: true,
        restoreRate: 1.0
      }
    });
    
    console.log('Added nest to environment');
    
    // 6. Configure all agents in the swarm
    for (const agent of swarm.agents) {
      // Set initial behavior distribution
      await agent.setBehaviorDistribution(behaviorDistribution);
      
      // Set agent's knowledge of home base
      await agent.setHomeBase(nest);
      
      // Set pheromone types the agent can deposit and sense
      await agent.setPheromoneTypes({
        food: { color: 'green', decayRate: 0.95 },
        water: { color: 'blue', decayRate: 0.95 },
        nest: { color: 'yellow', decayRate: 0.98 }
      });
      
      // Set stochastic parameters
      await agent.setStochasticParameters({
        explorationNoise: 0.2, // Random deviation in movement
        adaptationRate: 0.05,  // How quickly behavior distribution changes
        minProbability: 0.05    // Minimum probability for any behavior
      });
    }
    
    console.log('Configured all agents in swarm');
    
    // 7. Define stigmergic behavior rules for agents
    const stigmergicRules = [
      // When finding food, deposit food pheromone and return to nest
      {
        condition: (agent, env) => {
          const cell = env.getCell(agent.position[0], agent.position[1]);
          return cell && cell.resources && cell.resources.food && cell.resources.food.value > 0;
        },
        action: async (agent, env) => {
          // Collect food
          const cell = env.getCell(agent.position[0], agent.position[1]);
          const foodAmount = Math.min(10, cell.resources.food.value);
          cell.resources.food.value -= foodAmount;
          agent.carrying = { type: 'food', amount: foodAmount };
          
          // Increase food pheromone trail strength
          await agent.depositPheromone('food', agent.config.pheromoneStrength * 2);
          
          // Shift behavior toward returning to nest
          const newDistribution = { ...agent.behaviorDistribution };
          newDistribution.returnToNest = 0.8;
          newDistribution.explore = 0.1;
          newDistribution.followTrail = 0.1;
          newDistribution.rest = 0;
          await agent.setBehaviorDistribution(newDistribution);
          
          return true;
        }
      },
      
      // When finding water, deposit water pheromone and return to nest
      {
        condition: (agent, env) => {
          const cell = env.getCell(agent.position[0], agent.position[1]);
          return cell && cell.resources && cell.resources.water && cell.resources.water.value > 0;
        },
        action: async (agent, env) => {
          // Collect water
          const cell = env.getCell(agent.position[0], agent.position[1]);
          const waterAmount = Math.min(10, cell.resources.water.value);
          cell.resources.water.value -= waterAmount;
          agent.carrying = { type: 'water', amount: waterAmount };
          
          // Increase water pheromone trail strength
          await agent.depositPheromone('water', agent.config.pheromoneStrength * 2);
          
          // Shift behavior toward returning to nest
          const newDistribution = { ...agent.behaviorDistribution };
          newDistribution.returnToNest = 0.8;
          newDistribution.explore = 0.1;
          newDistribution.followTrail = 0.1;
          newDistribution.rest = 0;
          await agent.setBehaviorDistribution(newDistribution);
          
          return true;
        }
      },
      
      // When returning to nest with resources, deposit at nest and leave nest pheromone
      {
        condition: (agent, env) => {
          if (!agent.carrying) return false;
          
          const [x, y] = agent.position;
          const nestPosition = agent.homeBase.position;
          const dx = x - nestPosition[0];
          const dy = y - nestPosition[1];
          const distanceToNest = Math.sqrt(dx * dx + dy * dy);
          
          return distanceToNest <= agent.homeBase.radius;
        },
        action: async (agent, env) => {
          // Deposit carried resources at nest
          if (agent.carrying) {
            console.log(`Agent ${agent.id} delivered ${agent.carrying.amount} of ${agent.carrying.type} to nest`);
            await environment.addToNestStorage(agent.carrying.type, agent.carrying.amount);
            agent.carrying = null;
          }
          
          // Deposit nest pheromone
          await agent.depositPheromone('nest', agent.config.pheromoneStrength);
          
          // Reset behavior distribution to favor exploration and trail following
          const newDistribution = { ...behaviorDistribution };
          await agent.setBehaviorDistribution(newDistribution);
          
          return true;
        }
      }
    ];
    
    // 8. Register stigmergic rules with the swarm
    await swarmManager.registerRules(swarm.id, stigmergicRules);
    
    console.log('Registered stigmergic rules with swarm');
    
    // 9. Set up visualization
    visualizer.setupEnvironmentView(environment.id);
    visualizer.setupAgentView(swarm.id);
    visualizer.setupPheromoneView(['food', 'water', 'nest']);
    visualizer.setupResourceView(['food', 'water']);
    
    // Prepare for data collection
    dataCollector.trackMetric('resourcesCollected', { food: 0, water: 0 });
    dataCollector.trackMetric('pheromoneIntensity', { food: [], water: [], nest: [] });
    dataCollector.trackMetric('agentEnergy', []);
    dataCollector.trackMetric('behaviorDistribution', {
      explore: [],
      followTrail: [],
      returnToNest: [],
      rest: []
    });
    
    // 10. Run the simulation
    const simulationConfig = {
      maxSteps: 1000,
      tickRate: 10, // Environment updates per second
      realTime: true,
      dataCollectionInterval: 10 // Collect data every 10 steps
    };
    
    // Add a callback to collect data during simulation
    simulationConfig.onStep = async (step) => {
      if (step % simulationConfig.dataCollectionInterval === 0) {
        // Get current nest storage
        const nestStorage = await environment.getNestStorage();
        dataCollector.updateMetric('resourcesCollected', nestStorage);
        
        // Sample pheromone intensity across the environment
        const pheromoneIntensity = await environment.getSamplePheromoneIntensity();
        dataCollector.updateMetric('pheromoneIntensity', pheromoneIntensity);
        
        // Track agent energy levels
        const energyLevels = swarm.agents.map(agent => agent.currentEnergy);
        dataCollector.updateMetric('agentEnergy', energyLevels);
        
        // Track behavior distribution across agents
        const avgBehaviorDistribution = {
          explore: 0,
          followTrail: 0,
          returnToNest: 0,
          rest: 0
        };
        
        swarm.agents.forEach(agent => {
          for (const [behavior, prob] of Object.entries(agent.behaviorDistribution)) {
            avgBehaviorDistribution[behavior] += prob / swarm.agents.length;
          }
        });
        
        dataCollector.updateMetric('behaviorDistribution', avgBehaviorDistribution);
      }
    };
    
    console.log('Starting simulation...');
    const simulationResult = await swarmManager.runSimulation(swarm.id, environment.id, simulationConfig);
    
    console.log('Simulation completed');
    console.log(`Completed ${simulationResult.steps} steps`);
    console.log(`Resource collection: ${JSON.stringify(simulationResult.nestStorage)}`);
    
    // 11. Generate visualizations of the results
    await visualizer.generateHeatmap('pheromoneIntensity', 'food', 'Food Pheromone Distribution');
    await visualizer.generateHeatmap('pheromoneIntensity', 'water', 'Water Pheromone Distribution');
    await visualizer.generateHeatmap('pheromoneIntensity', 'nest', 'Nest Pheromone Distribution');
    
    await visualizer.generateLineChart('resourcesCollected', 'Resources Collected Over Time');
    await visualizer.generateLineChart('agentEnergy', 'Agent Energy Distribution');
    await visualizer.generateStackedAreaChart('behaviorDistribution', 'Agent Behavior Evolution');
    
    // 12. Save results
    const results = {
      nestStorage: simulationResult.nestStorage,
      metrics: dataCollector.getAllMetrics(),
      parameters: {
        environmentSize: environment.dimensions,
        swarmSize: swarm.agents.length,
        initialBehaviorDistribution: behaviorDistribution,
        stigmergicRules: stigmergicRules.map(rule => ({ name: rule.name })),
        resources: await environment.getResourceSummary()
      },
      performance: {
        steps: simulationResult.steps,
        duration: simulationResult.duration,
        resourcesPerStep: {
          food: simulationResult.nestStorage.food / simulationResult.steps,
          water: simulationResult.nestStorage.water / simulationResult.steps
        }
      }
    };
    
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(resultsDir, 'emergent-swarm-results.json'),
      JSON.stringify(results, null, 2)
    );
    
    console.log('Results saved to file');
    console.log('Example completed successfully');
    
  } catch (error) {
    console.error('Error in emergent swarm example:', error);
  }
}

// Run the example
runEmergentSwarmExample()
  .then(() => console.log('Emergent swarm example execution completed'))
  .catch(err => console.error('Example execution failed:', err));

module.exports = { runEmergentSwarmExample }; 