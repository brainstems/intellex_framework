/**
 * AITP Integration Module
 * 
 * This module provides integration with the Agent Interaction & Transaction Protocol (AITP),
 * enabling Intellex Framework agents to communicate securely across trust boundaries.
 * 
 * Based on AITP documentation: https://aitp.dev/
 */

const { generateUniqueId } = require('../utils');

/**
 * AITP Integration class for implementing the Agent Interaction & Transaction Protocol
 */
class AITPIntegration {
  /**
   * Create a new AITP Integration instance
   * @param {Object} config - Configuration options
   * @param {string} config.agentType - Type of agent ('personal' or 'service')
   * @param {string} config.transportType - Type of transport to use ('http', 'websocket', etc.)
   * @param {Array} config.supportedCapabilities - List of supported AITP capabilities
   */
  constructor(config = {}) {
    this.config = {
      agentType: config.agentType || 'personal',
      transportType: config.transportType || 'http',
      supportedCapabilities: config.supportedCapabilities || [
        'AITP-01', // Payments
        'AITP-03', // Data Request
        'AITP-04', // NEAR Wallet
      ],
      ...config,
    };
    
    this.threads = new Map();
    this.activeCapabilities = new Map();
    this.initialized = false;
  }
  
  /**
   * Initialize the AITP integration
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log(`Initializing AITP integration with ${this.config.transportType} transport`);
      
      // Initialize the transport
      await this.initializeTransport();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize AITP integration:', error);
      return false;
    }
  }
  
  /**
   * Initialize the transport mechanism
   * @private
   */
  async initializeTransport() {
    switch (this.config.transportType) {
      case 'http':
        // Initialize HTTP transport
        console.log('Initializing HTTP transport for AITP');
        break;
      case 'websocket':
        // Initialize WebSocket transport
        console.log('Initializing WebSocket transport for AITP');
        break;
      default:
        throw new Error(`Unsupported transport type: ${this.config.transportType}`);
    }
  }
  
  /**
   * Create a new thread for agent communication
   * @param {Object} options - Thread options
   * @param {string} options.title - Thread title
   * @param {Array} options.participants - List of participant IDs
   * @returns {Object} - Created thread
   */
  createThread(options = {}) {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    const threadId = generateUniqueId();
    const thread = {
      id: threadId,
      title: options.title || `Thread ${threadId}`,
      participants: options.participants || [],
      messages: [],
      metadata: options.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.threads.set(threadId, thread);
    console.log(`Created AITP thread: ${thread.title} (${threadId})`);
    
    return thread;
  }
  
  /**
   * Add a message to a thread
   * @param {string} threadId - Thread ID
   * @param {Object} message - Message to add
   * @returns {Object} - Added message
   */
  addMessage(threadId, message) {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    const thread = this.threads.get(threadId);
    if (!thread) {
      throw new Error(`Thread not found: ${threadId}`);
    }
    
    const formattedMessage = {
      id: generateUniqueId(),
      threadId,
      role: message.role || 'assistant',
      content: message.content,
      capabilities: message.capabilities || [],
      metadata: message.metadata || {},
      createdAt: new Date().toISOString(),
    };
    
    thread.messages.push(formattedMessage);
    thread.updatedAt = formattedMessage.createdAt;
    
    console.log(`Added message to thread ${threadId}`);
    
    // Process capabilities if present
    if (message.capabilities && message.capabilities.length > 0) {
      this.processCapabilities(threadId, formattedMessage);
    }
    
    return formattedMessage;
  }
  
  /**
   * Process capabilities in a message
   * @param {string} threadId - Thread ID
   * @param {Object} message - Message containing capabilities
   * @private
   */
  processCapabilities(threadId, message) {
    message.capabilities.forEach(capability => {
      const capabilityId = capability.id || capability.type;
      console.log(`Processing capability: ${capabilityId}`);
      
      // Store the active capability for the thread
      this.activeCapabilities.set(`${threadId}:${capabilityId}`, {
        threadId,
        messageId: message.id,
        capability,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    });
  }
  
  /**
   * Get a thread by ID
   * @param {string} threadId - Thread ID
   * @returns {Object} - Thread
   */
  getThread(threadId) {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    const thread = this.threads.get(threadId);
    if (!thread) {
      throw new Error(`Thread not found: ${threadId}`);
    }
    
    return thread;
  }
  
  /**
   * Get all threads
   * @returns {Array} - List of threads
   */
  getAllThreads() {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    return Array.from(this.threads.values());
  }
  
  /**
   * Create a payment capability request
   * @param {Object} paymentRequest - Payment request details
   * @returns {Object} - Payment capability
   */
  createPaymentCapability(paymentRequest) {
    return {
      type: 'AITP-01',
      version: '0.1.0',
      action: 'request',
      data: {
        amount: paymentRequest.amount,
        currency: paymentRequest.currency || 'NEAR',
        recipient: paymentRequest.recipient,
        description: paymentRequest.description,
        metadata: paymentRequest.metadata || {},
      },
    };
  }
  
  /**
   * Create a data request capability
   * @param {Object} dataRequest - Data request details
   * @returns {Object} - Data request capability
   */
  createDataRequestCapability(dataRequest) {
    return {
      type: 'AITP-03',
      version: '0.1.0',
      action: 'request',
      data: {
        fields: dataRequest.fields,
        required: dataRequest.required || [],
        description: dataRequest.description,
        purpose: dataRequest.purpose,
        metadata: dataRequest.metadata || {},
      },
    };
  }
  
  /**
   * Create a NEAR wallet capability request
   * @param {Object} walletRequest - Wallet request details
   * @returns {Object} - NEAR wallet capability
   */
  createNEARWalletCapability(walletRequest) {
    return {
      type: 'AITP-04',
      version: '0.1.0',
      action: 'request',
      data: {
        operation: walletRequest.operation,
        contract: walletRequest.contract,
        method: walletRequest.method,
        args: walletRequest.args || {},
        deposit: walletRequest.deposit || '0',
        gas: walletRequest.gas || '30000000000000',
        metadata: walletRequest.metadata || {},
      },
    };
  }
  
  /**
   * Create an EVM wallet capability request
   * @param {Object} walletRequest - Wallet request details
   * @returns {Object} - EVM wallet capability
   */
  createEVMWalletCapability(walletRequest) {
    return {
      type: 'AITP-05',
      version: '0.1.0',
      action: 'request',
      data: {
        operation: walletRequest.operation,
        to: walletRequest.to,
        value: walletRequest.value || '0',
        data: walletRequest.data || '0x',
        chainId: walletRequest.chainId,
        metadata: walletRequest.metadata || {},
      },
    };
  }
  
  /**
   * Create a decision capability request
   * @param {Object} decisionRequest - Decision request details
   * @returns {Object} - Decision capability
   */
  createDecisionCapability(decisionRequest) {
    return {
      type: 'AITP-02',
      version: '0.1.0',
      action: 'request',
      data: {
        question: decisionRequest.question,
        options: decisionRequest.options,
        multiSelect: decisionRequest.multiSelect || false,
        metadata: decisionRequest.metadata || {},
      },
    };
  }
  
  /**
   * Respond to a capability request
   * @param {string} threadId - Thread ID
   * @param {string} capabilityId - Capability ID
   * @param {Object} response - Response data
   * @returns {Object} - Response message
   */
  respondToCapability(threadId, capabilityId, response) {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    const capabilityKey = `${threadId}:${capabilityId}`;
    const activeCapability = this.activeCapabilities.get(capabilityKey);
    
    if (!activeCapability) {
      throw new Error(`No active capability found: ${capabilityKey}`);
    }
    
    const responseCapability = {
      type: activeCapability.capability.type,
      version: activeCapability.capability.version,
      action: 'response',
      data: response,
      requestId: activeCapability.capability.id || activeCapability.messageId,
    };
    
    // Update the capability status
    activeCapability.status = 'responded';
    activeCapability.respondedAt = new Date().toISOString();
    this.activeCapabilities.set(capabilityKey, activeCapability);
    
    // Add the response message to the thread
    return this.addMessage(threadId, {
      role: 'user',
      content: `Responded to ${capabilityId} capability`,
      capabilities: [responseCapability],
    });
  }
  
  /**
   * Connect to a service agent
   * @param {string} serviceAgentId - Service agent ID
   * @param {Object} options - Connection options
   * @returns {Promise<Object>} - Created thread
   */
  async connectToServiceAgent(serviceAgentId, options = {}) {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    if (this.config.agentType !== 'personal') {
      throw new Error('Only personal agents can connect to service agents');
    }
    
    console.log(`Connecting to service agent: ${serviceAgentId}`);
    
    // Create a new thread for the connection
    const thread = this.createThread({
      title: options.title || `Conversation with ${serviceAgentId}`,
      participants: [serviceAgentId],
      metadata: {
        serviceAgentId,
        ...options.metadata,
      },
    });
    
    // Add initial message
    this.addMessage(thread.id, {
      role: 'user',
      content: options.initialMessage || 'Hello, I would like to connect with your service.',
    });
    
    return thread;
  }
  
  /**
   * Register as a service agent
   * @param {Object} serviceInfo - Service agent information
   * @returns {Promise<Object>} - Registration result
   */
  async registerAsServiceAgent(serviceInfo) {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    if (this.config.agentType !== 'service') {
      throw new Error('Only service agents can register');
    }
    
    console.log(`Registering as service agent: ${serviceInfo.name}`);
    
    // In a real implementation, this would register with a discovery service
    const registration = {
      id: generateUniqueId(),
      name: serviceInfo.name,
      description: serviceInfo.description,
      capabilities: this.config.supportedCapabilities,
      endpoint: serviceInfo.endpoint,
      metadata: serviceInfo.metadata || {},
      registeredAt: new Date().toISOString(),
    };
    
    return registration;
  }
  
  /**
   * Find service agents
   * @param {Object} query - Search query
   * @returns {Promise<Array>} - List of matching service agents
   */
  async findServiceAgents(query) {
    if (!this.initialized) {
      throw new Error('AITP integration not initialized');
    }
    
    console.log(`Finding service agents matching: ${JSON.stringify(query)}`);
    
    // In a real implementation, this would query a discovery service
    // For now, return mock data
    return [
      {
        id: 'flight-booking-agent',
        name: 'Flight Booking Agent',
        description: 'An agent that helps book flights',
        capabilities: ['AITP-01', 'AITP-03'],
      },
      {
        id: 'hotel-booking-agent',
        name: 'Hotel Booking Agent',
        description: 'An agent that helps book hotels',
        capabilities: ['AITP-01', 'AITP-03'],
      },
      {
        id: 'near-wallet-agent',
        name: 'NEAR Wallet Agent',
        description: 'An agent that helps manage NEAR wallets',
        capabilities: ['AITP-04'],
      },
    ].filter(agent => {
      // Simple filtering based on the query
      if (query.name && !agent.name.toLowerCase().includes(query.name.toLowerCase())) {
        return false;
      }
      if (query.capabilities) {
        const requiredCapabilities = Array.isArray(query.capabilities) 
          ? query.capabilities 
          : [query.capabilities];
        
        return requiredCapabilities.every(cap => agent.capabilities.includes(cap));
      }
      return true;
    });
  }
  
  /**
   * Get the status of the AITP integration
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      agentType: this.config.agentType,
      transportType: this.config.transportType,
      supportedCapabilities: this.config.supportedCapabilities,
      threadCount: this.threads.size,
      activeCapabilitiesCount: this.activeCapabilities.size,
    };
  }
}

module.exports = AITPIntegration; 