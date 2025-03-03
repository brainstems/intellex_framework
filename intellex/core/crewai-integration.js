/**
 * CrewAI Integration Module
 * 
 * This module provides integration with CrewAI's agent orchestration framework,
 * enabling Intellex Framework to work with CrewAI agents and facilitate communication
 * between CrewAI agents and NEAR AI agents.
 * 
 * Based on CrewAI documentation: https://docs.crewai.com/
 */

const { generateUniqueId } = require('../utils');

/**
 * CrewAI Integration class for working with CrewAI agents
 */
class CrewAIIntegration {
  /**
   * Create a new CrewAI Integration instance
   * @param {Object} config - Configuration options
   * @param {Object} config.aitpIntegration - AITP integration instance for agent communication
   * @param {Object} config.nearAIIntegration - NEAR AI integration instance
   * @param {string} config.processType - Type of process to use ('sequential', 'hierarchical')
   */
  constructor(config = {}) {
    this.config = {
      processType: config.processType || 'sequential',
      ...config,
    };
    
    this.aitpIntegration = config.aitpIntegration;
    this.nearAIIntegration = config.nearAIIntegration;
    
    this.crews = new Map();
    this.agents = new Map();
    this.tasks = new Map();
    this.initialized = false;
  }
  
  /**
   * Initialize the CrewAI integration
   * @returns {Promise<boolean>} - Whether initialization was successful
   */
  async initialize() {
    try {
      console.log(`Initializing CrewAI integration with ${this.config.processType} process`);
      
      // Initialize AITP integration if provided
      if (this.aitpIntegration && !this.aitpIntegration.initialized) {
        await this.aitpIntegration.initialize();
      }
      
      // Initialize NEAR AI integration if provided
      if (this.nearAIIntegration && !this.nearAIIntegration.initialized) {
        await this.nearAIIntegration.initialize();
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize CrewAI integration:', error);
      return false;
    }
  }
  
  /**
   * Create a CrewAI agent
   * @param {Object} agentConfig - Agent configuration
   * @param {string} agentConfig.name - Agent name
   * @param {string} agentConfig.role - Agent role
   * @param {string} agentConfig.goal - Agent goal
   * @param {Array} agentConfig.tools - Tools available to the agent
   * @param {Object} agentConfig.backstory - Agent backstory
   * @param {boolean} agentConfig.verbose - Whether to enable verbose mode
   * @returns {Object} - Created agent
   */
  createAgent(agentConfig) {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    const agentId = generateUniqueId();
    const agent = {
      id: agentId,
      name: agentConfig.name,
      role: agentConfig.role,
      goal: agentConfig.goal,
      tools: agentConfig.tools || [],
      backstory: agentConfig.backstory || '',
      verbose: agentConfig.verbose !== undefined ? agentConfig.verbose : true,
      allowDelegation: agentConfig.allowDelegation !== undefined ? agentConfig.allowDelegation : true,
      metadata: agentConfig.metadata || {},
      createdAt: new Date().toISOString(),
    };
    
    this.agents.set(agentId, agent);
    console.log(`Created CrewAI agent: ${agent.name} (${agentId})`);
    
    return agent;
  }
  
  /**
   * Create a task for a CrewAI agent
   * @param {Object} taskConfig - Task configuration
   * @param {string} taskConfig.description - Task description
   * @param {string} taskConfig.agentId - ID of the agent assigned to the task
   * @param {Array} taskConfig.tools - Tools available for the task
   * @param {Object} taskConfig.context - Additional context for the task
   * @returns {Object} - Created task
   */
  createTask(taskConfig) {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    const taskId = generateUniqueId();
    const task = {
      id: taskId,
      description: taskConfig.description,
      agentId: taskConfig.agentId,
      tools: taskConfig.tools || [],
      context: taskConfig.context || {},
      expectedOutput: taskConfig.expectedOutput || 'A detailed report',
      status: 'pending',
      result: null,
      createdAt: new Date().toISOString(),
    };
    
    this.tasks.set(taskId, task);
    console.log(`Created task: ${task.description} (${taskId})`);
    
    return task;
  }
  
  /**
   * Create a crew of CrewAI agents
   * @param {Object} crewConfig - Crew configuration
   * @param {string} crewConfig.name - Crew name
   * @param {Array} crewConfig.agents - Agents in the crew
   * @param {Array} crewConfig.tasks - Tasks for the crew
   * @param {string} crewConfig.process - Process type ('sequential', 'hierarchical')
   * @returns {Object} - Created crew
   */
  createCrew(crewConfig) {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    const crewId = generateUniqueId();
    const crew = {
      id: crewId,
      name: crewConfig.name,
      agents: crewConfig.agents || [],
      tasks: crewConfig.tasks || [],
      process: crewConfig.process || this.config.processType,
      verbose: crewConfig.verbose !== undefined ? crewConfig.verbose : true,
      memory: crewConfig.memory !== undefined ? crewConfig.memory : true,
      status: 'created',
      results: [],
      createdAt: new Date().toISOString(),
    };
    
    this.crews.set(crewId, crew);
    console.log(`Created crew: ${crew.name} (${crewId})`);
    
    return crew;
  }
  
  /**
   * Run a crew to execute its tasks
   * @param {string} crewId - Crew ID
   * @param {Object} inputs - Input data for the crew
   * @returns {Promise<Object>} - Crew execution results
   */
  async runCrew(crewId, inputs = {}) {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    const crew = this.crews.get(crewId);
    if (!crew) {
      throw new Error(`Crew not found: ${crewId}`);
    }
    
    console.log(`Running crew: ${crew.name} (${crewId})`);
    
    // Update crew status
    crew.status = 'running';
    this.crews.set(crewId, crew);
    
    try {
      // Create AITP thread for crew communication if AITP integration is available
      let crewThread = null;
      if (this.aitpIntegration) {
        crewThread = this.aitpIntegration.createThread({
          title: `Crew: ${crew.name}`,
          participants: crew.agents.map(agent => agent.id),
          metadata: {
            crewId,
            type: 'crew-communication',
          },
        });
        
        // Add initial message with inputs
        this.aitpIntegration.addMessage(crewThread.id, {
          role: 'system',
          content: `Crew "${crew.name}" has been started with the following inputs: ${JSON.stringify(inputs)}`,
        });
      }
      
      // Execute tasks based on the process type
      let results = [];
      
      if (crew.process === 'sequential') {
        // Sequential process - execute tasks one after another
        for (const taskId of crew.tasks) {
          const task = this.tasks.get(taskId);
          if (!task) {
            console.warn(`Task not found: ${taskId}`);
            continue;
          }
          
          const agent = this.agents.get(task.agentId);
          if (!agent) {
            console.warn(`Agent not found: ${task.agentId}`);
            continue;
          }
          
          console.log(`Executing task: ${task.description} with agent: ${agent.name}`);
          
          // Update task status
          task.status = 'running';
          this.tasks.set(taskId, task);
          
          // Add task message to crew thread if available
          if (crewThread) {
            this.aitpIntegration.addMessage(crewThread.id, {
              role: 'system',
              content: `Task "${task.description}" assigned to agent "${agent.name}"`,
            });
          }
          
          // Execute the task
          const taskResult = await this.executeTask(task, agent, inputs, crewThread);
          
          // Update task with result
          task.status = 'completed';
          task.result = taskResult;
          task.completedAt = new Date().toISOString();
          this.tasks.set(taskId, task);
          
          // Add result to inputs for next tasks
          inputs = {
            ...inputs,
            [task.id]: taskResult,
          };
          
          results.push({
            taskId: task.id,
            agentId: agent.id,
            result: taskResult,
          });
        }
      } else if (crew.process === 'hierarchical') {
        // Hierarchical process - manager agent delegates tasks
        // Find the manager agent (first agent in the crew)
        const managerAgent = crew.agents.length > 0 ? this.agents.get(crew.agents[0].id) : null;
        
        if (!managerAgent) {
          throw new Error('No manager agent found for hierarchical process');
        }
        
        console.log(`Manager agent: ${managerAgent.name} will delegate tasks`);
        
        // Add manager message to crew thread if available
        if (crewThread) {
          this.aitpIntegration.addMessage(crewThread.id, {
            role: 'system',
            content: `Manager agent "${managerAgent.name}" will delegate tasks to the crew`,
          });
        }
        
        // Execute tasks through the manager
        results = await this.executeHierarchicalProcess(crew, managerAgent, inputs, crewThread);
      } else {
        throw new Error(`Unsupported process type: ${crew.process}`);
      }
      
      // Update crew with results
      crew.status = 'completed';
      crew.results = results;
      crew.completedAt = new Date().toISOString();
      this.crews.set(crewId, crew);
      
      // Add completion message to crew thread if available
      if (crewThread) {
        this.aitpIntegration.addMessage(crewThread.id, {
          role: 'system',
          content: `Crew "${crew.name}" has completed all tasks`,
        });
      }
      
      return {
        crewId,
        status: 'completed',
        results,
      };
    } catch (error) {
      // Update crew status on error
      crew.status = 'failed';
      crew.error = error.message;
      this.crews.set(crewId, crew);
      
      console.error(`Error running crew ${crewId}:`, error);
      throw error;
    }
  }
  
  /**
   * Execute a task with an agent
   * @param {Object} task - Task to execute
   * @param {Object} agent - Agent to execute the task
   * @param {Object} inputs - Input data for the task
   * @param {Object} crewThread - AITP thread for crew communication
   * @returns {Promise<string>} - Task execution result
   * @private
   */
  async executeTask(task, agent, inputs, crewThread) {
    console.log(`Agent ${agent.name} executing task: ${task.description}`);
    
    // Simulate task execution
    // In a real implementation, this would use the actual CrewAI agent execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If AITP integration is available, create a task-specific thread
    if (this.aitpIntegration && crewThread) {
      // Add agent's thinking process to the crew thread
      this.aitpIntegration.addMessage(crewThread.id, {
        role: 'assistant',
        content: `Agent "${agent.name}" thinking: I need to ${task.description} based on the inputs: ${JSON.stringify(inputs)}`,
      });
      
      // Add agent's result to the crew thread
      this.aitpIntegration.addMessage(crewThread.id, {
        role: 'assistant',
        content: `Agent "${agent.name}" completed task: ${task.description}. Here's my result: I have analyzed the data and completed the task successfully.`,
      });
    }
    
    // If NEAR AI integration is available and the agent is configured to use it
    if (this.nearAIIntegration && agent.metadata.useNearAI) {
      console.log(`Using NEAR AI for agent ${agent.name}`);
      
      // Create a NEAR AI agent for this task
      const nearAIAgent = await this.nearAIIntegration.createAgent({
        name: agent.name,
        description: `${agent.role}: ${agent.backstory}`,
        modelId: agent.metadata.nearAIModelId || 'near-ai-base',
        tools: agent.tools.map(tool => typeof tool === 'string' ? tool : tool.name),
      });
      
      // Run the NEAR AI agent
      const nearAIResult = await this.nearAIIntegration.runAgent(nearAIAgent.id, {
        input: `Task: ${task.description}\nContext: ${JSON.stringify(task.context)}\nInputs: ${JSON.stringify(inputs)}`,
        context: {
          agentId: agent.id,
          taskId: task.id,
        },
      });
      
      return nearAIResult.output;
    }
    
    // Default simulated result
    return `I have completed the task "${task.description}" successfully. Here's my analysis based on the provided inputs.`;
  }
  
  /**
   * Execute a hierarchical process with a manager agent
   * @param {Object} crew - Crew to execute
   * @param {Object} managerAgent - Manager agent
   * @param {Object} inputs - Input data
   * @param {Object} crewThread - AITP thread for crew communication
   * @returns {Promise<Array>} - Execution results
   * @private
   */
  async executeHierarchicalProcess(crew, managerAgent, inputs, crewThread) {
    console.log(`Executing hierarchical process with manager: ${managerAgent.name}`);
    
    // Simulate manager agent delegating tasks
    const results = [];
    
    // If AITP integration is available, add manager's planning to the crew thread
    if (this.aitpIntegration && crewThread) {
      this.aitpIntegration.addMessage(crewThread.id, {
        role: 'assistant',
        content: `Manager "${managerAgent.name}" planning: I'll delegate tasks to the team based on their expertise.`,
      });
    }
    
    // Get all agents except the manager
    const teamAgents = crew.agents
      .filter(a => a.id !== managerAgent.id)
      .map(a => this.agents.get(a.id))
      .filter(a => a !== undefined);
    
    // Assign tasks to agents
    for (const taskId of crew.tasks) {
      const task = this.tasks.get(taskId);
      if (!task) {
        console.warn(`Task not found: ${taskId}`);
        continue;
      }
      
      // Find the best agent for the task (simplified logic)
      // In a real implementation, the manager would make this decision
      const assignedAgent = teamAgents.find(a => a.id === task.agentId) || teamAgents[0];
      
      if (!assignedAgent) {
        console.warn(`No agent available for task: ${taskId}`);
        continue;
      }
      
      // If AITP integration is available, add delegation message to the crew thread
      if (this.aitpIntegration && crewThread) {
        this.aitpIntegration.addMessage(crewThread.id, {
          role: 'assistant',
          content: `Manager "${managerAgent.name}" delegating: I'm assigning task "${task.description}" to agent "${assignedAgent.name}"`,
        });
      }
      
      // Execute the task with the assigned agent
      console.log(`Manager delegated task: ${task.description} to agent: ${assignedAgent.name}`);
      
      // Update task status and agent
      task.status = 'running';
      task.agentId = assignedAgent.id;
      this.tasks.set(taskId, task);
      
      // Execute the task
      const taskResult = await this.executeTask(task, assignedAgent, inputs, crewThread);
      
      // Update task with result
      task.status = 'completed';
      task.result = taskResult;
      task.completedAt = new Date().toISOString();
      this.tasks.set(taskId, task);
      
      // Add result to inputs for next tasks
      inputs = {
        ...inputs,
        [task.id]: taskResult,
      };
      
      results.push({
        taskId: task.id,
        agentId: assignedAgent.id,
        result: taskResult,
      });
      
      // If AITP integration is available, add review message to the crew thread
      if (this.aitpIntegration && crewThread) {
        this.aitpIntegration.addMessage(crewThread.id, {
          role: 'assistant',
          content: `Manager "${managerAgent.name}" reviewing: I've reviewed the work from agent "${assignedAgent.name}" on task "${task.description}" and it looks good.`,
        });
      }
    }
    
    // Manager provides final summary
    if (this.aitpIntegration && crewThread) {
      this.aitpIntegration.addMessage(crewThread.id, {
        role: 'assistant',
        content: `Manager "${managerAgent.name}" summarizing: All tasks have been completed successfully by the team. Here's the final report: ${JSON.stringify(results)}`,
      });
    }
    
    return results;
  }
  
  /**
   * Connect a CrewAI agent to a NEAR AI agent
   * @param {string} crewAgentId - CrewAI agent ID
   * @param {Object} nearAIConfig - NEAR AI configuration
   * @returns {Promise<Object>} - Connection result
   */
  async connectToNearAI(crewAgentId, nearAIConfig = {}) {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    if (!this.nearAIIntegration) {
      throw new Error('NEAR AI integration not available');
    }
    
    const crewAgent = this.agents.get(crewAgentId);
    if (!crewAgent) {
      throw new Error(`CrewAI agent not found: ${crewAgentId}`);
    }
    
    console.log(`Connecting CrewAI agent ${crewAgent.name} to NEAR AI`);
    
    // Update agent metadata to use NEAR AI
    crewAgent.metadata.useNearAI = true;
    crewAgent.metadata.nearAIModelId = nearAIConfig.modelId || 'near-ai-base';
    this.agents.set(crewAgentId, crewAgent);
    
    // Create a NEAR AI agent
    const nearAIAgent = await this.nearAIIntegration.createAgent({
      name: crewAgent.name,
      description: `${crewAgent.role}: ${crewAgent.backstory}`,
      modelId: crewAgent.metadata.nearAIModelId,
      tools: crewAgent.tools.map(tool => typeof tool === 'string' ? tool : tool.name),
      options: nearAIConfig.options || {},
    });
    
    console.log(`Created NEAR AI agent: ${nearAIAgent.id} for CrewAI agent: ${crewAgent.name}`);
    
    // Store the NEAR AI agent ID in the CrewAI agent metadata
    crewAgent.metadata.nearAIAgentId = nearAIAgent.id;
    this.agents.set(crewAgentId, crewAgent);
    
    return {
      crewAgentId,
      nearAIAgentId: nearAIAgent.id,
      connected: true,
    };
  }
  
  /**
   * Connect CrewAI agents using AITP
   * @param {string} agentId1 - First agent ID
   * @param {string} agentId2 - Second agent ID
   * @returns {Promise<Object>} - Connection thread
   */
  async connectAgentsWithAITP(agentId1, agentId2) {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    if (!this.aitpIntegration) {
      throw new Error('AITP integration not available');
    }
    
    const agent1 = this.agents.get(agentId1);
    if (!agent1) {
      throw new Error(`Agent not found: ${agentId1}`);
    }
    
    const agent2 = this.agents.get(agentId2);
    if (!agent2) {
      throw new Error(`Agent not found: ${agentId2}`);
    }
    
    console.log(`Connecting agents ${agent1.name} and ${agent2.name} using AITP`);
    
    // Create a thread for the agents to communicate
    const thread = this.aitpIntegration.createThread({
      title: `Communication between ${agent1.name} and ${agent2.name}`,
      participants: [agentId1, agentId2],
      metadata: {
        type: 'agent-communication',
        agent1Id: agentId1,
        agent2Id: agentId2,
      },
    });
    
    // Add initial message
    this.aitpIntegration.addMessage(thread.id, {
      role: 'system',
      content: `This thread is for communication between agent "${agent1.name}" (${agent1.role}) and agent "${agent2.name}" (${agent2.role}).`,
    });
    
    return thread;
  }
  
  /**
   * Get all crews
   * @returns {Array} - List of crews
   */
  getAllCrews() {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    return Array.from(this.crews.values());
  }
  
  /**
   * Get all agents
   * @returns {Array} - List of agents
   */
  getAllAgents() {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    return Array.from(this.agents.values());
  }
  
  /**
   * Get all tasks
   * @returns {Array} - List of tasks
   */
  getAllTasks() {
    if (!this.initialized) {
      throw new Error('CrewAI integration not initialized');
    }
    
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get the status of the CrewAI integration
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      processType: this.config.processType,
      crewCount: this.crews.size,
      agentCount: this.agents.size,
      taskCount: this.tasks.size,
      aitpAvailable: !!this.aitpIntegration,
      nearAIAvailable: !!this.nearAIIntegration,
    };
  }
}

module.exports = CrewAIIntegration; 