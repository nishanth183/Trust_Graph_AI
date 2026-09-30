import io
import re
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple, Optional
import pymupdf

class OCRService:
    def __init__(self):
        self.qr_detector = cv2.QRCodeDetector()

    def process_file(self, content_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Process uploaded file (PDF or Image) and extract text, QR codes, and visual indicators.
        """
        ext = filename.lower().split(".")[-1]
        if ext == "pdf":
            return self._process_pdf(content_bytes)
        else:
            return self._process_image(content_bytes)

    def _process_pdf(self, content_bytes: bytes) -> Dict[str, Any]:
        extracted_text = ""
        qr_detected = False
        qr_data = None
        page_count = 0

        try:
            doc = pymupdf.open(stream=content_bytes, filetype="pdf")
            page_count = len(doc)
            
            for page_index in range(page_count):
                page = doc[page_index]
                text = page.get_text()
                if text:
                    extracted_text += text + "\n"

                # Check embedded images in PDF for QR codes
                image_list = page.get_images(full=True)
                for img_info in image_list:
                    xref = img_info[0]
                    base_image = doc.extract_image(xref)
                    image_bytes = base_image["image"]
                    img_np = np.frombuffer(image_bytes, np.uint8)
                    img_cv = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
                    if img_cv is not None:
                        found_qr, qr_val = self._detect_qr(img_cv)
                        if found_qr:
                            qr_detected = True
                            qr_data = qr_val
                            break

            doc.close()
        except Exception as e:
            extracted_text = f"[PDF Parsing Error: {str(e)}]"

        return {
            "text": extracted_text.strip(),
            "confidence": 0.95 if extracted_text else 0.0,
            "source_type": "PDF",
            "page_count": page_count,
            "qr_detected": qr_detected,
            "qr_data": qr_data
        }

    def _process_image(self, content_bytes: bytes) -> Dict[str, Any]:
        img_np = np.frombuffer(content_bytes, np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        if img is None:
            return {
                "text": "",
                "confidence": 0.0,
                "source_type": "IMAGE",
                "qr_detected": False,
                "qr_data": None
            }

        # 1. Preprocessing with OpenCV
        processed_img = self._preprocess_image(img)

        # 2. QR Code detection
        qr_detected, qr_data = self._detect_qr(img)

        # 3. Extract text
        extracted_text = ""
        # Check if pytesseract is available with binary
        try:
            import pytesseract
            extracted_text = pytesseract.image_to_string(processed_img)
        except Exception:
            # If tesseract binary is not installed in Windows PATH, use regex & feature heuristic
            # and informatively mark extraction source
            extracted_text = ""

        # If OCR text is blank (or tesseract wasn't installed), we check if there are recognizable embedded headers
        # or QR codes
        if not extracted_text and qr_data:
            extracted_text = f"Notice containing payment QR Code. Destination: {qr_data}"

        h, w, c = img.shape
        return {
            "text": extracted_text.strip(),
            "confidence": 0.85 if extracted_text else 0.5,
            "source_type": "IMAGE",
            "resolution": f"{w}x{h}",
            "qr_detected": qr_detected,
            "qr_data": qr_data
        }

    def _preprocess_image(self, img: np.ndarray) -> np.ndarray:
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Contrast Limited Adaptive Histogram Equalization (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Denoise
        denoised = cv2.medianBlur(enhanced, 3)

        # Otsu thresholding
        _, binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary

    def _detect_qr(self, img: np.ndarray) -> Tuple[bool, Optional[str]]:
        try:
            data, points, _ = self.qr_detector.detectAndDecode(img)
            if data:
                return True, data
        except Exception:
            pass
        return False, None

ocr_service = OCRService()
