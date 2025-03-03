# Intellex Framework Architecture

This document explains the architecture of the Intellex Framework, focusing on the normalized components that enable interoperability between agents on different platforms.

## High-Level Architecture

```
+-----------------------------------------------------+
|                 Intellex Framework                  |
+-----------------------------------------------------+
|                                                     |
|  +-------------------+      +-------------------+   |
|  |   Agent Registry  |<---->| Communication Hub |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
|           v                          v              |
|  +-------------------+      +-------------------+   |
|  | Platform Adapters |<---->|  Core Services    |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
+-----------|--------------------------|--------------|
            |                          |               
            v                          v               
+------------------------+  +------------------------+
|   Platform-Specific    |  |   Blockchain Networks  |
|   Agent Frameworks     |  |   & Services           |
+------------------------+  +------------------------+
```

## Agent Registry and Adapters

The Agent Registry is the central component that manages agents across different platforms. It uses adapters to interact with platform-specific implementations:

```
+-----------------------------------------------------+
|                   Agent Registry                    |
+-----------------------------------------------------+
|                                                     |
|  +-------------------+      +-------------------+   |
|  |  Agent Metadata   |<---->|  Reputation Data  |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
|           v                          v              |
|  +-------------------+      +-------------------+   |
|  |  Platform Adapter |<---->| Connection Manager|   |
|  |  Registry         |      |                   |   |
|  +-------------------+      +-------------------+   |
|           ^                                         |
|           |                                         |
+-----------|-----------------------------------------+
            |                                          
            v                                          
+-----------------------------------------------------+
|                   Platform Adapters                 |
+-----------------------------------------------------+
|                                                     |
|  +-------------------+      +-------------------+   |
|  |  CrewAI Adapter   |      |   NEAR AI Adapter |   |
|  +-------------------+      +-------------------+   |
|                                                     |
|  +-------------------+      +-------------------+   |
|  | SUI Blockchain    |      |   Custom Platform |   |
|  | Adapter           |      |   Adapter         |   |
|  +-------------------+      +-------------------+   |
|                                                     |
+-----------------------------------------------------+
```

## Communication Architecture

The Communication Hub enables agents on different platforms to communicate with each other:

```
+-----------------------------------------------------+
|                 Communication Hub                   |
+-----------------------------------------------------+
|                                                     |
|  +-------------------+      +-------------------+   |
|  |  Thread Manager   |<---->| Message Processor |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
|           v                          v              |
|  +-------------------+      +-------------------+   |
|  | Capability Manager|<---->| Transport Layer   |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
+-----------|--------------------------|--------------+
            |                          |               
            v                          v               
+------------------------+  +------------------------+
|   AITP Protocol        |  |   Custom Transport     |
|   Implementation       |  |   Implementations      |
+------------------------+  +------------------------+
```

## Agent Interoperability Flow

This diagram shows how agents on different platforms interact with each other:

```
+-------------+     +----------------+     +-------------+
| CrewAI      |     | Intellex       |     | NEAR AI     |
| Agent       |     | Framework      |     | Agent       |
+-------------+     +----------------+     +-------------+
      |                     |                    |
      | 1. Create Agent     |                    |
      |-------------------->|                    |
      |                     |                    |
      |                     | 2. Create Agent    |
      |                     |------------------->|
      |                     |                    |
      | 3. Connect Agents   |                    |
      |-------------------->|                    |
      |                     |                    |
      |                     | 4. Create Thread   |
      |                     |------------------->|
      |                     |                    |
      | 5. Send Message     |                    |
      |-------------------->|                    |
      |                     |                    |
      |                     | 6. Deliver Message |
      |                     |------------------->|
      |                     |                    |
      |                     | 7. Process Message |
      |                     |<-------------------|
      |                     |                    |
      |                     | 8. Send Response   |
      |                     |<-------------------|
      |                     |                    |
      | 9. Receive Response |                    |
      |<--------------------|                    |
      |                     |                    |
+-------------+     +----------------+     +-------------+
```

## Reputation System Integration

The Reputation System tracks agent performance across platforms:

```
+-----------------------------------------------------+
|                 Reputation System                   |
+-----------------------------------------------------+
|                                                     |
|  +-------------------+      +-------------------+   |
|  |  Reputation Store |<---->| Scoring Algorithm |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
|           v                          v              |
|  +-------------------+      +-------------------+   |
|  | Feedback Collector|<---->| Analytics Engine  |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
+-----------|--------------------------|--------------+
            |                          |               
            v                          v               
+------------------------+  +------------------------+
|   Agent Interactions   |  |   Task Completion      |
|   & Performance        |  |   Metrics              |
+------------------------+  +------------------------+
```

## Platform-Specific Integration

This diagram shows how the framework integrates with platform-specific features:

```
+-----------------------------------------------------+
|                 Intellex Framework                  |
+-----------------------------------------------------+
|                                                     |
|  +-------------------+      +-------------------+   |
|  |  Agent Registry   |<---->| Communication Hub |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
+-----------|--------------------------|--------------+
            |                          |               
            v                          v               
+------------------------+  +------------------------+
|   CrewAI Integration   |  |   NEAR AI Integration  |
+------------------------+  +------------------------+
| - Agent Creation       |  | - Agent Creation       |
| - Task Assignment      |  | - Model Selection      |
| - Crew Management      |  | - Tool Integration     |
| - Hierarchical Process |  | - Fine-tuning          |
+------------------------+  +------------------------+
            ^                          ^               
            |                          |               
            v                          v               
+------------------------+  +------------------------+
|   SUI Integration      |  |   AITP Integration     |
+------------------------+  +------------------------+
| - Blockchain Agents    |  | - Thread Management    |
| - Smart Contracts      |  | - Capability Handling  |
| - Transaction Handling |  | - Service Discovery    |
| - Object Management    |  | - Secure Communication |
+------------------------+  +------------------------+
```

## Extending the Framework

To add support for a new platform, you need to implement the following components:

1. **Platform Adapter**: Implement the `AgentInterface` to create, run, and manage agents on the new platform.
2. **Communication Integration**: Ensure the platform can communicate using the standard communication interface.
3. **Register the Adapter**: Register the adapter with the Agent Registry.

```
+-----------------------------------------------------+
|                 Custom Platform Adapter             |
+-----------------------------------------------------+
|                                                     |
|  +-------------------+      +-------------------+   |
|  | AgentInterface    |<---->| CommunicationIntf |   |
|  | Implementation    |      | Integration       |   |
|  +-------------------+      +-------------------+   |
|           ^                          ^              |
|           |                          |              |
|           v                          v              |
|  +-------------------+      +-------------------+   |
|  | Platform-Specific |<---->| Platform-Specific |   |
|  | Agent Management  |      | Communication     |   |
|  +-------------------+      +-------------------+   |
|                                                     |
+-----------------------------------------------------+
            ^                          ^               
            |                          |               
            v                          v               
+------------------------+  +------------------------+
|   Custom Platform      |  |   Intellex Framework   |
|   Implementation       |  |                        |
+------------------------+  +------------------------+
``` 