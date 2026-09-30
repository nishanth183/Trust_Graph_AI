# Database Architecture: Hybrid Document & Graph Engine

## Storage Strategy
TrustGraph AI uses a dual-tier storage strategy:
1. **Document Storage (MongoDB Compatible / File-Backed Persistent Engine)**:
   - Stores cases, raw evidence dictionaries, DNA genomes, risk scores, and audit logs.
   - Collections:
     - `cases`
     - `recruitment_dna`
     - `scam_indicators`
     - `audit_logs`
     - `official_registry`
2. **Graph Storage (Neo4j Compatible / NetworkX In-Memory with JSON Serialization)**:
   - Manages entity nodes and directed relationship edges.
   - Computes network graph metrics (degree centrality, suspicious connection ratios, and cross-case syndicate linkage).
