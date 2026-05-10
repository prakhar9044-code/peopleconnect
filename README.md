```mermaid
graph TD;
    A[Client User Interface] -->|GSAP / Three.js| B(React Frontend);
    B -->|REST / GraphQL| C{Node.js / Python Services};
    C -->|Authentication| D[Supabase Auth];
    C -->|Data Persistence| E[(Supabase DB)];
    C -->|AI Predictive Models| F[Python ML Microservices];
    style A fill:#000000,stroke:#00E5FF,stroke-width:2px,color:#fff
    style B fill:#000000,stroke:#00E5FF,stroke-width:2px,color:#fff
    style C fill:#000000,stroke:#0055FF,stroke-width:2px,color:#fff
    style D fill:#000000,stroke:#3ECF8E,stroke-width:2px,color:#fff
    style E fill:#000000,stroke:#3ECF8E,stroke-width:2px,color:#fff
    style F fill:#000000,stroke:#FFD43B,stroke-width:2px,color:#fff
