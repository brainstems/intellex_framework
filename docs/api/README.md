# Intellex Framework API Documentation

## Core API

### Framework Initialization

```javascript
const intellex = require('intellex');

// Initialize the framework
const framework = intellex.init({
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: ['ethereum', 'solana'],
  intentProcessing: true,
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `nearNetwork` | string | `'testnet'` | NEAR network to connect to ('mainnet', 'testnet') |
| `enableReputation` | boolean | `true` | Whether to enable the reputation system |
| `enableAgentDiscovery` | boolean | `false` | Whether to enable agent discovery capabilities |
| `enableNearAI` | boolean | `false` | Whether to enable NEAR AI integration |
| `enableCrewAI` | boolean | `false` | Whether to enable CrewAI integration |
| `enableActivators` | boolean | `false` | Whether to enable Activators Management integration |
| `crossChainSupport` | Array<string> | `['ethereum']` | List of blockchains to support for cross-chain operations |
| `intentProcessing` | boolean | `true` | Whether to enable intent processing |
| `verificationThreshold` | number | `0.7` | Default threshold for reputation verification |
| `confidenceThreshold` | number | `0.7` | Default threshold for intent confidence |
| `nearAIApiKey` | string | `null` | API key for NEAR AI services |
| `nearAIDiscoveryApiKey` | string | `null` | API key for NEAR AI Discovery network |
| `activatorsApiKey` | string | `null` | API key for Activators Management Platform |
| `activatorsPlatformUrl` | string | `'https://api.activators.near.org'` | URL of the Activators Management Platform |
| `autoInitialize` | boolean | `false` | Whether to automatically initialize integrations on startup |

## Agent Management

### Creating an Agent

```javascript
const agent = framework.createAgent({
  name: 'MyAgent',
  capabilities: ['text-processing', 'data-analysis'],
  reputationThreshold: 0.8,
});
```

### Agent Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | Auto-generated | Name of the agent |
| `capabilities` | Array<string> | `[]` | List of agent capabilities |
| `reputationThreshold` | number | `0.5` | Minimum reputation score required for operation |

### Agent Methods

#### Deploy

Deploy the agent to the network.

```javascript
const deployResult = await agent.deploy();
```

#### Execute Task

Execute a task with the agent.

```javascript
const taskResult = await agent.executeTask({
  type: 'data-analysis',
  data: { values: [1, 2, 3, 4, 5] },
  options: { method: 'average' },
});
```

#### Update Configuration

Update the agent's configuration.

```javascript
const updatedAgent = agent.updateConfig({
  name: 'UpdatedAgentName',
  capabilities: ['text-processing', 'data-analysis', 'image-recognition'],
});
```

#### Deactivate

Deactivate the agent.

```javascript
const deactivateResult = agent.deactivate();
```

## Reputation System

### Accessing the Reputation System

```javascript
const reputationSystem = framework.getReputationSystem();
```

### Reputation Methods

#### Register Agent

Register an agent with the reputation system.

```javascript
const registrationResult = reputationSystem.registerAgent(agentId, initialScore);
```

#### Submit Rating

Submit a rating for an agent.

```javascript
reputationSystem.submitRating(agentId, rating, raterId, evidence);
```

#### Get Reputation Score

Get the current reputation score for an agent.

```javascript
const score = reputationSystem.getReputationScore(agentId);
```

#### Get Reputation History

Get the reputation history for an agent.

```javascript
const history = reputationSystem.getReputationHistory(agentId);
```

#### Verify Agent Reputation

Verify if an agent meets the reputation threshold.

```javascript
const isVerified = reputationSystem.verifyAgentReputation(agentId, threshold);
```

#### Submit to Blockchain

Submit reputation data to the blockchain for verification.

```javascript
const blockchainResult = await reputationSystem.submitToBlockchain(agentId);
```

## Agent Discovery

### Accessing the Agent Discovery

```javascript
const agentDiscovery = framework.getNearAIDiscovery();
```

### Agent Discovery Methods

#### Discover Agents

Discover agents based on capabilities, reputation, and other criteria.

```javascript
const agents = await framework.discoverAgents({
  capabilities: ['data_analysis', 'market_research'],
  minReputationScore: 0.75,
  limit: 5
});
```

#### Get Agent Capabilities

Get detailed capabilities for a specific agent.

```javascript
const capabilities = await framework.getAgentCapabilities(agentId);
```

#### Get Agent History

Retrieve the task execution history for an agent.

```javascript
const history = await framework.getAgentHistory(agentId);
```

#### Register Agent Capabilities

Register or update an agent's capabilities.

```javascript
await framework.registerAgentCapabilities(agentId, 
  ['data_analysis', 'visualization', 'prediction'],
  { specialization: 'financial_data', experience_level: 'expert' }
);
```

#### Record Agent Task

Record a completed task for an agent's history and reputation.

```javascript
await framework.recordAgentTask(agentId, {
  taskId: 'task-123',
  description: 'Market analysis for product launch',
  success: true,
  performanceMetrics: {
    accuracy: 0.92,
    timeliness: 0.85
  },
  evidence: {
    outputUrl: 'https://example.com/results/task-123'
  }
});
```

#### Verify Agent

Verify an agent's identity, capabilities, and reputation.

```javascript
const verificationResult = await framework.verifyAgent(agentId, {
  verificationLevel: 'high',
  requiredCapabilities: ['data_analysis'],
  minReputationScore: 0.8
});
```

## Activators Management

### Accessing the Activators Management

```javascript
const activatorsManagement = framework.getActivatorsManagement();
```

### Activators Methods

#### Create Activator

Create a new activator based on a base agent.

```javascript
const activator = await activatorsManagement.createActivator({
  name: 'Marketing Campaign Manager',
  baseAgentId: 'base-agent-123',
  description: 'Manages marketing campaign activations',
  capabilities: [
    'activation_management',
    'task_coordination',
    'quality_assurance'
  ],
  configuration: {
    taskValidation: true,
    autoPayment: true
  }
}, {
  deploymentRegion: 'us-west',
  highAvailability: true
});
```

#### List Activators

List available activators with optional filtering.

```javascript
const activators = await activatorsManagement.listActivators({
  capabilities: ['activation_management'],
  status: 'active'
});
```

#### Assign Task to Activator

Assign a task to an activator.

```javascript
const taskAssignment = await activatorsManagement.assignTask(activatorId, {
  id: 'task-001',
  name: 'Market Research',
  description: 'Conduct market research for new product',
  deliverables: ['Market research report', 'Competitor analysis'],
  compensation: 1000, // in NEAR tokens
  deadline: new Date('2023-12-31'),
  validationCriteria: {
    comprehensiveness: 0.8,
    accuracy: 0.85
  },
  assignedAgentIds: ['agent-1', 'agent-2']
});
```

#### Connect Activator to Agent

Connect an activator with a specialized agent.

```javascript
const connection = await activatorsManagement.connectActivatorToAgent(
  activatorId,
  agentId,
  {
    role: 'specialist',
    permissions: ['task_execution', 'communication'],
    compensationModel: {
      type: 'task-based',
      currency: 'NEAR'
    }
  }
);
```

#### Get Activator Details

Get detailed information about an activator.

```javascript
const activatorDetails = await activatorsManagement.getActivatorDetails(activatorId);
```

#### Get Activator Metrics

Get performance metrics for an activator.

```javascript
const metrics = await activatorsManagement.getActivatorMetrics(activatorId);
```

#### Stake on Activator

Stake tokens on an activator for governance or incentive alignment.

```javascript
const stakingResult = await activatorsManagement.stakeOnActivator(
  activatorId,
  {
    amount: '100', // NEAR tokens
    duration: 30, // days
    purpose: 'performance_incentive'
  }
);
```

## Intent Processing

### Accessing the Intent Processor

```javascript
const intentProcessor = framework.getIntentProcessor();
```

### Intent Methods

#### Process Text

Process natural language text and execute the corresponding intent.

```javascript
const result = await intentProcessor.processText(text, confidenceThreshold);
```

#### Parse Intent

Parse natural language text into an intent.

```javascript
const intent = await intentProcessor.parseIntent(text);
```

#### Register Intent Handler

Register a custom intent handler.

```javascript
intentProcessor.registerIntentHandler(intentType, handler);
```

## Cross-Chain Bridge

### Accessing the Cross-Chain Bridge

```javascript
const crossChainBridge = framework.getCrossChainBridge();
```

### Cross-Chain Methods

#### Get Supported Chains

Get supported blockchain networks.

```javascript
const supportedChains = crossChainBridge.getSupportedChains();
```

#### Check Chain Support

Check if a blockchain network is supported.

```javascript
const isSupported = crossChainBridge.isChainSupported(chain);
```

#### Send Transaction

Send a transaction to a blockchain network.

```javascript
const txResult = await crossChainBridge.sendTransaction(chain, transaction);
```

#### Get Balance

Get balance from a blockchain network.

```javascript
const balance = await crossChainBridge.getBalance(chain, address);
```

#### Transfer Cross-Chain

Transfer assets between different blockchain networks.

```javascript
const transferResult = await crossChainBridge.transferCrossChain(
  sourceChain,
  targetChain,
  transferData
);
```

#### Get Transaction

Get transaction status.

```javascript
const transaction = crossChainBridge.getTransaction(txHash);
```

## NEAR Integration

### Accessing the NEAR Integration

```javascript
const nearIntegration = framework.getNearIntegration();
```

### NEAR Methods

#### Create Account

Create a new NEAR account.

```javascript
const account = await nearIntegration.createAccount(accountId, options);
```

#### Get Account

Get a NEAR account.

```javascript
const account = nearIntegration.getAccount(accountId);
```

#### Deploy Contract

Deploy a contract to NEAR.

```javascript
const contract = await nearIntegration.deployContract(accountId, contractCode, options);
```

#### Call Contract

Call a contract method.

```javascript
const callResult = await nearIntegration.callContract(contractId, method, args, options);
```

#### View Contract

View a contract method (read-only call).

```javascript
const viewResult = await nearIntegration.viewContract(contractId, method, args);
```

#### Transfer Tokens

Transfer NEAR tokens.

```javascript
const transferResult = await nearIntegration.transferTokens(senderAccountId, receiverAccountId, amount);
```

#### Get Network Status

Get network status.

```javascript
const status = await nearIntegration.getNetworkStatus();
```

#### Get Contract Metadata

Get contract metadata.

```javascript
const metadata = await nearIntegration.getContractMetadata(contractId);
```

## Utility Functions

### Accessing Utilities

```javascript
const utils = intellex.utils;
```

### Available Utilities

- `generateId(prefix)`: Generate a random ID with a specified prefix
- `formatTimestamp(timestamp)`: Format a timestamp as an ISO string
- `isValidEthereumAddress(address)`: Validate an Ethereum address
- `isValidNearAccountId(accountId)`: Validate a NEAR account ID
- `truncateString(str, maxLength, suffix)`: Truncate a string to a specified length
- `deepClone(obj)`: Deep clone an object
- `sleep(ms)`: Sleep for a specified duration
- `retry(fn, maxRetries, initialDelay)`: Retry a function with exponential backoff
- `formatCurrency(amount, currency, locale)`: Format a number as a currency string
- `yoctoToNear(yoctoNear)`: Convert from yoctoNEAR to NEAR
- `nearToYocto(near)`: Convert from NEAR to yoctoNEAR 