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
const NearAIDiscovery = require('./core/near-ai-discovery');

// Interfaces
const AgentInterface = require('./core/agent-interface');
const CommunicationInterface = require('./core/communication-interface');

// Import integration modules
const NearIntentsIntegration = require('./intents_integration');
const OmniBridgeIntegration = require('./omnibridge_integration');
const NearAIIntegration = require('./core/near-ai-integration');
const AITPIntegration = require('./core/aitp-integration');
const CrewAIIntegration = require('./core/crewai-integration');
const ActivatorsManagementIntegration = require('./core/activators-management-integration');
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
 * Initialize the framework
 * @param {Object} options - Framework initialization options
 * @returns {Object} - Initialized framework instance
 */
function init(options = {}) {
  // Initialize framework configuration
  const config = {
    ...DEFAULT_CONFIG,
    ...options
  };
  
  // Initialize storage
  const storage = initStorage(config.storage);
  
  // Initialize integrations
  const integrations = new Map();
  
  // Initialize agent registry
  const agents = {};
  
  // Initialize discovery systems
  const discovery = {};
  
  // Initialize NEAR AI integration if enabled
  if (config.enableNearAI) {
    const NearAIIntegration = require('./core/near-ai-integration');
    const nearAIOptions = {
      apiKey: config.nearAIApiKey,
      environment: config.nearNetwork || 'development',
      privateMode: config.privateMode || false
    };
    
    const nearAIIntegration = new NearAIIntegration(nearAIOptions);
    integrations.set('nearai', nearAIIntegration);
    
    // Initialize immediately if auto-initialize is enabled
    if (config.autoInitialize) {
      nearAIIntegration.initialize();
    }
    
    // Initialize NEAR AI Discovery if enabled
    if (config.enableAgentDiscovery) {
      const NearAIDiscovery = require('./core/near-ai-discovery');
      const nearAIDiscoveryOptions = {
        apiKey: config.nearAIDiscoveryApiKey || config.nearAIApiKey,
        environment: config.nearNetwork || 'development',
        enableGlobalDiscovery: config.enableGlobalDiscovery !== false,
        privateMode: config.privateMode || false,
        reputationConfig: config.reputationConfig || {
          initialScore: 0.7,
          weightPerformance: 0.6,
          weightFeedback: 0.3,
          weightHistory: 0.1
        }
      };
      
      const nearAIDiscovery = new NearAIDiscovery(nearAIDiscoveryOptions);
      discovery.nearAI = nearAIDiscovery;
      
      // Initialize immediately if auto-initialize is enabled
      if (config.autoInitialize) {
        nearAIDiscovery.initialize();
      }
    }
  }

  // Initialize CrewAI integration if enabled
  if (config.enableCrewAI) {
    const CrewAIIntegration = require('./core/crewai-integration');
    const crewAIOptions = {
      apiKey: config.crewAIApiKey,
      defaultLLM: config.crewAIDefaultLLM
    };
    
    const crewAIIntegration = new CrewAIIntegration(crewAIOptions);
    integrations.set('crewai', crewAIIntegration);
    
    // Initialize immediately if auto-initialize is enabled
    if (config.autoInitialize) {
      crewAIIntegration.initialize();
    }
  }
  
  // Initialize communication adapter
  const CommunicationAdapter = require('./adapters/communication-adapter');
  const communicationAdapter = new CommunicationAdapter({
    storageAdapter: storage
  });
  
  // Create framework instance
  const framework = {
    config,
    storage,
    integrations,
    agents,
    discovery,
    communicationAdapter,
    
    // Core module instances
    _agentManager: null,
    _reputationSystem: null,
    _intentProcessor: null,
    _crossChainBridge: null,
    _nearIntegration: null,
    _nearAIIntegration: null,
    _aitpIntegration: null,
    _crewAIIntegration: null,
    _activatorsManagement: null,
    _agentRegistry: null,
    _nearAIDiscovery: null,
    
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
    
    // Get the Activators Management Platform integration
    getActivatorsManagement() {
      if (!this._activatorsManagement) {
        this._activatorsManagement = new ActivatorsManagementIntegration({
          apiKey: this.config.activatorsApiKey,
          platformUrl: this.config.activatorsPlatformUrl,
          region: this.config.activatorsRegion,
          resourceLimits: this.config.activatorsResourceLimits,
          securitySettings: this.config.activatorsSecuritySettings,
          stakingAmount: this.config.activatorsStakingAmount,
        });
      }
      return this._activatorsManagement;
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
    
    // Get the Near AI Discovery integration
    getNearAIDiscovery() {
      if (!this._nearAIDiscovery) {
        this._nearAIDiscovery = new NearAIDiscovery({
          apiKey: this.config.nearAIDiscoveryApiKey,
          environment: this.config.environment,
          enableGlobalDiscovery: this.config.enableAgentDiscovery
        });
      }
      return this._nearAIDiscovery;
    },
    
    // Get the agent registry
    getAgentRegistry() {
      if (!this._agentRegistry) {
        // Initialize reputation system first if enabled
        let reputationSystem = null;
        if (this.config.enableReputation) {
          reputationSystem = this.getReputationSystem();
        }
        
        // Initialize Near AI Discovery if enabled
        let nearAIDiscovery = null;
        if (this.config.enableAgentDiscovery) {
          nearAIDiscovery = this.getNearAIDiscovery();
        }
        
        this._agentRegistry = new AgentRegistry({
          reputationSystem,
          nearAIDiscovery
        });
        
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
    
    // Create and deploy an activator
    async createActivator(activatorConfig, deploymentOptions = {}) {
      if (!this._activatorsManagement) {
        this.getActivatorsManagement(); // Initialize the Activators Management Platform integration
      }
      
      return this._activatorsManagement.createActivator(activatorConfig, deploymentOptions);
    },
    
    // List all activators
    async listActivators(filters = {}) {
      if (!this._activatorsManagement) {
        this.getActivatorsManagement(); // Initialize the Activators Management Platform integration
      }
      
      return this._activatorsManagement.listActivators(filters);
    },
    
    // Connect an agent to an activator
    async connectAgentToActivator(agentId, activatorId, options = {}) {
      if (!this._activatorsManagement) {
        this.getActivatorsManagement(); // Initialize the Activators Management Platform integration
      }
      
      if (!this._agentRegistry) {
        this.getAgentRegistry(); // Initialize the agent registry
      }
      
      const agent = await this._agentRegistry.getAgent(agentId);
      if (!agent) {
        throw new Error(`Agent with ID ${agentId} not found`);
      }
      
      return this._activatorsManagement.connectActivatorToAgent(activatorId, agentId, options);
    },
    
    /**
     * Discover agents based on capability requirements
     * @param {Object} query - Query parameters
     * @param {Array} query.capabilities - Required capabilities
     * @param {number} query.minReputationScore - Minimum reputation score
     * @param {Object} query.filters - Additional filters
     * @param {number} query.limit - Maximum number of agents to return
     * @returns {Promise<Array>} - List of matching agents
     */
    async discoverAgents(query = {}) {
      const discovery = this.getNearAIDiscovery();
      if (!discovery) {
        console.warn('Agent discovery is not enabled');
        return [];
      }
      
      return await discovery.discoverAgents(query);
    },
    
    /**
     * Register agent capabilities in the framework's discovery system
     * @param {string} agentId - ID of the agent
     * @param {Array} capabilities - List of capabilities the agent has
     * @param {Object} metadata - Additional metadata for the agent
     * @returns {Promise<boolean>} - Whether registration was successful
     */
    async registerAgentCapabilities(agentId, capabilities, metadata = {}) {
      const discovery = this.getNearAIDiscovery();
      if (!discovery) {
        console.warn('Agent discovery is not enabled, capabilities not registered');
        return false;
      }
      
      // Register agent capabilities in the discovery system
      return await discovery.publishAgentCapabilities(agentId, {
        capabilities,
        metadata
      });
    },
    
    /**
     * Get capabilities for a specific agent
     * @param {string} agentId - ID of the agent
     * @returns {Promise<Object>} - Agent capabilities and metadata
     */
    async getAgentCapabilities(agentId) {
      const discovery = this.getNearAIDiscovery();
      if (!discovery) {
        console.warn('Agent discovery is not enabled');
        return { capabilities: [], metadata: {} };
      }
      
      return await discovery.getAgentCapabilities(agentId);
    },
    
    /**
     * Get historical behavior for a specific agent
     * @param {string} agentId - ID of the agent
     * @returns {Promise<Object>} - Agent history and reputation
     */
    async getAgentHistory(agentId) {
      const discovery = this.getNearAIDiscovery();
      if (!discovery) {
        console.warn('Agent discovery is not enabled');
        return { tasks: [], interactions: [], reputationScore: 0 };
      }
      
      return await discovery.getAgentHistory(agentId);
    },
    
    /**
     * Record a task execution for tracking agent behavior
     * @param {string} agentId - ID of the agent
     * @param {Object} taskData - Task execution data
     * @returns {Promise<boolean>} - Whether recording was successful
     */
    async recordAgentTask(agentId, taskData) {
      const discovery = this.getNearAIDiscovery();
      if (!discovery) {
        console.warn('Agent discovery is not enabled, task not recorded');
        return false;
      }
      
      return await discovery.recordAgentTask(agentId, taskData);
    },
    
    /**
     * Verify an agent to establish credibility
     * @param {string} agentId - ID of the agent
     * @param {Object} verificationData - Verification data
     * @returns {Promise<boolean>} - Whether verification was successful
     */
    async verifyAgent(agentId, verificationData = {}) {
      const discovery = this.getNearAIDiscovery();
      if (!discovery) {
        console.warn('Agent discovery is not enabled, cannot verify agent');
        return false;
      }
      
      return await discovery.verifyAgent(agentId, verificationData);
    },

    /**
     * Connect two agents for collaboration
     * @param {string} agentId1 - ID of the first agent
     * @param {string} agentId2 - ID of the second agent
     * @param {Object} options - Connection options
     * @returns {Promise<Object>} - Connection details
     */
    async connectAgents(agentId1, agentId2, options = {}) {
      const discovery = this.getNearAIDiscovery();
      if (!discovery) {
        console.warn('Agent discovery is not enabled, cannot connect agents');
        throw new Error('Agent discovery is not enabled');
      }
      
      return await discovery.connectAgents(agentId1, agentId2, options);
    },

    /**
     * Get the NEAR AI Integration instance
     * @returns {Object} - NEAR AI Integration instance
     */
    getNearAIIntegration() {
      return this.integrations.get('nearai') || null;
    },

    /**
     * Get the NEAR AI Discovery instance
     * @returns {Object} - NEAR AI Discovery instance
     */
    getNearAIDiscovery() {
      return this.discovery?.nearAI || null;
    },

    /**
     * Get the agent registry
     * @returns {Object} - Agent registry
     */
    getAgentRegistry() {
      return this.agents;
    },

    /**
     * Get the communication adapter
     * @returns {Object} - Communication adapter
     */
    getCommunicationAdapter() {
      return this.communicationAdapter;
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
  ActivatorsManagementIntegration,
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