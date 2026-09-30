# AI Pipeline & Machine Learning Risk Engine

## 1. Feature Vector Formulation
The ML risk engine transforms multi-modal evidence into a calibrated 15-dimensional numerical feature vector:

1. `nlp_risk_score`: Score (0-100) reflecting coercive language and pressure tactics
2. `domain_risk_score`: Heuristic risk of TLD and typosquatting pattern
3. `email_risk_score`: Public mailbox vs institutional mail host
4. `payment_risk_score`: Personal UPI presence vs official gateway
5. `qr_detected_flag`: Binary presence of embedded QR code
6. `official_notif_match`: Binary match against official gazette index
7. `official_domain_match`: Binary match against `.gov.in`/`.nic.in` registry
8. `official_email_match`: Binary match against authorized commission mail host
9. `dna_similarity_score`: Mathematical similarity percentage (0-100)
10. `suspicious_edges_ratio`: Ratio of conflict edges in the Evidence Graph
11. `scam_network_link_count`: Count of matched historical scam syndicate entities
12. `contradiction_critical_count`: Count of critical contradiction rules triggered
13. `contradiction_high_count`: Count of high contradiction rules triggered
14. `urgency_score`: Frequency of urgency markers ("24h left", "apply today")
15. `guaranteed_job_claim_flag`: Binary indicator for "100% selection / direct joining"

## 2. Deterministic Safety Arbiter
Machine learning probability models can produce stochastic errors. To prevent an ML classifier from falsely classifying a notification with a personal UPI fee request as "Genuine", TrustGraph AI implements a **Deterministic Safety Arbiter**:
- If `contradiction_critical_count >= 1` (e.g. personal UPI handle found) $\rightarrow$ Force Classification to `SCAM`.
- If `scam_network_link_count >= 1` (reused fraudulent phone or UPI) $\rightarrow$ Force Classification to `SCAM`.
- If `official_notif_match == 1` AND `official_domain_match == 1` AND `contradictions == 0` $\rightarrow$ Force Classification to `GENUINE`.
- If evidence is missing $\rightarrow$ Output `INCONCLUSIVE` rather than forcing a false positive/negative.
