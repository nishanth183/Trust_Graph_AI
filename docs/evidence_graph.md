# Evidence Graph: Entity-Relationship Knowledge Representation

## Overview
The Evidence Graph structures extracted facts into typed entities and attributed relationships. This enables graph analytics (degree centrality, community detection) and exposes repeated scam infrastructure across distinct cases.

## Entity Types (Nodes)
- **Organization**: Claimed government commission (e.g. UPSC, RRB, India Post)
- **Notification**: Advertisement or circular index
- **Domain**: Web domain hosting the recruitment application form
- **Email**: Contact email address
- **Phone**: Contact helpline or WhatsApp number
- **QR**: Embedded QR code in image or PDF
- **UPI**: Direct UPI recipient address (e.g. `officer@okaxis`)
- **CaseHistory**: Historical flagged scam cases

## Relationship Types (Edges)
- `PUBLISHED_BY`: Link from Notification to Organization
- `USES_DOMAIN`: Link from Notification to Domain
- `USES_EMAIL`: Link from Notification to Email
- `CONTACTED_BY`: Link from Notification to Phone
- `HAS_QR`: Link from Notification to QR Code
- `REQUESTS_PAYMENT`: Link from Notification to UPI Account
- `POINTS_TO`: Link from QR Code to Payment Destination
- `CONNECTED_TO`: Link from Phone/UPI/Domain to a previously reported scam case
- `APPEARS_IN`: Link from Source (WhatsApp, Telegram) to Notification

## Visual States
- `VERIFIED`: Official government entity confirmed in knowledge base
- `CONFLICT`: Unauthorized private entity masquerading as public authority
- `SUSPICIOUS`: Unverified aggregator or missing credentials
- `NEUTRAL`: Contextual node (e.g. source platform)
