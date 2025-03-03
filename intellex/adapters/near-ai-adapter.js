/**
 * NEAR AI Adapter Module
 * 
 * This module provides an adapter that implements the Intellex Framework's
 * agent interface for NEAR AI agents, ensuring interoperability with other
 * agent platforms.
 * 
 * @module near-ai-adapter
 */

const AgentInterface = require('../core/agent-interface');
const { generateUniqueId } = require('../utils');

/**
 * NEAR AI Adapter class that implements the agent interface for NEAR AI
 */
class NearAIAdapter extends AgentInterface {
  /**
   * Create a new NEAR AI Adapter instance
   * @param {Object} config - Configuration options
   * @param {Object} config.nearAIIntegration - NEAR AI integration instance
   * @param {Object} config.communicationAdapter - Communication adapter instance
   */
  constructor(config = {}) {
    super();
    
    this.config = {
      ...config,
    };
    
    this.nearAIIntegration = config.nearAIIntegration;
    this.communicationAdapter = config.communicationAdapter;
    
    this.agentMappings = new Map(); // Maps Intellex agent IDs to NEAR AI agent IDs
    this.initialized = false;
  }
  
  /**
   * Initialize the NEAR AI adapter
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log('Initializing NEAR AI adapter');
      
      // Initialize NEAR AI integration if not already initialized
      if (this.nearAIIntegration && !this.nearAIIntegration.initialized) {
        await this.nearAIIntegration.initialize();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize NEAR AI adapter:', error);
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
      throw new Error('NEAR AI adapter not initialized');
    }
    
    // Create a NEAR AI agent
    const nearAIAgent = await this.nearAIIntegration.createAgent({
      name: config.name,
      description: config.description || config.role || '',
      modelId: config.modelId || 'near-ai-base',
      tools: config.tools || [],
      options: config.options || {},
    });
    
    // Create an Intellex agent wrapper
    const intellexAgentId = generateUniqueId();
    const intellexAgent = {
      id: intellexAgentId,
      name: config.name,
      type: 'near-ai',
      role: config.role || config.type,
      goal: config.goal,
      description: config.description || '',
      capabilities: config.capabilities || [],
      platformId: nearAIAgent.id,
      metadata: {
        ...config.metadata,
        platform: 'near-ai',
        modelId: nearAIAgent.modelId,
      },
      createdAt: new Date().toISOString(),
    };
    
    // Store the mapping
    this.agentMappings.set(intellexAgentId, nearAIAgent.id);
    
    console.log(`Created NEAR AI agent: ${intellexAgent.name} (${intellexAgentId})`);
    
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
      throw new Error('NEAR AI adapter not initialized');
    }
    
    const nearAIAgentId = this.agentMappings.get(agentId);
    if (!nearAIAgentId) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // Run the NEAR AI agent
    const result = await this.nearAIIntegration.runAgent(nearAIAgentId, {
      input: task.description,
      context: task.context || {},
    }, options);
    
    return {
      id: generateUniqueId(),
      agentId,
      taskId: task.id || generateUniqueId(),
      result: result.output,
      status: 'completed',
      metadata: {
        nearAIResultId: result.id,
        toolCalls: result.toolCalls,
      },
      completedAt: result.completedAt || new Date().toISOString(),
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
      throw new Error('NEAR AI adapter not initialized');
    }
    
    const sourceNearAIAgentId = this.agentMappings.get(sourceAgentId);
    if (!sourceNearAIAgentId) {
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
    
    throw new Error('Cannot connect agents: Communication adapter not available');
  }
  
  /**
   * Get an agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} - Agent
   */
  async getAgent(agentId) {
    if (!this.initialized) {
      throw new Error('NEAR AI adapter not initialized');
    }
    
    const nearAIAgentId = this.agentMappings.get(agentId);
    if (!nearAIAgentId) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // In a real implementation, we would fetch the NEAR AI agent details
    // For now, we'll return a placeholder
    return {
      id: agentId,
      name: `NEAR AI Agent ${agentId}`,
      type: 'near-ai',
      role: 'assistant',
      goal: 'Assist users with tasks',
      description: 'A NEAR AI agent',
      capabilities: [],
      platformId: nearAIAgentId,
      metadata: {
        platform: 'near-ai',
      },
      createdAt: new Date().toISOString(),
    };
  }
  
  /**
   * Update an agent
   * @param {string} agentId - Agent ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated agent
   */
  async updateAgent(agentId, updates) {
    throw new Error('Method not implemented: NEAR AI does not support agent updates');
  }
  
  /**
   * Delete an agent
   * @param {string} agentId - Agent ID
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  async deleteAgent(agentId) {
    if (!this.initialized) {
      throw new Error('NEAR AI adapter not initialized');
    }
    
    const nearAIAgentId = this.agentMappings.get(agentId);
    if (!nearAIAgentId) {
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
      throw new Error('NEAR AI adapter not initialized');
    }
    
    const agents = [];
    
    for (const [intellexAgentId, nearAIAgentId] of this.agentMappings.entries()) {
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
    if (!this.initialized) {
      throw new Error('NEAR AI adapter not initialized');
    }
    
    const nearAIAgentId = this.agentMappings.get(agentId);
    if (!nearAIAgentId) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // In a real implementation, we would register capabilities with NEAR AI
    // For now, we'll return a placeholder
    return {
      id: agentId,
      capabilities,
      updatedAt: new Date().toISOString(),
    };
  }
  
  /**
   * Check if an agent has a specific capability
   * @param {string} agentId - Agent ID
   * @param {string} capability - Capability to check
   * @returns {Promise<boolean>} - Whether the agent has the capability
   */
  async hasCapability(agentId, capability) {
    if (!this.initialized) {
      throw new Error('NEAR AI adapter not initialized');
    }
    
    const nearAIAgentId = this.agentMappings.get(agentId);
    if (!nearAIAgentId) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    // In a real implementation, we would check with NEAR AI
    // For now, we'll return a placeholder
    return false;
  }
}

module.exports = NearAIAdapter; 