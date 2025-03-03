/**
 * Agent Interface Module
 * 
 * This module defines the standard interface that all agent implementations
 * must follow to ensure interoperability across different platforms
 * (CrewAI, NEAR AI, SUI Blockchain, etc.) within the Intellex Framework.
 * 
 * @module agent-interface
 */

/**
 * Abstract Agent Interface class that defines the standard methods
 * all agent implementations must implement
 */
class AgentInterface {
  /**
   * Create a new agent
   * @param {Object} config - Agent configuration
   * @returns {Promise<Object>} - Created agent
   */
  async createAgent(config) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Run an agent to perform a task
   * @param {string} agentId - Agent ID
   * @param {Object} task - Task to perform
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Task result
   */
  async runAgent(agentId, task, options) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Connect an agent to another agent
   * @param {string} sourceAgentId - Source agent ID
   * @param {string} targetAgentId - Target agent ID
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} - Connection result
   */
  async connectAgents(sourceAgentId, targetAgentId, options) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get an agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Promise<Object>} - Agent
   */
  async getAgent(agentId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Update an agent
   * @param {string} agentId - Agent ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated agent
   */
  async updateAgent(agentId, updates) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Delete an agent
   * @param {string} agentId - Agent ID
   * @returns {Promise<boolean>} - Whether deletion was successful
   */
  async deleteAgent(agentId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get all agents
   * @returns {Promise<Array>} - List of agents
   */
  async getAllAgents() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Register agent capabilities
   * @param {string} agentId - Agent ID
   * @param {Array} capabilities - Capabilities to register
   * @returns {Promise<Object>} - Updated agent with capabilities
   */
  async registerCapabilities(agentId, capabilities) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Check if an agent has a specific capability
   * @param {string} agentId - Agent ID
   * @param {string} capability - Capability to check
   * @returns {Promise<boolean>} - Whether the agent has the capability
   */
  async hasCapability(agentId, capability) {
    throw new Error('Method not implemented');
  }
}

module.exports = AgentInterface; 