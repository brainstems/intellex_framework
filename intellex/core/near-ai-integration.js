/**
 * NEAR AI Integration Module
 * 
 * This module provides integration with NEAR AI's agent toolkit, allowing the Intellex Framework
 * to leverage NEAR AI's autonomous agents, models, and tools.
 * 
 * Based on NEAR AI documentation: https://docs.near.ai/api/
 */

const nearai = require('nearai');
const { generateUniqueId } = require('../utils');

/**
 * NEAR AI Integration class for interacting with NEAR AI's agent toolkit
 */
class NearAIIntegration {
  /**
   * Create a new NEAR AI Integration instance
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - NEAR AI API key
   * @param {string} config.environment - Environment to use (production, staging, etc.)
   * @param {boolean} config.privateMode - Whether to enable private & verifiable AI mode
   */
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.NEAR_AI_API_KEY,
      environment: config.environment || 'production',
      privateMode: config.privateMode || true,
      ...config,
    };
    
    this.agentRegistry = [];
    this.modelRegistry = [];
    this.toolRegistry = [];
    this.environments = new Map();
    this.vectorStores = new Map();
    
    this.initialized = false;
    this.client = null;
  }
  
  /**
   * Initialize the NEAR AI integration
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log(`Initializing NEAR AI integration in ${this.config.environment} environment`);
      
      // Initialize the NEAR AI client
      this.client = new nearai.shared.inference_client.InferenceClient({
        apiKey: this.config.apiKey
      });
      
      // Fetch available agents from NEAR AI registry
      await this.fetchAgentRegistry();
      
      // Fetch available models
      await this.fetchModelRegistry();
      
      // Fetch available tools
      await this.fetchToolRegistry();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize NEAR AI integration:', error);
      return false;
    }
  }
  
  /**
   * Create a new environment for agent interactions
   * @param {Object} options - Environment options
   * @returns {Object} - NEAR AI Environment object
   */
  createEnvironment(options = {}) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    const environmentId = generateUniqueId('env');
    const environment = new nearai.agents.environment.Environment({
      ...options,
      client: this.client
    });
    
    this.environments.set(environmentId, environment);
    return environment;
  }
  
  /**
   * Fetch available agents from NEAR AI registry
   * @returns {Promise<Array>} - List of available agents
   * @private
   */
  async fetchAgentRegistry() {
    try {
      if (this.client) {
        // In production code, this would call the actual API
        const agentResults = await this.client.find_agents({
          limit: 20
        });
        
        this.agentRegistry = agentResults || [];
      } else {
        // Fallback to sample data
        this.agentRegistry = [
          { id: 'data-analysis-agent', name: 'Data Analysis Agent', capabilities: ['data_analysis'] },
          { id: 'nlp-agent', name: 'NLP Agent', capabilities: ['text_processing'] }
        ];
      }
      
      return this.agentRegistry;
    } catch (error) {
      console.error('Failed to fetch agent registry:', error);
      return [];
    }
  }
  
  /**
   * Fetch available models from NEAR AI registry
   * @returns {Promise<Array>} - List of available models
   * @private
   */
  async fetchModelRegistry() {
    try {
      // In a production implementation, this would call the NEAR AI API
      this.modelRegistry = [
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
        { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
        { id: 'near-ai-base', name: 'NEAR AI Base', provider: 'near' },
      ];
      
      return this.modelRegistry;
    } catch (error) {
      console.error('Failed to fetch model registry:', error);
      return [];
    }
  }
  
  /**
   * Fetch available tools from NEAR AI registry
   * @returns {Promise<Array>} - List of available tools
   * @private
   */
  async fetchToolRegistry() {
    try {
      if (this.client) {
        // In a real implementation, would fetch from NEAR AI
        const environment = this.createEnvironment();
        const toolRegistry = environment.get_tool_registry();
        this.toolRegistry = toolRegistry.get_all_tools() || [];
      } else {
        // Fallback to sample data
        this.toolRegistry = [
          { name: 'web_search', description: 'Search the web for information' },
          { name: 'calculator', description: 'Perform calculations' },
        ];
      }
      
      return this.toolRegistry;
    } catch (error) {
      console.error('Failed to fetch tool registry:', error);
      return [];
    }
  }
  
  /**
   * Get available agents from NEAR AI
   * @returns {Array} - List of available agents
   */
  getAvailableAgents() {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    return this.agentRegistry;
  }
  
  /**
   * Get available models from NEAR AI
   * @returns {Array} - List of available models
   */
  getAvailableModels() {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    return this.modelRegistry;
  }
  
  /**
   * Get available tools from NEAR AI
   * @returns {Array} - List of available tools
   */
  getAvailableTools() {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    return this.toolRegistry;
  }
  
  /**
   * Create a new agent
   * @param {Object} agentConfig - Agent configuration
   * @returns {Promise<Object>} - Created agent
   */
  async createAgent(agentConfig) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    const agentId = generateUniqueId('agent');
    
    try {
      // Set agent metadata using the NEAR AI API
      const agentData = {
        name: agentConfig.name,
        description: agentConfig.description || '',
        model: agentConfig.modelId || 'near-ai-base',
        tools: agentConfig.tools || [],
        ...agentConfig.options
      };
      
      // In a real implementation, would create an agent with NEAR AI
      await nearai.agents.agent.set_agent_metadata(agentId, agentData);
      
      const agent = {
        id: agentId,
        name: agentConfig.name,
        description: agentConfig.description || '',
        modelId: agentConfig.modelId || 'near-ai-base',
        tools: agentConfig.tools || [],
        options: agentConfig.options || {},
        createdAt: new Date().toISOString(),
      };
      
      this.agentRegistry.push(agent);
      
      return agent;
    } catch (error) {
      console.error('Failed to create agent:', error);
      throw error;
    }
  }
  
  /**
   * Run an agent with a task
   * @param {string} agentId - Agent ID
   * @param {Object} task - Task to run
   * @param {Object} options - Run options
   * @returns {Promise<Object>} - Task result
   */
  async runAgent(agentId, task, options = {}) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    try {
      // Create an environment for this run
      const environment = this.createEnvironment();
      
      // Load the agent using the NEAR AI API
      const agent = await nearai.agents.agent.load_agent(agentId);
      
      // Add task message to the environment
      environment.add_message({
        role: "user",
        content: task.description || JSON.stringify(task)
      });
      
      // Register tools if provided
      if (options.tools && options.tools.length > 0) {
        const toolRegistry = environment.get_tool_registry();
        options.tools.forEach(tool => {
          toolRegistry.register_tool(tool.name, tool.handler, tool.definition);
        });
      }
      
      // Run the agent in the environment
      const result = await agent.run({
        environment,
        ...options
      });
      
      return {
        success: true,
        result: result,
        agentId: agentId,
        taskId: task.id || generateUniqueId('task'),
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Failed to run agent ${agentId}:`, error);
      return {
        success: false,
        error: error.message,
        agentId: agentId,
        taskId: task.id || generateUniqueId('task'),
        completedAt: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Create a vector store for knowledge management
   * @param {Object} options - Vector store options
   * @returns {Promise<Object>} - Created vector store
   */
  async createVectorStore(options = {}) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    try {
      const storeId = options.name || generateUniqueId('vectorstore');
      
      // Create the vector store using the NEAR AI API
      const vectorStore = await this.client.create_vector_store({
        name: storeId,
        file_ids: options.fileIds || [],
        chunking_strategy: options.chunkingStrategy || { type: "auto" },
        expires_after: options.expiresAfter || { days: 30 },
        metadata: options.metadata || {}
      });
      
      this.vectorStores.set(storeId, vectorStore);
      
      return vectorStore;
    } catch (error) {
      console.error('Failed to create vector store:', error);
      throw error;
    }
  }
  
  /**
   * Query a vector store
   * @param {string} storeId - Vector store ID
   * @param {string} query - Query string
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Query results
   */
  async queryVectorStore(storeId, query, options = {}) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    try {
      // Query the vector store using the NEAR AI API
      const results = await this.client.query_vector_store(
        storeId,
        query,
        options
      );
      
      return results;
    } catch (error) {
      console.error(`Failed to query vector store ${storeId}:`, error);
      throw error;
    }
  }
  
  /**
   * Find agents based on capabilities
   * @param {Object} query - Search query
   * @returns {Promise<Array>} - Matching agents
   */
  async findAgents(query = {}) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    try {
      // Find agents using the NEAR AI API
      const results = await this.client.find_agents(query);
      return results;
    } catch (error) {
      console.error('Failed to find agents:', error);
      return [];
    }
  }
  
  /**
   * Fine-tune a model
   * @param {string} modelId - Base model ID
   * @param {Array} trainingData - Training data
   * @param {Object} options - Fine-tuning options
   * @returns {Promise<Object>} - Fine-tuned model info
   */
  async fineTuneModel(modelId, trainingData, options = {}) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    console.log(`Fine-tuning model ${modelId} with ${trainingData.length} training examples`);
    
    // Placeholder - in a real implementation, would call the NEAR AI API
    const fineTunedModel = {
      id: `ft-${modelId}-${generateUniqueId()}`,
      baseModel: modelId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    return fineTunedModel;
  }
  
  /**
   * Deploy an agent to the NEAR AI platform
   * @param {string} agentId - Agent ID
   * @param {Object} deployOptions - Deployment options
   * @returns {Promise<Object>} - Deployment result
   */
  async deployAgent(agentId, deployOptions = {}) {
    if (!this.initialized) {
      throw new Error('NEAR AI integration not initialized');
    }
    
    console.log(`Deploying agent ${agentId} to NEAR AI platform`);
    
    // Placeholder - in a real implementation, would call the NEAR AI API
    const deploymentResult = {
      agentId: agentId,
      deploymentId: generateUniqueId('deploy'),
      status: 'success',
      endpoint: `https://near.ai/agents/${agentId}`,
      deployedAt: new Date().toISOString(),
    };
    
    return deploymentResult;
  }
  
  /**
   * Enable or disable private mode
   * @param {boolean} enable - Whether to enable private mode
   */
  enablePrivateMode(enable = true) {
    this.config.privateMode = enable;
    console.log(`Private mode ${enable ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get the status of the NEAR AI integration
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      environment: this.config.environment,
      privateMode: this.config.privateMode,
      agentCount: this.agentRegistry.length,
      modelCount: this.modelRegistry.length,
      toolCount: this.toolRegistry.length,
      environmentCount: this.environments.size,
      vectorStoreCount: this.vectorStores.size
    };
  }
}

module.exports = NearAIIntegration; 