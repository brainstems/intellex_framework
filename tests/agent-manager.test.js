/**
 * Agent Manager Tests
 * 
 * This file contains tests for the Agent Manager module of the Intellex framework.
 */

const AgentManager = require('../intellex/core/agent-manager');

describe('AgentManager', () => {
  let agentManager;
  
  beforeEach(() => {
    // Initialize a new AgentManager before each test
    agentManager = new AgentManager({
      nearNetwork: 'testnet',
      enableReputation: true,
    });
  });
  
  test('should create an instance of AgentManager', () => {
    expect(agentManager).toBeInstanceOf(AgentManager);
    expect(agentManager.agents).toBeDefined();
    expect(agentManager.agents.size).toBe(0);
  });
  
  test('should create an agent with default values', () => {
    const agent = agentManager.createAgent({});
    
    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.name).toMatch(/^Agent-/);
    expect(agent.capabilities).toEqual([]);
    expect(agent.reputationThreshold).toBe(0.5);
    expect(agent.active).toBe(false);
    expect(agent.createdAt).toBeDefined();
    
    // Check that the agent was added to the manager
    expect(agentManager.agents.size).toBe(1);
    expect(agentManager.agents.get(agent.id)).toBe(agent);
  });
  
  test('should create an agent with custom values', () => {
    const agentConfig = {
      name: 'TestAgent',
      capabilities: ['text-processing', 'data-analysis'],
      reputationThreshold: 0.7,
    };
    
    const agent = agentManager.createAgent(agentConfig);
    
    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.name).toBe('TestAgent');
    expect(agent.capabilities).toEqual(['text-processing', 'data-analysis']);
    expect(agent.reputationThreshold).toBe(0.7);
    expect(agent.active).toBe(false);
    expect(agent.createdAt).toBeDefined();
    
    // Check that the agent was added to the manager
    expect(agentManager.agents.size).toBe(1);
    expect(agentManager.agents.get(agent.id)).toBe(agent);
  });
  
  test('should get an agent by ID', () => {
    const agent = agentManager.createAgent({ name: 'TestAgent' });
    const retrievedAgent = agentManager.getAgent(agent.id);
    
    expect(retrievedAgent).toBe(agent);
  });
  
  test('should return null when getting a non-existent agent', () => {
    const retrievedAgent = agentManager.getAgent('non-existent-id');
    
    expect(retrievedAgent).toBeNull();
  });
  
  test('should get all agents', () => {
    const agent1 = agentManager.createAgent({ name: 'Agent1' });
    const agent2 = agentManager.createAgent({ name: 'Agent2' });
    const agent3 = agentManager.createAgent({ name: 'Agent3' });
    
    const allAgents = agentManager.getAllAgents();
    
    expect(allAgents).toBeInstanceOf(Array);
    expect(allAgents.length).toBe(3);
    expect(allAgents).toContain(agent1);
    expect(allAgents).toContain(agent2);
    expect(allAgents).toContain(agent3);
  });
  
  test('should remove an agent by ID', () => {
    const agent = agentManager.createAgent({ name: 'TestAgent' });
    
    expect(agentManager.agents.size).toBe(1);
    
    const removeResult = agentManager.removeAgent(agent.id);
    
    expect(removeResult).toBe(true);
    expect(agentManager.agents.size).toBe(0);
    expect(agentManager.getAgent(agent.id)).toBeNull();
  });
  
  test('should return false when removing a non-existent agent', () => {
    const removeResult = agentManager.removeAgent('non-existent-id');
    
    expect(removeResult).toBe(false);
  });
  
  test('should deploy an agent', async () => {
    const agent = agentManager.createAgent({ name: 'TestAgent' });
    
    expect(agent.active).toBe(false);
    
    const deployResult = await agent.deploy();
    
    expect(deployResult).toBe(true);
    expect(agent.active).toBe(true);
  });
  
  test('should update agent configuration', () => {
    const agent = agentManager.createAgent({
      name: 'TestAgent',
      capabilities: ['text-processing'],
    });
    
    const updatedAgent = agent.updateConfig({
      name: 'UpdatedAgent',
      capabilities: ['text-processing', 'data-analysis'],
    });
    
    expect(updatedAgent).toBe(agent);
    expect(updatedAgent.name).toBe('UpdatedAgent');
    expect(updatedAgent.capabilities).toEqual(['text-processing', 'data-analysis']);
    
    // Check that the agent in the manager was updated
    const retrievedAgent = agentManager.getAgent(agent.id);
    expect(retrievedAgent.name).toBe('UpdatedAgent');
    expect(retrievedAgent.capabilities).toEqual(['text-processing', 'data-analysis']);
  });
  
  test('should deactivate an agent', () => {
    const agent = agentManager.createAgent({ name: 'TestAgent' });
    
    // First deploy the agent to activate it
    agent.deploy();
    
    expect(agent.active).toBe(true);
    
    const deactivateResult = agent.deactivate();
    
    expect(deactivateResult).toBe(true);
    expect(agent.active).toBe(false);
  });
  
  test('should throw an error when executing a task with an inactive agent', async () => {
    const agent = agentManager.createAgent({ name: 'TestAgent' });
    
    // Agent is not deployed, so it's inactive
    expect(agent.active).toBe(false);
    
    await expect(agent.executeTask({ type: 'test' })).rejects.toThrow('Agent is not active');
  });
  
  test('should execute a task with an active agent', async () => {
    const agent = agentManager.createAgent({ name: 'TestAgent' });
    
    // Deploy the agent to activate it
    await agent.deploy();
    
    expect(agent.active).toBe(true);
    
    const taskResult = await agent.executeTask({ type: 'test' });
    
    expect(taskResult).toBeDefined();
    expect(taskResult.success).toBe(true);
    expect(taskResult.result).toContain('Task executed by TestAgent');
    expect(taskResult.timestamp).toBeDefined();
  });
}); 