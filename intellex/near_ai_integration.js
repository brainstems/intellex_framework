// Integration with NEAR AI platform
import { NearAI, AgentRegistry } from 'near-ai-sdk';

class IntellexAgentAdapter {
  constructor(config) {
    this.nearAI = new NearAI(config.networkId, config.nodeUrl);
    this.agentRegistry = new AgentRegistry(config.registryAccountId);
    this.reputationContract = config.reputationContractId;
  }

  // Register a new agent with the reputation system
  async registerAgent(agentId, specializations, accountId) {
    // First check if agent exists in NEAR AI registry
    const agentExists = await this.agentRegistry.hasAgent(agentId);
    
    if (!agentExists) {
      throw new Error('Agent must be registered with NEAR AI first');
    }
    
    // Get agent metadata from NEAR AI
    const agentMetadata = await this.agentRegistry.getAgentMetadata(agentId);
    
    // Register with our reputation system using existing metadata
    const transaction = await this.nearAI.createTransaction({
      receiverId: this.reputationContract,
      actions: [{
        type: 'FunctionCall',
        params: {
          methodName: 'register_agent',
          args: {
            agent_id: agentId,
            specializations: specializations || agentMetadata.capabilities || [],
          },
          gas: '100000000000000',
          deposit: '0'
        }
      }]
    });
    
    return this.nearAI.signAndSendTransaction(transaction, accountId);
  }

  // Fetch agent data combining NEAR AI data with reputation data
  async getAgentWithReputation(agentId) {
    const [agentData, reputationData] = await Promise.all([
      this.agentRegistry.getAgentMetadata(agentId),
      this.nearAI.view({
        contractId: this.reputationContract,
        methodName: 'get_agent_reputation_detailed',
        args: { agent_id: agentId }
      })
    ]);
    
    return {
      ...agentData,
      reputation: reputationData || null
    };
  }
} 