/**
 * Intent Processor Module
 * 
 * This module is responsible for processing natural language intents from users
 * and converting them into structured actions that can be executed by agents
 * within the Intellex framework. It integrates with NEAR's Intent system for
 * blockchain operations.
 * 
 * @module intellex/core/intent-processor
 */

const NearIntentsIntegration = require('../intents_integration');

/**
 * Class representing the Intent Processor
 */
class IntentProcessor {
  /**
   * Create an Intent Processor instance
   * 
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.intentHandlers = new Map();
    this.defaultConfidenceThreshold = config.confidenceThreshold || 0.7;
    
    // Initialize NEAR Intents integration
    this.nearIntents = new NearIntentsIntegration(config);
    
    // Register built-in intent handlers
    this._registerBuiltInHandlers();
  }

  /**
   * Register built-in intent handlers
   * 
   * @private
   */
  _registerBuiltInHandlers() {
    // Register some default intent handlers
    this.registerIntentHandler('query', this._handleQueryIntent.bind(this));
    this.registerIntentHandler('action', this._handleActionIntent.bind(this));
    this.registerIntentHandler('create', this._handleCreateIntent.bind(this));
    
    // Register blockchain-specific intent handlers
    this.registerIntentHandler('transfer', this._handleTransferIntent.bind(this));
    this.registerIntentHandler('call_contract', this._handleCallContractIntent.bind(this));
    this.registerIntentHandler('deploy_contract', this._handleDeployContractIntent.bind(this));
    this.registerIntentHandler('stake', this._handleStakeIntent.bind(this));
    this.registerIntentHandler('create_account', this._handleCreateAccountIntent.bind(this));
  }

  /**
   * Handle query intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Object} - The result of handling the intent
   * @private
   */
  _handleQueryIntent(intent) {
    return {
      type: 'query',
      response: `Processed query intent: ${intent.text}`,
      confidence: intent.confidence,
    };
  }

  /**
   * Handle action intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Object} - The result of handling the intent
   * @private
   */
  _handleActionIntent(intent) {
    return {
      type: 'action',
      response: `Processed action intent: ${intent.text}`,
      actionToTake: intent.action || 'default_action',
      confidence: intent.confidence,
    };
  }

  /**
   * Handle create intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Object} - The result of handling the intent
   * @private
   */
  _handleCreateIntent(intent) {
    return {
      type: 'create',
      response: `Processed create intent: ${intent.text}`,
      entityToCreate: intent.entity || 'default_entity',
      confidence: intent.confidence,
    };
  }

  /**
   * Handle transfer intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Promise<Object>} - The result of handling the intent
   * @private
   */
  async _handleTransferIntent(intent) {
    // Extract transfer details from the intent
    const { sender, receiver, amount } = this._extractTransferDetails(intent);
    
    if (!sender || !receiver || !amount) {
      return {
        type: 'transfer',
        success: false,
        error: 'Missing transfer details',
        confidence: intent.confidence,
      };
    }
    
    try {
      // Create a NEAR transfer intent
      const nearIntent = this.nearIntents.createIntent('transfer', {
        receiver,
        amount,
      }, { sender });
      
      return {
        type: 'transfer',
        success: true,
        nearIntent,
        response: `Created transfer intent: ${amount} NEAR from ${sender} to ${receiver}`,
        confidence: intent.confidence,
      };
    } catch (error) {
      return {
        type: 'transfer',
        success: false,
        error: error.message,
        confidence: intent.confidence,
      };
    }
  }

  /**
   * Extract transfer details from an intent
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Object} - The extracted transfer details
   * @private
   */
  _extractTransferDetails(intent) {
    // In a real implementation, this would use NLP to extract details
    // For now, we'll use a simple approach
    
    const text = intent.text.toLowerCase();
    let sender = null;
    let receiver = null;
    let amount = null;
    
    // Try to extract sender
    const senderMatch = text.match(/from\s+([a-z0-9._-]+)/i);
    if (senderMatch && senderMatch[1]) {
      sender = senderMatch[1];
    }
    
    // Try to extract receiver
    const receiverMatch = text.match(/to\s+([a-z0-9._-]+)/i);
    if (receiverMatch && receiverMatch[1]) {
      receiver = receiverMatch[1];
    }
    
    // Try to extract amount
    const amountMatch = text.match(/([0-9.]+)\s+near/i);
    if (amountMatch && amountMatch[1]) {
      amount = amountMatch[1];
    }
    
    return { sender, receiver, amount };
  }

  /**
   * Handle call contract intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Promise<Object>} - The result of handling the intent
   * @private
   */
  async _handleCallContractIntent(intent) {
    // Extract contract call details from the intent
    const { sender, contractId, methodName, args } = this._extractContractCallDetails(intent);
    
    if (!sender || !contractId || !methodName) {
      return {
        type: 'call_contract',
        success: false,
        error: 'Missing contract call details',
        confidence: intent.confidence,
      };
    }
    
    try {
      // Create a NEAR call intent
      const nearIntent = this.nearIntents.createIntent('call', {
        contractId,
        methodName,
        args: args || {},
      }, { sender });
      
      return {
        type: 'call_contract',
        success: true,
        nearIntent,
        response: `Created contract call intent: ${sender} calling ${methodName} on ${contractId}`,
        confidence: intent.confidence,
      };
    } catch (error) {
      return {
        type: 'call_contract',
        success: false,
        error: error.message,
        confidence: intent.confidence,
      };
    }
  }

  /**
   * Extract contract call details from an intent
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Object} - The extracted contract call details
   * @private
   */
  _extractContractCallDetails(intent) {
    // In a real implementation, this would use NLP to extract details
    // For now, we'll use a simple approach
    
    const text = intent.text.toLowerCase();
    let sender = null;
    let contractId = null;
    let methodName = null;
    let args = {};
    
    // Try to extract sender
    const senderMatch = text.match(/([a-z0-9._-]+)\s+calls?/i);
    if (senderMatch && senderMatch[1]) {
      sender = senderMatch[1];
    }
    
    // Try to extract contract ID
    const contractMatch = text.match(/contract\s+([a-z0-9._-]+)/i);
    if (contractMatch && contractMatch[1]) {
      contractId = contractMatch[1];
    }
    
    // Try to extract method name
    const methodMatch = text.match(/method\s+([a-z0-9_]+)/i);
    if (methodMatch && methodMatch[1]) {
      methodName = methodMatch[1];
    }
    
    // In a real implementation, we would extract args from the text
    // For now, we'll just return an empty object
    
    return { sender, contractId, methodName, args };
  }

  /**
   * Handle deploy contract intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Promise<Object>} - The result of handling the intent
   * @private
   */
  async _handleDeployContractIntent(intent) {
    // In a real implementation, this would handle contract deployment
    return {
      type: 'deploy_contract',
      success: false,
      error: 'Contract deployment not implemented in this version',
      confidence: intent.confidence,
    };
  }

  /**
   * Handle stake intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Promise<Object>} - The result of handling the intent
   * @private
   */
  async _handleStakeIntent(intent) {
    // In a real implementation, this would handle staking
    return {
      type: 'stake',
      success: false,
      error: 'Staking not implemented in this version',
      confidence: intent.confidence,
    };
  }

  /**
   * Handle create account intents
   * 
   * @param {Object} intent - The parsed intent
   * @returns {Promise<Object>} - The result of handling the intent
   * @private
   */
  async _handleCreateAccountIntent(intent) {
    // In a real implementation, this would handle account creation
    return {
      type: 'create_account',
      success: false,
      error: 'Account creation not implemented in this version',
      confidence: intent.confidence,
    };
  }

  /**
   * Register a custom intent handler
   * 
   * @param {string} intentType - Type of intent to handle
   * @param {Function} handler - Handler function for the intent
   * @returns {boolean} - Whether the registration was successful
   */
  registerIntentHandler(intentType, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Intent handler must be a function');
    }
    
    this.intentHandlers.set(intentType, handler);
    return true;
  }

  /**
   * Parse natural language text into an intent
   * 
   * @param {string} text - Natural language text to parse
   * @returns {Promise<Object>} - Parsed intent object
   */
  async parseIntent(text) {
    // In a real implementation, this would use NLP to parse the intent
    // For now, we'll use a simple rule-based approach
    
    const lowerText = text.toLowerCase();
    
    let intentType = 'unknown';
    let confidence = 0.5;
    let action = null;
    let entity = null;
    
    // Check for blockchain-specific intents first
    if (lowerText.includes('transfer') || lowerText.includes('send') || lowerText.includes('near to')) {
      intentType = 'transfer';
      confidence = 0.85;
    } else if (lowerText.includes('call contract') || lowerText.includes('execute method')) {
      intentType = 'call_contract';
      confidence = 0.85;
    } else if (lowerText.includes('deploy contract')) {
      intentType = 'deploy_contract';
      confidence = 0.85;
    } else if (lowerText.includes('stake') || lowerText.includes('validator')) {
      intentType = 'stake';
      confidence = 0.85;
    } else if (lowerText.includes('create account')) {
      intentType = 'create_account';
      confidence = 0.85;
    }
    // Then check for general intents
    else if (lowerText.includes('what') || lowerText.includes('who') || lowerText.includes('when') || lowerText.includes('where')) {
      intentType = 'query';
      confidence = 0.8;
    } else if (lowerText.includes('create') || lowerText.includes('make') || lowerText.includes('build')) {
      intentType = 'create';
      confidence = 0.85;
      
      // Extract entity to create
      const entityMatches = lowerText.match(/create (?:a|an) ([a-z]+)/i);
      if (entityMatches && entityMatches[1]) {
        entity = entityMatches[1];
      }
    } else if (lowerText.includes('do') || lowerText.includes('execute') || lowerText.includes('run') || lowerText.includes('perform')) {
      intentType = 'action';
      confidence = 0.75;
      
      // Extract action to take
      const actionMatches = lowerText.match(/(?:do|execute|run|perform) ([a-z]+)/i);
      if (actionMatches && actionMatches[1]) {
        action = actionMatches[1];
      }
    }
    
    return {
      text,
      intentType,
      confidence,
      action,
      entity,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Process natural language text and execute the corresponding intent
   * 
   * @param {string} text - Natural language text to process
   * @param {number} confidenceThreshold - Minimum confidence threshold (default: system default)
   * @returns {Promise<Object>} - Result of processing the intent
   */
  async processText(text, confidenceThreshold = this.defaultConfidenceThreshold) {
    const intent = await this.parseIntent(text);
    
    if (intent.confidence < confidenceThreshold) {
      return {
        success: false,
        error: 'Low confidence in intent parsing',
        intent,
      };
    }
    
    const handler = this.intentHandlers.get(intent.intentType);
    
    if (!handler) {
      return {
        success: false,
        error: `No handler registered for intent type: ${intent.intentType}`,
        intent,
      };
    }
    
    try {
      const result = await handler(intent);
      
      return {
        success: true,
        result,
        intent,
      };
    } catch (error) {
      return {
        success: false,
        error: `Error handling intent: ${error.message}`,
        intent,
      };
    }
  }

  /**
   * Execute a NEAR intent directly
   * 
   * @param {Object} nearIntent - NEAR intent to execute
   * @param {Object} keyPair - Key pair to sign with
   * @returns {Promise<Object>} - Result of executing the intent
   */
  async executeNearIntent(nearIntent, keyPair) {
    if (!nearIntent || !nearIntent.type || !nearIntent.params) {
      throw new Error('Invalid NEAR intent');
    }
    
    if (!keyPair) {
      throw new Error('Key pair is required to sign the intent');
    }
    
    try {
      const signedIntent = await this.nearIntents.signIntent(
        nearIntent,
        nearIntent.sender,
        keyPair
      );
      
      return this.nearIntents.executeIntent(signedIntent);
    } catch (error) {
      throw new Error(`Error executing NEAR intent: ${error.message}`);
    }
  }
}

module.exports = IntentProcessor; 