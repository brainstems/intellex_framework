/**
 * Communication Interface Module
 * 
 * This module defines the standard communication interface that all
 * platform-specific implementations must follow to ensure interoperability
 * between agents across different platforms within the Intellex Framework.
 * 
 * @module communication-interface
 */

/**
 * Abstract Communication Interface class that defines the standard methods
 * all communication implementations must implement
 */
class CommunicationInterface {
  /**
   * Create a new communication thread
   * @param {Object} options - Thread options
   * @returns {Promise<Object>} - Created thread
   */
  async createThread(options) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Add a message to a thread
   * @param {string} threadId - Thread ID
   * @param {Object} message - Message to add
   * @returns {Promise<Object>} - Added message
   */
  async addMessage(threadId, message) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get a thread by ID
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} - Thread
   */
  async getThread(threadId) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get all threads
   * @returns {Promise<Array>} - List of threads
   */
  async getAllThreads() {
    throw new Error('Method not implemented');
  }
  
  /**
   * Create a capability request
   * @param {string} capabilityType - Type of capability
   * @param {Object} data - Capability data
   * @returns {Promise<Object>} - Created capability
   */
  async createCapabilityRequest(capabilityType, data) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Respond to a capability request
   * @param {string} threadId - Thread ID
   * @param {string} messageId - Message ID containing the capability request
   * @param {string} capabilityType - Type of capability
   * @param {Object} response - Response data
   * @returns {Promise<Object>} - Response result
   */
  async respondToCapability(threadId, messageId, capabilityType, response) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Register a capability handler
   * @param {string} capabilityType - Type of capability
   * @param {Function} handler - Handler function
   * @returns {Promise<boolean>} - Whether registration was successful
   */
  async registerCapabilityHandler(capabilityType, handler) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Add participants to a thread
   * @param {string} threadId - Thread ID
   * @param {Array} participantIds - Participant IDs to add
   * @returns {Promise<Object>} - Updated thread
   */
  async addParticipants(threadId, participantIds) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Remove participants from a thread
   * @param {string} threadId - Thread ID
   * @param {Array} participantIds - Participant IDs to remove
   * @returns {Promise<Object>} - Updated thread
   */
  async removeParticipants(threadId, participantIds) {
    throw new Error('Method not implemented');
  }
}

module.exports = CommunicationInterface; 