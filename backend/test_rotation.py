#!/usr/bin/env python3
"""
Test script to verify PDF rotation functionality with a rotated PDF file.
"""
import io
import PyPDF2
from pathlib import Path
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_bytes
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

def extract_text_with_rotation(pdf_bytes):
    """Extract text from PDF, trying different rotations and OCR if needed."""
    rotations = [0, 90, 180, 270]  # Try each rotation up to 270 degrees

    for rotation in rotations:
        try:
            print(f"Trying rotation: {rotation}°")
            # Reset file pointer
            pdf_bytes.seek(0)
            reader = PyPDF2.PdfReader(pdf_bytes)
            print(f"PDF has {len(reader.pages)} pages")

            # If rotation needed, create rotated PDF
            if rotation > 0:
                writer = PyPDF2.PdfWriter()
                for page in reader.pages:
                    page.rotate(rotation)
                    writer.add_page(page)

                # Write rotated PDF to new BytesIO
                rotated_pdf = io.BytesIO()
                writer.write(rotated_pdf)
                rotated_pdf.seek(0)
                reader = PyPDF2.PdfReader(rotated_pdf)

            # Extract text
            text_content = ""
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                print(f"Page {i+1} extracted text length: {len(page_text)}")
                if page_text.strip():
                    print(f"Page {i+1} sample text: {page_text[:100]}...")
                text_content += page_text + "\n"

            # Check if we got meaningful text
            if text_content.strip() and len(text_content.strip()) > 10:
                print(f"Successfully extracted text with {rotation}° rotation")
                print(f"Text length: {len(text_content)} characters")
                print("--- First 500 characters ---")
                print(text_content[:500])
                print("--- End preview ---")
                return text_content
            else:
                print(f"No sufficient text extracted with {rotation}° rotation, trying OCR...")                # Try OCR if available and regular extraction failed
                if OCR_AVAILABLE:
                    print("Attempting OCR...")
                    try:
                        # Reset file pointer for OCR
                        pdf_bytes.seek(0)
                        pdf_data = pdf_bytes.read()

                        # Convert PDF to images for OCR
                        images = convert_from_bytes(pdf_data, dpi=300)

                        ocr_text = ""
                        for i, image in enumerate(images):
                            print(f"Performing OCR on page {i+1}...")

                            # Apply rotation to image if needed
                            if rotation > 0:
                                image = image.rotate(-rotation, expand=True)  # PIL uses counterclockwise rotation

                            # Perform OCR on the image
                            page_text = pytesseract.image_to_string(image, lang='pol+eng')  # Support Polish and English
                            print(f"OCR extracted {len(page_text)} characters from page {i+1}")
                            ocr_text += page_text + "\n"

                        # Check if OCR extracted meaningful text
                        if ocr_text.strip() and len(ocr_text.strip()) > 20:  # OCR might extract some garbage, so higher threshold
                            print(f"Successfully extracted text with OCR at {rotation}° rotation")
                            print(f"OCR Text length: {len(ocr_text)} characters")
                            print("--- First 500 characters from OCR ---")
                            print(ocr_text[:500])
                            print("--- End OCR preview ---")
                            return ocr_text
                        else:
                            print(f"OCR did not extract sufficient text at {rotation}° rotation")

                    except Exception as ocr_error:
                        print(f"OCR failed: {ocr_error}")

        except Exception as e:
            print(f"Failed with {rotation}° rotation: {e}")
            continue

    # If all rotations failed, return empty string
    print("All rotations and OCR attempts failed to extract text")
    return ""

def main():
    """Test the rotation functionality with the rotated PDF file."""
    print(f"OCR available: {OCR_AVAILABLE}")

    # Try different possible paths
    possible_paths = [
        Path(__file__).parent / "rotated_weird_file.pdf",  # Backend directory
        Path(__file__).parent.parent / "Test Data" / "rotated_weird_file.pdf",  # Local development
        Path("/Test Data/rotated_weird_file.pdf"),  # Docker container root
        Path("/app/../Test Data/rotated_weird_file.pdf"),  # Docker container relative
    ]

    test_file_path = None
    for path in possible_paths:
        if path.exists():
            test_file_path = path
            break

    if not test_file_path:
        print("Test file not found in any of these locations:")
        for path in possible_paths:
            print(f"  - {path}")
        return

    print(f"Testing PDF rotation with file: {test_file_path}")

    try:
        # Read the PDF file
        with open(test_file_path, 'rb') as f:
            pdf_content = f.read()

        pdf_bytes = io.BytesIO(pdf_content)
        extracted_text = extract_text_with_rotation(pdf_bytes)

        if extracted_text:
            print("\n✅ SUCCESS: Text was extracted successfully!")
        else:
            print("\n❌ FAILURE: Could not extract text from PDF")

    except Exception as e:
        print(f"Error testing PDF rotation: {e}")

if __name__ == "__main__":
    main()
