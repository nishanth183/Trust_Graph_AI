# Recruitment DNA: Digital Feature Representation

## Concept
Recruitment DNA is **not biological DNA**. It is a structured, 9-dimensional digital feature genome representing the institutional, procedural, and communicative attributes of an employment notice.

## Signatures

| Signature | Description | Key Attributes |
|---|---|---|
| **Organization Signature** | Claimed hiring authority | Identity hash, central vs state level, ministry hierarchy |
| **Notification Signature** | Advertisement index | Gazette number format conformity, cyclostyled index hash |
| **Domain Signature** | Web authority | `.gov.in`/`.nic.in` apex verification, SSL, TLD risk score |
| **Contact Signature** | Communication routing | Public webmail check, authorized departmental mail server |
| **Visual Signature** | Document layout/crests | Ashoka pillar/crest presence, embedded payment QR code detection |
| **Writing Signature** | Linguistic style | Coercive urgency, guaranteed appointment claims, caps ratio |
| **Layout Signature** | Document typography | Gazette columnar table vs informal circular |
| **Payment Signature** | Fee mechanism | Authorized cyber treasury vs direct personal UPI |
| **Temporal Signature** | Application window | Realistic 21-30 day filing window vs 24h panic timer |

## Similarity Calculation
$$\text{Score} = \sum_{i=1}^{9} w_i \cdot \text{Sim}(S_{\text{submitted}}^{(i)}, S_{\text{trusted}}^{(i)})$$

Where weights $w_i$ prioritize critical fraud vectors:
- Domain Authenticity: 25%
- Payment Gateway Channel: 25%
- Contact Channel / Email: 15%
- Notification Gazette Format: 15%
- Linguistic Integrity: 10%
- Application Window / Temporal: 5%
- Document QR Safety: 5%
