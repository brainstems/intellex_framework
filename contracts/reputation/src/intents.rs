use near_sdk::{env, json_types::Base64VecU8};

#[derive(BorshDeserialize, BorshSerialize)]
pub struct IntentData {
    intent_id: String,
    agent_id: AccountId,
    client_id: AccountId,
    intent_type: String,
    parameters: String,
    status: IntentStatus,
    timestamp: u64,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq)]
pub enum IntentStatus {
    Created,
    InProgress,
    Completed,
    Failed,
}

impl AgentReputationContract {
    // Record a new intent being handled by an agent
    pub fn record_intent(&mut self, intent_id: String, agent_id: AccountId, intent_type: String, parameters: String) {
        let client_id = env::predecessor_account_id();
        
        // Ensure agent exists
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        
        // Create and store intent data
        let intent_data = IntentData {
            intent_id: intent_id.clone(),
            agent_id: agent_id.clone(),
            client_id: client_id.clone(),
            intent_type,
            parameters,
            status: IntentStatus::Created,
            timestamp: env::block_timestamp(),
        };
        
        // In a production system, you'd store this in a data structure
        // For simplicity in this example, we'll just emit an event
        env::log_str(&format!("Intent created: {}", intent_id));
    }
    
    // Update intent status and adjust reputation accordingly
    pub fn update_intent_status(&mut self, intent_id: String, status: String, result: Option<String>) {
        let agent_id = env::predecessor_account_id();
        
        // Ensure agent exists
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        
        // Convert status string to enum
        let status_enum = match status.as_str() {
            "completed" => IntentStatus::Completed,
            "failed" => IntentStatus::Failed,
            "in_progress" => IntentStatus::InProgress,
            _ => panic!("Invalid status"),
        };
        
        // In a real implementation, you would:
        // 1. Retrieve the intent from storage
        // 2. Verify the agent is authorized to update it
        // 3. Update the intent status
        
        // If intent was completed or failed, update agent reputation
        if status_enum == IntentStatus::Completed || status_enum == IntentStatus::Failed {
            let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
            
            // Update interaction counts
            agent_rep.total_interactions += 1;
            if status_enum == IntentStatus::Completed {
                agent_rep.successful_interactions += 1;
            }
            
            // The client would still need to provide explicit feedback
            // for a more nuanced reputation update
            
            // Update the agent reputation
            self.agent_reputations.insert(&agent_id, &agent_rep);
        }
        
        // Log the update
        env::log_str(&format!("Intent {} updated to {}", intent_id, status));
    }
} 