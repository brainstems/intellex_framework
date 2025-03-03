/**
 * Intellex Framework AITP Example
 * 
 * This example demonstrates the integration with the Agent Interaction & Transaction Protocol (AITP),
 * showing how to create threads, send messages with capabilities, and interact with service agents.
 */

// Import the Intellex framework
const intellex = require('../intellex');

// Initialize the framework with configuration
const framework = intellex.init({
  nearNetwork: 'testnet',
  enableReputation: true,
  crossChainSupport: ['ethereum', 'near', 'aurora'],
  intentProcessing: true,
});

// Main function to run the example
async function runExample() {
  console.log('Intellex Framework AITP Example');
  console.log(`Framework Version: ${intellex.getVersion()}`);
  console.log('-----------------------------------');
  
  try {
    // Get the AITP integration
    console.log('\n1. Accessing AITP integration...');
    const aitp = framework.getAITPIntegration();
    
    // Initialize the AITP integration
    console.log('\n2. Initializing AITP integration...');
    const initialized = await aitp.initialize();
    
    console.log(`AITP integration initialized: ${initialized}`);
    
    // Create a thread
    console.log('\n3. Creating a thread...');
    const thread = aitp.createThread({
      title: 'Flight Booking Conversation',
      participants: ['user-123', 'flight-booking-agent'],
      metadata: {
        purpose: 'Book a flight from San Francisco to New York',
      },
    });
    
    console.log(`Thread created: ${thread.id}`);
    console.log(`  Title: ${thread.title}`);
    console.log(`  Participants: ${thread.participants.join(', ')}`);
    console.log(`  Created At: ${thread.createdAt}`);
    
    // Add a message to the thread
    console.log('\n4. Adding a message to the thread...');
    const message = aitp.addMessage(thread.id, {
      role: 'user',
      content: 'I need to book a flight from San Francisco to New York on July 15th.',
    });
    
    console.log(`Message added: ${message.id}`);
    console.log(`  Role: ${message.role}`);
    console.log(`  Content: ${message.content}`);
    console.log(`  Created At: ${message.createdAt}`);
    
    // Create a data request capability
    console.log('\n5. Creating a data request capability...');
    const dataRequestCapability = aitp.createDataRequestCapability({
      fields: [
        {
          name: 'departure_date',
          type: 'date',
          description: 'Departure date',
        },
        {
          name: 'return_date',
          type: 'date',
          description: 'Return date (optional)',
        },
        {
          name: 'passenger_count',
          type: 'number',
          description: 'Number of passengers',
        },
        {
          name: 'class',
          type: 'string',
          description: 'Travel class (economy, business, first)',
          options: ['economy', 'business', 'first'],
        },
      ],
      required: ['departure_date', 'passenger_count'],
      description: 'Please provide the following information to search for flights',
      purpose: 'Flight search',
    });
    
    console.log(`Data request capability created: ${dataRequestCapability.type}`);
    console.log(`  Fields: ${dataRequestCapability.data.fields.map(f => f.name).join(', ')}`);
    console.log(`  Required: ${dataRequestCapability.data.required.join(', ')}`);
    
    // Add a message with the data request capability
    console.log('\n6. Adding a message with the data request capability...');
    const capabilityMessage = aitp.addMessage(thread.id, {
      role: 'assistant',
      content: 'I need some additional information to search for flights.',
      capabilities: [dataRequestCapability],
    });
    
    console.log(`Message with capability added: ${capabilityMessage.id}`);
    console.log(`  Role: ${capabilityMessage.role}`);
    console.log(`  Content: ${capabilityMessage.content}`);
    console.log(`  Capabilities: ${capabilityMessage.capabilities.map(c => c.type).join(', ')}`);
    
    // Respond to the data request capability
    console.log('\n7. Responding to the data request capability...');
    const dataResponse = aitp.respondToCapability(thread.id, 'AITP-03', {
      departure_date: '2023-07-15',
      return_date: '2023-07-22',
      passenger_count: 2,
      class: 'economy',
    });
    
    console.log(`Response to capability added: ${dataResponse.id}`);
    console.log(`  Role: ${dataResponse.role}`);
    console.log(`  Content: ${dataResponse.content}`);
    
    // Create a payment capability
    console.log('\n8. Creating a payment capability...');
    const paymentCapability = aitp.createPaymentCapability({
      amount: '250.00',
      currency: 'NEAR',
      recipient: 'flight-booking-agent.near',
      description: 'Payment for flight booking service',
    });
    
    console.log(`Payment capability created: ${paymentCapability.type}`);
    console.log(`  Amount: ${paymentCapability.data.amount} ${paymentCapability.data.currency}`);
    console.log(`  Recipient: ${paymentCapability.data.recipient}`);
    
    // Add a message with the payment capability
    console.log('\n9. Adding a message with the payment capability...');
    const paymentMessage = aitp.addMessage(thread.id, {
      role: 'assistant',
      content: 'I found a flight for you. Please complete the payment to book it.',
      capabilities: [paymentCapability],
    });
    
    console.log(`Message with payment capability added: ${paymentMessage.id}`);
    
    // Respond to the payment capability
    console.log('\n10. Responding to the payment capability...');
    const paymentResponse = aitp.respondToCapability(thread.id, 'AITP-01', {
      status: 'completed',
      transactionHash: 'HZgzuUEpmTBCwVa3iZP8c5fFD7YxbWEJm8J5XYSjVxZZ',
      completedAt: new Date().toISOString(),
    });
    
    console.log(`Response to payment capability added: ${paymentResponse.id}`);
    
    // Create a NEAR wallet capability
    console.log('\n11. Creating a NEAR wallet capability...');
    const walletCapability = aitp.createNEARWalletCapability({
      operation: 'function_call',
      contract: 'flight-booking.near',
      method: 'book_flight',
      args: {
        flight_id: 'FL123',
        departure_date: '2023-07-15',
        return_date: '2023-07-22',
        passenger_count: 2,
        class: 'economy',
      },
      deposit: '250000000000000000000000000', // 0.25 NEAR
    });
    
    console.log(`NEAR wallet capability created: ${walletCapability.type}`);
    console.log(`  Operation: ${walletCapability.data.operation}`);
    console.log(`  Contract: ${walletCapability.data.contract}`);
    console.log(`  Method: ${walletCapability.data.method}`);
    
    // Add a message with the wallet capability
    console.log('\n12. Adding a message with the wallet capability...');
    const walletMessage = aitp.addMessage(thread.id, {
      role: 'assistant',
      content: 'Please confirm the flight booking by approving this transaction.',
      capabilities: [walletCapability],
    });
    
    console.log(`Message with wallet capability added: ${walletMessage.id}`);
    
    // Respond to the wallet capability
    console.log('\n13. Responding to the wallet capability...');
    const walletResponse = aitp.respondToCapability(thread.id, 'AITP-04', {
      status: 'approved',
      transactionHash: 'J7gzuUEpmTBCwVa3iZP8c5fFD7YxbWEJm8J5XYSjVxZZ',
      completedAt: new Date().toISOString(),
    });
    
    console.log(`Response to wallet capability added: ${walletResponse.id}`);
    
    // Find service agents
    console.log('\n14. Finding service agents...');
    const serviceAgents = await aitp.findServiceAgents({
      capabilities: ['AITP-01', 'AITP-03'],
    });
    
    console.log(`Found ${serviceAgents.length} service agents:`);
    serviceAgents.forEach(agent => {
      console.log(`  ${agent.name}: ${agent.description}`);
      console.log(`    Capabilities: ${agent.capabilities.join(', ')}`);
    });
    
    // Connect to a service agent
    console.log('\n15. Connecting to a service agent...');
    const serviceThread = await aitp.connectToServiceAgent('hotel-booking-agent', {
      title: 'Hotel Booking Conversation',
      initialMessage: 'I need to book a hotel in New York from July 15th to July 22nd.',
    });
    
    console.log(`Connected to service agent, thread created: ${serviceThread.id}`);
    console.log(`  Title: ${serviceThread.title}`);
    console.log(`  Participants: ${serviceThread.participants.join(', ')}`);
    
    // Get all threads
    console.log('\n16. Getting all threads...');
    const allThreads = aitp.getAllThreads();
    
    console.log(`Total threads: ${allThreads.length}`);
    allThreads.forEach(t => {
      console.log(`  ${t.title} (${t.id}): ${t.messages.length} messages`);
    });
    
    // Get integration status
    console.log('\n17. Getting AITP integration status...');
    const status = aitp.getStatus();
    
    console.log('AITP integration status:');
    console.log(`  Initialized: ${status.initialized}`);
    console.log(`  Agent Type: ${status.agentType}`);
    console.log(`  Transport Type: ${status.transportType}`);
    console.log(`  Supported Capabilities: ${status.supportedCapabilities.join(', ')}`);
    console.log(`  Thread Count: ${status.threadCount}`);
    console.log(`  Active Capabilities Count: ${status.activeCapabilitiesCount}`);
    
    console.log('\nExample completed successfully!');
    
  } catch (error) {
    console.error('Error running example:', error);
  }
}

// Run the example
runExample().catch(console.error); 