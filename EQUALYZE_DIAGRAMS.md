# Equalyze: System Architecture and Process Flow

This document provides architectural and process flow diagrams for the Equalyze system. These diagrams are rendered using Mermaid.js and can be directly used in presentations, documentation, or design specs.

## 1. System Architecture Diagram

This diagram outlines the high-level technical architecture of Equalyze, showing the relationship between the Frontend (Next.js), Backend (FastAPI), Multi-Agent Engine, and Persistence layers.

```mermaid
graph TD
    %% User Layer
    User[User / Compliance Officer]

    %% Frontend Layer
    subgraph Frontend [Frontend - Next.js]
        UI[UI Components]
        State[State Management]
        API_Client[API Client lib/api.ts]
        
        UI --> State
        State <--> API_Client
    end

    %% Backend API Layer
    subgraph Backend [Backend API - FastAPI]
        Router[API Routers]
        Models[Pydantic Models]
        Services[Services & Utilities]
        
        Router --> Models
        Router --> Services
    end

    %% Multi-Agent AI Engine Layer
    subgraph Agents [Multi-Agent Engine]
        Orchestrator[Orchestrator Agent]
        Ingestion[Ingestion Agent]
        Proxy[Proxy Detector Agent]
        TwinEngine[Twin Engine / Counterfactuals]
        Remediation[Remediation Agent]
        
        Orchestrator --> Ingestion
        Orchestrator --> Proxy
        Orchestrator --> TwinEngine
        Orchestrator --> Remediation
    end

    %% Data Persistence Layer
    subgraph DataStore [Data & Persistence]
        Firestore[(Firestore DB)]
        Storage[(Firebase Storage)]
        LocalCache[Local Data Cache]
    end

    %% Connections
    User <-->|HTTP/HTTPS| UI
    API_Client <-->|REST API / JSON| Router
    Services <--> Orchestrator
    
    Services --> Firestore
    Services --> Storage
    Services --> LocalCache
    Agents --> Firestore
```

---

## 2. Process Flow Diagram (Audit Lifecycle)

This process flow details the step-by-step lifecycle of an audit, from dataset upload to final remediation reporting.

```mermaid
sequenceDiagram
    autonumber
    actor User as Compliance Officer
    participant FE as Next.js Frontend
    participant API as FastAPI Backend
    participant Agent as Multi-Agent Engine
    participant DB as Firestore DB

    User->>FE: Uploads Dataset & Selects Domain
    FE->>API: POST /datasets/upload
    API->>DB: Save dataset metadata
    API-->>FE: Return dataset_id & profile

    FE->>API: GET /schema-suggestions
    API->>Agent: IngestionAgent.suggest_schema()
    Agent-->>API: Schema map & column definitions
    API->>Agent: ProxyAgent.detect_proxies()
    Agent-->>API: Proxy warnings
    API-->>FE: Schema & Proxy Data

    User->>FE: Confirms schema & clicks "Launch Audit"
    FE->>API: POST /audits
    API->>DB: Initialize Audit record (Status: Running)
    API->>Agent: Start Orchestrator (Background Task)
    API-->>FE: Return audit_id
    
    %% Background Agent Process
    par Background Processing
        Agent->>Agent: TwinEngine: Fairness & Counterfactual Analysis
        Agent->>Agent: RemediationAgent: Generate Fixes
        Agent->>DB: Update Audit record (Status: Complete, Findings)
    end

    User->>FE: Views Dashboard
    FE->>API: GET /audits/{id}
    API->>DB: Fetch Audit Results
    DB-->>API: Audit Data
    API-->>FE: Render Twin Explorer & Metrics
```

---

## 3. Use-Case Diagram

This diagram visualizes the primary interactions different actors have with the Equalyze system.

```mermaid
usecaseDiagram
    actor "Compliance Officer" as CO
    actor "Data Scientist" as DS
    
    package Equalyze {
        usecase "Upload Model Dataset" as UC1
        usecase "Map Schema & Identify Proxies" as UC2
        usecase "Run Bias Audit" as UC3
        usecase "Explore Counterfactual Twins" as UC4
        usecase "Review Remediation Strategies" as UC5
        usecase "Monitor Scheduled Audits" as UC6
    }
    
    CO --> UC1
    CO --> UC2
    CO --> UC3
    CO --> UC4
    CO --> UC5
    
    DS --> UC1
    DS --> UC2
    DS --> UC4
    DS --> UC5
    DS --> UC6
    
    %% Relationships
    UC3 ..> UC2 : <<includes>>
    UC4 ..> UC3 : <<extends>>
    UC5 ..> UC3 : <<extends>>
```
