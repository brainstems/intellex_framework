# Extending the Intellex Framework

This guide explains how to extend the Intellex Framework by adding support for new agent platforms or communication protocols.

## Overview

The Intellex Framework is designed with extensibility in mind. Its architecture is based on interfaces and adapters that allow you to integrate new agent platforms, blockchain networks, or communication protocols without modifying the core framework.

## Adding a New Agent Platform

To add support for a new agent platform, you need to create a platform adapter that implements the `AgentInterface`.

### Step 1: Create a Platform Adapter

Create a new file in the `intellex/adapters` directory:

```javascript
// intellex/adapters/my-platform-adapter.js

const { AgentInterface } = require('../core/agent-interface');

class MyPlatformAdapter extends AgentInterface {
  constructor(config = {}) {
    super();
    this.config = config;
    this.agents = new Map();
    this.platformClient = null; // Initialize your platform's client/SDK here
    
    // Initialize connection to your platform
    this._initializePlatform();
  }
  
  _initializePlatform() {
    // Connect to your platform's API or services
    // Example:
    // this.platformClient = new MyPlatformSDK(this.config);
    console.log('Initializing connection to My Platform');
  }
  
  async createAgent(agentConfig) {
    try {
      // Implement agent creation logic specific to your platform
      // Example:
      // const platformAgent = await this.platformClient.createAgent(agentConfig);
      
      const agentId = `my-platform-${Date.now()}`;
      const agent = {
        id: agentId,
        name: agentConfig.name,
        platform: 'my-platform',
        capabilities: agentConfig.capabilities || [],
        // Add other platform-specific properties
        ...agentConfig
      };
      
      this.agents.set(agentId, agent);
      return agent;
    } catch (error) {
      throw new Error(`Failed to create agent on My Platform: ${error.message}`);
    }
  }
  
  async getAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found on My Platform`);
    }
    return agent;
  }
  
  async updateAgent(agentId, updates) {
    const agent = await this.getAgent(agentId);
    
    // Apply updates to the agent
    Object.assign(agent, updates);
    
    // Update the agent on the platform if needed
    // Example:
    // await this.platformClient.updateAgent(agentId, updates);
    
    this.agents.set(agentId, agent);
    return agent;
  }
  
  async deleteAgent(agentId) {
    const agent = await this.getAgent(agentId);
    
    // Delete the agent from the platform
    // Example:
    // await this.platformClient.deleteAgent(agentId);
    
    this.agents.delete(agentId);
    return { success: true, message: `Agent ${agentId} deleted successfully` };
  }
  
  async runAgent(agentId, input) {
    const agent = await this.getAgent(agentId);
    
    // Execute the agent with the given input
    // Example:
    // const result = await this.platformClient.runAgent(agentId, input);
    
    const result = {
      agentId,
      status: 'completed',
      output: `Simulated response from ${agent.name}`,
      // Add other result properties
    };
    
    return result;
  }
  
  async listAgents() {
    return Array.from(this.agents.values());
  }
  
  // Implement any platform-specific methods
  async performPlatformSpecificOperation(params) {
    // Custom functionality specific to your platform
    return { success: true, result: 'Operation completed' };
  }
}

module.exports = { MyPlatformAdapter };
```

### Step 2: Create a Communication Adapter (if needed)

If your platform has a unique communication protocol, create a communication adapter:

```javascript
// intellex/adapters/my-platform-communication-adapter.js

const { CommunicationInterface } = require('../core/communication-interface');

class MyPlatformCommunicationAdapter extends CommunicationInterface {
  constructor(config = {}) {
    super();
    this.config = config;
    this.threads = new Map();
    this.messages = new Map();
    
    // Initialize your communication client
    this._initializeCommunication();
  }
  
  _initializeCommunication() {
    // Set up connection to your platform's communication services
    console.log('Initializing My Platform communication adapter');
  }
  
  async createThread(threadConfig) {
    try {
      const threadId = `my-platform-thread-${Date.now()}`;
      const thread = {
        id: threadId,
        name: threadConfig.name,
        participants: threadConfig.participants,
        capabilities: threadConfig.capabilities || [],
        createdAt: new Date().toISOString(),
        // Add other thread properties
        ...threadConfig
      };
      
      this.threads.set(threadId, thread);
      return thread;
    } catch (error) {
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }
  
  async getThread(threadId) {
    const thread = this.threads.get(threadId);
    if (!thread) {
      throw new Error(`Thread with ID ${threadId} not found`);
    }
    return thread;
  }
  
  async sendMessage(messageConfig) {
    try {
      const { threadId, senderId, content } = messageConfig;
      
      // Verify the thread exists
      await this.getThread(threadId);
      
      const messageId = `my-platform-msg-${Date.now()}`;
      const message = {
        id: messageId,
        threadId,
        senderId,
        content,
        capabilities: messageConfig.capabilities || [],
        attachments: messageConfig.attachments || {},
        timestamp: new Date().toISOString(),
        // Add other message properties
      };
      
      // Store the message
      if (!this.messages.has(threadId)) {
        this.messages.set(threadId, []);
      }
      this.messages.get(threadId).push(message);
      
      return message;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
  
  async getMessages(threadId) {
    // Verify the thread exists
    await this.getThread(threadId);
    
    return this.messages.get(threadId) || [];
  }
  
  async addParticipantToThread(threadId, participantId) {
    const thread = await this.getThread(threadId);
    
    if (!thread.participants.includes(participantId)) {
      thread.participants.push(participantId);
      this.threads.set(threadId, thread);
    }
    
    return thread;
  }
  
  async removeParticipantFromThread(threadId, participantId) {
    const thread = await this.getThread(threadId);
    
    thread.participants = thread.participants.filter(id => id !== participantId);
    this.threads.set(threadId, thread);
    
    return thread;
  }
}

module.exports = { MyPlatformCommunicationAdapter };
```

### Step 3: Register Your Adapters with the Framework

Update the main Intellex class to include your new adapters:

```javascript
// intellex/index.js

// Import your adapters
const { MyPlatformAdapter } = require('./adapters/my-platform-adapter');
const { MyPlatformCommunicationAdapter } = require('./adapters/my-platform-communication-adapter');

// Add to the Intellex class
class Intellex {
  constructor(config = {}) {
    // Existing initialization code...
    
    // Initialize your platform adapter if configured
    this._myPlatformAdapter = null;
    this._myPlatformCommunication = null;
    
    if (config.enableMyPlatform) {
      this._myPlatformAdapter = new MyPlatformAdapter(config.myPlatformConfig || {});
      
      // Register the adapter with the agent registry
      if (this._agentRegistry) {
        this._agentRegistry.registerPlatformAdapter('my-platform', this._myPlatformAdapter);
      }
      
      // Initialize communication adapter if needed
      if (config.enableMyPlatformCommunication) {
        this._myPlatformCommunication = new MyPlatformCommunicationAdapter(
          config.myPlatformCommunicationConfig || {}
        );
        
        // Register with communication hub if needed
        if (this._communicationHub) {
          this._communicationHub.registerCommunicationAdapter(
            'my-platform', 
            this._myPlatformCommunication
          );
        }
      }
    }
  }
  
  // Add getter methods for your adapters
  getMyPlatformAdapter() {
    if (!this._myPlatformAdapter) {
      this._myPlatformAdapter = new MyPlatformAdapter();
      
      // Register with agent registry
      if (this._agentRegistry) {
        this._agentRegistry.registerPlatformAdapter('my-platform', this._myPlatformAdapter);
      }
    }
    return this._myPlatformAdapter;
  }
  
  getMyPlatformCommunicationAdapter() {
    if (!this._myPlatformCommunication) {
      this._myPlatformCommunication = new MyPlatformCommunicationAdapter();
      
      // Register with communication hub
      if (this._communicationHub) {
        this._communicationHub.registerCommunicationAdapter(
          'my-platform', 
          this._myPlatformCommunication
        );
      }
    }
    return this._myPlatformCommunication;
  }
  
  // Existing methods...
}
```

### Step 4: Update Package Dependencies

Add any required dependencies for your platform to the `package.json` file:

```json
{
  "dependencies": {
    "my-platform-sdk": "^1.0.0",
    // Other dependencies...
  }
}
```

## Adding Blockchain Network Support

To add support for a new blockchain network, follow a similar pattern:

1. Create a blockchain adapter that implements the necessary interfaces
2. Register the adapter with the framework
3. Add required dependencies

Example for a blockchain adapter:

```javascript
// intellex/adapters/my-blockchain-adapter.js

class MyBlockchainAdapter {
  constructor(config = {}) {
    this.config = config;
    this.network = config.network || 'mainnet';
    this.client = null;
    
    this._initializeBlockchain();
  }
  
  _initializeBlockchain() {
    // Initialize connection to the blockchain
    // this.client = new MyBlockchainSDK({ network: this.network });
    console.log(`Initializing connection to My Blockchain (${this.network})`);
  }
  
  async getBalance(address) {
    // Implement balance checking
    return { address, balance: '100', symbol: 'MYC' };
  }
  
  async sendTransaction(txParams) {
    // Implement transaction sending
    return { 
      txHash: `0x${Math.random().toString(16).substring(2)}`,
      status: 'submitted'
    };
  }
  
  // Other blockchain-specific methods
}

module.exports = { MyBlockchainAdapter };
```

## Testing Your Extensions

Create test files for your adapters to ensure they work correctly:

```javascript
// tests/my-platform-adapter.test.js

const { MyPlatformAdapter } = require('../intellex/adapters/my-platform-adapter');

describe('MyPlatformAdapter', () => {
  let adapter;
  
  beforeEach(() => {
    adapter = new MyPlatformAdapter({ testMode: true });
  });
  
  test('should create an agent', async () => {
    const agent = await adapter.createAgent({
      name: 'Test Agent',
      capabilities: ['test']
    });
    
    expect(agent).toBeDefined();
    expect(agent.id).toBeDefined();
    expect(agent.name).toBe('Test Agent');
    expect(agent.platform).toBe('my-platform');
  });
  
  // Add more tests for other methods
});
```

## Creating an Example

Create an example file to demonstrate how to use your extension:

```javascript
// examples/my-platform-example.js

const Intellex = require('../intellex');

async function runMyPlatformExample() {
  // Initialize Intellex with your platform enabled
  const intellex = new Intellex({
    enableMyPlatform: true,
    myPlatformConfig: {
      apiKey: 'your-api-key',
      // Other configuration options
    }
  });
  
  try {
    // Get your platform adapter
    const myPlatformAdapter = intellex.getMyPlatformAdapter();
    
    // Create an agent
    const agent = await myPlatformAdapter.createAgent({
      name: 'My Platform Agent',
      capabilities: ['feature1', 'feature2']
    });
    console.log(`Created agent: ${agent.name} (ID: ${agent.id})`);
    
    // Run the agent
    const result = await myPlatformAdapter.runAgent(agent.id, {
      input: 'Hello, agent!'
    });
    console.log(`Agent response: ${result.output}`);
    
    // Perform platform-specific operations
    const opResult = await myPlatformAdapter.performPlatformSpecificOperation({
      param1: 'value1',
      param2: 'value2'
    });
    console.log(`Operation result: ${opResult.result}`);
    
  } catch (error) {
    console.error('Error in example:', error);
  }
}

runMyPlatformExample()
  .then(() => console.log('Example completed'))
  .catch(err => console.error('Example failed:', err));
```

## Documentation

Update the README.md file to include information about your extension:

```markdown
## Platform Support

### My Platform Integration

The Intellex Framework supports integration with My Platform, allowing you to:

- Create and manage My Platform agents
- Execute agent tasks
- Communicate between My Platform agents and other agents

#### Usage

```javascript
const intellex = new Intellex({
  enableMyPlatform: true,
  myPlatformConfig: {
    apiKey: 'your-api-key'
  }
});

// Get the My Platform adapter
const myPlatformAdapter = intellex.getMyPlatformAdapter();

// Create an agent
const agent = await myPlatformAdapter.createAgent({
  name: 'My Agent',
  capabilities: ['feature1', 'feature2']
});

// Run the agent
const result = await myPlatformAdapter.runAgent(agent.id, {
  input: 'Process this data'
});
```

## Best Practices for Extensions

1. **Follow Interface Contracts**: Ensure your adapters implement all required methods from the interfaces.
2. **Error Handling**: Provide clear error messages that help users understand what went wrong.
3. **Documentation**: Document your adapter's features, configuration options, and any platform-specific behaviors.
4. **Testing**: Create comprehensive tests for your adapter to ensure reliability.
5. **Examples**: Provide example code that demonstrates how to use your adapter.
6. **Versioning**: Clearly indicate which versions of the platform your adapter supports.

## Conclusion

By following this guide, you can extend the Intellex Framework to support new agent platforms, blockchain networks, or communication protocols. The framework's modular architecture makes it easy to add new capabilities while maintaining interoperability with existing components. 