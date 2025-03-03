use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, Promise};
use near_sdk::json_types::U128;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct AgentReputationContract {
    // Contract owner
    owner_id: AccountId,
    
    // ITLX token contract
    token_contract_id: AccountId,
    
    // Map of agent ID to its reputation data
    agent_reputations: UnorderedMap<AccountId, AgentReputation>,
    
    // Map of agent ID to its staked ITLX amount
    agent_stakes: LookupMap<AccountId, Balance>,
    
    // Minimum stake required to register an agent
    min_stake_amount: Balance,
    
    // Feedback expiration period in nanoseconds (e.g., 30 days)
    feedback_expiry_period: u64,
    
    // NEAR AI registry contract for verifying agents
    near_ai_registry: AccountId,
    
    // NEAR Intents processor for intent verification
    intents_processor: AccountId,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AgentReputation {
    // Reputation score (0-100)
    score: u32,
    
    // Total interactions handled
    total_interactions: u64,
    
    // Successful interactions
    successful_interactions: u64,
    
    // Vector of feedback entries with timestamps
    feedback_history: Vec<FeedbackEntry>,
    
    // Timestamp of last reputation update
    last_update: u64,
    
    // Categories the agent specializes in
    specializations: Vec<String>,
    
    // Average scores by category
    category_scores: CategoryRatings,
    
    // Add this new field
    violation_history: Vec<ViolationRecord>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct FeedbackEntry {
    // User who provided feedback
    user_id: AccountId,
    
    // Overall rating (0-5)
    rating: u8,
    
    // Categorized ratings (all 0-5)
    category_ratings: CategoryRatings,
    
    // Optional feedback message
    message: Option<String>,
    
    // Timestamp when feedback was submitted
    timestamp: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Default, near_sdk::serde::Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct CategoryRatings {
    // Accuracy of the agent's responses/actions
    accuracy: u8,
    
    // Speed/response time
    response_time: u8,
    
    // Quality of communication
    communication: u8,
    
    // Problem-solving ability
    problem_solving: u8,
    
    // Ethical behavior
    ethics: u8,
}

// Add these enums to define violation types
#[derive(BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum ViolationType {
    MinorInfraction,    // Minor errors or issues
    MajorInfraction,    // Major errors or poor performance
    TermsViolation,     // Violation of terms of service
    EthicalViolation,   // Ethical violations
    SecurityBreach      // Security breach or attack
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct ViolationRecord {
    violation_type: ViolationType,
    reporter: AccountId,
    description: String,
    evidence: Option<String>,
    timestamp: u64,
    penalty_applied: u32, // Reputation points deducted
    tokens_slashed: Balance,
}

#[near_bindgen]
impl AgentReputationContract {
    #[init]
    pub fn new(owner_id: AccountId, token_contract_id: AccountId, min_stake_amount: Balance) -> Self {
        Self {
            owner_id,
            token_contract_id,
            agent_reputations: UnorderedMap::new(b"a"),
            agent_stakes: LookupMap::new(b"s"),
            min_stake_amount,
            feedback_expiry_period: 30 * 24 * 60 * 60 * 1_000_000_000, // 30 days in nanoseconds
            near_ai_registry: AccountId::new_unchecked("".to_string()),
            intents_processor: AccountId::new_unchecked("".to_string()),
        }
    }
    
    // Register a new AI agent with initial stake
    pub fn register_agent(&mut self, agent_id: AccountId, specializations: Vec<String>) {
        // Check if caller is the agent owner or authorized entity
        assert_eq!(env::predecessor_account_id(), agent_id, "Only agent can register itself");
        
        // Ensure agent isn't already registered
        assert!(!self.agent_reputations.contains_key(&agent_id), "Agent already registered");
        
        // Ensure agent has staked the minimum amount (would be handled via cross-contract call)
        // For now, we're simplifying by assuming the stake transaction happens separately
        
        // Initialize agent reputation
        let agent_reputation = AgentReputation {
            score: 50, // Start with neutral reputation
            total_interactions: 0,
            successful_interactions: 0,
            feedback_history: Vec::new(),
            last_update: env::block_timestamp(),
            specializations,
            category_scores: CategoryRatings::default(),
            violation_history: Vec::new(),
        };
        
        self.agent_reputations.insert(&agent_id, &agent_reputation);
    }
    
    // Add feedback for an agent after interaction
    pub fn add_feedback(
        &mut self, 
        agent_id: AccountId, 
        rating: u8, 
        category_ratings: CategoryRatings, 
        message: Option<String>
    ) {
        let user_id = env::predecessor_account_id();
        
        // Ensure agent exists
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        
        // Ensure ratings are valid (0-5)
        assert!(rating <= 5, "Rating must be between 0 and 5");
        assert!(category_ratings.accuracy <= 5, "Accuracy rating must be between 0 and 5");
        assert!(category_ratings.response_time <= 5, "Response time rating must be between 0 and 5");
        assert!(category_ratings.communication <= 5, "Communication rating must be between 0 and 5");
        assert!(category_ratings.problem_solving <= 5, "Problem solving rating must be between 0 and 5");
        assert!(category_ratings.ethics <= 5, "Ethics rating must be between 0 and 5");
        
        let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
        
        // Add feedback entry
        let feedback = FeedbackEntry {
            user_id,
            rating,
            category_ratings,
            message,
            timestamp: env::block_timestamp(),
        };
        
        agent_rep.feedback_history.push(feedback);
        
        // Update interaction counts
        agent_rep.total_interactions += 1;
        if rating >= 3 {
            agent_rep.successful_interactions += 1;
        }
        
        // Recalculate reputation score and category averages
        self.recalculate_reputation_with_categories(&mut agent_rep);
        
        // Update agent reputation
        agent_rep.last_update = env::block_timestamp();
        self.agent_reputations.insert(&agent_id, &agent_rep);
    }
    
    // Internal function to recalculate reputation score
    fn recalculate_reputation(&self, agent_rep: &mut AgentReputation) {
        if agent_rep.total_interactions == 0 {
            return;
        }
        
        // Filter out expired feedback
        let current_time = env::block_timestamp();
        let valid_feedback: Vec<&FeedbackEntry> = agent_rep.feedback_history
            .iter()
            .filter(|f| current_time - f.timestamp <= self.feedback_expiry_period)
            .collect();
        
        // Simple weighted calculation (can be enhanced with more complex algorithms)
        let mut total_rating = 0;
        let mut weight_sum = 0;
        
        for (i, feedback) in valid_feedback.iter().enumerate() {
            // More recent feedback gets higher weight
            let weight = i as u32 + 1;
            total_rating += (feedback.rating as u32) * weight;
            weight_sum += weight;
        }
        
        if weight_sum > 0 {
            // Normalize to 0-100 scale
            let raw_score = (total_rating * 20) / weight_sum; // Convert from 0-5 to 0-100
            
            // Apply success rate modifier
            let success_rate = (agent_rep.successful_interactions * 100) / agent_rep.total_interactions;
            
            // Get stake-based bonus
            let stake_bonus = self.calculate_stake_bonus(env::predecessor_account_id());
            
            // Final score with stake weight (capped at 100)
            let combined_score = (raw_score + success_rate as u32) / 2;
            agent_rep.score = std::cmp::min(combined_score + stake_bonus, 100);
        }
    }
    
    // Calculate reputation bonus based on staked amount
    fn calculate_stake_bonus(&self, agent_id: AccountId) -> u32 {
        let stake = self.agent_stakes.get(&agent_id).unwrap_or(0);
        let min_stake = self.min_stake_amount;
        
        if stake < min_stake {
            return 0;
        }
        
        // Calculate bonus (max 15 points)
        // Scale based on multiples of minimum stake
        let stake_multiple = stake / min_stake;
        match stake_multiple {
            0 => 0,
            1 => 3,  // 3% bonus for minimum stake
            2 => 6,  // 6% bonus for 2x minimum stake
            3 => 9,  // 9% bonus for 3x minimum stake
            4 => 12, // 12% bonus for 4x minimum stake
            _ => 15, // 15% max bonus for 5x+ minimum stake
        }
    }
    
    // Update token_integration.rs on_stake_complete function to recalculate reputation
    // This is a new function to be added
    pub fn update_reputation_on_stake_change(&mut self, agent_id: AccountId) {
        if self.agent_reputations.contains_key(&agent_id) {
            let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
            self.recalculate_reputation(&mut agent_rep);
            self.agent_reputations.insert(&agent_id, &agent_rep);
        }
    }
    
    // Stake ITLX tokens to boost reputation
    pub fn stake_tokens(&mut self, amount: Balance) {
        let agent_id = env::predecessor_account_id();
        
        // Would implement cross-contract call to token contract
        // For now, simplified implementation
        
        let current_stake = self.agent_stakes.get(&agent_id).unwrap_or(0);
        self.agent_stakes.insert(&agent_id, &(current_stake + amount));
    }
    
    // Get agent reputation
    pub fn get_agent_reputation(&self, agent_id: AccountId) -> Option<AgentReputationView> {
        self.agent_reputations.get(&agent_id).map(|rep| {
            AgentReputationView {
                score: rep.score,
                total_interactions: rep.total_interactions,
                successful_interactions: rep.successful_interactions,
                specializations: rep.specializations,
                last_update: rep.last_update,
            }
        })
    }
    
    // Get the trust level based on reputation score
    pub fn get_trust_level(&self, score: u32) -> TrustLevel {
        match score {
            0..=30 => TrustLevel::Novice,
            31..=50 => TrustLevel::Apprentice,
            51..=75 => TrustLevel::Trusted,
            76..=90 => TrustLevel::Expert,
            _ => TrustLevel::Master,
        }
    }
    
    // Get the capability limits based on trust level
    pub fn get_capability_limits(&self, agent_id: AccountId) -> Option<CapabilityLimits> {
        if let Some(agent_rep) = self.agent_reputations.get(&agent_id) {
            let trust_level = self.get_trust_level(agent_rep.score);
            
            let limits = match trust_level {
                TrustLevel::Novice => CapabilityLimits {
                    max_complexity: 3,
                    max_transaction_value: 100 * 10u128.pow(18), // 100 tokens
                    can_access_critical_systems: false,
                    can_operate_autonomously: false,
                    can_delegate: false,
                },
                TrustLevel::Apprentice => CapabilityLimits {
                    max_complexity: 5,
                    max_transaction_value: 500 * 10u128.pow(18),
                    can_access_critical_systems: false,
                    can_operate_autonomously: true,
                    can_delegate: false,
                },
                TrustLevel::Trusted => CapabilityLimits {
                    max_complexity: 7,
                    max_transaction_value: 2000 * 10u128.pow(18),
                    can_access_critical_systems: false,
                    can_operate_autonomously: true,
                    can_delegate: true,
                },
                TrustLevel::Expert => CapabilityLimits {
                    max_complexity: 9,
                    max_transaction_value: 10000 * 10u128.pow(18),
                    can_access_critical_systems: true,
                    can_operate_autonomously: true,
                    can_delegate: true,
                },
                TrustLevel::Master => CapabilityLimits {
                    max_complexity: 10,
                    max_transaction_value: u128::MAX, // Unlimited
                    can_access_critical_systems: true,
                    can_operate_autonomously: true,
                    can_delegate: true,
                },
            };
            
            Some(limits)
        } else {
            None
        }
    }
    
    // Check if an agent can perform a specific action
    pub fn can_perform_action(&self, agent_id: AccountId, action_type: String, value: Option<Balance>) -> bool {
        if let Some(limits) = self.get_capability_limits(agent_id) {
            match action_type.as_str() {
                "transaction" => {
                    if let Some(tx_value) = value {
                        return tx_value <= limits.max_transaction_value;
                    }
                    false
                },
                "critical_access" => limits.can_access_critical_systems,
                "autonomous_operation" => limits.can_operate_autonomously,
                "delegation" => limits.can_delegate,
                _ => false,
            }
        } else {
            false
        }
    }
    
    // New function to calculate category averages
    fn recalculate_reputation_with_categories(&self, agent_rep: &mut AgentReputation) {
        if agent_rep.total_interactions == 0 {
            return;
        }
        
        // Filter out expired feedback
        let current_time = env::block_timestamp();
        let valid_feedback: Vec<&FeedbackEntry> = agent_rep.feedback_history
            .iter()
            .filter(|f| current_time - f.timestamp <= self.feedback_expiry_period)
            .collect();
        
        if valid_feedback.is_empty() {
            return;
        }
        
        // Calculate category averages
        let mut accuracy_sum = 0;
        let mut response_time_sum = 0;
        let mut communication_sum = 0;
        let mut problem_solving_sum = 0;
        let mut ethics_sum = 0;
        
        for feedback in &valid_feedback {
            accuracy_sum += feedback.category_ratings.accuracy as u32;
            response_time_sum += feedback.category_ratings.response_time as u32;
            communication_sum += feedback.category_ratings.communication as u32;
            problem_solving_sum += feedback.category_ratings.problem_solving as u32;
            ethics_sum += feedback.category_ratings.ethics as u32;
        }
        
        let count = valid_feedback.len() as u32;
        
        agent_rep.category_scores = CategoryRatings {
            accuracy: (accuracy_sum / count) as u8,
            response_time: (response_time_sum / count) as u8,
            communication: (communication_sum / count) as u8,
            problem_solving: (problem_solving_sum / count) as u8,
            ethics: (ethics_sum / count) as u8,
        };
        
        // Continue with regular reputation calculation
        self.recalculate_reputation(agent_rep);
    }
    
    // Extend the reputation view to include categories
    pub fn get_agent_reputation_detailed(&self, agent_id: AccountId) -> Option<AgentReputationDetailedView> {
        self.agent_reputations.get(&agent_id).map(|rep| {
            AgentReputationDetailedView {
                score: rep.score,
                total_interactions: rep.total_interactions,
                successful_interactions: rep.successful_interactions,
                specializations: rep.specializations,
                last_update: rep.last_update,
                trust_level: self.get_trust_level(rep.score),
                category_scores: rep.category_scores,
            }
        })
    }
    
    // Report a violation (limited to authorized accounts)
    pub fn report_violation(
        &mut self,
        agent_id: AccountId,
        violation_type: ViolationType,
        description: String,
        evidence: Option<String>
    ) {
        let reporter = env::predecessor_account_id();
        
        // Only allow authorized entities (contract owner or governance) to report violations
        assert!(
            reporter == self.owner_id || self.is_governance_member(reporter),
            "Unauthorized: only owner or governance members can report violations"
        );
        
        // Ensure agent exists
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        
        // Calculate penalty based on violation type
        let (reputation_penalty, token_slash_percentage) = match violation_type {
            ViolationType::MinorInfraction => (5, 1),   // 5 points, 1% of stake
            ViolationType::MajorInfraction => (15, 5),  // 15 points, 5% of stake
            ViolationType::TermsViolation => (25, 10),  // 25 points, 10% of stake
            ViolationType::EthicalViolation => (40, 25), // 40 points, 25% of stake
            ViolationType::SecurityBreach => (60, 50),  // 60 points, 50% of stake
        };
        
        // Apply reputation penalty
        let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
        if agent_rep.score >= reputation_penalty {
            agent_rep.score -= reputation_penalty;
        } else {
            agent_rep.score = 0;
        }
        
        // Calculate token slashing
        let stake = self.agent_stakes.get(&agent_id).unwrap_or(0);
        let tokens_to_slash = stake * token_slash_percentage as u128 / 100;
        
        // Record the violation
        let violation = ViolationRecord {
            violation_type,
            reporter,
            description,
            evidence,
            timestamp: env::block_timestamp(),
            penalty_applied: reputation_penalty,
            tokens_slashed: tokens_to_slash,
        };
        
        agent_rep.violation_history.push(violation);
        
        // Update the agent reputation
        self.agent_reputations.insert(&agent_id, &agent_rep);
        
        // If tokens to slash > 0, execute the slashing
        if tokens_to_slash > 0 {
            self.execute_slashing(agent_id, tokens_to_slash);
        }
    }
    
    // Execute token slashing (simplified - would be a cross-contract call in production)
    fn execute_slashing(&mut self, agent_id: AccountId, amount: Balance) {
        let current_stake = self.agent_stakes.get(&agent_id).unwrap_or(0);
        if current_stake >= amount {
            // Update stake amount
            self.agent_stakes.insert(&agent_id, &(current_stake - amount));
            
            // In a real implementation, you would transfer the slashed tokens
            // to a community fund or governance treasury
            
            // Log the slashing event
            env::log_str(&format!(
                "Slashed {} tokens from agent {} for violation",
                amount, agent_id
            ));
        }
    }
    
    // Helper function to check if an account is a governance member
    fn is_governance_member(&self, account_id: AccountId) -> bool {
        // In a real implementation, you would check against a list of governance members
        // For now, just check if it's the owner
        account_id == self.owner_id
    }
    
    // Allow an agent to appeal a violation
    pub fn appeal_violation(&mut self, violation_index: usize, justification: String) {
        let agent_id = env::predecessor_account_id();
        
        // Ensure agent exists
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        
        let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
        
        // Ensure violation index is valid
        assert!(
            violation_index < agent_rep.violation_history.len(),
            "Invalid violation index"
        );
        
        // In a real system, this would create an appeal that governance would review
        // For now, just log the appeal
        env::log_str(&format!(
            "Appeal received from agent {} for violation #{}: {}",
            agent_id, violation_index, justification
        ));
        
        // Store the appeal with the violation (would need to modify ViolationRecord)
        // For simplicity, not implemented here
    }
    
    // Allow the owner or governance to restore reputation points
    pub fn restore_reputation(&mut self, agent_id: AccountId, points: u32, reason: String) {
        let caller = env::predecessor_account_id();
        
        // Only owner or governance can restore reputation
        assert!(
            caller == self.owner_id || self.is_governance_member(caller),
            "Unauthorized: only owner or governance can restore reputation"
        );
        
        // Ensure agent exists
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        
        let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
        
        // Add reputation points (cap at 100)
        agent_rep.score = std::cmp::min(agent_rep.score + points, 100);
        
        // Update the agent reputation
        self.agent_reputations.insert(&agent_id, &agent_rep);
        
        // Log the restoration
        env::log_str(&format!(
            "Restored {} reputation points to agent {} for reason: {}",
            points, agent_id, reason
        ));
    }
    
    // Allow agents to complete remediation tasks to recover reputation
    pub fn complete_remediation_task(&mut self, task_id: String, proof: String) {
        let agent_id = env::predecessor_account_id();
        
        // Ensure agent exists
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        
        // In a real system, you would:
        // 1. Verify the task was assigned to this agent
        // 2. Verify the proof of completion
        // 3. Calculate the appropriate reputation recovery
        
        // For simplicity, we'll assume verification passed and grant a fixed recovery
        let recovery_points = 5; // Fixed 5 points per remediation task
        
        let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
        
        // Add reputation points (cap at 100)
        agent_rep.score = std::cmp::min(agent_rep.score + recovery_points, 100);
        
        // Update the agent reputation
        self.agent_reputations.insert(&agent_id, &agent_rep);
        
        // Log the recovery
        env::log_str(&format!(
            "Agent {} recovered {} reputation points by completing remediation task {}",
            agent_id, recovery_points, task_id
        ));
    }
    
    // Path to reputation recovery through enhanced stake
    pub fn boost_recovery_with_stake(&mut self, additional_stake: U128) -> Promise {
        let agent_id = env::predecessor_account_id();
        
        // Ensure agent exists and has reputation below 50
        assert!(self.agent_reputations.contains_key(&agent_id), "Agent not registered");
        let agent_rep = self.agent_reputations.get(&agent_id).unwrap();
        assert!(agent_rep.score < 50, "Recovery boost only available for agents with reputation below 50");
        
        // Call stake_itlx (from token_integration.rs) with increased recovery factor
        self.stake_itlx(additional_stake)
    }
    
    // Special callback for recovery staking (would be added to token_integration.rs)
    pub fn on_recovery_stake_complete(&mut self, agent_id: AccountId, amount: U128) {
        // Verify callback is from previous cross-contract call
        assert_eq!(env::predecessor_account_id(), env::current_account_id(), "Unauthorized");
        
        // Check if the transfer was successful
        match env::promise_result(0) {
            PromiseResult::Successful(_) => {
                // Get current reputation
                if self.agent_reputations.contains_key(&agent_id) {
                    let mut agent_rep = self.agent_reputations.get(&agent_id).unwrap();
                    
                    // Calculate recovery boost (larger than normal stake bonus)
                    // 1 point per 10% of minimum_stake, up to 20 points
                    let recovery_points = std::cmp::min(
                        (amount.0 * 10 / self.min_stake_amount) as u32,
                        20
                    );
                    
                    // Apply recovery points
                    agent_rep.score = std::cmp::min(agent_rep.score + recovery_points, 100);
                    self.agent_reputations.insert(&agent_id, &agent_rep);
                    
                    env::log_str(&format!(
                        "Agent {} recovered {} reputation points through additional staking",
                        agent_id, recovery_points
                    ));
                }
            },
            _ => {
                // Handle failure case
                env::log_str("Recovery staking failed");
            }
        }
    }

    // Function to verify an agent exists in NEAR AI Registry
    pub fn verify_agent_exists(&self, agent_id: AccountId) -> Promise {
        Promise::new(self.near_ai_registry.clone())
            .function_call(
                "has_agent".to_string(),
                json!({ "agent_id": agent_id }).to_string().into_bytes(),
                0,
                env::prepaid_gas() / 3
            )
            .then(
                Promise::new(env::current_account_id())
                    .function_call(
                        "on_agent_verified".to_string(),
                        json!({
                            "agent_id": agent_id,
                        }).to_string().into_bytes(),
                        0,
                        env::prepaid_gas() / 3
                    )
            )
    }
}

// View-only struct for external queries
#[derive(near_sdk::serde::Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AgentReputationView {
    score: u32,
    total_interactions: u64,
    successful_interactions: u64,
    specializations: Vec<String>,
    last_update: u64,
}

// Add these new structures after AgentReputationView
#[derive(BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum TrustLevel {
    Novice,     // 0-30 reputation score
    Apprentice, // 31-50 reputation score
    Trusted,    // 51-75 reputation score
    Expert,     // 76-90 reputation score
    Master      // 91-100 reputation score
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CapabilityLimits {
    // Maximum complexity of tasks this agent can handle (1-10)
    max_complexity: u8,
    // Maximum value in transactions this agent can handle
    max_transaction_value: Balance,
    // Whether agent can interact with critical systems
    can_access_critical_systems: bool,
    // Whether agent can operate autonomously without approval
    can_operate_autonomously: bool,
    // Whether agent can delegate tasks to other agents
    can_delegate: bool,
}

// New detailed view struct
#[derive(near_sdk::serde::Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct AgentReputationDetailedView {
    score: u32,
    total_interactions: u64,
    successful_interactions: u64,
    specializations: Vec<String>,
    last_update: u64,
    trust_level: TrustLevel,
    category_scores: CategoryRatings,
} 