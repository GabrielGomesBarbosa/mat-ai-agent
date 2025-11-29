# POS React - Project Structure

This document provides a comprehensive overview of the pos-react codebase structure.

**Last Updated:** November 14, 2024

**⚠️ IMPORTANT: This document shows the TARGET/IDEAL structure after modular architecture refactoring.**

**What this document represents:**
- The **TARGET structure** for new and refactored code
- Where the project is heading after the restructuring effort
- Some directories/patterns already exist, some are planned for future implementation
- **ALL NEW CODE must follow this structure**

**Current state:**
- The project is actively being migrated from the old structure to this new structure
- You may encounter legacy code that doesn't follow these patterns yet
- When editing legacy code, migrate it to follow this structure (rename files, move to correct locations)
- See [project-context.md](project-context.md) for coding conventions and patterns

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Directory Structure](#directory-structure)
- [Module Structure Pattern](#module-structure-pattern)
- [Component Structure Pattern](#component-structure-pattern)
- [Key Architectural Patterns](#key-architectural-patterns)
  - [Component Organization](#component-organization)
  - [Constants Organization](#constants-organization)
  - [Hooks Organization](#hooks-organization)
  - [Form Handling](#form-handling)
  - [State Management](#state-management)
- [Feature Module Examples](#feature-module-examples)
  - [Loan Details Module](#loan-details-module)
  - [Shared Module](#shared-module)
- [Navigation and Routing](#navigation-and-routing)
- [Data Flow](#data-flow)
- [Testing Structure](#testing-structure)
- [Styling](#styling)
- [Key Files and Directories](#key-files-and-directories)
- [Adding New Features](#adding-new-features)
- [Migration Notes](#migration-notes)

---

## Architecture Overview

The pos-react application follows a **modular architecture** pattern, where features are organized into domain-specific modules under `src/modules/`. This approach promotes:

- **Feature isolation**: Each module encapsulates its own pages, components, hooks, and utilities
- **Code discoverability**: Related code is co-located within feature modules
- **Scalability**: New features can be added as independent modules
- **Reusability**: Shared code lives in `src/components/` and `src/modules/shared/`

## Directory Structure

```
src/
├── assets/                       # Static assets
│   ├── fonts/                    # Font files
│   ├── icons/                    # Icon assets
│   ├── images/                   # Image files
│   └── lordicons/                # Lordicon animations
│
├── components/                   # Reusable UI components (flat structure)
│   ├── icon/                     # Icon component system
│   │   ├── index.tsx
│   │   └── icon-constants.ts
│   │
│   ├── button/                   # Button components
│   │   ├── index.tsx             # Main button component
│   │   └── loading-button.tsx
│   │
│   ├── data-table/               # Data table component
│   │   ├── index.tsx             # Main component
│   │   ├── data-table-sub-header.tsx
│   │   ├── data-table-row.tsx
│   │   ├── data-table-constants.ts
│   │   ├── data-table-types.ts
│   │   ├── data-table-utils.ts
│   │   └── data-table.cy.tsx
│   │
│   ├── select/                   # Select components
│   │   ├── index.tsx             # Main select component
│   │   └── select-controlled.tsx # Controlled by `react-hook-form`
│   │
│   ├── autocomplete/                   # Autocomplete components
│   │   ├── index.tsx                   # Main autocomplete component
│   │   └── autocomplete-controlled.tsx # Controlled by `react-hook-form`
│   │
│   ├── checkbox/                   # Checkbox components
│   │   ├── index.tsx               # Main checkbox component
│   │   └── checkbox-controlled.tsx # Controlled by `react-hook-form`
│   │
│   ├── dropzone/                 # File upload dropzone
│   │   ├── index.tsx             # Main component
│   │   ├── dropzone-field.tsx
│   │   ├── dropzone-content.tsx
│   │   ├── dropzone-file-list.tsx
│   │   ├── dropzone-file-list-item.tsx
│   │   ├── dropzone-rejections.tsx
│   │   ├── dropzone-context.tsx
│   │   ├── dropzone-types.ts
│   │   └── dropzone-utils.ts
│   │
│   ├── breadcrumbs/              # Navigation breadcrumbs
│   ├── form.tsx                  # Form wrapper component
│   ├── form-control.tsx          # Form control wrapper
│   ├── form-row.tsx              # Form row layout
│   ├── date-picker.tsx           # Date picker component
│   ├── date-range-picker.tsx     # Date range picker
│   ├── empty-state.tsx           # Empty state component
│   ├── error-boundary.tsx        # Error boundary component
│   ├── page-wrapper.tsx          # Page layout wrapper
│   └── ...                       # Other reusable components
│
├── constants/                    # Global application constants only
│   │                             # TARGET: Global constants used across entire application
│   │                             # CURRENT STATE: Partially implemented
│   │                             #   - pagination.ts exists
│   │                             #   - Other files planned for future organization
│   │                             # TARGET structure (what SHOULD be here):
│   ├── pagination.ts             # Pagination defaults (page sizes, limits)
│   ├── api.ts                    # API configuration (timeouts, retry limits)
│   ├── date-time-formats.ts      # Date/time display formats
│   ├── file-upload.ts            # File size limits, allowed MIME types
│   ├── validation-rules.ts       # Global validation limits (min/max lengths)
│   └── user-roles.ts             # User roles and permissions enum
│
├── hooks/                        # Global custom hooks (generic utilities only)
│   │                             # TARGET: Generic utility hooks with no business logic
│   │                             # CURRENT STATE: Does not exist yet
│   │                             #   - All hooks currently in src/modules/shared/hooks/
│   │                             #   - Will be migrated here in future phase
│   │                             # TARGET structure (what WILL be here):
│   ├── use-local-storage.ts      # Persist state to localStorage
│   ├── use-toggle.ts             # Boolean toggle with helpers
│   ├── use-media-query.ts        # Responsive breakpoint detection
│   ├── use-click-outside.ts      # Detect clicks outside element
│   ├── use-debounce.ts           # Debounce a value
│   ├── use-copy-to-clipboard.ts  # Copy text to clipboard
│   ├── use-pagination.ts         # Pagination state management
│   └── ...                       # See "Hooks Organization" section for full strategy
│
├── contexts/                     # Global state contexts
│   ├── app-context/              # Main application context
│   │   ├── app-context.tsx
│   │   ├── app-context-actions.tsx
│   │   └── app-context-types.ts
│   │
│   ├── loan-context/             # Active loan state management
│   │   ├── loan-context.tsx
│   │   └── loan-context-types.ts
│   │
│   ├── loan-locked-context/      # Real-time loan lock status
│   │   ├── loan-locked-context.tsx
│   │   └── loan-locked-context-types.ts
│   │
│   ├── loan-signalr-context.tsx  # SignalR WebSocket connection
│   └── language-context.tsx      # i18n language state
│
├── i18n/                         # Internationalization
│   ├── en.ts                     # English translations
│   ├── es.ts                     # Spanish translations
│   └── index.ts                  # i18n setup
│
├── modules/                      # Feature modules (domain-driven)
│   │
│   ├── shared/                   # Shared across modules
│   │   ├── components/           # Shared components (flat structure)
│   │   │   ├── loan-upload-files.tsx
│   │   │   ├── autocomplete-users.tsx
│   │   │   ├── loan-status-badge.tsx
│   │   │   ├── borrower-card/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── borrower-card-info.tsx
│   │   │   │   ├── borrower-card-employment.tsx
│   │   │   │   ├── borrower-card-types.ts
│   │   │   │   └── borrower-card-utils.ts
│   │   │   ├── document-preview/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── document-preview-header.tsx
│   │   │   │   ├── document-preview-content.tsx
│   │   │   │   ├── document-preview-toolbar.tsx
│   │   │   │   ├── document-preview-types.ts
│   │   │   │   └── document-preview.cy.tsx
│   │   │   └── ...
│   │   │
│   │   ├── constants/            # Cross-module constants (not global)
│   │   │   ├── loan-statuses.ts  # Loan status constants
│   │   │   ├── document-types.ts # Document type constants
│   │   │   ├── milestone-types.ts # Loan milestone constants
│   │   │   ├── borrower-roles.ts # Borrower role constants
│   │   │   └── ...
│   │   │
│   │   ├── contexts/             # Shared contexts
│   │   │   ├── loan-context/     # Active loan state management
│   │   │   │   ├── loan-context.tsx
│   │   │   │   └── loan-context-types.ts
│   │   │   ├── loan-locked-context/ # Real-time loan lock status
│   │   │   │   ├── loan-locked-context.tsx
│   │   │   │   └── loan-locked-context-types.ts
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                # Shared hooks
│   │   │   ├── use-auth.js       # Authentication helpers
│   │   │   ├── use-user.ts       # User data management
│   │   │   ├── use-loan-status.js # Loan status logic
│   │   │   ├── use-share-loan.ts # Share loan functionality
│   │   │   ├── use-partner.ts    # Partner management
│   │   │   ├── use-branch.ts     # Branch management
│   │   │   ├── use-loan-officer.ts # Loan officer operations
│   │   │   ├── use-site-config.js # Site configuration
│   │   │   ├── use-error-handler.ts # Error handling logic
│   │   │   └── ...
│   │   │
│   │   ├── types/                # Shared TypeScript types
│   │   │   ├── loan-types.ts     # Loan-related types
│   │   │   ├── user-types.ts     # User-related types
│   │   │   ├── document-types.ts # Document-related types
│   │   │   ├── borrower-types.ts # Borrower-related types
│   │   │   ├── property-types.ts # Property-related types
│   │   │   └── ...
│   │   │
│   │   └── utils/                # Shared utility functions
│   │       ├── loan-payment-calculator.ts # Calculate loan payments
│   │       ├── interest-rate-calculator.ts # Calculate interest rates
│   │       ├── date-formatter.ts # Format dates for display
│   │       ├── currency-formatter.ts # Format currency values
│   │       ├── phone-number-formatter.ts # Format phone numbers
│   │       └── ...
│   │
│   ├── auth/                     # Authentication module
│   │   ├── components/           # Auth-specific components (flat structure)
│   │   │   ├── auth-sign-in-form.tsx
│   │   │   ├── auth-sign-up-form.tsx
│   │   │   ├── auth-password-reset-form.tsx
│   │   │   └── ...
│   │   └── pages/                # Auth pages
│   │       ├── auth-sign-in-page.tsx
│   │       ├── auth-sign-up-page.tsx
│   │       ├── auth-password-reset-page.tsx
│   │       └── ...
│   │
│   ├── loan-documents/           # Document management (COMPLETE EXAMPLE)
│   │   ├── components/           # Module-specific components (flat structure)
│   │   │   ├── loan-documents-list.tsx
│   │   │   ├── loan-documents-upload-form.tsx
│   │   │   ├── loan-documents-status-badge.tsx
│   │   │   ├── loan-documents-actions-menu.tsx
│   │   │   ├── loan-documents-delete-modal.tsx
│   │   │   └── ...
│   │   ├── constants/            # Module-specific constants
│   │   │   ├── loan-documents-statuses.ts
│   │   │   ├── loan-documents-file-types.ts
│   │   │   └── loan-documents-upload-limits.ts
│   │   ├── contexts/             # Module-specific contexts
│   │   │   ├── loan-documents-filter-context/
│   │   │   │   ├── loan-documents-filter-context.tsx
│   │   │   │   └── loan-documents-filter-context-types.ts
│   │   │   └── ...
│   │   ├── hooks/                # Module-specific hooks
│   │   │   ├── use-loan-documents-upload.ts
│   │   │   ├── use-loan-documents-filter.ts
│   │   │   ├── use-loan-documents-validation.ts
│   │   │   └── ...
│   │   ├── pages/                # Document pages
│   │   │   ├── loan-documents-list-page.tsx
│   │   │   ├── loan-documents-details-page.tsx
│   │   │   └── ...
│   │   ├── types/                # Module-specific types
│   │   │   ├── loan-documents-upload-types.ts
│   │   │   ├── loan-documents-filter-types.ts
│   │   │   └── ...
│   │   └── utils/                # Module-specific utilities
│   │       ├── loan-documents-size-validator.ts
│   │       ├── loan-documents-file-type-checker.ts
│   │       └── ...
│   │
│   ├── loan-pricing/             # Loan pricing and rates
│   │   ├── components/           # Pricing-specific components (flat structure)
│   │   │   ├── loan-pricing-rate-comparison-table.tsx
│   │   │   ├── loan-pricing-calculator.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── use-loan-pricing-rate-calculation.ts
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── loan-pricing-page.tsx
│   │   │   └── ...
│   │   └── utils/
│   │       ├── loan-pricing-interest-calculator.ts
│   │       └── ...
│   │
│   ├── user-groups/              # User group management (REAL PROJECT EXAMPLE)
│   │   ├── components/           # User-groups-specific components (flat structure)
│   │   │   ├── user-groups-list.tsx
│   │   │   ├── user-groups-form-stepper.tsx
│   │   │   ├── user-groups-step-access-scope-form.tsx
│   │   │   ├── user-groups-step-group-setup-form.tsx
│   │   │   ├── user-groups-delete-modal.tsx
│   │   │   ├── user-groups-form-modal.tsx
│   │   │   ├── user-groups-access-scope-form.tsx
│   │   │   ├── user-groups-access-list.tsx
│   │   │   ├── user-groups-access-list-empty-state.tsx
│   │   │   ├── user-groups-access-list-name-cell.tsx
│   │   │   └── ...
│   │   ├── hooks/                # User-groups-specific hooks
│   │   │   ├── use-user-groups.ts
│   │   │   ├── use-user-groups-access-scope.ts
│   │   │   ├── use-user-groups-members.ts
│   │   │   └── ...
│   │   ├── pages/                # User-groups pages
│   │   │   ├── user-groups-list-page.tsx
│   │   │   └── ...
│   │   ├── types/                # Module-specific types (should be prefixed)
│   │   │   ├── user-groups-types.ts
│   │   │   └── ...
│   │   └── utils/                # Module-specific utilities (should be prefixed)
│   │       ├── user-groups-scope-converter.ts
│   │       ├── user-groups-member-converter.ts
│   │       └── ...
│   │
│   └── ...                       # 30+ other feature modules following same pattern
│
├── routes/                       # Routing configuration
│   └── private-route.jsx         # Protected route wrapper
│
├── utils/                        # Global utility functions
│   ├── the-big-pos-client.ts    # API client wrapper
│   ├── api-error-handler.ts     # Global API error handling
│   ├── storage-manager.ts       # localStorage/sessionStorage wrapper
│   ├── logger.ts                # Global logging utility
│   ├── retry-handler.ts         # Retry logic for failed operations
│   └── environment-config.ts    # Environment variable utilities
│
├── workflows/                    # Workflow definitions (JSON)
│
├── app.jsx                       # Main app component with routes
├── app-theme.jsx                 # MUI theme configuration
├── index.tsx                     # Application entry point
└── index.css                     # Global styles
```

**Note:** This tree shows the TARGET structure. Sections marked with "TARGET:" or "CURRENT STATE:" indicate what's planned vs what exists. Always follow the TARGET structure when writing new code.

## Module Structure Pattern

Each feature module follows a standard structure with these subdirectories (only include what's needed):

- **`components/`** - Module-specific components (follow flat structure pattern)
- **`constants/`** - Module-specific constants (not global constants)
- **`contexts/`** - Module-specific React contexts
- **`hooks/`** - Module-specific custom hooks
- **`pages/`** - Page-level components rendered by routes
- **`types/`** - Module-specific TypeScript type definitions
- **`utils/`** - Module-specific utility functions

**Important:**
- Folders are listed in alphabetical order
- Only include directories that are actually needed - don't create empty folders "just in case"
- All components use the flat structure pattern (no nested subdirectories)

**Module Prefix Pattern (CRITICAL):**

**ALL files within a module must be prefixed with the module name.** This prevents naming conflicts and makes file purpose immediately clear.

Pattern: `{module-name}-{file-name}.{ext}`

Examples by module:
- **`auth/`** module: `auth-sign-in-form.tsx`, `auth-sign-up-page.tsx`, `use-auth-validation.ts`
- **`loan-documents/`** module: `loan-documents-list.tsx`, `loan-documents-upload-form.tsx`, `use-loan-documents-filter.ts`
- **`user-groups/`** module: `user-groups-list.tsx`, `user-groups-form-modal.tsx`, `use-user-groups.ts`

Applies to:
- ✅ Components: `{module-name}-{component-name}.tsx`
- ✅ Pages: `{module-name}-{page-name}-page.tsx`
- ✅ Hooks: `use-{module-name}-{hook-name}.ts`
- ✅ Utils: `{module-name}-{util-name}.ts`
- ✅ Types: `{module-name}-{type-name}-types.ts`
- ✅ Constants: `{module-name}-{constant-name}.ts`
- ✅ Contexts: `{module-name}-{context-name}-context.tsx`

**Component Type Suffixes:**
- **Pages**: Must have `-page` suffix (e.g., `loan-documents-list-page.tsx`, `user-groups-list-page.tsx`)
- **Forms**: Must have `-form` suffix (e.g., `auth-sign-in-form.tsx`, `loan-documents-upload-form.tsx`)
- **Modals**: Must have `-modal` suffix (e.g., `user-groups-delete-modal.tsx`, `loan-documents-share-modal.tsx`)

## Component Structure Pattern

**All component folders throughout the codebase follow a flat structure pattern.**

This pattern applies to:
- `src/components/` (reusable components)
- `src/modules/{module}/components/` (module-specific components)

### Flat Structure Rules

1. **No nested subdirectories**: All files related to a component live directly in the component's folder
   - ❌ No `components/` subfolder within a component folder
   - ❌ No `utils/` subfolder within a component folder
   - ❌ No `contexts/` subfolder within a component folder
   - ❌ No `hooks/` subfolder within a component folder

2. **File naming with prefixes**: All files are prefixed with the component name for easy searchability
   - **Main component: Always use `index.tsx`** (enables clean imports like `@/components/data-table`)
   - **Controlled variant (for react-hook-form): `{component-name}-controlled.tsx`** (e.g., `select-controlled.tsx`)
   - Sub-components: `{component-name}-{sub-name}.tsx`
   - Constants: `{component-name}-constants.ts`
   - Types: `{component-name}-types.ts`
   - Utils: `{component-name}-utils.ts`
   - Tests: `{component-name}.cy.tsx`

3. **React Hook Form Pattern**: For form input components, provide both uncontrolled and controlled versions
   - **Uncontrolled (default)**: `index.tsx` - Standard React component with `value` and `onChange` props
   - **Controlled (react-hook-form)**: `{component-name}-controlled.tsx` - Wrapped with `Controller` from react-hook-form
   - This allows flexible usage: use the controlled version within forms, or the uncontrolled version for standalone usage

### Examples

#### ✅ Correct: Flat Structure

**Simple Component (Icon):**
```
icon/
├── index.tsx                    # Main component → import from '@/components/icon'
├── icon-constants.ts            # Constants (prefixed)
└── icon.cy.tsx                  # Tests (prefixed)
```

**Form Input Component (Select):**
```
select/
├── index.tsx                    # Uncontrolled component → import Select from '@/components/select'
├── select-controlled.tsx        # Controlled for react-hook-form → import SelectControlled from '@/components/select/select-controlled'
├── select-types.ts              # Shared types (prefixed)
└── select.cy.tsx                # Tests (prefixed)
```

**Form Input Component (Autocomplete):**
```
autocomplete/
├── index.tsx                    # Uncontrolled component → import Autocomplete from '@/components/autocomplete'
├── autocomplete-controlled.tsx  # Controlled for react-hook-form
├── autocomplete-types.ts        # Shared types (prefixed)
└── autocomplete.cy.tsx          # Tests (prefixed)
```

**Moderate Complexity (Data Table):**
```
data-table/
├── index.tsx                    # Main component → import from '@/components/data-table'
├── data-table-sub-header.tsx    # Sub-component (prefixed)
├── data-table-row.tsx           # Sub-component (prefixed)
├── data-table-constants.ts      # Constants (prefixed)
├── data-table-types.ts          # Types (prefixed)
├── data-table-utils.ts          # Utils (prefixed)
└── data-table.cy.tsx            # Tests (prefixed)
```

**Complex Component (Dropzone):**
```
dropzone/
├── index.tsx                    # Main component → import from '@/components/dropzone'
├── dropzone-field.tsx           # Form field wrapper (prefixed)
├── dropzone-content.tsx         # Content area (prefixed)
├── dropzone-file-list.tsx       # File list display (prefixed)
├── dropzone-file-list-item.tsx  # Individual file item (prefixed)
├── dropzone-rejections.tsx      # Rejected files display (prefixed)
├── dropzone-context.tsx         # Context for state (prefixed)
├── dropzone-types.ts            # Types (prefixed)
├── dropzone-utils.ts            # Utilities (prefixed)
└── dropzone.cy.tsx              # Tests (prefixed)
```

#### ❌ Incorrect: Nested Structure (DO NOT USE)

```
dropzone/
├── context/                     # ❌ Don't create nested folders
│   └── dropzone-context.tsx
├── dropzone.tsx                 # ❌ Use index.tsx instead
├── dropzone-content.tsx
├── dropzone-field.tsx
├── dropzone-file-list.tsx
├── dropzone-file-list-item.tsx
├── dropzone-rejections.tsx
└── utils.ts                     # ❌ Missing component prefix
```

```
data-table/
├── components/                  # ❌ Don't create nested folders
│   ├── header.tsx              # ❌ Missing component prefix
│   └── row.tsx                 # ❌ Missing component prefix
├── hooks/                       # ❌ Don't create nested folders
│   └── use-data-table.ts
├── utils/                       # ❌ Don't create nested folders
│   └── formatter.ts            # ❌ Missing component prefix
├── data-table.tsx              # ❌ Use index.tsx instead
└── sub-header.tsx              # ❌ Missing component prefix
```

### Benefits

- **Clean import paths**: Using `index.tsx` enables clean imports like `@/components/data-table` instead of `@/components/data-table/data-table`
- **Easy to find files**: Prefix-based naming makes searching straightforward (e.g., search for "data-table-" to find all related files)
- **Flat hierarchy**: No deep nesting, all files at the same level
- **Consistent pattern**: Same structure for all components across the codebase
- **Better IDE support**: Autocomplete works better with prefixed names
- **Reduced cognitive load**: No need to remember which subfolder a file is in
- **Flexible form integration**: Controlled/uncontrolled pattern allows components to work both inside and outside react-hook-form contexts

## Key Architectural Patterns

### Component Organization

1. **Reusable Components** (`src/components/`)
   - Components used across multiple modules
   - Each component has its own folder with a flat structure
   - All files prefixed with the component name
   - **Form input components provide both controlled and uncontrolled versions**
   - Examples: `icon/`, `data-table/`, `button/`, `select/`, `autocomplete/`

2. **Module Components** (`src/modules/{module}/components/`)
   - Components specific to a single module
   - Not intended for reuse outside the module
   - Follow the same flat structure pattern as reusable components
   - All files prefixed with the component name

3. **Shared Module** (`src/modules/shared/`)
   - Components, hooks, and utilities used across multiple modules
   - Bridge between true "global" reusables and module-specific code
   - Components here also follow the flat structure pattern

### Constants Organization

**Constants should be organized by scope to maintain clarity and prevent unnecessary coupling.**

```
Three levels of constants organization:
1. Global (src/constants/) → Used across the entire application
2. Cross-module (src/modules/shared/constants/) → Used across multiple related modules
3. Module/Component-specific → Used only within that module or component
```

#### Global Constants (`src/constants/`)

**Only truly global constants used across the entire application belong here. File names must be specific and descriptive.**

- **Pagination defaults**: Page sizes, limits used across the entire app
- **API configuration**: Request timeouts, retry limits, base endpoints
- **Date/time formats**: Display formats used throughout the application
- **File upload limits**: File size limits, allowed MIME types
- **Validation rules**: Global input validation limits (min/max lengths, patterns)
- **User roles and permissions**: System-wide role definitions

**Examples of what belongs in `src/constants/`:**

```typescript
// src/constants/pagination.ts
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
export const MAX_PAGINATION_PAGES = 10

// src/constants/api.ts
export const API_TIMEOUT = 30000
export const MAX_RETRY_ATTEMPTS = 3
export const API_BASE_URL = process.env.REACT_APP_API_URL

// src/constants/date-time-formats.ts
export const DATE_FORMAT = 'MM/DD/YYYY'
export const DATE_TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss'
export const TIME_FORMAT = 'HH:mm'

// src/constants/file-upload.ts
export const MAX_FILE_SIZE = 10485760 // 10MB
export const ALLOWED_FILE_TYPES = ['.pdf', '.jpg', '.png', '.docx']
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

// src/constants/validation-rules.ts
export const MIN_PASSWORD_LENGTH = 8
export const MAX_TEXT_INPUT_LENGTH = 255
export const PHONE_NUMBER_PATTERN = /^\d{3}-\d{3}-\d{4}$/

// src/constants/user-roles.ts
export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  LoanOfficer = 'LoanOfficer',
  Borrower = 'Borrower'
}
```

**Important:** File names should be descriptive and focused. Avoid vague names like `app.ts`, `common.ts`, `misc.ts`, or `utils.ts`. Each file should have a clear, single purpose.

#### Module-Specific Constants

**Feature-specific constants should live within their module:**

- Place in `src/modules/{module}/constants/`
- Or co-locate with components: `src/components/{component}/{component}-constants.ts`
- Only used within that module/component

**Examples of module-specific constants:**

```typescript
// ❌ DON'T put in src/constants/
// ✅ DO put in src/modules/loan-pricing/constants/
export const INTEREST_RATE_DECIMALS = 3
export const LOAN_TYPES = ['Conventional', 'FHA', 'VA']

// ❌ DON'T put in src/constants/
// ✅ DO put in src/components/data-table/data-table-constants.ts
export const DEFAULT_SORT_ORDER = 'asc'
export const SORTABLE_COLUMNS = ['name', 'date', 'status']
```

#### Best Practices

- **Descriptive file names**: Use specific, purpose-driven names
  - ✅ Good: `date-time-formats.ts`, `file-upload.ts`, `validation-rules.ts`
  - ❌ Bad: `app.ts`, `common.ts`, `misc.ts`, `constants.ts`, `config.ts`, `utils.ts`
- **Single responsibility**: Each file should have one clear purpose
- **Global vs Local**: Ask "Is this used across multiple unrelated modules?" If no, it's module-specific
- **Avoid over-globalization**: Don't put constants in `src/constants/` "just in case" they might be reused
- **File organization**: Group related constants in the same file (e.g., all API configs together)
- **Naming conventions**: Use SCREAMING_SNAKE_CASE for primitive constants, PascalCase for enums

### Hooks Organization

**Hooks should be organized by scope, similar to components and constants.**

```
Three levels of hooks organization:
1. Global (src/hooks/) → Generic, reusable across any application (currently not used)
2. Cross-module (src/modules/shared/hooks/) → Shared across modules (currently contains both generic and domain-specific)
3. Module-specific → Used only within that module
```

#### Global Hooks (`src/hooks/`) - What Should Go Here

**Global hooks should be purely utility-focused with NO business logic. These hooks should be generic enough to use in any React application.**

**Characteristics:**
- No domain types (Loan, User, Document, etc.)
- No API calls to your backend
- Pure utility logic (DOM, state, effects, storage)
- Could be extracted into an npm package

---

### Reference List: Global Hooks to Create

#### DOM & UI Utilities

| Hook | Purpose | Returns |
|------|---------|---------|
| **useMediaQuery(query)** | Detect responsive breakpoints | `boolean` - true if query matches |
| **useClickOutside(handler)** | Detect clicks outside element | `ref` - attach to element |
| **useCopyToClipboard()** | Copy text to clipboard | `{ copied, copy }` |
| **useKeyPress(targetKey)** | Detect specific key press | `boolean` - true if key pressed |
| **useWindowSize()** | Track window dimensions | `{ width, height }` |
| **useScrollPosition()** | Track scroll position | `{ x, y }` |
| **useHover()** | Detect hover state | `{ hovered, ref }` |
| **useFocusWithin()** | Detect focus within element | `{ focused, ref }` |

#### State Management

| Hook | Purpose | Returns |
|------|---------|---------|
| **useToggle(initial)** | Boolean toggle with helpers | `{ value, toggle, setTrue, setFalse }` |
| **useLocalStorage(key, initial)** | Persist state to localStorage | `[value, setValue]` |
| **useSessionStorage(key, initial)** | Persist state to sessionStorage | `[value, setValue]` |
| **usePrevious(value)** | Track previous value | `previousValue` |
| **useCounter(initial)** | Counter with increment/decrement | `{ count, increment, decrement, reset }` |
| **useArray(initial)** | Array manipulation helpers | `{ array, push, remove, clear, update }` |
| **useMap(initial)** | Map manipulation helpers | `{ map, set, remove, clear }` |

#### Timing & Effects

| Hook | Purpose | Returns |
|------|---------|---------|
| **useDebounce(value, delay)** | Debounce a value | `debouncedValue` |
| **useThrottle(value, delay)** | Throttle a value | `throttledValue` |
| **useInterval(callback, delay)** | Declarative setInterval | `void` |
| **useTimeout(callback, delay)** | Declarative setTimeout | `void` |
| **useUpdateEffect(effect, deps)** | useEffect that skips first render | `void` |

#### Lifecycle

| Hook | Purpose | Returns |
|------|---------|---------|
| **useMounted()** | Check if component is mounted | `ref` - mounted.current |
| **useUnmount(callback)** | Run callback on unmount | `void` |
| **useIsFirstRender()** | Check if first render | `boolean` |

#### Performance

| Hook | Purpose | Returns |
|------|---------|---------|
| **useWhyDidYouUpdate(name, props)** | Debug re-renders | `void` (logs changes) |

---

### Implementation Examples

**For complete implementation examples of all utility hooks (useLocalStorage, useToggle, useMediaQuery, useClickOutside, and more), see [hooks-reference.md](hooks-reference.md).**

The reference guide includes:
- Full TypeScript implementations with proper typing
- Usage examples for each hook
- Best practices and patterns
- When to use each hook

---

**When NOT to create a global hook:**

```typescript
// ❌ DON'T - Uses domain types (Loan)
export function useLoanValidation(loan: Loan) {
  // This belongs in src/modules/shared/hooks/
}

// ❌ DON'T - Makes API calls to your backend
export function useUserProfile(userId: string) {
  // This belongs in src/modules/shared/hooks/
}

// ❌ DON'T - Business logic specific to your app
export function useDocumentUpload(loanId: string) {
  // This belongs in src/modules/shared/hooks/
}

// ✅ DO - Pure utility, no business logic
export function useDebounce<T>(value: T, delay: number) {
  // Generic utility, belongs in src/hooks/
}
```

**Quick Reference: Hook Categories**

| Category | Examples | Location |
|----------|----------|----------|
| **DOM Utilities** | useClickOutside, useMediaQuery, useCopyToClipboard | `src/hooks/` |
| **State Helpers** | useToggle, usePrevious, useLocalStorage | `src/hooks/` |
| **Timing** | useDebounce, useInterval, useTimeout | `src/hooks/` |
| **Lifecycle** | useMounted, useUnmount, useUpdateEffect | `src/hooks/` |
| **Form Wrapper** | useForm (wraps react-hook-form) | `src/modules/shared/hooks/` |
| **Authentication** | useAuth, useUser, usePermissions | `src/modules/shared/hooks/` |
| **Loan Logic** | useLoanStatus, useShareLoan, useLoanOfficer | `src/modules/shared/hooks/` |
| **Data Fetching** | usePartner, useBranch, useSiteConfig | `src/modules/shared/hooks/` |
| **Notifications** | useAlert, useErrorHandler | `src/modules/shared/hooks/` (could move to src/hooks/) |

**Usage Examples:**

```tsx
// ✅ Using global hooks (DOM, state, timing utilities)
import { useToggle } from '@/hooks/use-toggle'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useClickOutside } from '@/hooks/use-click-outside'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'

function MyComponent() {
  // Toggle state management
  const { value: isOpen, toggle, setFalse } = useToggle(false)

  // Responsive design
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Click outside detection
  const ref = useClickOutside<HTMLDivElement>(() => setFalse())

  // Persist to localStorage
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  // Copy to clipboard
  const { copied, copy } = useCopyToClipboard()

  return (
    <div ref={ref}>
      {isMobile ? 'Mobile View' : 'Desktop View'}
      <button onClick={toggle}>Toggle</button>
      <button onClick={() => copy('Hello!')}>
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

// ✅ Using domain-specific hooks (business logic)
import { useAuth } from '@/modules/shared/hooks/use-auth'
import { useLoanStatus } from '@/modules/shared/hooks/use-loan-status'

function LoanPage() {
  const { user, isAuthenticated } = useAuth()
  const { status, updateStatus } = useLoanStatus(loanId)

  // Business logic with domain types
  return <div>Loan Status: {status}</div>
}
```

---

### Reference List: Domain-Specific Hooks (Current Project)

**These hooks contain loan/mortgage business logic and belong in `src/modules/shared/hooks/`**

#### Authentication & User Management

| Hook | Purpose | Current Location |
|------|---------|------------------|
| **useAuth()** | Authentication helpers (login, logout, user) | `src/modules/shared/hooks/` |
| **useUser(userId)** | User data management and operations | `src/modules/shared/hooks/` |
| **useSiteConfig()** | Site configuration settings | `src/modules/shared/hooks/` |

#### Loan Management

| Hook | Purpose | Current Location |
|------|---------|------------------|
| **useLoanStatus(loanId)** | Loan status logic and transitions | `src/modules/shared/hooks/` |
| **useShareLoan()** | Share loan functionality | `src/modules/shared/hooks/` |
| **useLoanInvites()** | Loan invitation management | `src/modules/shared/hooks/` |

#### People & Relationships

| Hook | Purpose | Current Location |
|------|---------|------------------|
| **usePartner()** | Partner management | `src/modules/shared/hooks/` |
| **useBranch()** | Branch operations | `src/modules/shared/hooks/` |
| **useLoanOfficer()** | Loan officer operations | `src/modules/shared/hooks/` |

#### UI & Data Management

| Hook | Purpose | Current Location |
|------|---------|------------------|
| **usePagination()** | Pagination state management | `src/modules/shared/hooks/` *(could move to src/hooks/)* |
| **useSearch()** | Generic search functionality | `src/modules/shared/hooks/` *(could move to src/hooks/)* |
| **useDebounce()** | Debounce values | `src/modules/shared/hooks/` *(could move to src/hooks/)* |
| **useWindowSize()** | Window size tracking | `src/modules/shared/hooks/` *(could move to src/hooks/)* |

#### Form & Validation

| Hook | Purpose | Current Location |
|------|---------|------------------|
| **useForm()** | Custom form hook (react-hook-form + Yup) | `src/modules/shared/hooks/` |
| **useFormField()** | Form field helpers | `src/modules/shared/hooks/` |
| **useDateRangeValidation()** | Date range validation | `src/modules/shared/hooks/` |
| **useImageValidator()** | Image validation logic | `src/modules/shared/hooks/` |

#### Notifications & Errors

| Hook | Purpose | Current Location |
|------|---------|------------------|
| **useAlert()** | Alert/notification handling | `src/modules/shared/hooks/` *(could move to src/hooks/)* |
| **useErrorHandler()** | Error handling logic | `src/modules/shared/hooks/` *(could move to src/hooks/)* |

#### Other Utilities

| Hook | Purpose | Current Location |
|------|---------|------------------|
| **useUserAgent()** | User agent detection | `src/modules/shared/hooks/` |
| **useRoleList()** | Role list management | `src/modules/shared/hooks/` |
| **usePaginatedUsers()** | Paginated user data | `src/modules/shared/hooks/` |
| **usePaginatedBranches()** | Paginated branch data | `src/modules/shared/hooks/` |
| **useSearchText()** | Search text management | `src/modules/shared/hooks/` |
| **useHtmlTemplatePreview()** | HTML template preview | `src/modules/shared/hooks/` |
| **useMixpanel()** | Mixpanel analytics | `src/modules/shared/hooks/` |
| **useSiteConfigurationByEntity()** | Entity-specific site config | `src/modules/shared/hooks/` |

---

#### Current State: All Hooks in `src/modules/shared/hooks/`

**The project currently has all 28 hooks in `src/modules/shared/hooks/`, including both:**
- Generic utility hooks (could be moved to `src/hooks/` in the future)
- Domain-specific hooks (loan/mortgage business logic)

**Generic Utility Hooks (could move to `src/hooks/`):**

```typescript
// src/modules/shared/hooks/use-form.ts
// Custom wrapper around react-hook-form with Yup validation
export function useForm(options) {
  // Standardized form setup with validation
}

// src/modules/shared/hooks/use-debounce.ts
// Generic debounce hook for any value
export function useDebounce<T>(value: T, delay: number) {
  // Returns debounced value
}

// src/modules/shared/hooks/use-window-size.js
// Window size tracking for responsive layouts
export function useWindowSize() {
  // Returns { width, height }
}

// src/modules/shared/hooks/use-pagination.ts
// Pagination state management
export function usePagination(initialPage = 1, initialPageSize = 20) {
  // Returns page, pageSize, handlePageChange, etc.
}

// src/modules/shared/hooks/use-search.ts
// Generic search functionality with debouncing
export function useSearch(initialValue = '') {
  // Returns searchTerm, setSearchTerm, debouncedSearchTerm
}

// src/modules/shared/hooks/use-error-handler.ts
// Error handling logic
export function useErrorHandler() {
  // Returns handleError, clearError, error
}

// src/modules/shared/hooks/use-alert.js
// Alert/notification handling
export function useAlert() {
  // Returns showAlert, hideAlert, alert
}
```

**Domain-Specific Hooks (loan/mortgage business logic):**

```typescript
// src/modules/shared/hooks/use-auth.js
// Authentication helpers
export function useAuth() {
  // Returns user, login, logout, isAuthenticated
}

// src/modules/shared/hooks/use-user.ts
// User data management
export function useUser(userId: string) {
  // Returns user data, updateUser, etc.
}

// src/modules/shared/hooks/use-loan-status.js
// Manages loan status logic
export function useLoanStatus(loanId: string) {
  // Returns loan status, canTransition, updateStatus, etc.
}

// src/modules/shared/hooks/use-share-loan.ts
// Share loan functionality
export function useShareLoan() {
  // Returns shareLoan, revokeLoanAccess, etc.
}

// src/modules/shared/hooks/use-partner.ts
// Partner management
export function usePartner() {
  // Returns partner data and operations
}

// src/modules/shared/hooks/use-branch.ts
// Branch management
export function useBranch() {
  // Returns branch data and operations
}

// src/modules/shared/hooks/use-loan-officer.ts
// Loan officer operations
export function useLoanOfficer() {
  // Returns loan officer data and operations
}

// src/modules/shared/hooks/use-site-config.js
// Site configuration
export function useSiteConfig() {
  // Returns site configuration settings
}
```

#### Module-Specific Hooks

**Hooks used only within a single module.**

```typescript
// src/modules/loan-pricing/hooks/use-pricing-calculation.ts
// Pricing calculations specific to loan-pricing module
export function usePricingCalculation(loanAmount: number) {
  // Returns calculated pricing data
}

// src/modules/pipeline/hooks/use-pipeline-filters.ts
// Filter logic specific to pipeline view
export function usePipelineFilters() {
  // Returns filter state and handlers
}
```

#### Best Practices

- **Hook naming**: Always prefix with `use` (e.g., `useForm`, `useDebounce`)
- **File naming**: Use kebab-case (e.g., `use-local-storage.ts`, `use-click-outside.ts`)
- **Single responsibility**: Each hook should do one thing well
- **Generic vs Domain**: Ask "Could this be used in a non-loan application?"
  - ✅ Yes → `src/hooks/`
  - ❌ No → `src/modules/shared/hooks/` or module-specific
- **Export pattern**: Use named export `export function useHookName()`
- **TypeScript**: Always type parameters and return values

#### Future Organization Strategy

**Currently, all hooks are in `src/modules/shared/hooks/`. For better organization, consider:**

1. **Create `src/hooks/` directory** for truly generic hooks:
   - `use-form.ts`, `use-debounce.ts`, `use-window-size.js`, `use-pagination.ts`, `use-search.ts`, `use-error-handler.ts`, `use-alert.js`

2. **Keep domain-specific hooks** in `src/modules/shared/hooks/`:
   - `use-auth.js`, `use-user.ts`, `use-loan-status.js`, `use-share-loan.ts`, `use-partner.ts`, `use-branch.ts`, `use-loan-officer.ts`, `use-site-config.js`

#### Decision Tree: Where to Put Hooks

Ask yourself these questions in order:

1. **Is it generic with no business logic (DOM, state, effects, storage)?**
   - ✅ Yes → `src/hooks/` (e.g., `useDebounce`, `useWindowSize`, `usePagination`)
   - ❌ No → Continue to question 2

2. **Is it used by multiple modules with domain logic?**
   - ✅ Yes → `src/modules/shared/hooks/` (e.g., `useLoanStatus`, `useAuth`, `useShareLoan`)
   - ❌ No → Continue to question 3

3. **Is it specific to a single module?**
   - ✅ Yes → `src/modules/{module}/hooks/` (e.g., module-specific business logic)

**Example walkthrough using actual project hooks:**
- `useDebounce` → Generic utility, no business logic → Should move to `src/hooks/use-debounce.ts`
- `useWindowSize` → Generic utility, any app → Should move to `src/hooks/use-window-size.js`
- `useLoanStatus` → Loan domain logic, multiple modules → Keep in `src/modules/shared/hooks/use-loan-status.js`
- `useAuth` → Auth logic, multiple modules → Keep in `src/modules/shared/hooks/use-auth.js`

#### Import Examples (Current State)

```tsx
// ✅ Currently all hooks are imported from shared
// Generic utility hooks (currently in shared, could move to src/hooks/)
import { useForm } from '@/modules/shared/hooks/use-form'
import { useDebounce } from '@/modules/shared/hooks/use-debounce'
import { useWindowSize } from '@/modules/shared/hooks/use-window-size'
import { usePagination } from '@/modules/shared/hooks/use-pagination'
import { useSearch } from '@/modules/shared/hooks/use-search'
import { useAlert } from '@/modules/shared/hooks/use-alert'
import { useErrorHandler } from '@/modules/shared/hooks/use-error-handler'

// Domain-specific shared hooks (stay in shared)
import { useAuth } from '@/modules/shared/hooks/use-auth'
import { useUser } from '@/modules/shared/hooks/use-user'
import { useLoanStatus } from '@/modules/shared/hooks/use-loan-status'
import { useShareLoan } from '@/modules/shared/hooks/use-share-loan'
import { usePartner } from '@/modules/shared/hooks/use-partner'
import { useBranch } from '@/modules/shared/hooks/use-branch'
import { useLoanOfficer } from '@/modules/shared/hooks/use-loan-officer'
import { useSiteConfig } from '@/modules/shared/hooks/use-site-config'

// Module-specific hooks (if they exist)
// import { useModuleSpecificLogic } from '@/modules/{module}/hooks/use-module-specific-logic'
```

#### Import Examples (Future Ideal State)

```tsx
// ✅ Generic utility hooks from src/hooks/
import { useForm } from '@/hooks/use-form'
import { useDebounce } from '@/hooks/use-debounce'
import { useWindowSize } from '@/hooks/use-window-size'
import { usePagination } from '@/hooks/use-pagination'

// ✅ Domain-specific shared hooks from src/modules/shared/hooks/
import { useAuth } from '@/modules/shared/hooks/use-auth'
import { useLoanStatus } from '@/modules/shared/hooks/use-loan-status'
import { useShareLoan } from '@/modules/shared/hooks/use-share-loan'

// ✅ Module-specific hooks
import { useModuleLogic } from '@/modules/{module}/hooks/use-module-logic'
```

#### Decision Tree: Where to Put Constants

Ask yourself these questions in order:

1. **Is it used throughout the entire application by unrelated modules?**
   - ✅ Yes → `src/constants/` (e.g., `DEFAULT_PAGE_SIZE`, `UserRole` enum)
   - ❌ No → Continue to question 2

2. **Is it used by multiple related modules (e.g., multiple loan-related modules)?**
   - ✅ Yes → `src/modules/shared/constants/` (e.g., loan statuses, document types)
   - ❌ No → Continue to question 3

3. **Is it specific to a single module or component?**
   - ✅ Module-specific → `src/modules/{module}/constants/` (e.g., loan pricing decimals)
   - ✅ Component-specific → `src/components/{component}/{component}-constants.ts` (e.g., data table sort order)

**Example walkthrough:**
- `API_TIMEOUT` → Used by all API calls across the app → `src/constants/api.ts`
- `DATE_FORMAT` → Used for displaying dates throughout the entire app → `src/constants/date-time-formats.ts`
- `MAX_FILE_SIZE` → Used by all file upload components → `src/constants/file-upload.ts`
- `LOAN_STATUSES` → Used by multiple loan-related modules → `src/modules/shared/constants/loan-statuses.ts`
- `INTEREST_RATE_DECIMALS` → Only used in loan-pricing module → `src/modules/loan-pricing/constants/pricing.ts`
- `DEFAULT_SORT_ORDER` → Only used in data-table component → `src/components/data-table/data-table-constants.ts`

### Form Handling

The project uses **React Hook Form** for all form management:

1. **Form Input Components**: All form input components (Select, Autocomplete, TextField, etc.) have two versions:
   - **Uncontrolled (`index.tsx`)**: Standard React component for standalone use
   - **Controlled (`{component-name}-controlled.tsx`)**: Integrated with react-hook-form using `Controller`

2. **Custom `useForm` Hook**: Always use the custom `useForm` hook from `@/hooks/use-form` (not the raw react-hook-form)
   - Includes Yup schema validation
   - Standardized error handling
   - Consistent form behavior across the app

3. **Form Pattern**: Wrap form fields with `FormProvider` from react-hook-form
   - Use controlled components within `FormProvider`
   - Use uncontrolled components outside forms

### State Management

1. **Global State** (`src/contexts/`)
   - `app-context` - User authentication, site config, impersonation
   - `loan-context` - Active loan state with SignalR updates
   - `loan-locked-context` - Real-time loan lock status
   - `language-context` - i18n language selection

2. **Server State** (TanStack React Query)
   - Query keys centralized in `src/services/queryKeys.js`
   - Automatic cache invalidation via SignalR

### File Naming Conventions

- **All files**: kebab-case (e.g., `user-profile.tsx`, `loan-header.tsx`)
- **Components**: PascalCase exports from kebab-case files
- **Hooks**: camelCase exports from kebab-case files (e.g., `use-form.ts`)
- **Extensions**: `.tsx` for components, `.ts` for hooks/utils
- **Page components**: Suffix with `-page` (e.g., `documents-page.tsx`, `pricing-page.tsx`)
- **Form components**: Suffix with `-form` (e.g., `sign-in-form.tsx`, `document-upload-form.tsx`)
- **Modal components**: Suffix with `-modal` (e.g., `delete-confirmation-modal.tsx`, `share-loan-modal.tsx`)

### Import Paths

The project uses absolute imports with the `@/` alias:

```tsx
// ✅ Absolute imports - clean paths using index.tsx
import Icon from '@/components/icon'                    // imports icon/index.tsx
import DataTable from '@/components/data-table'         // imports data-table/index.tsx
import Dropzone from '@/components/dropzone'            // imports dropzone/index.tsx
import { useLoanContext } from '@/contexts/loan-context'
import { useAuth } from '@/modules/shared/hooks/use-auth'

// ✅ Form input components - controlled vs uncontrolled
import Select from '@/components/select'                           // Uncontrolled (index.tsx)
import SelectControlled from '@/components/select/select-controlled' // Controlled for react-hook-form
import Autocomplete from '@/components/autocomplete'               // Uncontrolled (index.tsx)
import AutocompleteControlled from '@/components/autocomplete/autocomplete-controlled' // Controlled

// ✅ Relative imports for co-located files within a component
import { formatData } from './data-table-utils'         // sibling file in same folder
import type { DataTableProps } from './data-table-types'

// ❌ Avoid redundant paths
import DataTable from '@/components/data-table/data-table'  // Bad! Use index.tsx
```

### Usage: Controlled vs Uncontrolled Form Components

**When to use the Uncontrolled version (`index.tsx`):**
```tsx
import Select from '@/components/select'

function MyComponent() {
  const [value, setValue] = useState('')

  return (
    <Select
      value={value}
      onChange={setValue}
      options={options}
    />
  )
}
```

**When to use the Controlled version (`{component-name}-controlled.tsx`):**
```tsx
import { FormProvider, useForm } from 'react-hook-form'
import SelectControlled from '@/components/select/select-controlled'

function MyForm() {
  const methods = useForm()

  return (
    <FormProvider {...methods}>
      <form>
        <SelectControlled
          name="country"
          control={methods.control}
          options={options}
        />
      </form>
    </FormProvider>
  )
}
```

**Key differences:**
- **Uncontrolled**: Uses standard React props (`value`, `onChange`)
- **Controlled**: Integrates with react-hook-form (`name`, `control`, automatic validation)

## Feature Module Examples

### Loan Details Module

The `loan-details` module demonstrates a typical feature module structure:

```
loan-details/
├── pages/                        # Route-level pages
│   └── loan-details-page.tsx
│
└── components/                   # Module-specific components
    ├── loan-header.tsx           # Each component follows flat structure
    ├── loan-summary.tsx
    ├── loan-locked-alert.tsx
    ├── loan-status.jsx
    ├── loan-contacts-table.tsx
    ├── personal-info.jsx
    ├── employment-income.jsx
    ├── assets.jsx
    └── real-estate-owned.jsx
```

**Note:** For complex components with multiple files, create a folder using the flat structure pattern:

```
loan-details/
└── components/
    └── loan-summary/             # Complex component with its own folder
        ├── index.tsx             # Main component → import from '@/modules/loan-details/components/loan-summary'
        ├── loan-summary-card.tsx # Sub-component (prefixed)
        ├── loan-summary-types.ts # Types (prefixed)
        └── loan-summary-utils.ts # Utils (prefixed)
```

### Shared Module

The `shared` module contains cross-cutting concerns used across multiple feature modules. All components follow the flat structure pattern.

```
shared/
├── components/                   # 24+ shared components (flat structure)
│   │
│   ├── loan-upload-files.tsx    # Simple: single-file component
│   ├── autocomplete-users.tsx   # Simple: single-file component
│   ├── loan-status-badge.tsx    # Simple: single-file component
│   ├── property-address-display.tsx   # Simple: single-file component
│   │
│   ├── borrower-card/           # Complex: multi-file component (flat)
│   │   ├── index.tsx            # Main component → import from '@/modules/shared/components/borrower-card'
│   │   ├── borrower-card-info.tsx       # Sub-component (prefixed)
│   │   ├── borrower-card-employment.tsx # Sub-component (prefixed)
│   │   ├── borrower-card-types.ts       # Types (prefixed)
│   │   └── borrower-card-utils.ts       # Utils (prefixed)
│   │
│   ├── document-preview/        # Complex: multi-file component (flat)
│   │   ├── index.tsx            # Main component
│   │   ├── document-preview-header.tsx    # Sub-component (prefixed)
│   │   ├── document-preview-content.tsx   # Sub-component (prefixed)
│   │   ├── document-preview-toolbar.tsx   # Sub-component (prefixed)
│   │   ├── document-preview-types.ts      # Types (prefixed)
│   │   └── document-preview.cy.tsx        # Tests (prefixed)
│   │
│   ├── loan-timeline/           # Complex: multi-file component (flat)
│   │   ├── index.tsx            # Main component
│   │   ├── loan-timeline-item.tsx         # Sub-component (prefixed)
│   │   ├── loan-timeline-milestone.tsx    # Sub-component (prefixed)
│   │   ├── loan-timeline-types.ts         # Types (prefixed)
│   │   └── loan-timeline-constants.ts     # Constants (prefixed)
│   │
│   └── ...                      # Other shared components
│
├── hooks/                        # 28+ shared hooks (both generic and domain-specific)
│   ├── use-form.ts              # Custom form hook (react-hook-form + Yup)
│   ├── use-debounce.ts          # Generic debounce utility
│   ├── use-window-size.js       # Window size tracking
│   ├── use-pagination.ts        # Pagination state management
│   ├── use-search.ts            # Generic search functionality
│   ├── use-auth.js              # Authentication helpers
│   ├── use-user.ts              # User data management
│   ├── use-loan-status.js       # Loan status logic
│   ├── use-share-loan.ts        # Share loan functionality
│   ├── use-partner.ts           # Partner management
│   ├── use-branch.ts            # Branch management
│   ├── use-loan-officer.ts      # Loan officer operations
│   ├── use-alert.js             # Alert/notification handling
│   └── ...
│
├── types/                        # Shared TypeScript types
│   ├── loan-types.ts            # Loan-related types
│   ├── user-types.ts            # User-related types
│   ├── document-types.ts        # Document-related types
│   ├── borrower-types.ts        # Borrower-related types
│   ├── property-types.ts        # Property-related types
│   └── ...
│
├── utils/                        # Shared utility functions
│   ├── loan-payment-calculator.ts   # Calculate loan payments
│   ├── interest-rate-calculator.ts  # Calculate interest rates
│   ├── date-formatter.ts            # Format dates for display
│   ├── currency-formatter.ts        # Format currency values
│   ├── phone-number-formatter.ts    # Format phone numbers
│   └── ...
│
└── constants/                    # Cross-module constants (not app-global)
    ├── loan-statuses.ts          # Constants used by multiple loan-related modules
    ├── document-types.ts         # Constants used across document-handling modules
    └── milestone-types.ts        # Loan milestone type constants
```

**Key Points:**

- **Components follow flat structure**: All files within a component folder are at the same level with prefixed names
- **Simple vs Complex**: Simple components are single files, complex components get their own folder
- **Shared vs Global**: These components are used across multiple feature modules but are still domain-specific (loan/mortgage related)
- **Constants**: The `shared/constants/` folder is for constants used across multiple feature modules but not globally throughout the entire app. True global constants belong in `src/constants/`.

**When to use `src/modules/shared/` vs `src/components/`:**

| Criteria | `src/components/` | `src/modules/shared/components/` |
|----------|-------------------|----------------------------------|
| **Purpose** | Generic, reusable UI components | Domain-specific shared components |
| **Domain** | No business logic, pure UI | Loan/mortgage business logic included |
| **Dependencies** | No domain types or business logic | Uses loan/document/user domain types |
| **Examples** | Button, Select, DataTable, Icon, Checkbox | LoanStatusBadge, DocumentPreview, LoanTimeline, BorrowerCard |
| **Reusability** | Could be used in any application | Specific to this loan application domain |

**Decision Questions:**

1. **Does it contain loan/mortgage/document-specific logic?**
   - ✅ Yes → `src/modules/shared/components/` (e.g., LoanTimeline, DocumentPreview)
   - ❌ No → `src/components/` (e.g., Button, DataTable, Select)

2. **Does it use domain-specific types (Loan, Document, User)?**
   - ✅ Yes → `src/modules/shared/components/` (e.g., LoanStatusBadge uses LoanStatus type)
   - ❌ No → `src/components/` (e.g., Icon only uses string props)

3. **Could this component be used in a completely different app?**
   - ✅ Yes → `src/components/` (e.g., DataTable could be used anywhere)
   - ❌ No → `src/modules/shared/components/` (e.g., LoanUploadFiles is loan-specific)

**Import Examples:**

```tsx
// ✅ Importing simple shared components (single file)
import LoanUploadFiles from '@/modules/shared/components/loan-upload-files'
import AutocompleteUsers from '@/modules/shared/components/autocomplete-users'
import LoanStatusBadge from '@/modules/shared/components/loan-status-badge'
import PropertyAddressDisplay from '@/modules/shared/components/property-address-display'

// ✅ Importing complex shared components (folders with index.tsx)
import BorrowerCard from '@/modules/shared/components/borrower-card'
import DocumentPreview from '@/modules/shared/components/document-preview'
import LoanTimeline from '@/modules/shared/components/loan-timeline'

// ✅ Importing shared hooks
import { useLoanStatus } from '@/modules/shared/hooks/use-loan-status'
import { useAuth } from '@/modules/shared/hooks/use-auth'
import { useDocumentUpload } from '@/modules/shared/hooks/use-document-upload'

// ✅ Importing shared types
import type { Loan, LoanStatus } from '@/modules/shared/types/loan-types'
import type { User, UserRole } from '@/modules/shared/types/user-types'

// ✅ Importing shared utilities
import { calculateLoanPayment } from '@/modules/shared/utils/loan-payment-calculator'
import { formatDate } from '@/modules/shared/utils/date-formatter'
import { formatCurrency } from '@/modules/shared/utils/currency-formatter'

// ✅ Importing shared constants
import { LOAN_STATUSES } from '@/modules/shared/constants/loan-statuses'
import { DOCUMENT_TYPES } from '@/modules/shared/constants/document-types'
```

## Navigation and Routing

- **Main routing**: `src/app.jsx` defines all application routes
- **Route protection**: `src/routes/private-route.jsx` handles authentication and authorization
- **Route definitions**: Centralized in `src/services/navigation.js`

## Data Flow

1. **API Client**: `src/utils/the-big-pos-client.ts` wraps the auto-generated OpenAPI SDK
2. **Query Management**: TanStack React Query with keys from `src/services/queryKeys.js`
3. **Real-time Updates**: SignalR WebSocket connection via `loan-signalr-context.tsx`
4. **State Persistence**: localStorage for auth tokens, user preferences

## Testing Structure

- Component tests: Co-located `.cy.tsx` files (e.g., `button.tsx` + `button.cy.tsx`)
- Test framework: Cypress for both E2E and component testing

## Styling

- **CSS Framework**: Tailwind CSS for utility classes
- **Component Library**: Material-UI (MUI) v5 wrapped in custom components
- **Theme**: Configured in `src/app-theme.jsx`
- **Global Styles**: `src/index.css` + Tailwind config

## Key Files and Directories

- **`src/index.tsx`** - Application entry point, provider setup
- **`src/app.jsx`** - Main app component with routing
- **`src/app-theme.jsx`** - MUI theme configuration
- **`src/utils/the-big-pos-client.ts`** - API client wrapper
- **`src/i18n/en.ts` / `es.ts`** - Translation strings
- **`src/constants/`** - Global constants (pagination, API config, formats, etc.)
- **`src/hooks/`** - Global utility hooks (currently empty - all hooks in shared)
- **`src/modules/shared/hooks/use-form.ts`** - Custom form hook (wraps react-hook-form + Yup)
- **`src/modules/shared/hooks/`** - 28 shared hooks (both generic and domain-specific)

## Adding New Features

When adding a new feature:

1. **Determine scope**: Is it reusable or feature-specific?

2. **Choose location for components**:
   - **Generic UI (no business logic)** → `src/components/`
     - Examples: Button, Select, DataTable, Icon, Form controls
     - Could be used in any application
   - **Domain-specific shared (contains business logic)** → `src/modules/shared/components/`
     - Examples: LoanStatusBadge, DocumentPreview, LoanTimeline
     - Uses loan/document/user domain types
     - Shared across multiple loan-related modules
   - **Feature-specific (single module only)** → `src/modules/{module}/components/`
     - Examples: LoanApplicationForm, PricingCalculator
     - Only used within one specific module

3. **Choose location for other code**:
   - **Hooks** (Currently all in `src/modules/shared/hooks/`):
     - Generic utility hooks (no business logic) → `src/hooks/` (future) or `src/modules/shared/hooks/` (current)
     - Domain-specific shared → `src/modules/shared/hooks/`
     - Module-specific → `src/modules/{module}/hooks/`
     - **Note:** For now, add all hooks to `src/modules/shared/hooks/`. Consider moving generic utilities to `src/hooks/` in a future refactoring.
   - **Constants**:
     - Global (used across many unrelated modules) → `src/constants/`
     - Cross-module (multiple related modules) → `src/modules/shared/constants/`
     - Module-specific → `src/modules/{module}/constants/`
     - Component-specific → `src/components/{component}/{component}-constants.ts`
   - **Utils, Types**: Follow the same scoping pattern as hooks and components

4. **Follow conventions**:
   - Use kebab-case files
   - Use TypeScript (`.ts` or `.tsx`)
   - Add localization for all user-facing text
   - Follow the flat component structure pattern (all files prefixed with component name)

5. **Create component structure**:
   - Single-file components: Place directly in the parent `components/` folder
   - Multi-file components: Create a folder with flat structure
   - **Always use `index.tsx` for the main component** (enables clean imports)
   - **For form inputs**: Create both uncontrolled (`index.tsx`) and controlled (`{component-name}-controlled.tsx`) versions
   - Prefix all other files with the component name
   - Examples:
     - Display component: `data-table/index.tsx`, `data-table/data-table-sub-header.tsx`, `data-table/data-table-types.ts`
     - Form input: `select/index.tsx`, `select/select-controlled.tsx`, `select/select-types.ts`

## Migration Notes

The project is actively migrating from JavaScript to TypeScript:
- All new code must be TypeScript (`.ts` or `.tsx`)
- When editing `.js` or `.jsx` files, rename and refactor to TypeScript
- Use `FixMeLater` type only for temporary complex type migrations