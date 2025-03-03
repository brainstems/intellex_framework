/**
 * Reputation System Module
 * 
 * This module is responsible for tracking, calculating, and verifying agent
 * reputation scores within the Intellex framework. It integrates with the
 * blockchain-based reputation contracts for decentralized verification.
 * 
 * @module intellex/core/reputation-system
 */

/**
 * Class representing the Reputation System
 */
class ReputationSystem {
  /**
   * Create a Reputation System instance
   * 
   * @param {Object} config - Configuration options
   */
  constructor(config) {
    this.config = config;
    this.reputationScores = new Map();
    this.reputationHistory = new Map();
    this.verificationThreshold = config.verificationThreshold || 0.7;
  }

  /**
   * Calculate the reputation score for an agent based on its history
   * 
   * @param {string} agentId - ID of the agent
   * @returns {number} - Reputation score between 0 and 1
   * @private
   */
  _calculateScore(agentId) {
    const history = this.reputationHistory.get(agentId) || [];
    
    if (history.length === 0) {
      return 0.5; // Default neutral score for new agents
    }
    
    // Calculate weighted average of ratings
    const totalWeight = history.reduce((sum, entry) => sum + entry.weight, 0);
    const weightedSum = history.reduce((sum, entry) => sum + (entry.rating * entry.weight), 0);
    
    return weightedSum / totalWeight;
  }

  /**
   * Register a new agent with the reputation system
   * 
   * @param {string} agentId - ID of the agent to register
   * @param {number} initialScore - Initial reputation score (default: 0.5)
   * @returns {boolean} - Whether the registration was successful
   */
  registerAgent(agentId, initialScore = 0.5) {
    if (this.reputationScores.has(agentId)) {
      return false; // Agent already registered
    }
    
    this.reputationScores.set(agentId, initialScore);
    this.reputationHistory.set(agentId, []);
    
    return true;
  }

  /**
   * Submit a rating for an agent
   * 
   * @param {string} agentId - ID of the agent being rated
   * @param {number} rating - Rating value between 0 and 1
   * @param {string} raterId - ID of the entity submitting the rating
   * @param {Object} evidence - Evidence supporting the rating
   * @returns {boolean} - Whether the rating submission was successful
   */
  submitRating(agentId, rating, raterId, evidence = {}) {
    if (!this.reputationScores.has(agentId)) {
      this.registerAgent(agentId);
    }
    
    // Validate rating
    const normalizedRating = Math.max(0, Math.min(1, rating));
    
    // Create rating entry
    const ratingEntry = {
      rating: normalizedRating,
      raterId,
      timestamp: new Date().toISOString(),
      evidence,
      weight: 1.0, // Default weight, could be adjusted based on rater's own reputation
    };
    
    // Add to history
    const history = this.reputationHistory.get(agentId);
    history.push(ratingEntry);
    this.reputationHistory.set(agentId, history);
    
    // Recalculate score
    const newScore = this._calculateScore(agentId);
    this.reputationScores.set(agentId, newScore);
    
    return true;
  }

  /**
   * Get the current reputation score for an agent
   * 
   * @param {string} agentId - ID of the agent
   * @returns {number|null} - Reputation score or null if agent not found
   */
  getReputationScore(agentId) {
    return this.reputationScores.has(agentId) ? this.reputationScores.get(agentId) : null;
  }

  /**
   * Get the reputation history for an agent
   * 
   * @param {string} agentId - ID of the agent
   * @returns {Array|null} - Array of rating entries or null if agent not found
   */
  getReputationHistory(agentId) {
    return this.reputationHistory.has(agentId) ? [...this.reputationHistory.get(agentId)] : null;
  }

  /**
   * Verify if an agent meets the reputation threshold
   * 
   * @param {string} agentId - ID of the agent
   * @param {number} threshold - Reputation threshold (default: system default)
   * @returns {boolean} - Whether the agent meets the threshold
   */
  verifyAgentReputation(agentId, threshold = this.verificationThreshold) {
    const score = this.getReputationScore(agentId);
    
    if (score === null) {
      return false; // Agent not found
    }
    
    return score >= threshold;
  }

  /**
   * Submit reputation data to the blockchain for verification
   * 
   * @param {string} agentId - ID of the agent
   * @returns {Promise<Object>} - Result of the blockchain submission
   */
  async submitToBlockchain(agentId) {
    if (!this.reputationScores.has(agentId)) {
      throw new Error(`Agent ${agentId} not found in reputation system`);
    }
    
    const score = this.reputationScores.get(agentId);
    const history = this.reputationHistory.get(agentId);
    
    // Implementation would connect to NEAR blockchain and submit data
    console.log(`Submitting reputation data for agent ${agentId} to blockchain...`);
    
    return {
      success: true,
      transactionId: `tx-${Date.now()}`,
      agentId,
      score,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = ReputationSystem; 