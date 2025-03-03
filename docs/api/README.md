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
| `crossChainSupport` | Array<string> | `['ethereum']` | List of blockchains to support for cross-chain operations |
| `intentProcessing` | boolean | `true` | Whether to enable intent processing |
| `verificationThreshold` | number | `0.7` | Default threshold for reputation verification |
| `confidenceThreshold` | number | `0.7` | Default threshold for intent confidence |

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