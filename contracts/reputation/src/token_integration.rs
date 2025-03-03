use near_sdk::{env, Promise, PromiseResult};
use near_sdk::json_types::U128;
use near_sdk::serde_json::json;

impl AgentReputationContract {
    // Handle token staking via cross-contract call
    pub fn stake_itlx(&mut self, amount: U128) -> Promise {
        let agent_id = env::predecessor_account_id();
        
        // Cross-contract call to transfer tokens from user to this contract
        let transfer_call = Promise::new(self.token_contract_id.clone())
            .function_call(
                "ft_transfer_call".to_string(),
                json!({
                    "receiver_id": env::current_account_id(),
                    "amount": amount,
                    "msg": "stake"
                }).to_string().into_bytes(),
                1, // 1 yoctoNEAR
                env::prepaid_gas() / 3
            );
            
        // After transfer, update staking record
        transfer_call.then(
            Promise::new(env::current_account_id())
                .function_call(
                    "on_stake_complete".to_string(),
                    json!({
                        "agent_id": agent_id,
                        "amount": amount
                    }).to_string().into_bytes(),
                    0,
                    env::prepaid_gas() / 3
                )
        )
    }
    
    // Callback after staking
    pub fn on_stake_complete(&mut self, agent_id: AccountId, amount: U128) {
        // Verify callback is from previous cross-contract call
        assert_eq!(env::predecessor_account_id(), env::current_account_id(), "Unauthorized");
        
        // Check if the transfer was successful
        match env::promise_result(0) {
            PromiseResult::Successful(_) => {
                // Update agent stake
                let current_stake = self.agent_stakes.get(&agent_id).unwrap_or(0);
                self.agent_stakes.insert(&agent_id, &(current_stake + amount.0));
                
                // Boost reputation if this is a significant stake
                if self.agent_reputations.contains_key(&agent_id) {
                    let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
                    // Apply stake-based reputation boost (optional)
                    // For example, give small boosts for maintaining significant stake
                    self.agent_reputations.insert(&agent_id, &agent_rep);
                }
            },
            _ => {
                // Handle failure case
                env::log_str("Token staking failed");
            }
        }
    }
    
    // Unstake tokens (with potential reputation penalty)
    pub fn unstake_itlx(&mut self, amount: U128) -> Promise {
        let agent_id = env::predecessor_account_id();
        
        // Check if agent has enough staked
        let current_stake = self.agent_stakes.get(&agent_id).unwrap_or(0);
        assert!(current_stake >= amount.0, "Not enough staked tokens");
        
        // Update stake amount first
        self.agent_stakes.insert(&agent_id, &(current_stake - amount.0));
        
        // Check if remaining stake is below minimum and agent is registered
        if current_stake - amount.0 < self.min_stake_amount && self.agent_reputations.contains_key(&agent_id) {
            // Apply reputation penalty for going below minimum stake
            let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
            if agent_rep.score > 5 {
                agent_rep.score -= 5; // Penalty for unstaking below minimum
            }
            self.agent_reputations.insert(&agent_id, &agent_rep);
        }
        
        // Transfer tokens back to agent
        Promise::new(self.token_contract_id.clone())
            .function_call(
                "ft_transfer".to_string(),
                json!({
                    "receiver_id": agent_id,
                    "amount": amount,
                }).to_string().into_bytes(),
                1, // 1 yoctoNEAR
                env::prepaid_gas() / 2
            )
    }
} 