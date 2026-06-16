/**
 * Extract text from uploaded file buffers.
 * Supports PDF, DOCX, and TXT files.
 * Returns empty string on failure — never throws.
 */

async function extractPdfText(buffer) {
  const { PDFParse } = await import('pdf-parse')
  const parser = new PDFParse({ data: buffer })

  try {
    const result = await parser.getText()
    return result.text?.trim() || ''
  } finally {
    await parser.destroy()
  }
}

export async function extractText(buffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      return await extractPdfText(buffer)
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
    console.error(`Text extraction failed (${mimeType}):`, error.message)
    return ''
  }
}
