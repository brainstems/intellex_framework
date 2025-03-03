# Intellex Framework: Interoperability Between Agents on Different Platforms

> **BETA STATUS DISCLAIMER**: The Intellex Framework is currently in beta development and is a work in progress. It is NOT recommended for production use yet. API changes and breaking modifications may occur without prior notice. Use at your own risk for experimental and development purposes only.

The Intellex Framework enables interoperability between intelligent agents on different platforms, allowing them to communicate, coordinate, and work together seamlessly. It provides a standardized way for agents to interact regardless of their underlying implementation.

## Overview

Intellex Framework provides a comprehensive solution for developing applications that leverage blockchain technologies and AI agents, with a special focus on interoperability between agents on different platforms (CrewAI, NEAR AI, SUI Blockchain, etc.). The framework simplifies complex blockchain interactions and agent communications, enabling developers to build sophisticated multi-agent systems with minimal effort.

## Features

- **Agent Interoperability**: Standardized interfaces for agents across different platforms:
  - **Unified Agent Interface**: Common interface for creating, running, and managing agents regardless of platform.
  - **Cross-Platform Communication**: Seamless communication between agents on different platforms.
  - **Reputation Tracking**: Track and manage agent reputation across platforms.

- **Platform Support**:
  - **CrewAI Integration**: Orchestrate multiple agents to work together on complex tasks.
  - **NEAR AI Integration**: Leverage NEAR AI's agent toolkit for building autonomous agents.
  - **SUI Blockchain Integration**: Create and manage agents on the SUI blockchain.
  - **Extensible Architecture**: Add support for new platforms through the adapter pattern.

- **NEAR Protocol Integration**: Seamless integration with NEAR Protocol, including support for accounts, access keys, and contract interactions.

- **Chain Abstraction Support**: Implementation of NEAR's Chain Abstraction features:
  - **Intents**: Create, sign, and process intents for various blockchain operations.
  - **Chain Signatures**: Cross-chain signature verification and validation.
  - **OmniBridge**: Facilitate cross-chain communication and asset transfers.

- **AITP Integration**: Implement the Agent Interaction & Transaction Protocol for secure agent communication:
  - **Chat Threads**: Create and manage threads for agent communication.
  - **Capabilities**: Support for payments, data requests, decisions, and wallet integrations.
  - **Service Agents**: Connect with and discover service agents.

- **Cross-Chain Operations**: Execute transactions across different blockchain networks.
- **Reputation System**: Track and manage agent reputation across platforms.
- **Intent Processing**: Process and execute intents across different platforms.
- **CrewAI Integration**: Orchestrate multiple agents for complex tasks.
- **Emergent Intelligence**: Support for stigmergic and stochastic agent systems that exhibit self-organizing behavior.

## Installation

```bash
npm install intellex-framework
```

## Dependencies

The framework relies on the following key dependencies:

- `near-sdk-js`: For NEAR Protocol interactions
- `near-wallet-selector`: For wallet integration
- `near-chain-configs`: For NEAR network configuration
- `@aurora-is-near/engine`: For Aurora integration
- `tweetnacl`: For cryptographic operations
- `borsh`: For binary serialization
- `crewai`: For CrewAI agent orchestration
- `aitp`: For agent communication

## Quick Start

```javascript
// Import the framework
const intellex = require('intellex-framework');

// Initialize the framework
const framework = intellex.init({
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: ['ethereum', 'near', 'sui'],
  intentProcessing: true,
});

// Create agents on different platforms
async function createAgents() {
  // Create a CrewAI agent
  const crewAIAgent = await framework.createAgent('crewai', {
    name: 'Research Assistant',
    role: 'Research Assistant',
    goal: 'Find and analyze information',
    tools: ['web-search', 'document-analysis'],
  });
  
  // Create a NEAR AI agent
  const nearAIAgent = await framework.createAgent('nearai', {
    name: 'Blockchain Expert',
    role: 'Blockchain Expert',
    goal: 'Provide expertise on blockchain technologies',
    modelId: 'near-ai-blockchain',
  });
  
  // Connect agents across platforms
  const connection = await framework.connectAgents(
    crewAIAgent.id,
    nearAIAgent.id,
    { title: 'Research and Blockchain Expertise Collaboration' }
  );
  
  // Run an agent to perform a task
  const result = await framework.runAgent(crewAIAgent.id, {
    description: 'Research the latest developments in blockchain interoperability',
    context: {
      focus_areas: ['cross-chain communication', 'bridge technologies'],
    },
  });
  
  console.log(`Task result: ${result.result}`);
}

createAgents().catch(console.error);
```

## Core Components

### Agent Registry

The Agent Registry provides a central registry for managing agents across different platforms:

```javascript
// Get the agent registry
const agentRegistry = framework.getAgentRegistry();

// Register a custom adapter
await framework.registerAdapter('custom-platform', customAdapter);

// Create an agent
const agent = await framework.createAgent('crewai', {
  name: 'Research Assistant',
  role: 'Research Assistant',
  goal: 'Find and analyze information',
});

// Get all agents
const allAgents = await framework.getAllAgents();
```

### Agent Adapters

Agent adapters implement the standard agent interface for specific platforms:

```javascript
// CrewAI adapter is registered automatically
const crewAIAgent = await framework.createAgent('crewai', {
  name: 'Research Assistant',
  role: 'Research Assistant',
  goal: 'Find and analyze information',
});

// NEAR AI adapter is registered automatically
const nearAIAgent = await framework.createAgent('nearai', {
  name: 'Blockchain Expert',
  role: 'Blockchain Expert',
  goal: 'Provide expertise on blockchain technologies',
});

// SUI Blockchain adapter is registered if suiProvider is configured
const suiAgent = await framework.createAgent('sui', {
  name: 'Transaction Processor',
  role: 'Transaction Processor',
  goal: 'Process blockchain transactions',
  address: '0xsui_address',
});
```

### Communication Adapter

The Communication Adapter provides a standard interface for agent communication:

```javascript
// Get the communication adapter
const communicationAdapter = framework.getCommunicationAdapter();

// Create a thread
const thread = await communicationAdapter.createThread({
  title: 'Discussion Thread',
  participants: [agent1.id, agent2.id],
});

// Add a message to the thread
await communicationAdapter.addMessage(thread.id, {
  role: 'assistant',
  content: 'Hello, how can I help you?',
});
```

### NEAR Integration

The NEAR integration module provides a comprehensive set of functions for interacting with the NEAR Protocol:

```javascript
// Get the NEAR integration
const nearIntegration = framework.getNearIntegration();

// Create a NEAR account
const account = await nearIntegration.createAccount('example.testnet', {
  accessKeys: [{ publicKey: 'ed25519:YOUR_PUBLIC_KEY', permission: 'FullAccess' }],
});
```

## Documentation

The Intellex Framework includes comprehensive documentation to help you get started and make the most of its capabilities:

- [Getting Started Guide](docs/guides/getting-started.md) - A step-by-step guide to setting up and using the framework
- [API Documentation](docs/api/README.md) - Detailed API reference for all framework components
- [Architecture Overview](docs/architecture.md) - Visual diagrams and explanations of the framework's architecture
- [Security Considerations](docs/security.md) - Best practices for securing your implementation
- [Extending the Framework](docs/extending-framework.md) - Guide to adding support for new platforms and protocols
- [Development Roadmap](docs/roadmap.md) - Future plans and milestones for the framework

## Examples

The framework includes several example implementations to demonstrate its capabilities:

- [Basic Example](examples/basic-example.js) - Simple demonstration of core functionality
- [Agent Example](examples/agent-example.js) - Working with agents and the reputation system
- [NEAR Integration Example](examples/near-integration-example.js) - Integrating with NEAR Protocol
- [Cross-Chain Example](examples/cross-chain-example.js) - Performing cross-chain operations
- [NEAR AI Example](examples/near-ai-example.js) - Working with NEAR AI agents
- [AITP Example](examples/aitp-example.js) - Using the Agent Interaction & Transaction Protocol
- [CrewAI Example](examples/crewai-example.js) - Integrating with CrewAI for agent orchestration
- [Interoperability Example](examples/interoperability-example.js) - Demonstrating cross-platform agent communication
- [Comprehensive Example](examples/comprehensive-example.js) - Full demonstration of all framework capabilities
- [Emergent Swarm Example](examples/emergent-swarm-example.js) - Demonstrating stigmergic and stochastic agent systems

## Extending the Framework

You can extend the framework to support new platforms by implementing the agent interface:

```javascript
const { AgentInterface } = require('intellex-framework');

class CustomPlatformAdapter extends AgentInterface {
  // Implement the required methods
  async createAgent(config) {
    // Implementation
  }
  
  async runAgent(agentId, task, options) {
    // Implementation
  }
  
  // ... other methods
}

// Register the adapter
await framework.registerAdapter('custom-platform', new CustomPlatformAdapter());
```

## Contributing

We welcome contributions to the Intellex Framework! As this is a beta project under active development, your feedback and contributions are especially valuable.

### Ways to Contribute

- **Report Bugs**: Submit issues for any bugs you encounter
- **Suggest Features**: Propose new features or improvements
- **Submit Pull Requests**: Contribute code or documentation improvements
- **Review Pull Requests**: Help review and test other contributors' pull requests
- **Improve Documentation**: Help make our docs better through corrections or additions
- **Share Use Cases**: Tell us how you're using or planning to use the framework

### Contribution Process

1. **Fork the Repository**: Create your own fork of the project
2. **Create a Branch**: Make your changes in a new branch
3. **Submit a Pull Request**: Open a PR from your branch to our main branch
4. **Code Review**: Maintainers will review your changes
5. **Merge**: Once approved, your contribution will be merged

Please read our [Contributing Guide](CONTRIBUTING.md) for more detailed information on our contribution process and coding standards.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/brainstems/intellex-framework.git

# Navigate to the project directory
cd intellex-framework

# Install dependencies
npm install

# Run tests
npm test
```

## License

[MIT License](LICENSE) - see the LICENSE file for details.

## Contact

For questions, feedback, or discussions about the Intellex Framework:

- Create an issue on [GitHub](https://github.com/brainstems/intellex-framework/issues)
- Join our [Discord community](https://discord.gg/S5C6CvqKwz)
- Follow us on [Twitter](https://twitter.com/intellex_xyz)
- Join us on [Telegram](https://t.me/Intellex_ai)

---

<div align="center">
  <p><strong>⚠️ BETA SOFTWARE - NOT FOR PRODUCTION USE ⚠️</strong></p>
  <p>The Intellex Framework is still in active development. APIs may change without warning.</p>
</div>

# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, religion, or sexual identity
and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

* Demonstrating empathy and kindness toward other people
* Being respectful of differing opinions, viewpoints, and experiences
* Giving and gracefully accepting constructive feedback
* Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
* Focusing on what is best not just for us as individuals, but for the
  overall community

Examples of unacceptable behavior include:

* The use of sexualized language or imagery, and sexual attention or
  advances of any kind
* Trolling, insulting or derogatory comments, and personal or political attacks
* Public or private harassment
* Publishing others' private information, such as a physical or email
  address, without their explicit permission
* Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

Project maintainers are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

## Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the project maintainers responsible for enforcement at
[maintainers@intellex.xyz].
All complaints will be reviewed and investigated promptly and fairly.

## Attribution

This Code of Conduct is adapted from the Contributor Covenant.
