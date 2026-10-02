import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractTextFromPDF(file: File): Promise<string> {
  if (!file) throw new Error('No file provided');

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Please upload a PDF file');
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5 MB limit');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    pdf.cleanup();

    const trimmed = fullText.trim();
    if (!trimmed) {
      throw new Error(
        'Unable to extract text from this PDF. Please upload a text-based PDF (not a scanned image).'
      );
    }

    return trimmed;
  } catch (err: any) {
    if (err.message?.includes('Unable to extract text')) {
      throw err;
    }
    if (err.message?.includes('Invalid PDF') || err.name === 'InvalidPDFException') {
      throw new Error('The uploaded file is not a valid PDF or appears to be corrupted.');
    }
    throw new Error('Failed to process the PDF file. Please try a different file.');
  }
}
