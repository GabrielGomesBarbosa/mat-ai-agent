/**
 * Monday.com API Type Definitions
 * 
 * Shared types used across Monday.com service modules
 */

/**
 * Image/Asset block content from Monday.com description
 */
export interface ImageBlockContent {
    url?: string
    assetId?: number
    [key: string]: any
}

/**
 * Single delta insert operation in Quill-like format
 */
export interface DeltaInsert {
    insert: string
    [key: string]: any
}

/**
 * Text block content with deltaFormat array
 */
export interface TextBlockContent {
    deltaFormat?: DeltaInsert[]
    [key: string]: any
}

/**
 * Document block from Monday.com item description
 */
export interface DocumentBlock {
    id: string
    doc_id: string
    content: string
}
