import io
import re
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple, Optional
import pymupdf
import logging

logger = logging.getLogger("trustgraph.ocr")

try:
    from rapidocr_onnxruntime import RapidOCR
    rapid_ocr = RapidOCR()
    logger.info("RapidOCR deep-learning text extraction engine initialized successfully.")
except Exception as e:
    logger.warning(f"RapidOCR initialization notice: {e}")
    rapid_ocr = None

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

            # If scanned PDF with no native text layer, run RapidOCR on rendered page pixmaps
            if not extracted_text.strip() and rapid_ocr is not None:
                for page_index in range(min(page_count, 5)):
                    page = doc[page_index]
                    pix = page.get_pixmap()
                    img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
                    if pix.n == 4:
                        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
                    elif pix.n == 3:
                        img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
                    else:
                        img_cv = cv2.cvtColor(img_np, cv2.COLOR_GRAY2BGR)
                    ocr_res, _ = rapid_ocr(img_cv)
                    if ocr_res:
                        lines = [item[1] for item in ocr_res if item and len(item) > 1 and item[1]]
                        extracted_text += "\n".join(lines) + "\n"

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

        # 1. QR Code detection
        qr_detected, qr_data = self._detect_qr(img)

        # 2. Extract text using RapidOCR (deep learning engine)
        extracted_text = ""
        confidence = 0.5
        if rapid_ocr is not None:
            try:
                ocr_out, _ = rapid_ocr(img)
                if ocr_out:
                    lines = [item[1] for item in ocr_out if item and len(item) > 1 and item[1]]
                    confs = [float(item[2]) for item in ocr_out if item and len(item) > 2 and item[2] is not None]
                    extracted_text = "\n".join(lines).strip()
                    if confs:
                        confidence = round(float(sum(confs) / len(confs)), 2)
            except Exception as e:
                logger.warning(f"RapidOCR extraction error: {e}")

        # If primary OCR yielded nothing, try enhanced preprocessed image
        if not extracted_text and rapid_ocr is not None:
            try:
                processed_img = self._preprocess_image(img)
                ocr_out, _ = rapid_ocr(processed_img)
                if ocr_out:
                    lines = [item[1] for item in ocr_out if item and len(item) > 1 and item[1]]
                    extracted_text = "\n".join(lines).strip()
            except Exception:
                pass

        # Also fallback to pytesseract if available
        if not extracted_text:
            try:
                import pytesseract
                extracted_text = pytesseract.image_to_string(img).strip()
            except Exception:
                pass

        # If text is still blank and QR was detected, synthesize indicator
        if not extracted_text and qr_data:
            extracted_text = f"Notice containing payment QR Code. Destination: {qr_data}"

        h, w, c = img.shape
        return {
            "text": extracted_text.strip(),
            "confidence": confidence if extracted_text else 0.5,
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
