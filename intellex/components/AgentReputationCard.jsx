import React, { useState, useEffect } from 'react';
import { Badge, Card, Progress, Tabs, Table } from 'antd';
import { useNear } from 'near-hooks';

const TrustLevelBadge = ({ level }) => {
  const colors = {
    Novice: 'gray',
    Apprentice: 'blue',
    Trusted: 'green',
    Expert: 'purple',
    Master: 'gold'
  };
  
  return <Badge color={colors[level]} text={level} />;
};

const AgentReputationCard = ({ agentId }) => {
  const [reputation, setReputation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { nearConnection } = useNear();
  
  useEffect(() => {
    async function fetchReputation() {
      try {
        const data = await nearConnection.callFunction({
          contractId: process.env.REPUTATION_CONTRACT_ID,
          methodName: 'get_agent_reputation_detailed',
          args: { agent_id: agentId }
        });
        setReputation(data);
      } catch (error) {
        console.error('Error fetching reputation:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReputation();
  }, [agentId, nearConnection]);
  
  if (loading) return <div>Loading reputation data...</div>;
  if (!reputation) return <div>No reputation data found</div>;
  
  const categoryColumns = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Score', dataIndex: 'score', key: 'score', 
      render: (score) => (
        <Progress percent={score * 20} size="small" />
      )
    }
  ];
  
  const categoryData = [
    { key: '1', category: 'Accuracy', score: reputation.category_scores.accuracy },
    { key: '2', category: 'Response Time', score: reputation.category_scores.response_time },
    { key: '3', category: 'Communication', score: reputation.category_scores.communication },
    { key: '4', category: 'Problem Solving', score: reputation.category_scores.problem_solving },
    { key: '5', category: 'Ethics', score: reputation.category_scores.ethics }
  ];
  
  return (
    <Card title={`Agent Reputation: ${agentId}`} bordered={true}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3>Overall Score: {reputation.score}/100</h3>
          <TrustLevelBadge level={reputation.trust_level} />
        </div>
        <Progress percent={reputation.score} status="active" />
      </div>
      
      <div style={{ marginBottom: 10 }}>
        <p>Total Interactions: {reputation.total_interactions}</p>
        <p>Success Rate: {(reputation.successful_interactions * 100 / reputation.total_interactions).toFixed(1)}%</p>
        <p>Last Updated: {new Date(reputation.last_update / 1000000).toLocaleString()}</p>
      </div>
      
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Category Scores" key="1">
          <Table 
            columns={categoryColumns} 
            dataSource={categoryData} 
            pagination={false} 
            size="small"
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Specializations" key="2">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {reputation.specializations.map((spec, index) => (
              <Badge key={index} count={spec} style={{ backgroundColor: '#52c41a' }} />
            ))}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

export default AgentReputationCard; 