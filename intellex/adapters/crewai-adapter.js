/**
 * CrewAI Adapter Module
 * 
 * This module provides an adapter that implements the Intellex Framework's
 * agent interface for CrewAI agents, ensuring interoperability with other
 * agent platforms.
 * 
 * @module crewai-adapter
 */

const AgentInterface = require('../core/agent-interface');
const { generateUniqueId } = require('../utils');

/**
 * CrewAI Adapter class that implements the agent interface for CrewAI
 */
class CrewAIAdapter extends AgentInterface {
  /**
   * Create a new CrewAI Adapter instance
   * @param {Object} config - Configuration options
   * @param {Object} config.crewAIIntegration - CrewAI integration instance
   * @param {Object} config.communicationAdapter - Communication adapter instance
   */
  constructor(config = {}) {
    super();
    
    this.config = {
      ...config,
    };
    
    this.crewAIIntegration = config.crewAIIntegration;
    this.communicationAdapter = config.communicationAdapter;
    
    this.agentMappings = new Map(); // Maps Intellex agent IDs to CrewAI agent IDs
    this.initialized = false;
  }
  
  /**
   * Initialize the CrewAI adapter
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log('Initializing CrewAI adapter');
      
      // Initialize CrewAI integration if not already initialized
      if (this.crewAIIntegration && !this.crewAIIntegration.initialized) {
        await this.crewAIIntegration.initialize();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize CrewAI adapter:', error);
      return false;
    }
  }
  
  /**
   * Create a new agent
   * @param {Object} config - Agent configuration
   * @returns {Promise<Object>} - Created agent
   */
  async createAgent(config) {
    if (!this.initialized) {
      throw new Error('CrewAI adapter not initialized');
    }
    
    // Create a CrewAI agent
    const crewAIAgent = this.crewAIIntegration.createAgent({
      name: config.name,
      role: config.role || config.type,
      goal: config.goal,
      tools: config.tools || [],
      backstory: config.description || '',
      verbose: config.verbose !== undefined ? config.verbose : true,
      allowDelegation: config.allowDelegation !== undefined ? config.allowDelegation : true,
      metadata: config.metadata || {},
    });
    
    // Create an Intellex agent wrapper
    const intellexAgentId = generateUniqueId();
    const intellexAgent = {
      id: intellexAgentId,
      name: config.name,
      type: 'crewai',
      role: config.role || config.type,
      goal: config.goal,
      description: config.description || '',
      capabilities: config.capabilities || [],
      platformId: crewAIAgent.id,
      metadata: {
        ...config.metadata,
        platform: 'crewai',
      },
      createdAt: new Date().toISOString(),
    };
    
    // Store the mapping
    this.agentMappings.set(intellexAgentId, crewAIAgent.id);
    
    console.log(`Created CrewAI agent: ${intellexAgent.name} (${intellexAgentId})`);
    
    return intellexAgent;
  }
  
  /**
   * Run an agent to perform a task
   * @param {string} agentId - Agent ID
   * @param {Object} task - Task to perform
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Task result
   */
  async runAgent(agentId, task, options = {}) {
    if (!this.initialized) {
      throw new Error('CrewAI adapter not initialized');
    }
    
    const crewAIAgentId = this.agentMappings.get(agentId);
    if (!crewAIAgentId) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Create a CrewAI task
    const crewAITask = this.crewAIIntegration.createTask({
      description: task.description,
      agentId: crewAIAgentId,
      context: task.context || {},
      expectedOutput: task.expectedOutput || 'A detailed report',
    });
    
    // Create a crew with just this agent and task
    const crew = this.crewAIIntegration.createCrew({
      name: `Single Task Crew for ${agentId}`,
      agents: [{ id: crewAIAgentId }],
      tasks: [crewAITask.id],
      process: 'sequential',
      verbose: options.verbose !== undefined ? options.verbose : true,
    });
    
    // Run the crew
    const crewResults = await this.crewAIIntegration.runCrew(crew.id, task.inputs || {});
    
    // Extract the task result
    const taskResult = crewResults.results.find(result => result.taskId === crewAITask.id);
    
    return {
      id: generateUniqueId(),
      agentId,
      taskId: task.id || generateUniqueId(),
      result: taskResult ? taskResult.result : null,
      status: taskResult ? 'completed' : 'failed',
      metadata: {
        crewId: crew.id,
        crewAITaskId: crewAITask.id,
      },
      completedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Connect an agent to another agent
   * @param {string} sourceAgentId - Source agent ID
   * @param {string} targetAgentId - Target agent ID
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} - Connection result
   */
  async connectAgents(sourceAgentId, targetAgentId, options = {}) {
    if (!this.initialized) {
      throw new Error('CrewAI adapter not initialized');
    }
    
    const sourceCrewAIAgentId = this.agentMappings.get(sourceAgentId);
    if (!sourceCrewAIAgentId) {
      throw new Error(`Source agent not found: ${sourceAgentId}`);
    }
    
    // If the communication adapter is available, use it to create a thread
    if (this.communicationAdapter) {
      const thread = await this.communicationAdapter.createThread({
        title: options.title || `Thread between ${sourceAgentId} and ${targetAgentId}`,
        participants: [sourceAgentId, targetAgentId],
        metadata: {
          ...options.metadata,
          sourceAgentId,
          targetAgentId,
        },
      });
      
      return {
        sourceAgentId,
        targetAgentId,
        threadId: thread.id,
        status: 'connected',
        createdAt: new Date().toISOString(),
      };
    }
    
    // If no communication adapter, use CrewAI's built-in connection if target is also CrewAI
    const targetCrewAIAgentId = this.agentMappings.get(targetAgentId);
    if (targetCrewAIAgentId) {
      // Create a crew with both agents
      const crew = this.crewAIIntegration.createCrew({
        name: options.title || `Crew for ${sourceAgentId} and ${targetAgentId}`,
        agents: [
          { id: sourceCrewAIAgentId },
          { id: targetCrewAIAgentId },
        ],
        tasks: [],
        process: options.process || 'sequential',
        verbose: options.verbose !== undefined ? options.verbose : true,
      });
      
      return {
        sourceAgentId,
        targetAgentId,
        crewId: crew.id,
        status: 'connected',
        createdAt: new Date().toISOString(),
      };
    }
    
    throw new Error(`Cannot connect agents: ${sourceAgentId} and ${targetAgentId}`);
  }
  
  /**
   * Get an agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} - Agent
   */
  async getAgent(agentId) {
    if (!this.initialized) {
      throw new Error('CrewAI adapter not initialized');
    }
    
    const crewAIAgentId = this.agentMappings.get(agentId);
    if (!crewAIAgentId) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Get the CrewAI agent
    const crewAIAgent = this.crewAIIntegration.getAgent(crewAIAgentId);
    
    // Convert to Intellex agent format
    return {
      id: agentId,
      name: crewAIAgent.name,
      type: 'crewai',
      role: crewAIAgent.role,
      goal: crewAIAgent.goal,
      description: crewAIAgent.backstory,
      capabilities: [],
      platformId: crewAIAgentId,
      metadata: {
        ...crewAIAgent.metadata,
        platform: 'crewai',
      },
      createdAt: crewAIAgent.createdAt,
    };
  }
  
  /**
   * Update an agent
   * @param {string} agentId - Agent ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated agent
   */
  async updateAgent(agentId, updates) {
    throw new Error('Method not implemented: CrewAI does not support agent updates');
  }
  
  /**
   * Delete an agent
   * @param {string} agentId - Agent ID
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  async deleteAgent(agentId) {
    if (!this.initialized) {
      throw new Error('CrewAI adapter not initialized');
    }
    
    const crewAIAgentId = this.agentMappings.get(agentId);
    if (!crewAIAgentId) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Remove the mapping
    this.agentMappings.delete(agentId);
    
    return true;
  }
  
  /**
   * Get all agents
   * @returns {Promise<Array>} - List of agents
   */
  async getAllAgents() {
    if (!this.initialized) {
      throw new Error('CrewAI adapter not initialized');
    }
    
    const agents = [];
    
    for (const [intellexAgentId, crewAIAgentId] of this.agentMappings.entries()) {
      try {
        const agent = await this.getAgent(intellexAgentId);
        agents.push(agent);
      } catch (error) {
        console.warn(`Error getting agent ${intellexAgentId}:`, error);
      }
    }
    
    return agents;
  }
  
  /**
   * Register agent capabilities
   * @param {string} agentId - Agent ID
   * @param {Array} capabilities - Capabilities to register
   * @returns {Promise<Object>} - Updated agent with capabilities
   */
  async registerCapabilities(agentId, capabilities) {
    throw new Error('Method not implemented: CrewAI does not support capability registration');
  }
  
  /**
   * Check if an agent has a specific capability
   * @param {string} agentId - Agent ID
   * @param {string} capability - Capability to check
   * @returns {Promise<boolean>} - Whether the agent has the capability
   */
  async hasCapability(agentId, capability) {
    throw new Error('Method not implemented: CrewAI does not support capability checking');
  }
}

module.exports = CrewAIAdapter; 