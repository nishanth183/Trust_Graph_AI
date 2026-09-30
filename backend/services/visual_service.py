import cv2
import numpy as np
from typing import Dict, Any, Optional

class VisualAnalysisService:
    def analyze_document_visuals(self, content_bytes: bytes, filename: str) -> Dict[str, Any]:
        ext = filename.lower().split(".")[-1]
        if ext not in ["png", "jpg", "jpeg"]:
            return {
                "has_emblem_indicator": False,
                "document_layout": "STANDARD_TEXT",
                "qr_detected": False,
                "notes": "Non-raster document format (native PDF / text)"
            }

        img_np = np.frombuffer(content_bytes, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
        if img is None:
            return {
                "has_emblem_indicator": False,
                "document_layout": "UNKNOWN",
                "qr_detected": False,
                "notes": "Could not decode image"
            }

        h, w, _ = img.shape

        # 1. Look for centered top header or emblem bounding box
        # Government gazettes typically have an Ashoka Lion Capital or emblem in the top 20% center region
        header_region = img[0:int(h * 0.25), int(w * 0.25):int(w * 0.75)]
        gray_header = cv2.cvtColor(header_region, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray_header, 50, 150)
        edge_density = np.sum(edges > 0) / (header_region.shape[0] * header_region.shape[1])

        has_emblem_indicator = edge_density > 0.04

        # 2. Check for QR Code
        detector = cv2.QRCodeDetector()
        qr_found, qr_data, _, _ = detector.detectAndDecodeMulti(img)

        # 3. Assess visual layout
        layout = "GAZETTE_LAYOUT" if (h > w * 1.2 and has_emblem_indicator) else "SOCIAL_MEDIA_BANNER"

        return {
            "has_emblem_indicator": has_emblem_indicator,
            "emblem_confidence": 0.65 if has_emblem_indicator else 0.1,
            "document_layout": layout,
            "aspect_ratio": round(w / h, 2),
            "qr_detected": bool(qr_found and len(qr_data) > 0),
            "qr_count": len(qr_data) if qr_found else 0,
            "notes": "Visual emblem present at top header. Note: Scammers frequently paste genuine emblems onto fake circulars; presence of emblem alone does NOT confirm authenticity."
        }

visual_service = VisualAnalysisService()
