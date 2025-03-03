/**
 * AITP Communication Adapter Module
 * 
 * This module provides an adapter that implements the Intellex Framework's
 * communication interface for AITP (Agent Interaction & Transaction Protocol),
 * ensuring interoperability between agents across different platforms.
 * 
 * @module aitp-communication-adapter
 */

const CommunicationInterface = require('../core/communication-interface');
const { generateUniqueId } = require('../utils');

/**
 * AITP Communication Adapter class that implements the communication interface for AITP
 */
class AITPCommunicationAdapter extends CommunicationInterface {
  /**
   * Create a new AITP Communication Adapter instance
   * @param {Object} config - Configuration options
   * @param {Object} config.aitpIntegration - AITP integration instance
   */
  constructor(config = {}) {
    super();
    
    this.config = {
      ...config,
    };
    
    this.aitpIntegration = config.aitpIntegration;
    this.capabilityHandlers = new Map();
    this.initialized = false;
  }
  
  /**
   * Initialize the AITP communication adapter
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log('Initializing AITP communication adapter');
      
      // Initialize AITP integration if not already initialized
      if (this.aitpIntegration && !this.aitpIntegration.initialized) {
        await this.aitpIntegration.initialize();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AITP communication adapter:', error);
      return false;
    }
  }
  
  /**
   * Create a new communication thread
   * @param {Object} options - Thread options
   * @returns {Promise<Object>} - Created thread
   */
  async createThread(options) {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Create a thread using AITP integration
    const thread = this.aitpIntegration.createThread({
      title: options.title,
      participants: options.participants,
      metadata: options.metadata || {},
    });
    
    return thread;
  }
  
  /**
   * Add a message to a thread
   * @param {string} threadId - Thread ID
   * @param {Object} message - Message to add
   * @returns {Promise<Object>} - Added message
   */
  async addMessage(threadId, message) {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Add a message to the thread using AITP integration
    const addedMessage = this.aitpIntegration.addMessage(threadId, message);
    
    return addedMessage;
  }
  
  /**
   * Get a thread by ID
   * @param {string} threadId - Thread ID
   * @returns {Promise<Object>} - Thread
   */
  async getThread(threadId) {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Get a thread using AITP integration
    const thread = this.aitpIntegration.getThread(threadId);
    
    return thread;
  }
  
  /**
   * Get all threads
   * @returns {Promise<Array>} - List of threads
   */
  async getAllThreads() {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Get all threads using AITP integration
    const threads = this.aitpIntegration.getAllThreads();
    
    return threads;
  }
  
  /**
   * Create a capability request
   * @param {string} capabilityType - Type of capability
   * @param {Object} data - Capability data
   * @returns {Promise<Object>} - Created capability
   */
  async createCapabilityRequest(capabilityType, data) {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Create a capability request based on the type
    let capability;
    
    switch (capabilityType) {
      case 'payment':
        capability = this.aitpIntegration.createPaymentCapability(data);
        break;
      case 'data-request':
        capability = this.aitpIntegration.createDataRequestCapability(data);
        break;
      case 'near-wallet':
        capability = this.aitpIntegration.createNEARWalletCapability(data);
        break;
      default:
        throw new Error(`Unsupported capability type: ${capabilityType}`);
    }
    
    return capability;
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
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Get the thread
    const thread = await this.getThread(threadId);
    
    // Find the message
    const message = thread.messages.find(msg => msg.id === messageId);
    if (!message) {
      throw new Error(`Message not found: ${messageId}`);
    }
    
    // Find the capability
    const capability = message.capabilities.find(cap => cap.type === capabilityType);
    if (!capability) {
      throw new Error(`Capability not found: ${capabilityType}`);
    }
    
    // Create a response message
    const responseMessage = await this.addMessage(threadId, {
      role: 'assistant',
      content: response.message || `Response to ${capabilityType} request`,
      capabilities: [
        {
          type: capabilityType,
          version: capability.version,
          action: 'response',
          data: response.data,
          referenceId: capability.id,
        },
      ],
      metadata: {
        responseToMessageId: messageId,
        ...response.metadata,
      },
    });
    
    return {
      threadId,
      messageId: responseMessage.id,
      capabilityType,
      status: 'responded',
      createdAt: responseMessage.createdAt,
    };
  }
  
  /**
   * Register a capability handler
   * @param {string} capabilityType - Type of capability
   * @param {Function} handler - Handler function
   * @returns {Promise<boolean>} - Whether registration was successful
   */
  async registerCapabilityHandler(capabilityType, handler) {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Register the handler
    this.capabilityHandlers.set(capabilityType, handler);
    
    return true;
  }
  
  /**
   * Add participants to a thread
   * @param {string} threadId - Thread ID
   * @param {Array} participantIds - Participant IDs to add
   * @returns {Promise<Object>} - Updated thread
   */
  async addParticipants(threadId, participantIds) {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Get the thread
    const thread = await this.getThread(threadId);
    
    // Add participants
    const updatedParticipants = [...new Set([...thread.participants, ...participantIds])];
    
    // Update the thread
    const updatedThread = {
      ...thread,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real implementation, we would update the thread in AITP
    // For now, we'll simulate it
    this.aitpIntegration.threads.set(threadId, updatedThread);
    
    return updatedThread;
  }
  
  /**
   * Remove participants from a thread
   * @param {string} threadId - Thread ID
   * @param {Array} participantIds - Participant IDs to remove
   * @returns {Promise<Object>} - Updated thread
   */
  async removeParticipants(threadId, participantIds) {
    if (!this.initialized) {
      throw new Error('AITP communication adapter not initialized');
    }
    
    // Get the thread
    const thread = await this.getThread(threadId);
    
    // Remove participants
    const updatedParticipants = thread.participants.filter(id => !participantIds.includes(id));
    
    // Update the thread
    const updatedThread = {
      ...thread,
      participants: updatedParticipants,
      updatedAt: new Date().toISOString(),
    };
    
    // In a real implementation, we would update the thread in AITP
    // For now, we'll simulate it
    this.aitpIntegration.threads.set(threadId, updatedThread);
    
    return updatedThread;
  }
  
  /**
   * Process incoming messages and trigger capability handlers
   * @param {string} threadId - Thread ID
   * @param {Object} message - Message to process
   * @private
   */
  async _processMessage(threadId, message) {
    // Check if the message has capabilities
    if (!message.capabilities || message.capabilities.length === 0) {
      return;
    }
    
    // Process each capability
    for (const capability of message.capabilities) {
      const handler = this.capabilityHandlers.get(capability.type);
      if (handler) {
        try {
          await handler(threadId, message.id, capability);
        } catch (error) {
          console.error(`Error handling capability ${capability.type}:`, error);
        }
      }
    }
  }
}

module.exports = AITPCommunicationAdapter; 