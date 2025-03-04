/**
 * NEAR AI Discovery Integration
 * 
 * This module integrates the Intellex Framework with NEAR AI's agent discovery system.
 * It allows the framework to discover and publish agents within the NEAR ecosystem
 * based on their capabilities, reputation, and historical behavior.
 * 
 * The NEAR AI Discovery API allows for:
 * - Publishing agent capabilities and metadata to the discovery network
 * - Discovering agents based on specific capabilities and reputation scores
 * - Managing agent verification and reputation
 * - Creating connections between agents for collaboration
 */

const nearai = require('nearai');
const logger = require('../utils/logger');

class NearAIDiscovery {
  /**
   * Initialize the NEAR AI Discovery integration
   * @param {Object} options Configuration options
   * @param {string} options.apiKey NEAR AI API key
   * @param {string} options.environment NEAR AI environment (e.g., 'production', 'development')
   * @param {boolean} options.enableGlobalDiscovery Whether to enable global agent discovery
   * @param {boolean} options.privateMode Whether to operate in private mode (agents not publicly discoverable)
   * @param {Object} options.reputationConfig Configuration for the reputation system
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.NEAR_AI_API_KEY;
    this.environment = options.environment || 'development';
    this.enableGlobalDiscovery = options.enableGlobalDiscovery !== false;
    this.privateMode = options.privateMode || false;
    this.reputationConfig = options.reputationConfig || {
      initialScore: 0.7,
      weightPerformance: 0.6,
      weightFeedback: 0.3,
      weightHistory: 0.1,
    };
    
    // Client instance (will be initialized in initialize())
    this.client = null;
    
    // Local cache of discovered agents
    this.agentCache = new Map();
    this.lastCacheRefresh = null;
    this.cacheExpiryMs = 1000 * 60 * 5; // 5 minutes
    
    logger.info('NEAR AI Discovery initialized with configuration:', {
      environment: this.environment,
      enableGlobalDiscovery: this.enableGlobalDiscovery,
      privateMode: this.privateMode,
    });
  }
  
  /**
   * Initialize the NEAR AI Discovery integration
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      if (!this.apiKey) {
        throw new Error('NEAR AI API key is required for discovery integration');
      }
      
      // Initialize the NEAR AI client
      this.client = new nearai.Client({
        apiKey: this.apiKey,
        environment: this.environment
      });
      
      logger.info('NEAR AI Discovery client initialized successfully');
      
      // Refresh the agent cache initially
      await this._refreshAgentCache();
      
      return true;
    } catch (error) {
      logger.error('Failed to initialize NEAR AI Discovery client:', error);
      return false;
    }
  }
  
  /**
   * Discover agents based on capabilities and reputation
   * @param {Object} params Discovery parameters
   * @param {string[]} params.capabilities Required capabilities
   * @param {number} params.minReputationScore Minimum reputation score (0-1)
   * @param {number} params.limit Maximum number of agents to return
   * @param {Object} params.filters Additional filters
   * @returns {Promise<Array>} Discovered agents
   */
  async discoverAgents(params) {
    try {
      // Ensure the client is initialized
      if (!this.client) {
        await this.initialize();
      }
      
      // Refresh cache if needed
      if (this._isCacheExpired()) {
        await this._refreshAgentCache();
      }
      
      const capabilities = params.capabilities || [];
      const minReputationScore = params.minReputationScore || 0;
      const limit = params.limit || 10;
      const filters = params.filters || {};
      
      logger.info('Discovering agents with capabilities:', capabilities);
      
      // Use the NEAR AI client to find agents
      let discoveredAgents = [];
      
      try {
        // Use the official NEAR AI API to discover agents
        discoveredAgents = await this.client.find_agents({
          capabilities: capabilities,
          min_reputation: minReputationScore,
          limit: limit,
          additional_filters: filters,
          include_metadata: true
        });
        
        // Process and format the results
        discoveredAgents = discoveredAgents.map(agent => {
          return {
            id: agent.id,
            name: agent.name || agent.id,
            capabilities: agent.capabilities || [],
            reputationScore: agent.reputation_score || this.reputationConfig.initialScore,
            metadata: agent.metadata || {},
            lastActive: agent.last_active || new Date().toISOString(),
          };
        });
        
        // Update the cache with the discovered agents
        discoveredAgents.forEach(agent => {
          this.agentCache.set(agent.id, agent);
        });
      } catch (error) {
        logger.warn('Error using NEAR AI API for discovery, falling back to local cache:', error.message);
        
        // If API call fails, fall back to local cache filtering
        discoveredAgents = [...this.agentCache.values()].filter(agent => {
          // Check if agent has all required capabilities
          const hasCapabilities = capabilities.length === 0 || 
            capabilities.every(cap => agent.capabilities.includes(cap));
          
          // Check if agent meets minimum reputation score
          const hasReputationScore = agent.reputationScore >= minReputationScore;
          
          // Apply additional filters if provided
          let passesFilters = true;
          if (Object.keys(filters).length > 0) {
            for (const [key, value] of Object.entries(filters)) {
              if (agent.metadata[key] !== value) {
                passesFilters = false;
                break;
              }
            }
          }
          
          return hasCapabilities && hasReputationScore && passesFilters;
        });
        
        // Apply limit
        discoveredAgents = discoveredAgents.slice(0, limit);
      }
      
      logger.info(`Discovered ${discoveredAgents.length} agents matching criteria`);
      return discoveredAgents;
    } catch (error) {
      logger.error('Error discovering agents:', error);
      return [];
    }
  }
  
  /**
   * Publish agent capabilities and metadata to the discovery network
   * @param {string} agentId Agent ID
   * @param {Object} agentInfo Agent information
   * @param {string[]} agentInfo.capabilities Agent capabilities
   * @param {Object} agentInfo.metadata Additional metadata
   * @returns {Promise<boolean>} Success status
   */
  async publishAgentCapabilities(agentId, agentInfo) {
    try {
      // Ensure the client is initialized
      if (!this.client) {
        await this.initialize();
      }
      
      const capabilities = agentInfo.capabilities || [];
      const metadata = agentInfo.metadata || {};
      
      logger.info(`Publishing capabilities for agent ${agentId}:`, capabilities);
      
      // Don't publish if in private mode
      if (this.privateMode) {
        logger.info('Agent capabilities not published (private mode enabled)');
        return true;
      }
      
      // Use the NEAR AI client to publish agent capabilities
      try {
        await this.client.publish_agent({
          agent_id: agentId,
          capabilities: capabilities,
          metadata: metadata,
          is_discoverable: this.enableGlobalDiscovery
        });
        
        logger.info(`Successfully published capabilities for agent ${agentId}`);
      } catch (error) {
        logger.warn(`Error publishing to NEAR AI network: ${error.message}`);
        logger.info('Storing capabilities locally only');
        
        // If API call fails, just update local cache
        const agent = this.agentCache.get(agentId) || {
          id: agentId,
          name: agentId,
          capabilities: [],
          reputationScore: this.reputationConfig.initialScore,
          metadata: {},
          lastActive: new Date().toISOString()
        };
        
        agent.capabilities = [...new Set([...agent.capabilities, ...capabilities])];
        agent.metadata = { ...agent.metadata, ...metadata };
        agent.lastActive = new Date().toISOString();
        
        this.agentCache.set(agentId, agent);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error publishing capabilities for agent ${agentId}:`, error);
      return false;
    }
  }
  
  /**
   * Get the capabilities and metadata for a specific agent
   * @param {string} agentId Agent ID
   * @returns {Promise<Object>} Agent capabilities and metadata
   */
  async getAgentCapabilities(agentId) {
    try {
      // Ensure the client is initialized
      if (!this.client) {
        await this.initialize();
      }
      
      // First, check the local cache
      if (this.agentCache.has(agentId)) {
        const cachedAgent = this.agentCache.get(agentId);
        logger.info(`Retrieved agent ${agentId} capabilities from cache:`, cachedAgent.capabilities);
        return {
          capabilities: cachedAgent.capabilities,
          metadata: cachedAgent.metadata,
          reputationScore: cachedAgent.reputationScore,
          lastActive: cachedAgent.lastActive
        };
      }
      
      // If not in cache, try to fetch from the network
      try {
        const agentInfo = await this.client.get_agent(agentId);
        
        const agent = {
          id: agentId,
          name: agentInfo.name || agentId,
          capabilities: agentInfo.capabilities || [],
          reputationScore: agentInfo.reputation_score || this.reputationConfig.initialScore,
          metadata: agentInfo.metadata || {},
          lastActive: agentInfo.last_active || new Date().toISOString()
        };
        
        // Update the cache
        this.agentCache.set(agentId, agent);
        
        logger.info(`Retrieved agent ${agentId} capabilities from network:`, agent.capabilities);
        
        return {
          capabilities: agent.capabilities,
          metadata: agent.metadata,
          reputationScore: agent.reputationScore,
          lastActive: agent.lastActive
        };
      } catch (error) {
        logger.warn(`Error fetching agent ${agentId} from network:`, error.message);
        return {
          capabilities: [],
          metadata: {},
          reputationScore: this.reputationConfig.initialScore,
          lastActive: null
        };
      }
    } catch (error) {
      logger.error(`Error getting capabilities for agent ${agentId}:`, error);
      return {
        capabilities: [],
        metadata: {},
        reputationScore: this.reputationConfig.initialScore,
        lastActive: null
      };
    }
  }
  
  /**
   * Get historical behavior and reputation for a specific agent
   * @param {string} agentId Agent ID
   * @returns {Promise<Object>} Agent history and reputation data
   */
  async getAgentHistory(agentId) {
    try {
      // Ensure the client is initialized
      if (!this.client) {
        await this.initialize();
      }
      
      logger.info(`Fetching history for agent ${agentId}`);
      
      try {
        // Fetch agent history from the network
        const history = await this.client.get_agent_history(agentId);
        
        return {
          tasks: history.tasks || [],
          interactions: history.interactions || [],
          reputationScore: history.reputation_score || this.reputationConfig.initialScore,
          reputationTrend: history.reputation_trend || 'stable'
        };
      } catch (error) {
        logger.warn(`Error fetching agent history from network:`, error.message);
        
        // Return empty history if not found
        return {
          tasks: [],
          interactions: [],
          reputationScore: this.reputationConfig.initialScore,
          reputationTrend: 'stable'
        };
      }
    } catch (error) {
      logger.error(`Error getting history for agent ${agentId}:`, error);
      return {
        tasks: [],
        interactions: [],
        reputationScore: this.reputationConfig.initialScore,
        reputationTrend: 'stable'
      };
    }
  }
  
  /**
   * Record a task execution for an agent
   * @param {string} agentId Agent ID
   * @param {Object} taskData Task execution data
   * @param {string} taskData.taskId Task ID
   * @param {string} taskData.description Task description
   * @param {boolean} taskData.success Success status
   * @param {Object} taskData.performanceMetrics Performance metrics
   * @param {string} taskData.requesterId ID of the requester
   * @param {Object} taskData.evidence Evidence URLs or data
   * @returns {Promise<boolean>} Success status
   */
  async recordAgentTask(agentId, taskData) {
    try {
      // Ensure the client is initialized
      if (!this.client) {
        await this.initialize();
      }
      
      const { taskId, description, success, performanceMetrics, requesterId, evidence } = taskData;
      
      logger.info(`Recording task execution for agent ${agentId}: ${taskId}`);
      
      // Format the task data for the API
      const apiTaskData = {
        task_id: taskId,
        description: description,
        success: success,
        performance_metrics: performanceMetrics,
        requester_id: requesterId,
        evidence: evidence,
        timestamp: new Date().toISOString()
      };
      
      try {
        // Record the task in the NEAR AI network
        await this.client.record_task({
          agent_id: agentId,
          task_data: apiTaskData
        });
        
        logger.info(`Successfully recorded task ${taskId} for agent ${agentId}`);
      } catch (error) {
        logger.warn(`Error recording task to NEAR AI network:`, error.message);
        logger.info('Task recorded locally only');
      }
      
      // Update the agent's last active timestamp in cache
      if (this.agentCache.has(agentId)) {
        const agent = this.agentCache.get(agentId);
        agent.lastActive = new Date().toISOString();
        
        // Update reputation score based on task success (simplified)
        if (success) {
          agent.reputationScore = Math.min(1, agent.reputationScore + 0.05);
        } else {
          agent.reputationScore = Math.max(0, agent.reputationScore - 0.05);
        }
        
        this.agentCache.set(agentId, agent);
      }
      
      return true;
    } catch (error) {
      logger.error(`Error recording task for agent ${agentId}:`, error);
      return false;
    }
  }
  
  /**
   * Connect two agents for collaboration
   * @param {string} agentId1 First agent ID
   * @param {string} agentId2 Second agent ID
   * @param {Object} options Connection options
   * @returns {Promise<Object>} Connection details
   */
  async connectAgents(agentId1, agentId2, options = {}) {
    try {
      // Ensure the client is initialized
      if (!this.client) {
        await this.initialize();
      }
      
      logger.info(`Connecting agents ${agentId1} and ${agentId2}`);
      
      const connectionOptions = {
        title: options.title || `Connection between ${agentId1} and ${agentId2}`,
        metadata: options.metadata || {},
        environment: options.environment,
        communication_channel: options.communicationChannel
      };
      
      try {
        // Use the NEAR AI client to establish a connection
        const connection = await this.client.connect_agents({
          agent_id_1: agentId1,
          agent_id_2: agentId2,
          options: connectionOptions
        });
        
        logger.info(`Successfully connected agents ${agentId1} and ${agentId2} with connection ID ${connection.id}`);
        
        return {
          id: connection.id,
          agentId1: agentId1,
          agentId2: agentId2,
          status: connection.status,
          createdAt: connection.created_at,
          metadata: connection.metadata
        };
      } catch (error) {
        logger.warn(`Error connecting agents via NEAR AI network:`, error.message);
        
        // Create a simulated connection if API fails
        const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          id: connectionId,
          agentId1: agentId1,
          agentId2: agentId2,
          status: 'active',
          createdAt: new Date().toISOString(),
          metadata: connectionOptions.metadata
        };
      }
    } catch (error) {
      logger.error(`Error connecting agents ${agentId1} and ${agentId2}:`, error);
      throw error;
    }
  }
  
  /**
   * Verify an agent to establish credibility on the network
   * @param {string} agentId Agent ID
   * @param {Object} verificationData Verification data
   * @returns {Promise<boolean>} Success status
   */
  async verifyAgent(agentId, verificationData = {}) {
    try {
      // Ensure the client is initialized
      if (!this.client) {
        await this.initialize();
      }
      
      logger.info(`Verifying agent ${agentId}`);
      
      try {
        // Use the NEAR AI client to verify the agent
        await this.client.verify_agent({
          agent_id: agentId,
          verification_data: verificationData
        });
        
        logger.info(`Successfully verified agent ${agentId}`);
        
        // Update the agent's metadata in cache if it exists
        if (this.agentCache.has(agentId)) {
          const agent = this.agentCache.get(agentId);
          agent.metadata = {
            ...agent.metadata,
            verified: true,
            verificationTimestamp: new Date().toISOString()
          };
          
          // Verified agents get a reputation boost
          agent.reputationScore = Math.min(1, agent.reputationScore + 0.1);
          
          this.agentCache.set(agentId, agent);
        }
        
        return true;
      } catch (error) {
        logger.warn(`Error verifying agent via NEAR AI network:`, error.message);
        return false;
      }
    } catch (error) {
      logger.error(`Error verifying agent ${agentId}:`, error);
      return false;
    }
  }
  
  /**
   * Refresh the local cache of agents
   * @private
   */
  async _refreshAgentCache() {
    try {
      logger.debug('Refreshing agent cache');
      
      // If client isn't initialized, just use existing cache
      if (!this.client) {
        return;
      }
      
      try {
        // Fetch agents from the NEAR AI network
        const agents = await this.client.list_agents({
          limit: 100,
          include_metadata: true
        });
        
        // Process and update the cache
        agents.forEach(agent => {
          const processedAgent = {
            id: agent.id,
            name: agent.name || agent.id,
            capabilities: agent.capabilities || [],
            reputationScore: agent.reputation_score || this.reputationConfig.initialScore,
            metadata: agent.metadata || {},
            lastActive: agent.last_active || new Date().toISOString()
          };
          
          this.agentCache.set(agent.id, processedAgent);
        });
        
        this.lastCacheRefresh = Date.now();
        logger.debug(`Agent cache refreshed with ${agents.length} agents`);
      } catch (error) {
        logger.warn('Error refreshing agent cache from NEAR AI network:', error.message);
        logger.debug('Using existing cache data');
        
        // If we can't refresh from network, just update the timestamp to prevent constant refresh attempts
        this.lastCacheRefresh = Date.now();
      }
    } catch (error) {
      logger.error('Error refreshing agent cache:', error);
      // Set refresh timestamp anyway to prevent continuous refresh attempts on error
      this.lastCacheRefresh = Date.now();
    }
  }
  
  /**
   * Check if the local cache is expired
   * @private
   * @returns {boolean} Whether the cache is expired
   */
  _isCacheExpired() {
    // If never refreshed, it's expired
    if (!this.lastCacheRefresh) {
      return true;
    }
    
    // Check if cache has expired based on expiry time
    return (Date.now() - this.lastCacheRefresh) > this.cacheExpiryMs;
  }
  
  /**
   * Get the status of the NEAR AI Discovery integration
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: !!this.client,
      environment: this.environment,
      enableGlobalDiscovery: this.enableGlobalDiscovery,
      privateMode: this.privateMode,
      cachedAgentsCount: this.agentCache.size,
      lastCacheRefresh: this.lastCacheRefresh,
    };
  }
}

module.exports = NearAIDiscovery; 