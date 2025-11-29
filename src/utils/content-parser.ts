/**
 * Content Parser Utilities
 * 
 * Utilities for parsing and extracting text content from Monday.com task descriptions.
 * Handles Quill-like deltaFormat structure and filters out non-text content (images, assets).
 */

import { DocumentBlock, ImageBlockContent, TextBlockContent } from '@/types/monday-types'

/**
 * Type guard to check if content is an image/asset block
 */
export function hasAssetId(content: any): content is ImageBlockContent {
    return content && (content.assetId !== undefined || content.url?.includes('resources'))
}

/**
 * Type guard to check if content has deltaFormat (text content)
 */
export function hasDeltaFormat(content: any): content is TextBlockContent {
    return content && Array.isArray(content.deltaFormat)
}

/**
 * Parses block content from JSON string safely
 * 
 * @param content - JSON string from Monday.com block content field
 * @returns Parsed content object or null if malformed
 */
export function parseBlockContent(content: string): any {
    try {
        return JSON.parse(content)
    } catch (error) {
        console.warn('Skipped block with malformed JSON:', error instanceof Error ? error.message : error)
        return null
    }
}

/**
 * Extracts text from deltaFormat structure
 * 
 * @param content - Text block content with deltaFormat array
 * @returns Extracted text or newline for empty blocks
 */
export function extractTextFromDelta(content: TextBlockContent): string {
    if (!content.deltaFormat || content.deltaFormat.length === 0) {
        return '\n'
    }

    const blockText = content.deltaFormat
        .map(delta => delta.insert || '')
        .join('')

    return blockText.trim() ? blockText : ''
}

/**
 * Extracts clean text content from Monday.com task description blocks.
 * Filters out images/assets and parses deltaFormat structure into readable text.
 * 
 * @param blocks - Array of document blocks from Monday.com task description
 * @returns Clean formatted text with paragraph breaks preserved
 */
export function extractBlockContents(blocks: DocumentBlock[]): string {
    const textParts: string[] = []

    for (const block of blocks) {
        if (!block.content) continue

        const content = parseBlockContent(block.content)
        if (!content || hasAssetId(content)) continue

        if (hasDeltaFormat(content)) {
            const text = extractTextFromDelta(content)
            if (text) {
                textParts.push(text)
            }
        }
    }

    return textParts.join('\n').trim()
}
