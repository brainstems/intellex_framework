/**
 * SUI Blockchain Adapter Module
 * 
 * This module provides an adapter that implements the Intellex Framework's
 * agent interface for SUI Blockchain agents, ensuring interoperability with other
 * agent platforms.
 * 
 * @module sui-blockchain-adapter
 */

const AgentInterface = require('../core/agent-interface');
const { generateUniqueId } = require('../utils');

/**
 * SUI Blockchain Adapter class that implements the agent interface for SUI Blockchain
 */
class SUIBlockchainAdapter extends AgentInterface {
  /**
   * Create a new SUI Blockchain Adapter instance
   * @param {Object} config - Configuration options
   * @param {Object} config.suiProvider - SUI blockchain provider
   * @param {Object} config.communicationAdapter - Communication adapter instance
   */
  constructor(config = {}) {
    super();
    
    this.config = {
      network: config.network || 'testnet',
      ...config,
    };
    
    this.suiProvider = config.suiProvider;
    this.communicationAdapter = config.communicationAdapter;
    
    this.agents = new Map(); // Store SUI blockchain agents
    this.initialized = false;
  }
  
  /**
   * Initialize the SUI Blockchain adapter
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log(`Initializing SUI Blockchain adapter on ${this.config.network}`);
      
      // Initialize SUI provider if not already initialized
      if (this.suiProvider && typeof this.suiProvider.initialize === 'function') {
        await this.suiProvider.initialize();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize SUI Blockchain adapter:', error);
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
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    // Generate a unique ID for the agent
    const agentId = generateUniqueId();
    
    // Create a SUI blockchain agent
    const suiAgent = {
      id: agentId,
      name: config.name,
      type: 'sui-blockchain',
      role: config.role || config.type,
      goal: config.goal,
      description: config.description || '',
      capabilities: config.capabilities || [],
      address: config.address, // SUI blockchain address
      objectId: config.objectId, // SUI object ID for the agent
      metadata: {
        ...config.metadata,
        platform: 'sui-blockchain',
        network: this.config.network,
      },
      createdAt: new Date().toISOString(),
    };
    
    // Store the agent
    this.agents.set(agentId, suiAgent);
    
    console.log(`Created SUI Blockchain agent: ${suiAgent.name} (${agentId})`);
    
    return suiAgent;
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
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // In a real implementation, we would call the SUI blockchain
    // For now, we'll simulate a task execution
    console.log(`Running SUI Blockchain agent ${agentId} with task: ${task.description}`);
    
    // Simulate task execution
    const result = {
      id: generateUniqueId(),
      agentId,
      taskId: task.id || generateUniqueId(),
      result: `Executed task: ${task.description}`,
      status: 'completed',
      metadata: {
        network: this.config.network,
        transactionHash: generateUniqueId(), // Simulated transaction hash
      },
      completedAt: new Date().toISOString(),
    };
    
    return result;
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
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    const sourceAgent = this.agents.get(sourceAgentId);
    if (!sourceAgent) {
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
    
    // If no communication adapter, create a SUI blockchain connection
    // In a real implementation, this would involve creating a connection on the SUI blockchain
    return {
      sourceAgentId,
      targetAgentId,
      connectionId: generateUniqueId(),
      status: 'connected',
      metadata: {
        network: this.config.network,
        transactionHash: generateUniqueId(), // Simulated transaction hash
      },
      createdAt: new Date().toISOString(),
    };
  }
  
  /**
   * Get an agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} - Agent
   */
  async getAgent(agentId) {
    if (!this.initialized) {
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    return agent;
  }
  
  /**
   * Update an agent
   * @param {string} agentId - Agent ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated agent
   */
  async updateAgent(agentId, updates) {
    if (!this.initialized) {
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Update the agent
    const updatedAgent = {
      ...agent,
      ...updates,
      metadata: {
        ...agent.metadata,
        ...updates.metadata,
      },
      updatedAt: new Date().toISOString(),
    };
    
    // Store the updated agent
    this.agents.set(agentId, updatedAgent);
    
    return updatedAgent;
  }
  
  /**
   * Delete an agent
   * @param {string} agentId - Agent ID
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  async deleteAgent(agentId) {
    if (!this.initialized) {
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Remove the agent
    this.agents.delete(agentId);
    
    return true;
  }
  
  /**
   * Get all agents
   * @returns {Promise<Array>} - List of agents
   */
  async getAllAgents() {
    if (!this.initialized) {
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    return Array.from(this.agents.values());
  }
  
  /**
   * Register agent capabilities
   * @param {string} agentId - Agent ID
   * @param {Array} capabilities - Capabilities to register
   * @returns {Promise<Object>} - Updated agent with capabilities
   */
  async registerCapabilities(agentId, capabilities) {
    if (!this.initialized) {
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Update agent capabilities
    const updatedAgent = {
      ...agent,
      capabilities: [...new Set([...agent.capabilities, ...capabilities])],
      updatedAt: new Date().toISOString(),
    };
    
    // Store the updated agent
    this.agents.set(agentId, updatedAgent);
    
    return updatedAgent;
  }
  
  /**
   * Check if an agent has a specific capability
   * @param {string} agentId - Agent ID
   * @param {string} capability - Capability to check
   * @returns {Promise<boolean>} - Whether the agent has the capability
   */
  async hasCapability(agentId, capability) {
    if (!this.initialized) {
      throw new Error('SUI Blockchain adapter not initialized');
    }
    
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    return agent.capabilities.includes(capability);
  }
}

module.exports = SUIBlockchainAdapter; 