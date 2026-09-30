import os
from pathlib import Path
from typing import Dict, Any
from backend.config import REPORT_DIR

class ReportGenerator:
    """
    Generates verifiable analysis reports for citizens and cyber teams.
    Outputs formatted standalone HTML reports that are printable to PDF or viewable directly.
    """

    def generate_html_report(self, case: Dict[str, Any]) -> str:
        case_id = case.get("case_id", "TG-UNKNOWN")
        verdict = case.get("verdict", "INCONCLUSIVE")
        trust_score = case.get("trust_score", 0)
        risk_level = case.get("risk_level", "UNKNOWN")
        scam_prob = case.get("scam_probability", 0)
        evidence = case.get("extracted_evidence", {})
        dna = case.get("recruitment_dna", {})
        top_reasons = case.get("top_reasons", [])
        recommendation = case.get("recommended_action", "")
        created_at = case.get("created_at", "")
        contradictions = case.get("contradiction_findings", [])
        scam_links = case.get("scam_network_findings", [])

        # Color mapping
        verdict_color = "#10b981" if verdict == "GENUINE" else ("#ef4444" if verdict == "SCAM" else "#f59e0b")

        reasons_html = "".join([f"<li style='margin-bottom: 8px;'>{r}</li>" for r in top_reasons])
        
        contradictions_html = ""
        if contradictions:
            items = "".join([
                f"<div style='border-left: 3px solid #ef4444; padding-left: 10px; margin-bottom: 12px;'>"
                f"<strong>{c.get('factor')}</strong> <span style='font-size:11px; background:#fee2e2; color:#991b1b; padding:2px 6px; border-radius:4px;'>{c.get('severity')}</span>"
                f"<div style='font-size: 13px; color: #4b5563; margin-top: 4px;'>{c.get('explanation')}</div>"
                f"</div>"
                for c in contradictions
            ])
            contradictions_html = f"<div style='margin-top:20px;'><h3 style='color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:6px;'>Identified Evidence Contradictions</h3>{items}</div>"

        network_html = ""
        if scam_links:
            items = "".join([
                f"<div style='border-left: 3px solid #dc2626; padding-left: 10px; margin-bottom: 12px;'>"
                f"<strong>Repeated Infrastructure Matched:</strong> {l.get('reason')}"
                f"<div style='font-size: 12px; color: #6b7280;'>Connected Case: {l.get('connected_case_id')} | Entity: {l.get('entity_value')}</div>"
                f"</div>"
                for l in scam_links
            ])
            network_html = f"<div style='margin-top:20px;'><h3 style='color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:6px;'>Scam Syndicate Cross-Case Intelligence</h3>{items}</div>"

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TrustGraph AI Verification Certificate - {case_id}</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
  .container {{ max-width: 820px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); padding: 36px; border: 1px solid #e2e8f0; }}
  .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; }}
  .logo {{ font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }}
  .badge {{ background: {verdict_color}; color: #ffffff; padding: 6px 16px; border-radius: 9999px; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }}
  .meta-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; background: #f1f5f9; padding: 16px; border-radius: 8px; }}
  .meta-item div:first-child {{ font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }}
  .meta-item div:last-child {{ font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px; }}
  .card {{ background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin-bottom: 18px; }}
  .alert-box {{ background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 6px; margin-top: 24px; }}
  .footer {{ margin-top: 36px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }}
  @media print {{ body {{ background: #fff; padding: 0; }} .container {{ box-shadow: none; border: none; }} }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <div>
      <div class="logo">TRUSTGRAPH AI</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">AI-Based Fake Government Job & Recruitment Scam Detection System</div>
    </div>
    <div class="badge">{verdict}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <div>Case ID</div>
      <div>{case_id}</div>
    </div>
    <div class="meta-item">
      <div>Trust Score</div>
      <div style="color: {verdict_color};">{trust_score} / 100</div>
    </div>
    <div class="meta-item">
      <div>Risk Level</div>
      <div>{risk_level}</div>
    </div>
    <div class="meta-item">
      <div>Scam Probability</div>
      <div>{scam_prob}%</div>
    </div>
  </div>

  <div class="card">
    <h3 style="margin-top:0; color:#0f172a;">Executive Evidence Findings</h3>
    <ul style="padding-left: 20px; line-height: 1.6;">
      {reasons_html}
    </ul>
  </div>

  <div class="card">
    <h3 style="margin-top:0; color:#0f172a;">Extracted Recruitment Credentials</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color:#64748b; width: 35%;">Claimed Organization:</td><td style="font-weight: 600;">{evidence.get('organization') or 'Not Specified'}</td></tr>
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color:#64748b;">Notification / Advt No:</td><td style="font-weight: 600;">{evidence.get('notification_number') or 'None Identified'}</td></tr>
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color:#64748b;">Target Domain / Portal:</td><td style="font-weight: 600;">{evidence.get('domain') or 'None'}</td></tr>
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color:#64748b;">Contact Email:</td><td style="font-weight: 600;">{evidence.get('email') or 'None'}</td></tr>
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color:#64748b;">Contact Phone / WhatsApp:</td><td style="font-weight: 600;">{evidence.get('phone') or 'None'}</td></tr>
      <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color:#64748b;">Fee / UPI Payment Handle:</td><td style="font-weight: 600;">{evidence.get('upi_id') or ('₹' + str(evidence.get('application_fee')) if evidence.get('application_fee') else 'None')}</td></tr>
      <tr><td style="padding: 8px 0; color:#64748b;">Recruitment DNA Similarity:</td><td style="font-weight: 600;">{dna.get('similarity_score', 0)}% Match with Trusted Government Patterns</td></tr>
    </table>
  </div>

  {contradictions_html}
  {network_html}

  <div class="alert-box">
    <strong style="color: #1e3a8a; display: block; margin-bottom: 4px;">Recommended Advisory Action:</strong>
    <span style="font-size: 14px; color: #1e40af;">{recommendation}</span>
  </div>

  <div class="footer">
    Verified by TrustGraph AI Core Reasoning Engine on {created_at}.<br>
    "We don't trust the message; we trust the evidence."
  </div>
</div>
</body>
</html>
"""
        report_path = REPORT_DIR / f"{case_id}.html"
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return str(report_path)

report_generator = ReportGenerator()
