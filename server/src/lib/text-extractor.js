/**
 * Extract text from uploaded file buffers.
 * Supports PDF, DOCX, and TXT files.
 * Returns empty string on failure — never throws.
 */
export async function extractText(buffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const result = await pdfParse(buffer)
      return result.text?.trim() || ''
    }

    if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value?.trim() || ''
    }

    if (mimeType === 'text/plain') {
      return buffer.toString('utf-8').trim()
    }

    return ''
  } catch (error) {
    console.error('Text extraction failed:', error.message)
    return ''
  }
}
