import networkx as nx
from typing import Dict, Any, List, Optional

class EvidenceGraphService:
    """
    Core Innovation: Evidence Graph Generator.
    Builds an attributed knowledge graph representing extracted entities, relationships,
    and verified/suspicious states for deep relationship reasoning and Cytoscape visualization.
    """

    def build_graph(
        self,
        case_id: str,
        evidence: Dict[str, Any],
        verification_details: Optional[Dict[str, Any]] = None,
        scam_links: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        G = nx.DiGraph()

        verif = verification_details or {}
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []

        def add_node(node_id: str, label: str, node_type: str, status: str, extra: Optional[Dict[str, Any]] = None):
            data = {
                "id": node_id,
                "label": label,
                "type": node_type,
                "status": status,
                **(extra or {})
            }
            G.add_node(node_id, **data)
            nodes.append({"data": data})

        def add_edge(source_id: str, target_id: str, rel_type: str, status: str):
            edge_id = f"e_{source_id}_{target_id}_{rel_type}"
            data = {
                "id": edge_id,
                "source": source_id,
                "target": target_id,
                "label": rel_type,
                "status": status
            }
            G.add_edge(source_id, target_id, **data)
            edges.append({"data": data})

        # 1. Root Recruitment / Notification Node
        notif_num = evidence.get("notification_number") or f"Notice-{case_id}"
        notif_status = verif.get("notification_status", "UNKNOWN")
        notif_id = f"notif_{case_id}"
        add_node(notif_id, notif_num, "Notification", notif_status, {
            "title": evidence.get("job_title", "Recruitment Notice"),
            "fee": evidence.get("application_fee")
        })

        # 2. Organization Node
        org_name = evidence.get("organization") or "Claimed Government Body"
        org_status = verif.get("organization_status", "UNKNOWN")
        org_id = f"org_{case_id}"
        add_node(org_id, org_name, "Organization", org_status, {
            "dept": evidence.get("department")
        })
        add_edge(notif_id, org_id, "PUBLISHED_BY", org_status)

        # 3. Website & Domain Node
        website = evidence.get("website")
        domain = evidence.get("domain")
        if domain:
            dom_status = verif.get("domain_status", "UNKNOWN")
            dom_id = f"dom_{case_id}"
            add_node(dom_id, domain, "Domain", dom_status, {
                "url": website,
                "is_gov_in": domain.endswith(".gov.in") or domain.endswith(".nic.in")
            })
            add_edge(notif_id, dom_id, "USES_DOMAIN", dom_status)

        # 4. Email Node
        email = evidence.get("email")
        if email:
            email_status = verif.get("email_status", "UNKNOWN")
            email_id = f"email_{case_id}"
            add_node(email_id, email, "Email", email_status, {})
            add_edge(notif_id, email_id, "USES_EMAIL", email_status)

        # 5. Phone Node
        phone = evidence.get("phone")
        if phone:
            phone_status = "SUSPICIOUS" if (scam_links and any(l.get("entity_type") == "phone" for l in scam_links)) else "UNKNOWN"
            phone_id = f"phone_{case_id}"
            add_node(phone_id, phone, "Phone", phone_status, {})
            add_edge(notif_id, phone_id, "CONTACTED_BY", phone_status)

        # 6. QR Code Node
        if evidence.get("qr_detected"):
            qr_status = "CONFLICT" if evidence.get("upi_id") else "SUSPICIOUS"
            qr_id = f"qr_{case_id}"
            add_node(qr_id, "Payment QR Code", "QR", qr_status, {
                "qr_data": evidence.get("qr_data")
            })
            add_edge(notif_id, qr_id, "HAS_QR", qr_status)

            # If QR points to UPI
            if evidence.get("upi_id"):
                upi_id_node = f"upi_{case_id}"
                upi_status = "CONFLICT"
                add_node(upi_id_node, evidence.get("upi_id"), "UPI", upi_status, {})
                add_edge(qr_id, upi_id_node, "POINTS_TO", upi_status)
        elif evidence.get("upi_id"):
            upi_id_node = f"upi_{case_id}"
            upi_status = "CONFLICT"
            add_node(upi_id_node, evidence.get("upi_id"), "UPI", upi_status, {})
            add_edge(notif_id, upi_id_node, "REQUESTS_PAYMENT", upi_status)

        # 7. Source Platform Node
        source = evidence.get("source_platform") or "Direct"
        if source:
            source_id = f"src_{case_id}"
            add_node(source_id, f"Source: {source}", "Source", "NEUTRAL", {})
            add_edge(source_id, notif_id, "APPEARS_IN", "NEUTRAL")

        # 8. Cross-Case Scam Links (Repeated Infrastructure)
        if scam_links:
            for idx, link in enumerate(scam_links):
                prev_case_id = link.get("connected_case_id")
                link_node_id = f"prev_case_{prev_case_id}"
                add_node(link_node_id, f"Case: {prev_case_id}", "CaseHistory", "CONFLICT", {
                    "reason": link.get("reason"),
                    "strength": link.get("connection_strength")
                })
                # Connect target entity to previous scam case
                target_entity = link.get("entity_type")
                if target_entity == "phone" and phone:
                    add_edge(f"phone_{case_id}", link_node_id, "CONNECTED_TO", "CONFLICT")
                elif target_entity == "upi" and evidence.get("upi_id"):
                    add_edge(f"upi_{case_id}", link_node_id, "CONNECTED_TO", "CONFLICT")
                elif target_entity == "domain" and domain:
                    add_edge(f"dom_{case_id}", link_node_id, "CONNECTED_TO", "CONFLICT")

        # Calculate network metrics
        try:
            centrality = nx.degree_centrality(G)
        except Exception:
            centrality = {}

        suspicious_edges = sum(1 for e in edges if e["data"].get("status") in ["CONFLICT", "SUSPICIOUS"])

        return {
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "suspicious_edges_count": suspicious_edges,
            "degree_centrality": {k: round(v, 3) for k, v in centrality.items()}
        }

graph_service = EvidenceGraphService()
