/**
 * Intellex Framework Core
 * 
 * This module serves as the entry point for the Intellex framework,
 * providing the core functionality for creating and managing AI agents
 * with reputation tracking, cross-chain interoperability, and intent-based
 * interactions.
 * 
 * @module intellex/core
 */

const AgentManager = require('./agent-manager');
const ReputationSystem = require('./reputation-system');
const IntentProcessor = require('./intent-processor');
const CrossChainBridge = require('./cross-chain-bridge');
const NearIntegration = require('./near-integration');

/**
 * Initialize the Intellex framework with the provided configuration
 * 
 * @param {Object} config - Configuration options for the framework
 * @param {string} config.nearNetwork - NEAR network to connect to ('mainnet', 'testnet')
 * @param {boolean} config.enableReputation - Whether to enable the reputation system
 * @param {Array<string>} config.crossChainSupport - List of blockchains to support for cross-chain operations
 * @returns {Object} - The initialized framework instance
 */
function init(config = {}) {
  const defaultConfig = {
    nearNetwork: 'testnet',
    enableReputation: true,
    crossChainSupport: ['ethereum'],
    intentProcessing: true,
  };

  const mergedConfig = { ...defaultConfig, ...config };
  
  // Initialize core components
  const agentManager = new AgentManager(mergedConfig);
  const reputationSystem = mergedConfig.enableReputation ? new ReputationSystem(mergedConfig) : null;
  const intentProcessor = mergedConfig.intentProcessing ? new IntentProcessor(mergedConfig) : null;
  const crossChainBridge = new CrossChainBridge(mergedConfig.crossChainSupport);
  const nearIntegration = new NearIntegration(mergedConfig.nearNetwork);

  return {
    /**
     * Create a new AI agent with the specified configuration
     * 
     * @param {Object} agentConfig - Configuration for the new agent
     * @returns {Object} - The created agent instance
     */
    createAgent: (agentConfig) => agentManager.createAgent(agentConfig),
    
    /**
     * Get the reputation system instance
     * 
     * @returns {Object} - The reputation system instance
     */
    getReputationSystem: () => reputationSystem,
    
    /**
     * Get the intent processor instance
     * 
     * @returns {Object} - The intent processor instance
     */
    getIntentProcessor: () => intentProcessor,
    
    /**
     * Get the cross-chain bridge instance
     * 
     * @returns {Object} - The cross-chain bridge instance
     */
    getCrossChainBridge: () => crossChainBridge,
    
    /**
     * Get the NEAR integration instance
     * 
     * @returns {Object} - The NEAR integration instance
     */
    getNearIntegration: () => nearIntegration,
    
    /**
     * Framework configuration
     */
    config: mergedConfig,
  };
}

module.exports = {
  init,
  AgentManager,
  ReputationSystem,
  IntentProcessor,
  CrossChainBridge,
  NearIntegration,
}; 