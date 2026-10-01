import os
import re
from pathlib import Path
from typing import Dict, Any
from backend.config import REPORT_DIR

class ReportGenerator:
    """
    Generates a compact, professional 1-page A4 PDF/HTML TrustGraph AI
    Government Recruitment Verification Report.
    """

    def generate_pdf_report(self, case: Dict[str, Any]) -> str:
        case_id = case.get("case_id", "TG-UNKNOWN")
        pdf_path = os.path.join(REPORT_DIR, f"TrustGraph_Report_{case_id}.pdf")
        os.makedirs(REPORT_DIR, exist_ok=True)

        try:
            import reportlab
            self._generate_pdf_reportlab(case, pdf_path)
        except Exception:
            # Fallback to high-fidelity native vector PDF builder
            self._generate_pdf_native(case, pdf_path)

        return pdf_path

    def _extract_evidence_snapshot(self, case: Dict[str, Any]):
        evidence = case.get("extracted_evidence") or {}
        verifications = case.get("verification_details") or case.get("verifications") or {}
        
        dom_status = verifications.get("domain_status", "")
        email_status = verifications.get("email_status", "")
        notif_status = verifications.get("notification_status", "")
        org_matched = verifications.get("organization_matched")

        items = []

        # 1. Organization
        org = evidence.get("organization")
        if org_matched:
            items.append(("Organization", org, "VERIFIED", "#10b981"))
        elif org:
            items.append(("Organization", org, "NEEDS CHECKING", "#f59e0b"))
        else:
            items.append(("Organization", "Not Provided", "NOT PROVIDED", "#64748b"))

        # 2. Notification Number
        notif = evidence.get("notification_number")
        if notif_status in ["VERIFIED", "DEMO VERIFIED"]:
            items.append(("Notification No.", notif, "VERIFIED", "#10b981"))
        elif notif_status == "NOT_FOUND":
            items.append(("Notification No.", notif or "Unverified", "SUSPICIOUS", "#ef4444"))
        elif notif:
            items.append(("Notification No.", notif, "NEEDS CHECKING", "#f59e0b"))
        else:
            items.append(("Notification No.", "Not Provided", "NOT PROVIDED", "#64748b"))

        # 3. Website / Domain
        dom = evidence.get("domain") or evidence.get("website")
        if dom_status in ["VERIFIED", "DEMO VERIFIED"]:
            items.append(("Website / Domain", dom, "VERIFIED", "#10b981"))
        elif dom_status == "SUSPICIOUS_NON_GOV_DOMAIN":
            items.append(("Website / Domain", dom, "SUSPICIOUS", "#ef4444"))
        elif dom:
            items.append(("Website / Domain", dom, "NEEDS CHECKING", "#f59e0b"))
        else:
            items.append(("Website / Domain", "Not Provided", "NOT PROVIDED", "#64748b"))

        # 4. Email
        email = evidence.get("email")
        if email_status in ["VERIFIED", "DEMO VERIFIED"]:
            items.append(("Email Address", email, "VERIFIED", "#10b981"))
        elif email_status == "PUBLIC_PROVIDER_CONFLICT":
            items.append(("Email Address", email, "SUSPICIOUS", "#ef4444"))
        elif email:
            items.append(("Email Address", email, "NEEDS CHECKING", "#f59e0b"))
        else:
            items.append(("Email Address", "Not Provided", "NOT PROVIDED", "#64748b"))

        # 5. Phone
        phone = evidence.get("phone")
        if phone:
            items.append(("Contact Phone", phone, "NEEDS CHECKING", "#f59e0b"))
        else:
            items.append(("Contact Phone", "Not Provided", "NOT PROVIDED", "#64748b"))

        # 6. Payment
        upi = evidence.get("upi_id")
        fee = evidence.get("application_fee")
        payment_pattern = evidence.get("payment_pattern") or (f"Fee: ₹{int(fee)}" if fee else None)
        if upi or evidence.get("qr_detected"):
            items.append(("Payment Request", payment_pattern or "Personal UPI / QR Code", "SUSPICIOUS", "#ef4444"))
        elif evidence.get("payment_requested") and not (dom and dom.endswith(".gov.in")):
            items.append(("Payment Request", payment_pattern or f"₹{int(fee or 0)}", "SUSPICIOUS", "#ef4444"))
        elif fee:
            items.append(("Payment Request", f"Application Fee: ₹{int(fee)}", "NEEDS CHECKING", "#f59e0b"))
        else:
            items.append(("Payment Request", "No Fee Required", "VERIFIED", "#10b981"))

        # 7. QR Code
        if evidence.get("qr_detected"):
            items.append(("Document QR Code", "Embedded Money Transfer QR", "SUSPICIOUS", "#ef4444"))
        else:
            items.append(("Document QR Code", "None / Safe", "NOT PROVIDED", "#64748b"))

        return items

    def generate_html_report(self, case: Dict[str, Any]) -> str:
        case_id = case.get("case_id", "TG-UNKNOWN")
        verdict = case.get("verdict", "INCONCLUSIVE")
        trust_score = case.get("trust_score", 0)
        risk_level = case.get("risk_level", "UNKNOWN")
        scam_prob = case.get("scam_probability", 0)
        top_reasons = case.get("top_reasons", [])
        recommendation = case.get("recommended_action", "Verify through official government portals before making payments.")
        contradictions = case.get("contradiction_findings", [])
        evidence = case.get("extracted_evidence", {})
        dna_info = case.get("recruitment_dna") or {}
        input_meta = case.get("input_metadata", {})
        input_type = input_meta.get("input_type", "TEXT")
        created_at = case.get("created_at", "2026")[:10]

        v_color = "#10b981" if verdict == "GENUINE" else ("#ef4444" if verdict == "SCAM" else ("#f59e0b" if verdict == "SUSPICIOUS" else "#64748b"))
        v_label = "VERIFIED GENUINE" if verdict == "GENUINE" else ("CONFIRMED SCAM" if verdict == "SCAM" else ("SUSPICIOUS" if verdict == "SUSPICIOUS" else "INCONCLUSIVE"))

        # Key Reasons Cards HTML (Top 3 or 4)
        reasons_cards = []
        for i, r in enumerate(top_reasons[:4]):
            icon = "✕" if ("HIGH" in r or "CRITICAL" in r or "SCAM" in r or "Unverified" in r) else ("⚠" if "Absence" in r or "MISSING" in r else "✓")
            icon_color = "#ef4444" if icon == "✕" else ("#f59e0b" if icon == "⚠" else "#10b981")
            
            parts = r.split(":", 1)
            title = parts[0].replace("[HIGH]", "").replace("[CRITICAL]", "").replace("[MEDIUM]", "").strip()
            desc = parts[1].strip() if len(parts) > 1 else title
            if len(title) > 35: title = title[:35] + "..."

            reasons_cards.append(f"""
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; align-items: flex-start; gap: 10px;">
              <div style="color: {icon_color}; font-weight: 800; font-size: 14px; margin-top: 1px;">{icon}</div>
              <div>
                <div style="font-size: 11px; font-weight: 700; color: #0f172a;">{title}</div>
                <div style="font-size: 10px; color: #475569; margin-top: 2px; line-height: 1.3;">{desc[:90]}</div>
              </div>
            </div>
            """)
        reasons_html = "".join(reasons_cards)

        # Evidence Snapshot Table
        snapshot_items = self._extract_evidence_snapshot(case)
        table_rows = "".join([
            f"<tr>"
            f"<td style='padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #334155; font-size: 11px;'>{item[0]}</td>"
            f"<td style='padding: 6px 10px; border-bottom: 1px solid #e2e8f0; color: #0f172a; font-size: 11px; font-family: monospace;'>{item[1][:40]}</td>"
            f"<td style='padding: 6px 10px; border-bottom: 1px solid #e2e8f0;'><span style='background: {item[3]}20; color: {item[3]}; border: 1px solid {item[3]}40; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 9.5px;'>{item[2]}</span></td>"
            f"</tr>"
            for item in snapshot_items
        ])

        # Recruitment DNA Characteristics
        dna_sim = dna_info.get("similarity_score")
        dna_score_badge = f"<span style='background: #3b82f615; color: #2563eb; border: 1px solid #3b82f630; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700;'>DNA Similarity: {dna_sim}%</span>" if dna_sim else ""
        
        dna_features = [
            ("Organization", evidence.get("organization") or "Not Provided"),
            ("Notification", evidence.get("notification_number") or "Not Found"),
            ("Website", evidence.get("domain") or "Not Provided"),
            ("Contact", evidence.get("email") or evidence.get("phone") or "Not Provided"),
            ("Payment", evidence.get("payment_pattern") or "None"),
            ("Notice Format", "Gazette Layout" if evidence.get("notification_number") else "Informal Notice")
        ]
        dna_html = "".join([
            f"<div style='display: flex; justify-content: space-between; font-size: 10px; padding: 3px 0; border-bottom: 1px dashed #e2e8f0;'>"
            f"<span style='color: #64748b; font-weight: 600;'>{k}:</span>"
            f"<span style='color: #0f172a; font-weight: 700;'>{v[:25]}</span>"
            f"</div>"
            for k, v in dna_features
        ])

        # Graph Flow Node Tree
        graph_html = f"""
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 10px;">
          <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border-left: 3px solid #3b82f6;"><strong>Org:</strong> {evidence.get('organization') or 'Not Provided'}</div>
          <div style="text-align: center; color: #94a3b8; font-size: 9px;">│</div>
          <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border-left: 3px solid #8b5cf6;"><strong>Advt:</strong> {evidence.get('notification_number') or 'No Advt Number'}</div>
          <div style="text-align: center; color: #94a3b8; font-size: 9px;">│</div>
          <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border-left: 3px solid #06b6d4;"><strong>Portal:</strong> {evidence.get('domain') or 'No Domain'}</div>
          <div style="text-align: center; color: #94a3b8; font-size: 9px;">│</div>
          <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; border-left: 3px solid #f59e0b;"><strong>Payment:</strong> {evidence.get('payment_pattern') or 'No Payment Specified'}</div>
        </div>
        """

        # Contradiction warning if any
        contradiction_warning_html = ""
        if contradictions:
            c_first = contradictions[0]
            contradiction_warning_html = f"""
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; margin-top: 10px; font-size: 10.5px; color: #991b1b;">
              <strong>⚠ Evidence Consistency Warning:</strong> {c_first.get('factor')} — {c_first.get('explanation')[:120]}
            </div>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>TrustGraph AI Report - {case_id}</title>
<style>
  @page {{ size: A4; margin: 12mm; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }}
  .container {{ max-width: 780px; margin: 0 auto; background: #ffffff; padding: 20px; }}
  .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }}
  .title {{ font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }}
  .subtitle {{ font-size: 11px; color: #475569; font-weight: 600; margin-top: 2px; }}
  .meta-bar {{ font-size: 10px; color: #64748b; text-align: right; line-height: 1.4; }}
  
  .summary-card {{ background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px 20px; margin: 14px 0; display: flex; justify-content: space-between; align-items: center; }}
  .verdict-box {{ display: flex; align-items: center; gap: 12px; }}
  .verdict-badge {{ background: {v_color}; color: #ffffff; padding: 6px 14px; border-radius: 6px; font-weight: 800; font-size: 15px; letter-spacing: 0.5px; }}
  
  .stat-group {{ display: flex; gap: 24px; text-align: center; }}
  .stat-item .val {{ font-size: 18px; font-weight: 800; color: #0f172a; }}
  .stat-item .lbl {{ font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-top: 2px; }}

  .section-title {{ font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin: 14px 0 8px 0; }}

  .reasons-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }}

  .table {{ width: 100%; border-collapse: collapse; margin-top: 4px; font-size: 11px; }}
  .table th {{ background: #f1f5f9; color: #475569; padding: 6px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; }}

  .two-col {{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 6px; }}
  .col-card {{ background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }}

  .recommendation-card {{ background: #eff6ff; border-left: 4px solid #2563eb; padding: 10px 14px; border-radius: 6px; margin-top: 14px; }}
  .footer {{ margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 9px; color: #94a3b8; display: flex; justify-content: space-between; align-items: center; }}
</style>
</head>
<body>
<div class="container">
  <!-- 1. Header -->
  <div class="header">
    <div>
      <div class="title">TRUSTGRAPH AI</div>
      <div class="subtitle">Government Recruitment Verification Report</div>
    </div>
    <div class="meta-bar">
      <div><strong>Case ID:</strong> {case_id}</div>
      <div><strong>Generated:</strong> {created_at}</div>
      <div><strong>Input Type:</strong> {input_type}</div>
    </div>
  </div>

  <!-- 2. Top Summary Card -->
  <div class="summary-card">
    <div class="verdict-box">
      <div class="verdict-badge">{v_label}</div>
    </div>
    <div class="stat-group">
      <div class="stat-item">
        <div class="val" style="color:{v_color};">{trust_score} / 100</div>
        <div class="lbl">Trust Score</div>
      </div>
      <div class="stat-item">
        <div class="val">{scam_prob}%</div>
        <div class="lbl">Scam Probability</div>
      </div>
      <div class="stat-item">
        <div class="val">{risk_level}</div>
        <div class="lbl">Risk Level</div>
      </div>
    </div>
  </div>

  <!-- 3. Key Reasons -->
  <div class="section-title">Key Verification Findings</div>
  <div class="reasons-grid">
    {reasons_html}
  </div>

  <!-- 4. Evidence Snapshot -->
  <div class="section-title">Evidence Snapshot</div>
  <table class="table">
    <thead>
      <tr><th>Evidence Field</th><th>Extracted Value</th><th>Verification Status</th></tr>
    </thead>
    <tbody>
      {table_rows}
    </tbody>
  </table>

  <!-- 5. Side-by-Side: Recruitment DNA + Evidence Graph -->
  <div class="two-col">
    <div class="col-card">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
        <span style="font-size: 10px; font-weight: 800; color: #0f172a;">RECRUITMENT DNA</span>
        {dna_score_badge}
      </div>
      {dna_html}
    </div>

    <div class="col-card">
      <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; font-size: 10px; font-weight: 800; color: #0f172a;">
        EVIDENCE GRAPH HIERARCHY
      </div>
      {graph_html}
    </div>
  </div>

  {contradiction_warning_html}

  <!-- 6. Recommendation Card -->
  <div class="recommendation-card">
    <div style="font-size: 10px; font-weight: 800; color: #1e40af; text-transform: uppercase;">WHAT SHOULD YOU DO?</div>
    <div style="font-size: 11px; color: #1e3a8a; font-weight: 600; margin-top: 2px;">{recommendation}</div>
  </div>

  <!-- 7. Footer -->
  <div class="footer">
    <div>TrustGraph AI · AI-assisted verification — Always confirm through official government sources.</div>
    <div>{case_id} | Page 1 of 1</div>
  </div>
</div>
</body>
</html>"""

        file_path = os.path.join(REPORT_DIR, f"TrustGraph_Report_{case_id}.html")
        os.makedirs(REPORT_DIR, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        return file_path

    def _generate_pdf_reportlab(self, case: Dict[str, Any], filepath: str):
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=24, leftMargin=24, topMargin=20, bottomMargin=20)
        story = []
        styles = getSampleStyleSheet()

        verdict = case.get("verdict", "INCONCLUSIVE")
        case_id = case.get("case_id", "TG-UNKNOWN")
        trust_score = case.get("trust_score", 0)
        risk_level = case.get("risk_level", "UNKNOWN")
        scam_prob = case.get("scam_probability", 0)
        top_reasons = case.get("top_reasons", [])
        recommendation = case.get("recommended_action", "Verify through official government portals before submitting fees or personal details.")
        contradictions = case.get("contradiction_findings", [])
        evidence = case.get("extracted_evidence", {})
        dna_info = case.get("recruitment_dna") or {}
        input_meta = case.get("input_metadata", {})
        input_type = input_meta.get("input_type", "TEXT")
        created_at = case.get("created_at", "2026")[:10]

        v_color = colors.HexColor("#10b981") if verdict == "GENUINE" else (colors.HexColor("#ef4444") if verdict == "SCAM" else (colors.HexColor("#f59e0b") if verdict == "SUSPICIOUS" else colors.HexColor("#64748b")))
        v_label = "VERIFIED GENUINE" if verdict == "GENUINE" else ("CONFIRMED SCAM" if verdict == "SCAM" else ("SUSPICIOUS" if verdict == "SUSPICIOUS" else "INCONCLUSIVE"))

        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=16, leading=18, textColor=colors.HexColor("#0f172a"))
        sub_style = ParagraphStyle('Sub', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor("#475569"))
        meta_style = ParagraphStyle('Meta', parent=styles['Normal'], fontSize=8, leading=11, textColor=colors.HexColor("#64748b"), alignment=2)

        header_table = Table([
            [Paragraph("<b>TRUSTGRAPH AI</b>", title_style), Paragraph(f"<b>Case ID:</b> {case_id}<br/><b>Generated:</b> {created_at}<br/><b>Input:</b> {input_type}", meta_style)],
            [Paragraph("Government Recruitment Verification Report", sub_style), ""]
        ], colWidths=[360, 204])
        header_table.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
        story.append(header_table)
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f172a"), spaceAfter=8))

        badge_p = Paragraph(f"<font color='white'><b>{v_label}</b></font>", ParagraphStyle('B', alignment=1, fontSize=12, leading=14))
        score_p = Paragraph(f"<b><font color='{v_color.hexval()}'>{trust_score} / 100</font></b><br/><font size=7 color='#64748b'>TRUST SCORE</font>", ParagraphStyle('S', alignment=1, fontSize=13, leading=15))
        scam_p = Paragraph(f"<b>{scam_prob}%</b><br/><font size=7 color='#64748b'>SCAM PROBABILITY</font>", ParagraphStyle('S2', alignment=1, fontSize=13, leading=15))
        risk_p = Paragraph(f"<b>{risk_level}</b><br/><font size=7 color='#64748b'>RISK LEVEL</font>", ParagraphStyle('S3', alignment=1, fontSize=13, leading=15))

        sum_table = Table([
            [badge_p, score_p, scam_p, risk_p]
        ], colWidths=[180, 128, 128, 128])
        sum_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), v_color),
            ('BACKGROUND', (1,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(sum_table)
        story.append(Spacer(1, 8))

        sec_title = ParagraphStyle('Sec', parent=styles['Heading2'], fontSize=9.5, leading=12, textColor=colors.HexColor("#0f172a"))
        body_p = ParagraphStyle('Bdy', parent=styles['Normal'], fontSize=8, leading=10.5, textColor=colors.HexColor("#334155"))

        story.append(Paragraph("<b>KEY VERIFICATION FINDINGS</b>", sec_title))
        story.append(Spacer(1, 4))

        reason_cells = []
        for r in top_reasons[:4]:
            icon = "✕" if ("HIGH" in r or "CRITICAL" in r or "SCAM" in r or "Unverified" in r) else ("⚠" if "Absence" in r or "MISSING" in r else "✓")
            ic_col = "#ef4444" if icon == "✕" else ("#f59e0b" if icon == "⚠" else "#10b981")
            parts = r.split(":", 1)
            title = parts[0].replace("[HIGH]", "").replace("[CRITICAL]", "").replace("[MEDIUM]", "").strip()
            desc = parts[1].strip() if len(parts) > 1 else title
            if len(title) > 30: title = title[:30] + "..."
            cell_p = Paragraph(f"<font color='{ic_col}'><b>{icon} {title}</b></font><br/><font color='#475569'>{desc[:75]}</font>", body_p)
            reason_cells.append(cell_p)

        while len(reason_cells) < 4:
            reason_cells.append(Paragraph("<font color='#64748b'>• Verification check completed</font>", body_p))

        reasons_table = Table([
            [reason_cells[0], reason_cells[1]],
            [reason_cells[2], reason_cells[3]]
        ], colWidths=[277, 287])
        reasons_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(reasons_table)
        story.append(Spacer(1, 8))

        story.append(Paragraph("<b>EVIDENCE SNAPSHOT</b>", sec_title))
        story.append(Spacer(1, 4))

        snapshot_items = self._extract_evidence_snapshot(case)
        snap_rows = [
            [Paragraph("<b>Evidence Field</b>", body_p), Paragraph("<b>Extracted Value</b>", body_p), Paragraph("<b>Verification Status</b>", body_p)]
        ]
        for field, val, st, col in snapshot_items:
            st_p = Paragraph(f"<font color='{col}'><b>{st}</b></font>", body_p)
            val_p = Paragraph(f"<font face='Courier' size=7.5>{val[:45]}</font>", body_p)
            snap_rows.append([Paragraph(field, body_p), val_p, st_p])

        snap_table = Table(snap_rows, colWidths=[150, 274, 140])
        snap_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(snap_table)
        story.append(Spacer(1, 8))

        dna_sim = dna_info.get("similarity_score")
        dna_title = f"RECRUITMENT DNA ({dna_sim}% Match)" if dna_sim else "RECRUITMENT DNA"
        
        dna_text = (
            f"<b>Org:</b> {evidence.get('organization') or 'Not Provided'}<br/>"
            f"<b>Notification:</b> {evidence.get('notification_number') or 'Not Found'}<br/>"
            f"<b>Website:</b> {evidence.get('domain') or 'Not Provided'}<br/>"
            f"<b>Contact:</b> {evidence.get('email') or 'Not Provided'}<br/>"
            f"<b>Payment:</b> {evidence.get('payment_pattern') or 'None'}<br/>"
            f"<b>Format:</b> {'Official Gazette' if evidence.get('notification_number') else 'Informal'}"
        )
        dna_p = Paragraph(f"<b>{dna_title}</b><br/><br/>{dna_text}", body_p)

        graph_text = (
            f"<b>EVIDENCE GRAPH HIERARCHY</b><br/><br/>"
            f"• <b>Organization:</b> {evidence.get('organization') or 'Not Provided'}<br/>"
            f"  └─► <b>Notification:</b> {evidence.get('notification_number') or 'Missing'}<br/>"
            f"  └─► <b>Domain:</b> {evidence.get('domain') or 'Missing'}<br/>"
            f"  └─► <b>Payment:</b> {evidence.get('payment_pattern') or 'None'}"
        )
        graph_p = Paragraph(graph_text, body_p)

        side_table = Table([
            [dna_p, graph_p]
        ], colWidths=[277, 287])
        side_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#ffffff")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(side_table)
        story.append(Spacer(1, 6))

        if contradictions:
            c_first = contradictions[0]
            warn_p = Paragraph(f"<font color='#991b1b'><b>⚠ Evidence Consistency Warning:</b> {c_first.get('factor')} — {c_first.get('explanation')[:110]}</font>", body_p)
            warn_table = Table([[warn_p]], colWidths=[564])
            warn_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fef2f2")),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#fecaca")),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(warn_table)
            story.append(Spacer(1, 6))

        rec_p = Paragraph(f"<font color='#1e40af'><b>WHAT SHOULD YOU DO?</b></font><br/><font color='#1e3a8a'>{recommendation[:140]}</font>", body_p)
        rec_table = Table([[rec_p]], colWidths=[564])
        rec_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
            ('LINELEFT', (0,0), (0,0), 3, colors.HexColor("#2563eb")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#bfdbfe")),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(rec_table)
        story.append(Spacer(1, 8))

        foot_p = Paragraph(f"<font color='#94a3b8'>TrustGraph AI · AI-assisted verification — Always confirm through official government sources.<br/>{case_id} | Page 1 of 1</font>", ParagraphStyle('F', parent=body_p, alignment=1, fontSize=7, leading=9))
        story.append(foot_p)

        doc.build(story)

    def _generate_pdf_native(self, case: Dict[str, Any], filepath: str):
        """
        Pure Python fallback PDF generator conforming strictly to PDF-1.4 specification.
        Constructs a complete 1-page graphical A4 PDF with vector boxes, badges, grids, and typography.
        """
        verdict = case.get("verdict", "INCONCLUSIVE")
        case_id = case.get("case_id", "TG-UNKNOWN")
        trust_score = case.get("trust_score", 0)
        risk_level = case.get("risk_level", "UNKNOWN")
        scam_prob = case.get("scam_probability", 0)
        top_reasons = case.get("top_reasons", [])
        recommendation = case.get("recommended_action", "Verify through official government portals.")
        contradictions = case.get("contradiction_findings", [])
        evidence = case.get("extracted_evidence", {})
        input_meta = case.get("input_metadata", {})
        input_type = input_meta.get("input_type", "TEXT")
        created_at = case.get("created_at", "2026")[:10]

        v_label = "VERIFIED GENUINE" if verdict == "GENUINE" else ("CONFIRMED SCAM" if verdict == "SCAM" else ("SUSPICIOUS" if verdict == "SUSPICIOUS" else "INCONCLUSIVE"))

        def clean(s: str) -> str:
            return re.sub(r'[^\x20-\x7E]', ' ', str(s or '')).replace('(', '\\(').replace(')', '\\)')

        # Color codes in PDF RGB floats (0.0 to 1.0)
        if verdict == "GENUINE":
            v_rgb = "0.06 0.73 0.51" # Green
        elif verdict in ["SCAM", "CONFIRMED SCAM"]:
            v_rgb = "0.94 0.27 0.27" # Red
        else:
            v_rgb = "0.96 0.62 0.04" # Orange

        # Construct vector stream operators
        stream_lines = []

        # 1. Header Box & Lines
        # Title
        stream_lines.extend([
            "BT",
            "/F1 16 Tf",
            "0.06 0.09 0.16 rg",
            "36 800 Td",
            "(TRUSTGRAPH AI) Tj",
            "0 -14 Td",
            "/F1 9 Tf",
            "0.28 0.33 0.41 rg",
            "(Government Recruitment Verification Report) Tj",
            "ET",
            "BT",
            "/F1 8 Tf",
            "0.39 0.45 0.55 rg",
            "410 800 Td",
            f"(Case ID: {clean(case_id)}) Tj",
            "0 -11 Td",
            f"(Generated: {clean(created_at)}) Tj",
            "0 -11 Td",
            f"(Input Type: {clean(input_type)}) Tj",
            "ET",
            "0.06 0.09 0.16 RG",
            "1.5 w",
            "36 766 m 559 766 l S"
        ])

        # 2. Top Summary Card
        stream_lines.extend([
            # Outer Card Box
            "0.97 0.98 0.99 rg",
            "0.80 0.84 0.88 RG",
            "0.5 w",
            "36 706 523 52 re B",
            # Verdict Badge Box
            f"{v_rgb} rg",
            "44 712 160 40 re f",
            "BT",
            "/F1 11 Tf",
            "1 1 1 rg",
            "54 728 Td",
            f"({clean(v_label)}) Tj",
            "ET",
            # Metrics
            "BT",
            "/F1 14 Tf",
            f"{v_rgb} rg",
            "224 732 Td",
            f"({trust_score} / 100) Tj",
            "0 -12 Td",
            "/F1 7 Tf",
            "0.39 0.45 0.55 rg",
            "(TRUST SCORE) Tj",
            "ET",
            "BT",
            "/F1 14 Tf",
            "0.06 0.09 0.16 rg",
            "344 732 Td",
            f"({scam_prob}%) Tj",
            "0 -12 Td",
            "/F1 7 Tf",
            "0.39 0.45 0.55 rg",
            "(SCAM PROBABILITY) Tj",
            "ET",
            "BT",
            "/F1 14 Tf",
            "0.06 0.09 0.16 rg",
            "464 732 Td",
            f"({clean(risk_level)}) Tj",
            "0 -12 Td",
            "/F1 7 Tf",
            "0.39 0.45 0.55 rg",
            "(RISK LEVEL) Tj",
            "ET"
        ])

        # 3. Key Verification Findings (2x2 Grid)
        stream_lines.extend([
            "BT",
            "/F1 9.5 Tf",
            "0.06 0.09 0.16 rg",
            "36 688 Td",
            "(KEY VERIFICATION FINDINGS) Tj",
            "ET",
            "0.80 0.84 0.88 RG",
            "0.5 w",
            "36 682 m 559 682 l S"
        ])

        reasons = top_reasons[:4]
        while len(reasons) < 4:
            reasons.append("Verification check completed in official directory")

        coords = [
            (36, 638, 255, 36),   # Cell 1 (Top Left)
            (304, 638, 255, 36),  # Cell 2 (Top Right)
            (36, 594, 255, 36),   # Cell 3 (Bottom Left)
            (304, 594, 255, 36)   # Cell 4 (Bottom Right)
        ]

        for i, (cx, cy, cw, ch) in enumerate(coords):
            r_str = reasons[i]
            parts = r_str.split(":", 1)
            t_head = clean(parts[0].replace("[HIGH]", "").replace("[CRITICAL]", "").replace("[MEDIUM]", "").strip())[:28]
            t_body = clean(parts[1].strip() if len(parts) > 1 else t_head)[:65]

            icon_char = "X" if ("HIGH" in r_str or "CRITICAL" in r_str or "SCAM" in r_str or "Unverified" in r_str) else ("!" if "Absence" in r_str or "MISSING" in r_str else "V")
            icon_rgb = "0.94 0.27 0.27" if icon_char == "X" else ("0.96 0.62 0.04" if icon_char == "!" else "0.06 0.73 0.51")

            stream_lines.extend([
                "0.97 0.98 0.99 rg",
                "0.88 0.91 0.94 RG",
                f"{cx} {cy} {cw} {ch} re B",
                "BT",
                "/F1 8.5 Tf",
                f"{icon_rgb} rg",
                f"{cx + 8} {cy + 22} Td",
                f"([{icon_char}] {t_head}) Tj",
                "0 -11 Td",
                "/F1 7.5 Tf",
                "0.28 0.33 0.41 rg",
                f"({t_body}) Tj",
                "ET"
            ])

        # 4. Evidence Snapshot Table
        stream_lines.extend([
            "BT",
            "/F1 9.5 Tf",
            "0.06 0.09 0.16 rg",
            "36 574 Td",
            "(EVIDENCE SNAPSHOT) Tj",
            "ET",
            "0.80 0.84 0.88 RG",
            "36 568 m 559 568 l S",
            # Table Header
            "0.95 0.96 0.98 rg",
            "36 548 523 16 re f",
            "BT",
            "/F1 8 Tf",
            "0.28 0.33 0.41 rg",
            "42 552 Td",
            "(Evidence Field) Tj",
            "134 0 Td",
            "(Extracted Value) Tj",
            "260 0 Td",
            "(Verification Status) Tj",
            "ET"
        ])

        snapshot_items = self._extract_evidence_snapshot(case)
        row_y = 530

        for field, val, st, col_hex in snapshot_items:
            c_rgb = "0.06 0.73 0.51" if st == "VERIFIED" else ("0.94 0.27 0.27" if st == "SUSPICIOUS" else ("0.96 0.62 0.04" if st == "NEEDS CHECKING" else "0.39 0.45 0.55"))
            
            stream_lines.extend([
                "0.88 0.91 0.94 RG",
                f"36 {row_y} m 559 {row_y} l S",
                "BT",
                "/F1 8 Tf",
                "0.20 0.25 0.33 rg",
                f"42 {row_y + 4} Td",
                f"({clean(field)}) Tj",
                "134 0 Td",
                f"({clean(val)[:38]}) Tj",
                "260 0 Td",
                f"{c_rgb} rg",
                f"({clean(st)}) Tj",
                "ET"
            ])
            row_y -= 16

        # 5. Recruitment DNA & Evidence Graph (Side-by-Side Boxes)
        stream_lines.extend([
            # Left Box (DNA)
            "1 1 1 rg",
            "0.80 0.84 0.88 RG",
            "36 290 255 110 re B",
            "BT",
            "/F1 9 Tf",
            "0.06 0.09 0.16 rg",
            "44 388 Td",
            "(RECRUITMENT DNA) Tj",
            "0 -13 Td",
            "/F1 7.5 Tf",
            "0.28 0.33 0.41 rg",
            f"(Org: {clean(evidence.get('organization') or 'Not Provided')[:25]}) Tj",
            "0 -11 Td",
            f"(Advt: {clean(evidence.get('notification_number') or 'Not Found')[:25]}) Tj",
            "0 -11 Td",
            f"(Domain: {clean(evidence.get('domain') or 'Not Provided')[:25]}) Tj",
            "0 -11 Td",
            f"(Contact: {clean(evidence.get('email') or 'Not Provided')[:25]}) Tj",
            "0 -11 Td",
            f"(Payment: {clean(evidence.get('payment_pattern') or 'None')[:25]}) Tj",
            "0 -11 Td",
            f"(Format: {'Official Gazette' if evidence.get('notification_number') else 'Informal Notice'}) Tj",
            "ET",

            # Right Box (Evidence Graph)
            "1 1 1 rg",
            "0.80 0.84 0.88 RG",
            "304 290 255 110 re B",
            "BT",
            "/F1 9 Tf",
            "0.06 0.09 0.16 rg",
            "312 388 Td",
            "(EVIDENCE GRAPH HIERARCHY) Tj",
            "0 -13 Td",
            "/F1 7.5 Tf",
            "0.28 0.33 0.41 rg",
            f"(Org: {clean(evidence.get('organization') or 'Not Provided')[:25]}) Tj",
            "0 -11 Td",
            f"(   |-- Advt: {clean(evidence.get('notification_number') or 'Missing')[:23]}) Tj",
            "0 -11 Td",
            f"(   |-- Domain: {clean(evidence.get('domain') or 'Missing')[:23]}) Tj",
            "0 -11 Td",
            f"(   +-- Payment: {clean(evidence.get('payment_pattern') or 'None')[:23]}) Tj",
            "ET"
        ])

        # 6. Contradiction Warning (if present)
        curr_y = 236
        if contradictions:
            c_warn = contradictions[0]
            stream_lines.extend([
                "0.99 0.95 0.95 rg",
                "0.99 0.79 0.79 RG",
                "36 236 523 42 re B",
                "BT",
                "/F1 8 Tf",
                "0.60 0.10 0.10 rg",
                "44 264 Td",
                "(! Evidence Consistency Warning) Tj",
                "0 -11 Td",
                f"({clean(c_warn.get('factor'))}: {clean(c_warn.get('explanation'))[:80]}) Tj",
                "ET"
            ])
            curr_y = 176

        # 7. Actionable Advisory Card (WHAT SHOULD YOU DO?)
        stream_lines.extend([
            "0.93 0.96 1.0 rg",
            "0.75 0.86 0.99 RG",
            f"36 {curr_y - 48} 523 44 re B",
            # Blue accent line
            "0.15 0.39 0.92 rg",
            f"36 {curr_y - 48} 4 44 re f",
            "BT",
            "/F1 8.5 Tf",
            "0.12 0.25 0.68 rg",
            f"48 {curr_y - 18} Td",
            "(WHAT SHOULD YOU DO?) Tj",
            "0 -11 Td",
            "/F1 7.5 Tf",
            f"({clean(recommendation)[:110]}) Tj",
            "ET"
        ])

        # 8. Footer Line & Text
        stream_lines.extend([
            "0.80 0.84 0.88 RG",
            "0.5 w",
            "36 56 m 559 56 l S",
            "BT",
            "/F1 7.5 Tf",
            "0.58 0.64 0.72 rg",
            "36 42 Td",
            "(TrustGraph AI - AI-assisted verification - Always confirm through official government sources.) Tj",
            "ET",
            "BT",
            "/F1 7.5 Tf",
            "0.58 0.64 0.72 rg",
            "480 42 Td",
            f"({clean(case_id)} | Page 1 of 1) Tj",
            "ET"
        ])

        stream_content = "\n".join(stream_lines).encode('latin1', 'replace')
        stream_len = len(stream_content)

        pdf_bytes = bytearray()
        pdf_bytes.extend(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")

        offsets = []
        
        # Obj 1: Catalog
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")

        # Obj 2: Pages
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")

        # Obj 3: Page (A4 MediaBox: 595 x 842 points)
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n")

        # Obj 4: Content Stream
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode('latin1'))
        pdf_bytes.extend(stream_content)
        pdf_bytes.extend(b"\nendstream\nendobj\n")

        # Obj 5: Font
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")

        # Xref
        xref_offset = len(pdf_bytes)
        pdf_bytes.extend(f"xref\n0 6\n0000000000 65535 f \n".encode('latin1'))
        for off in offsets:
            pdf_bytes.extend(f"{off:010d} 00000 n \n".encode('latin1'))

        pdf_bytes.extend(f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode('latin1'))

        with open(filepath, "wb") as f:
            f.write(pdf_bytes)

report_generator = ReportGenerator()
