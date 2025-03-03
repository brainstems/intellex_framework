import { BigQuery } from '@google-cloud/bigquery';
import { PrismaClient } from '@prisma/client';

class ReputationAnalytics {
  constructor(config) {
    this.prisma = new PrismaClient();
    this.bigquery = new BigQuery();
    this.reputationContractId = config.reputationContractId;
  }
  
  // Sync on-chain reputation data to database
  async syncReputationData() {
    // Fetch all reputation events from contract logs
    const reputationEvents = await this.fetchReputationEventsFromChain();
    
    // Process and store in database
    for (const event of reputationEvents) {
      // Upsert agent record
      await this.prisma.agent.upsert({
        where: { id: event.agent_id },
        update: {
          reputation_score: event.score,
          last_updated: new Date(event.timestamp / 1000000)
        },
        create: {
          id: event.agent_id,
          reputation_score: event.score,
          created_at: new Date(event.timestamp / 1000000),
          last_updated: new Date(event.timestamp / 1000000)
        }
      });
      
      // Record feedback entry
      if (event.type === 'feedback') {
        await this.prisma.feedback.create({
          data: {
            agent_id: event.agent_id,
            user_id: event.user_id,
            rating: event.rating,
            accuracy: event.category_ratings.accuracy,
            response_time: event.category_ratings.response_time,
            communication: event.category_ratings.communication,
            problem_solving: event.category_ratings.problem_solving,
            ethics: event.category_ratings.ethics,
            message: event.message,
            created_at: new Date(event.timestamp / 1000000)
          }
        });
      }
    }
  }
  
  // Generate advanced insights using BigQuery
  async generateReputationInsights() {
    const query = `
      SELECT
        agent_id,
        AVG(rating) as avg_rating,
        COUNT(*) as total_feedback,
        STDDEV(rating) as rating_stddev,
        AVG(accuracy) as avg_accuracy,
        AVG(response_time) as avg_response_time,
        AVG(communication) as avg_communication,
        AVG(problem_solving) as avg_problem_solving,
        AVG(ethics) as avg_ethics
      FROM
        feedback
      GROUP BY
        agent_id
      HAVING
        COUNT(*) > 10
    `;
    
    const [rows] = await this.bigquery.query(query);
    return rows;
  }
} 