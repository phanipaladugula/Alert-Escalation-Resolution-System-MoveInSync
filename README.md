# 🚨 Alert Escalation & Resolution System  
### Enterprise-Grade Incident Management & Automated Escalation Platform

The **Alert Escalation & Resolution System** is a full-stack enterprise-level alert management platform designed to automate incident handling, enforce SLA compliance, and provide real-time operational visibility.

This system eliminates manual alert tracking, ensures intelligent escalation, and maintains complete audit traceability through a scalable backend architecture.

---

# 📌 Project Overview

This project demonstrates:

- Clean layered architecture (Controller → Service → Repository)
- Rule-based escalation engine
- SLA breach detection
- JWT-based authentication
- Role-based access control
- Event logging & audit tracking
- Frontend + Backend integration
- Production-ready configuration management

---

# 🏗️ High-Level Architecture

```
Frontend (React UI)
        ↓
Spring Boot REST API
        ↓
Alert Controller
        ↓
Alert Service
        ↓
Rule Engine
        ↓
Escalation Service
        ↓
Notification Service
        ↓
MySQL Database
```

Architecture follows:

- Separation of concerns
- Stateless authentication
- Thread-safe service layer
- Transactional persistence
- Exception handling framework

---

# 📊 System Design Diagrams

## 1️⃣ Entity Relationship Diagram (Database Design)

This diagram illustrates:

- User–Role relationship
- Alert lifecycle mapping
- Alert–EventLog one-to-many relationship
- Escalation rule structure
- Notification linkage

📌 Diagram Location:
```
/docs/er-diagram.png
```

---

## 2️⃣ Sequence Diagram — Alert Processing Flow

Processing Flow:

User → REST API → AlertController → AlertService → RuleEngine → EscalationService → NotificationService → Repository

Key Characteristics:

- Idempotent processing
- Escalation level tracking
- SLA validation
- State-aware updates
- Audit event creation

📌 Diagram Location:
```
/docs/sequence-diagram.png
```

---

## 3️⃣ UML Class Diagram — Domain Model

Highlights:

- User–Alert mapping
- Alert–EventLog relationship
- Alert–EscalationRule mapping
- Layered service architecture

📌 Diagram Location:
```
/docs/class-diagram.png
```

---

## 4️⃣ Use Case Diagram — Actor Interaction

Actors:

- Admin
- Operator
- System

Functional Capabilities:

- Create alerts
- Configure escalation rules
- Monitor alerts
- Resolve incidents
- Automatic escalation

📌 Diagram Location:
```
/docs/usecase-diagram.png
```

---

# ⚙️ Features

## 🔹 Alert Management

- Create alerts
- Update alert status
- View alert history
- Severity categorization
- SLA monitoring

Alert States:

- OPEN
- ESCALATED
- RESOLVED

---

## 🔹 Rule-Based Escalation Engine

Automatic escalation when:

- SLA time exceeded
- Severity threshold crossed
- Alert remains unresolved
- Manual override triggered

Engine supports:

- Multi-level escalation
- Duplicate prevention
- Time-based evaluation
- Configurable rules

---

## 🔹 Event & Audit Logging

- Tracks every alert transition
- Stores escalation timestamps
- Maintains full audit history
- Supports compliance verification

---

## 🔹 Authentication & Security

- JWT authentication
- BCrypt password hashing
- Role-based authorization
- Protected REST endpoints
- Stateless security configuration

---

## 🔹 Reliability & Edge Case Handling

- Duplicate alert prevention
- Escalation loop protection
- Concurrent request safety
- Global exception handling
- Transaction rollback safety

---

# 🧠 Alert Processing Lifecycle

1. Alert received via REST API  
2. Request authenticated (JWT)  
3. Alert persisted in database  
4. Rule engine evaluates conditions  
5. SLA validation executed  
6. Escalation triggered (if required)  
7. Event log created  
8. Notification dispatched  
9. Updated response returned  

Time Complexity:

- Rule evaluation: O(n)
- Event logging: O(1)
- Status update: O(1)

---

# 🛠️ Tech Stack

## Backend

- Java 21
- Spring Boot
- Spring Security (JWT)
- JPA / Hibernate
- MySQL
- Maven

## Frontend

- React (Vite)
- Tailwind CSS
- Axios
- React Router

---

# 🚀 Quick Start

## Prerequisites

- Java 21
- Maven
- Node.js 16+
- MySQL running locally

---

## Clone Repository

```bash
git clone https://github.com/phanipaladugula/Alert-Escalation-Resolution-System-MoveInSync.git
```

---

## Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Configure:

```
spring.datasource.url=jdbc:mysql://localhost:3306/alertsystem
spring.datasource.username=root
spring.datasource.password=yourpassword
jwt.secret=your_256_bit_secret_key
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit:

```
http://localhost:5173
```

---

# 📂 Repository Structure

```
/Alert-Escalation-Resolution-System
├── /frontend
│   ├── /src
│   ├── package.json
│   └── tailwind.config.js
│
├── /backend
│   ├── /controller
│   ├── /service
│   ├── /repository
│   ├── /entity
│   ├── /config
│   ├── /exception
│   └── AlertSystemApplication.java
│
├── /docs
│   ├── er-diagram.png
│   ├── sequence-diagram.png
│   ├── class-diagram.png
│   └── usecase-diagram.png
│
└── README.md
```

---

# 📈 Trade-Off Decisions

| Decision | Trade-Off |
|----------|-----------|
| Stateless JWT | Scalable but manual revocation needed |
| Rule-based engine | Simple & predictable vs ML-driven |
| REST architecture | Simpler vs event-stream system |
| In-memory checks | Fast vs non-persistent |

---

# 🧪 Testing Checklist

- Authentication flow verified
- Escalation scenarios tested
- SLA breach tested
- Concurrent requests tested
- Error handling validated
- No hardcoded secrets
- Environment variables externalized

---

# 🎯 Final Outcome

This system delivers:

- Automated incident handling
- Intelligent escalation workflows
- SLA enforcement
- Secure access control
- Audit-compliant event tracking
- Enterprise-ready backend architecture

The project reflects real-world production system design aligned with scalable enterprise alert management platforms.

---
