/**
 * Intellex Framework
 * 
 * A powerful framework for building intelligent, cross-chain applications with
 * interoperability between agents on different platforms.
 * 
 * This framework provides a standardized way for agents on different platforms
 * (CrewAI, NEAR AI, SUI Blockchain, etc.) to communicate and interact with each other,
 * while maintaining all the features of the original framework such as reputation
 * tracking, token integration, and cross-chain capabilities.
 * 
 * @module intellex
 */

// Core modules
const AgentManager = require('./core/agent-manager');
const ReputationSystem = require('./core/reputation-system');
const IntentProcessor = require('./core/intent-processor');
const CrossChainBridge = require('./core/cross-chain-bridge');
const NearIntegration = require('./core/near-integration');
const CoreUtils = require('./core/index');
const AgentRegistry = require('./core/agent-registry');

// Interfaces
const AgentInterface = require('./core/agent-interface');
const CommunicationInterface = require('./core/communication-interface');

// Import integration modules
const NearIntentsIntegration = require('./intents_integration');
const OmniBridgeIntegration = require('./omnibridge_integration');
const NearAIIntegration = require('./core/near-ai-integration');
const AITPIntegration = require('./core/aitp-integration');
const CrewAIIntegration = require('./core/crewai-integration');
const reputationAnalytics = require('./reputation_analytics');

// Import adapters
const CrewAIAdapter = require('./adapters/crewai-adapter');
const NearAIAdapter = require('./adapters/near-ai-adapter');
const SUIBlockchainAdapter = require('./adapters/sui-blockchain-adapter');
const AITPCommunicationAdapter = require('./adapters/aitp-communication-adapter');

// Import components
const components = require('./components');

// Framework version
const VERSION = '0.2.0';

/**
 * Initialize the Intellex framework
 * @param {Object} config - Configuration options
 * @returns {Object} - Framework instance
 */
function init(config = {}) {
  const framework = {
    config: {
      nearNetwork: config.nearNetwork || 'testnet',
      enableReputation: config.enableReputation !== false,
      crossChainSupport: config.crossChainSupport || ['ethereum', 'near'],
      intentProcessing: config.intentProcessing !== false,
      ...config,
    },
    
    // Core module instances
    _agentManager: null,
    _reputationSystem: null,
    _intentProcessor: null,
    _crossChainBridge: null,
    _nearIntegration: null,
    _nearAIIntegration: null,
    _aitpIntegration: null,
    _crewAIIntegration: null,
    _agentRegistry: null,
    _communicationAdapter: null,
    
    // Adapters
    _adapters: {},
    
    // Get the agent manager
    getAgentManager() {
      if (!this._agentManager) {
        this._agentManager = new AgentManager(this.config);
      }
      return this._agentManager;
    },
    
    // Get the reputation system
    getReputationSystem() {
      if (!this._reputationSystem) {
        this._reputationSystem = new ReputationSystem(this.config);
      }
      return this._reputationSystem;
    },
    
    // Get the intent processor
    getIntentProcessor() {
      if (!this._intentProcessor) {
        this._intentProcessor = new IntentProcessor(this.config);
      }
      return this._intentProcessor;
    },
    
    // Get the cross-chain bridge
    getCrossChainBridge() {
      if (!this._crossChainBridge) {
        this._crossChainBridge = new CrossChainBridge(this.config);
      }
      return this._crossChainBridge;
    },
    
    // Get the NEAR integration
    getNearIntegration() {
      if (!this._nearIntegration) {
        this._nearIntegration = new NearIntegration(this.config);
      }
      return this._nearIntegration;
    },
    
    // Get the NEAR AI integration
    getNearAIIntegration() {
      if (!this._nearAIIntegration) {
        this._nearAIIntegration = new NearAIIntegration(this.config);
      }
      return this._nearAIIntegration;
    },
    
    // Get the AITP integration
    getAITPIntegration() {
      if (!this._aitpIntegration) {
        this._aitpIntegration = new AITPIntegration({
          agentType: this.config.agentType || 'personal',
          transportType: this.config.transportType || 'http',
          supportedCapabilities: this.config.supportedCapabilities,
        });
      }
      return this._aitpIntegration;
    },
    
    // Get the CrewAI integration
    getCrewAIIntegration(crewConfig = {}) {
      if (!this._crewAIIntegration) {
        // If AITP and NEAR AI integrations are not provided in the config,
        // use the framework's instances
        if (!crewConfig.aitpIntegration) {
          crewConfig.aitpIntegration = this.getAITPIntegration();
        }
        if (!crewConfig.nearAIIntegration) {
          crewConfig.nearAIIntegration = this.getNearAIIntegration();
        }
        
        this._crewAIIntegration = new CrewAIIntegration(crewConfig);
      }
      return this._crewAIIntegration;
    },
    
    // Get the communication adapter
    getCommunicationAdapter() {
      if (!this._communicationAdapter) {
        this._communicationAdapter = new AITPCommunicationAdapter({
          aitpIntegration: this.getAITPIntegration(),
        });
        this._communicationAdapter.initialize();
      }
      return this._communicationAdapter;
    },
    
    // Get the agent registry
    getAgentRegistry() {
      if (!this._agentRegistry) {
        this._agentRegistry = new AgentRegistry({
          reputationSystem: this.getReputationSystem(),
        });
        this._agentRegistry.initialize();
        
        // Register adapters if not already registered
        this._registerDefaultAdapters();
      }
      return this._agentRegistry;
    },
    
    // Register default adapters
    _registerDefaultAdapters() {
      // Create and register the CrewAI adapter if not already registered
      if (!this._adapters.crewai) {
        this._adapters.crewai = new CrewAIAdapter({
          crewAIIntegration: this.getCrewAIIntegration(),
          communicationAdapter: this.getCommunicationAdapter(),
        });
        this._agentRegistry.registerAdapter('crewai', this._adapters.crewai);
      }
      
      // Create and register the NEAR AI adapter if not already registered
      if (!this._adapters.nearai) {
        this._adapters.nearai = new NearAIAdapter({
          nearAIIntegration: this.getNearAIIntegration(),
          communicationAdapter: this.getCommunicationAdapter(),
        });
        this._agentRegistry.registerAdapter('nearai', this._adapters.nearai);
      }
      
      // Create and register the SUI Blockchain adapter if config is provided
      if (this.config.suiProvider && !this._adapters.sui) {
        this._adapters.sui = new SUIBlockchainAdapter({
          suiProvider: this.config.suiProvider,
          communicationAdapter: this.getCommunicationAdapter(),
          network: this.config.suiNetwork || 'testnet',
        });
        this._agentRegistry.registerAdapter('sui', this._adapters.sui);
      }
    },
    
    // Register a custom adapter
    registerAdapter(platformType, adapter) {
      if (!this._agentRegistry) {
        this.getAgentRegistry(); // Initialize the agent registry
      }
      
      this._adapters[platformType] = adapter;
      return this._agentRegistry.registerAdapter(platformType, adapter);
    },
    
    // Create an agent
    async createAgent(platformType, config) {
      if (!this._agentRegistry) {
        this.getAgentRegistry(); // Initialize the agent registry
      }
      
      return this._agentRegistry.createAgent(platformType, config);
    },
    
    // Run an agent
    async runAgent(agentId, task, options = {}) {
      if (!this._agentRegistry) {
        this.getAgentRegistry(); // Initialize the agent registry
      }
      
      return this._agentRegistry.runAgent(agentId, task, options);
    },
    
    // Connect agents
    async connectAgents(sourceAgentId, targetAgentId, options = {}) {
      if (!this._agentRegistry) {
        this.getAgentRegistry(); // Initialize the agent registry
      }
      
      return this._agentRegistry.connectAgents(sourceAgentId, targetAgentId, options);
    },
    
    // Get an agent
    async getAgent(agentId) {
      if (!this._agentRegistry) {
        this.getAgentRegistry(); // Initialize the agent registry
      }
      
      return this._agentRegistry.getAgent(agentId);
    },
    
    // Get all agents
    async getAllAgents(filters = {}) {
      if (!this._agentRegistry) {
        this.getAgentRegistry(); // Initialize the agent registry
      }
      
      return this._agentRegistry.getAllAgents(filters);
    },
  };
  
  return framework;
}

/**
 * Get the framework version
 * @returns {string} - Framework version
 */
function getVersion() {
  return VERSION;
}

module.exports = {
  // Core functionality
  init,
  getVersion,
  
  // Utility functions
  ...CoreUtils,
  
  // Integration modules
  NearIntentsIntegration,
  OmniBridgeIntegration,
  NearAIIntegration,
  AITPIntegration,
  CrewAIIntegration,
  reputationAnalytics,
  
  // Interfaces
  AgentInterface,
  CommunicationInterface,
  
  // Adapters
  CrewAIAdapter,
  NearAIAdapter,
  SUIBlockchainAdapter,
  AITPCommunicationAdapter,
  
  // Core modules
  AgentRegistry,
  
  // UI Components
  components,
}; 