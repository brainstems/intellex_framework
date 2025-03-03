/**
 * Agent Registry Module
 * 
 * This module provides a central registry for managing agents across different platforms
 * (CrewAI, NEAR AI, SUI Blockchain, etc.) within the Intellex Framework.
 * 
 * @module agent-registry
 */

const { generateUniqueId } = require('../utils');

/**
 * Agent Registry class for managing agents across different platforms
 */
class AgentRegistry {
  /**
   * Create a new Agent Registry instance
   * @param {Object} config - Configuration options
   * @param {Object} config.reputationSystem - Reputation system instance
   */
  constructor(config = {}) {
    this.config = {
      ...config,
    };
    
    this.reputationSystem = config.reputationSystem;
    this.adapters = new Map(); // Maps platform types to adapters
    this.agents = new Map(); // Maps agent IDs to agent metadata
    this.connections = new Map(); // Maps connection IDs to connection metadata
    this.initialized = false;
  }
  
  /**
   * Initialize the agent registry
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log('Initializing agent registry');
      
      // Initialize reputation system if provided
      if (this.reputationSystem && !this.reputationSystem.initialized) {
        await this.reputationSystem.initialize();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize agent registry:', error);
      return false;
    }
  }
  
  /**
   * Register an adapter for a platform
   * @param {string} platformType - Platform type
   * @param {Object} adapter - Adapter instance
   * @returns {Promise<boolean>} - Whether registration was successful
   */
  async registerAdapter(platformType, adapter) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    // Initialize the adapter if not already initialized
    if (!adapter.initialized && typeof adapter.initialize === 'function') {
      await adapter.initialize();
    }
    
    // Register the adapter
    this.adapters.set(platformType, adapter);
    
    console.log(`Registered adapter for platform: ${platformType}`);
    
    return true;
  }
  
  /**
   * Create a new agent
   * @param {string} platformType - Platform type
   * @param {Object} config - Agent configuration
   * @returns {Promise<Object>} - Created agent
   */
  async createAgent(platformType, config) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    const adapter = this.adapters.get(platformType);
    if (!adapter) {
      throw new Error(`Adapter not found for platform: ${platformType}`);
    }
    
    // Create the agent using the adapter
    const agent = await adapter.createAgent(config);
    
    // Store agent metadata
    this.agents.set(agent.id, {
      id: agent.id,
      name: agent.name,
      platformType,
      platformId: agent.platformId,
      createdAt: agent.createdAt,
      reputation: 0, // Initial reputation
    });
    
    // Initialize reputation if reputation system is available
    if (this.reputationSystem) {
      await this.reputationSystem.initializeAgentReputation(agent.id, {
        name: agent.name,
        platformType,
      });
    }
    
    console.log(`Created agent: ${agent.name} (${agent.id}) on platform: ${platformType}`);
    
    return agent;
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
      throw new Error('Agent registry not initialized');
    }
    
    const agentMetadata = this.agents.get(agentId);
    if (!agentMetadata) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    const adapter = this.adapters.get(agentMetadata.platformType);
    if (!adapter) {
      throw new Error(`Adapter not found for platform: ${agentMetadata.platformType}`);
    }
    
    // Run the agent using the adapter
    const result = await adapter.runAgent(agentId, task, options);
    
    // Update reputation based on task result if reputation system is available
    if (this.reputationSystem && result.status === 'completed') {
      await this.reputationSystem.updateAgentReputation(agentId, {
        taskId: result.taskId,
        success: true,
        quality: options.quality || 0.8, // Default quality score
      });
    }
    
    return result;
  }
  
  /**
   * Connect agents across platforms
   * @param {string} sourceAgentId - Source agent ID
   * @param {string} targetAgentId - Target agent ID
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} - Connection result
   */
  async connectAgents(sourceAgentId, targetAgentId, options = {}) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    const sourceAgentMetadata = this.agents.get(sourceAgentId);
    if (!sourceAgentMetadata) {
      throw new Error(`Source agent not found: ${sourceAgentId}`);
    }
    
    const targetAgentMetadata = this.agents.get(targetAgentId);
    if (!targetAgentMetadata) {
      throw new Error(`Target agent not found: ${targetAgentId}`);
    }
    
    // Get the source agent's adapter
    const sourceAdapter = this.adapters.get(sourceAgentMetadata.platformType);
    if (!sourceAdapter) {
      throw new Error(`Adapter not found for platform: ${sourceAgentMetadata.platformType}`);
    }
    
    // Connect the agents using the source adapter
    const connection = await sourceAdapter.connectAgents(sourceAgentId, targetAgentId, options);
    
    // Store connection metadata
    const connectionId = connection.threadId || connection.connectionId || generateUniqueId();
    this.connections.set(connectionId, {
      id: connectionId,
      sourceAgentId,
      targetAgentId,
      sourcePlatform: sourceAgentMetadata.platformType,
      targetPlatform: targetAgentMetadata.platformType,
      status: connection.status,
      createdAt: connection.createdAt,
    });
    
    console.log(`Connected agents: ${sourceAgentId} -> ${targetAgentId}`);
    
    return connection;
  }
  
  /**
   * Get an agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} - Agent
   */
  async getAgent(agentId) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    const agentMetadata = this.agents.get(agentId);
    if (!agentMetadata) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    const adapter = this.adapters.get(agentMetadata.platformType);
    if (!adapter) {
      throw new Error(`Adapter not found for platform: ${agentMetadata.platformType}`);
    }
    
    // Get the agent using the adapter
    const agent = await adapter.getAgent(agentId);
    
    // Add reputation if available
    if (this.reputationSystem) {
      const reputation = await this.reputationSystem.getAgentReputation(agentId);
      agent.reputation = reputation;
    }
    
    return agent;
  }
  
  /**
   * Get all agents
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Array>} - List of agents
   */
  async getAllAgents(filters = {}) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    const agents = [];
    
    for (const [agentId, agentMetadata] of this.agents.entries()) {
      // Apply platform filter if specified
      if (filters.platformType && agentMetadata.platformType !== filters.platformType) {
        continue;
      }
      
      try {
        const agent = await this.getAgent(agentId);
        agents.push(agent);
      } catch (error) {
        console.warn(`Error getting agent ${agentId}:`, error);
      }
    }
    
    return agents;
  }
  
  /**
   * Get all connections
   * @param {Object} filters - Filters to apply
   * @returns {Promise<Array>} - List of connections
   */
  async getAllConnections(filters = {}) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    const connections = [];
    
    for (const [connectionId, connectionMetadata] of this.connections.entries()) {
      // Apply source agent filter if specified
      if (filters.sourceAgentId && connectionMetadata.sourceAgentId !== filters.sourceAgentId) {
        continue;
      }
      
      // Apply target agent filter if specified
      if (filters.targetAgentId && connectionMetadata.targetAgentId !== filters.targetAgentId) {
        continue;
      }
      
      connections.push(connectionMetadata);
    }
    
    return connections;
  }
  
  /**
   * Delete an agent
   * @param {string} agentId - Agent ID
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  async deleteAgent(agentId) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    const agentMetadata = this.agents.get(agentId);
    if (!agentMetadata) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    const adapter = this.adapters.get(agentMetadata.platformType);
    if (!adapter) {
      throw new Error(`Adapter not found for platform: ${agentMetadata.platformType}`);
    }
    
    // Delete the agent using the adapter
    await adapter.deleteAgent(agentId);
    
    // Remove agent metadata
    this.agents.delete(agentId);
    
    // Remove agent's reputation if reputation system is available
    if (this.reputationSystem) {
      await this.reputationSystem.removeAgentReputation(agentId);
    }
    
    console.log(`Deleted agent: ${agentId}`);
    
    return true;
  }
  
  /**
   * Get agent reputation
   * @param {string} agentId - Agent ID
   * @returns {Promise<number>} - Agent reputation
   */
  async getAgentReputation(agentId) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    if (!this.reputationSystem) {
      throw new Error('Reputation system not available');
    }
    
    const agentMetadata = this.agents.get(agentId);
    if (!agentMetadata) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Get agent reputation from the reputation system
    const reputation = await this.reputationSystem.getAgentReputation(agentId);
    
    return reputation;
  }
  
  /**
   * Update agent reputation
   * @param {string} agentId - Agent ID
   * @param {Object} update - Reputation update
   * @returns {Promise<number>} - Updated reputation
   */
  async updateAgentReputation(agentId, update) {
    if (!this.initialized) {
      throw new Error('Agent registry not initialized');
    }
    
    if (!this.reputationSystem) {
      throw new Error('Reputation system not available');
    }
    
    const agentMetadata = this.agents.get(agentId);
    if (!agentMetadata) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Update agent reputation in the reputation system
    const updatedReputation = await this.reputationSystem.updateAgentReputation(agentId, update);
    
    return updatedReputation;
  }
}

module.exports = AgentRegistry; 