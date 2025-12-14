### PROJECT CONTEXT



---
# FILE: ai-agent-instructions.md

# POS React: AI Agent Instructions

This document provides essential guidance for AI agents working in the pos-react codebase.

**Last Updated:** November 14, 2024

## Table of Contents

- [Project Overview](#project-overview)
- [Essential Commands](#essential-commands)
- [Architecture Patterns](#architecture-patterns)
- [Project Structure](#project-structure)
- [Quick Reference](#quick-reference)
- [Module Structure](#module-structure)
- [Code Conventions](#code-conventions)
  - [File & Naming](#file--naming)
  - [TypeScript & Types](#typescript--types)
  - [Reusable Component Pattern](#reusable-component-pattern)
  - [React Hook Form + Yup Pattern](#react-hook-form--yup-pattern)
  - [Styling](#styling)
  - [Icons](#icons)
  - [Localization](#localization)
  - [Boolean Props](#boolean-props)
  - [Import Standards](#import-standards)
  - [General Best Practices](#general-best-practices)
- [Common Workflows](#common-workflows)
- [Anti-Patterns & What to Avoid](#anti-patterns--what-to-avoid)
- [Project-Specific Quirks](#project-specific-quirks)
- [Key Files Reference](#key-files-reference)
- [Environment Configuration](#environment-configuration)
- [Debugging](#debugging)

---

## Project Overview

**pos-react** is a web application built with React 19, TypeScript, and Vite for a mortgage loan origination system. It serves multiple user roles (e.g., borrowers, loan officers, admins, realtors) and provides comprehensive loan management, document handling, and workflow automation.

**Key Tech Stack:**
- **Framework:** React 19, TypeScript, Vite (migration from Create React App)
- **State Management:** React Context (AppContext), TanStack React Query for server state
- **Forms:** React Hook Form + Yup validation
- **UI:** Material-UI (MUI v5) + Tailwind CSS
- **API Client:** Custom `TheBigPOSApi` (auto-generated SDK from OpenAPI)
- **Routing:** React Router v6 with custom browser history
- **Real-time:** SignalR WebSocket connections for loan updates
- **Testing:** Cypress (E2E + Component tests)
- **i18n:** React Intl (English/Spanish)

**Node Requirements:**
  - Node.js >= 20.19.0
  - npm ~10.5.0
  - Yarn 1.22.1

## Essential Commands

- **Install:** `yarn install` (Install all dependencies)
- **Dev:** `yarn start` (Vite dev server on :3000)
- **Build:** `yarn build` (Vite output to `build/`)
- **Lint Check:** `yarn lint` (Check for linting and formatting errors)
- **Lint Fix:** `yarn lint:fix` (Auto-fix ESLint + Prettier issues)
- **Type check:** `yarn typecheck` (No-emit TypeScript check)
- **Tests:** `yarn test` (Run full Cypress test suite)
- **Open Cypress UI:** `yarn cy:open` (Open the Cypress UI for interactive testing)

**Note:** A pre-commit hook automatically runs `yarn lint:fix`.

## Architecture Patterns

### Global State Management

The app uses a layered context approach for global state:

1. **AppContext** (`src/components/AppContext/`): Manages global app state (user, auth token, site config) via `useReducer` and persists auth to localStorage. Access with `useAppContext()` and `useAppContextActions()`.
2. **LoanContext** (`src/contexts/loan-context.tsx`): Manages active loan data, caching, and real-time SignalR updates. Use `setActiveLoanId()` to coordinate navigation.
3. **LoanLockedContext** (`src/contexts/loan-locked-context.tsx`): Provides real-time loan lock status via SignalR.
  - **Use Case:** Display lock warnings and disable forms during concurrent edits.
  - **Access:** `const { isLocked } = useLoanLockedContext()`. Conditionally render UI when `isLocked === true`.
4. **LanguageContext**: Manages i18n (English/Spanish).
5. **AlertsContext**: Manages UI feedback and notifications.

### Analytics

**MixpanelProvider** (`src/components/MixPanel/MixPanelProvider.jsx`): Initializes and shares the Mixpanel SDK for analytics.
  - **Use Case:** Track user events and feature usage.
  - **Access:** `mixpanel.track('Event Name', { property: 'value' })` via the `useMixpanel()` hook.
  - **Debug:** Set `REACT_APP_MIXPANEL_DEBUG=true` to log events to the console.

### Component Hierarchy

- **Layout:** `CustomBrowserRouter` → `AppTheme` (providers) → `App` (routing) → pages/components
- **Protection:** `PrivateRoute` handles auth and role-based access.
- **Pages:** The `Page` component wraps content, handling layout, breadcrumbs, and loading states.
- **Forms:** Form components use the `useForm()` hook and `FormProvider`.

### Navigation and Routing

This project uses **React Router v6**.

- **Route Definitions:** All route paths are centralized in `src/services/navigation.js`.
- **Protected Routes:** `PrivateRoute` in `src/routes/` protects routes that require authentication and authorization.
- **UI:** The `Breadcrumbs` component displays the user's navigation path.
- **Implementation:** The main routing structure is configured in `src/App.jsx`.

### Data Flow: API Integration

1. **API Client:** `src/utils/the-big-pos-client.ts` wraps the auto-generated SDK. It's configured with a bearer token and site configuration ID.
2. **Data Fetching:**
  - **Queries:** Use TanStack React Query. Keys must come from `src/services/queryKeys.js`.
  - **Mutations:** Use for `POST`/`PUT`/`DELETE` operations, handling optimistic updates and errors.
3. **Real-time Updates:** `LoanSignalRContext` connects to a WebSocket for live loan updates, which trigger query refetches.

### Data Handling: Helpers and Mappers

1. **Helper Functions (`src/services/helpers.ts`)**
  - **Purpose:** Small, reusable functions for simple, global tasks (e.g., date formatting, currency conversion).
  - **Rule:** **Always** check `src/services/helpers.ts` for an existing function before creating a new one. Add new helpers there.

2. **Data Mappers (Parsing & Transformation)**
  - **Purpose:** Functions that transform data from one shape to another (e.g., API response to a UI object).
  - **Rule:** Define transformation logic in a function outside the component and pass it to the `select` option of a `useQuery` hook. For reusable mappers, place them in a shared `utils` file.

```tsx
  const parseDataForUI = (apiResponse) => { /* ... */ };

  function MyComponent() {
    const query = useQuery({
      // ...
      select: parseDataForUI, // Pass the function here
    });
    // ...
  }
```

### Hooks Organization

**Current State:** All hooks are in `src/modules/shared/hooks/` (both generic and domain-specific).

**Organization by Purpose:**
- **Generic utility hooks** (no business logic): useDebounce, useToggle, useLocalStorage
  - Currently: `src/modules/shared/hooks/`
  - Future: Will move to `src/hooks/`
- **Domain-specific hooks** (loan/mortgage logic): useLoanStatus, useAuth, useShareLoan
  - Location: `src/modules/shared/hooks/`
- **Module-specific hooks** (single module only): useLoanDocumentsFilter
  - Location: `src/modules/{module}/hooks/`

**Decision:** Ask "Can this be used in a non-loan application?" If yes → generic utility. If no → domain-specific.

**See [architecture-guide.md](architecture-guide.md) for detailed decision trees and examples.**

### Constants Organization

**Three levels of organization by scope:**

1. **Global Constants** (`src/constants/`) - Used across entire application
   - Examples: Pagination defaults, API config, date formats, user roles
   - Rule: Only truly global constants used throughout the entire application

2. **Cross-Module Constants** (`src/modules/shared/constants/`) - Used by multiple related modules
   - Examples: Loan statuses, document types, borrower roles
   - Rule: Shared across multiple loan-related modules

3. **Module-Specific Constants** (`src/modules/{module}/constants/`) - Used within one module
   - Examples: Loan pricing decimals, module-specific statuses
   - Rule: Only used within that specific module

**Decision:** Ask "Is this used across many unrelated modules?" If yes → global. If used by multiple related modules → shared. If single module → module-specific.

**See [architecture-guide.md](architecture-guide.md) for detailed organization strategy and file naming conventions.**

### Client State Management (Venti) - Legacy

**Note:** The `venti` library is legacy code. **Do not use Venti for new features.** Use React Query for server state and React Context for client state instead.

The `venti` library persists UI state to `localStorage` in existing code:
  - Loan drafts: `storageKeys.loanDraft`
  - Public rates: `storageKeys.publicRates`
  - Theme preference: `storageKeys.theme`

When you encounter Venti in existing code, understand its usage but do not extend it. For new localStorage needs, use the browser's `localStorage` API directly or create a custom hook.

## Project Structure

**⚠️ IMPORTANT: This project is currently undergoing a major architectural restructuring.**

**For comprehensive documentation of the TARGET directory structure and file organization, see [architecture-guide.md](architecture-guide.md).**

**What is PROJECT_STRUCTURE.md?**
- Shows the **TARGET/IDEAL structure** for new code and refactored code
- Some parts already exist, some are planned for future implementation
- **Use this structure for ALL NEW CODE you write**

That file contains:
- Complete directory tree showing target organization
- Detailed component organization patterns (flat structure)
- Hooks organization strategy and decision trees
- Constants organization best practices
- Module structure examples with real code
- Decision flowcharts for "where should this file go?"

**This file (CLAUDE.md)** focuses on:
- Coding conventions and patterns
- How to write code (TypeScript, React, forms)
- What to avoid (anti-patterns)
- Common workflows and tasks

**Quick architectural summary:**
- **Modular architecture** with domain-based modules in `src/modules/`
- **Flat component structure** - no nested subdirectories within components
- **Module prefix pattern** - all files in a module must be prefixed with module name
- **Kebab-case naming** for all files
- See PROJECT_STRUCTURE.md for complete details and examples

**When writing new code:**
- Follow the TARGET structure shown in PROJECT_STRUCTURE.md
- Place files according to the organization patterns documented there
- If you encounter legacy code in old locations, that's expected - the migration is ongoing

---

## Quick Reference

This section provides fast answers to common questions. For detailed explanations, see [architecture-guide.md](architecture-guide.md).

### Where Should This File Go?

**Components:**
```
Is it generic UI with no business logic (Button, DataTable, Icon)?
├─ YES → src/components/
│
└─ NO → Does it use domain types (Loan, User, Document)?
         ├─ YES → Used by multiple modules?
         │        ├─ YES → src/modules/shared/components/
         │        └─ NO → src/modules/{module}/components/
         │
         └─ NO → Probably src/components/ (reconsider if it's truly generic)
```

**Hooks:**
```
Is it pure utility with no business logic (useToggle, useDebounce)?
├─ YES → src/modules/shared/hooks/ (current location)
│        Note: Will move to src/hooks/ in future
│
└─ NO → Contains business logic or domain types?
         ├─ YES → Used by multiple modules?
         │        ├─ YES → src/modules/shared/hooks/
         │        └─ NO → src/modules/{module}/hooks/
         │
         └─ NO → Reconsider - might be generic utility after all
```

**Constants:**
```
Used across the entire application (pagination, API config)?
├─ YES → src/constants/{descriptive-name}.ts
│
└─ NO → Used by multiple related modules (loan statuses)?
         ├─ YES → src/modules/shared/constants/
         └─ NO → src/modules/{module}/constants/
```

**Pages:**
```
Always in: src/modules/{module}/pages/{module-name}-{page-name}-page.tsx
Example: src/modules/loan-documents/pages/loan-documents-list-page.tsx
```

---

### File Naming Cheatsheet

| File Type | Naming Pattern | Example |
|-----------|----------------|---------|
| **All files** | kebab-case | `user-profile.tsx` |
| **Module files** | `{module-name}-{file-name}` | `loan-documents-list.tsx` |
| **Pages** | `{module-name}-{page-name}-page.tsx` | `loan-documents-list-page.tsx` |
| **Forms** | `{module-name}-{form-name}-form.tsx` | `loan-documents-upload-form.tsx` |
| **Modals** | `{module-name}-{modal-name}-modal.tsx` | `loan-documents-delete-modal.tsx` |
| **Hooks** | `use-{name}.ts` | `use-loan-documents-filter.ts` |
| **Types** | `{name}-types.ts` | `loan-documents-types.ts` |
| **Constants** | `{name}-constants.ts` or `{name}.ts` | `loan-statuses.ts` |
| **Utils** | `{name}-{util}.ts` | `loan-payment-calculator.ts` |

**Critical Rules:**
- ✅ **ALWAYS** kebab-case for file names
- ✅ **ALWAYS** module prefix for files in `src/modules/{module}/`
- ✅ **ALWAYS** Readonly<> wrapper for component props
- ✅ **ALWAYS** localize user-facing text with `formatMessage()`
- ❌ **NEVER** import icons directly from `@mui/icons-material` (use Icon component)
- ❌ **NEVER** use PascalCase or camelCase for file names

---

### Common Tasks

#### Adding a New Page

**Step-by-step:**
1. Determine which module: `src/modules/{module}/`
2. Create file: `{module}/pages/{module-name}-{page-name}-page.tsx`
3. Follow module prefix pattern (CRITICAL)
4. Import and wrap with `<Page>` component
5. Use `useLoanContext()` if loan-specific, `useAppContext()` for global state
6. Fetch data with `useQuery` + keys from `queryKeys.js`
7. Add route in `src/App.jsx`

**Example:**
```tsx
// src/modules/loan-documents/pages/loan-documents-list-page.tsx
import { useIntl } from 'react-intl'
import { Page } from '@/components/page-wrapper'
import { useLoanContext } from '@/contexts/loan-context'

export default function LoanDocumentsListPage() {
  const { formatMessage } = useIntl()
  const { loan } = useLoanContext()

  return (
    <Page title={formatMessage({ id: 'loan_documents.title' })}>
      {/* content */}
    </Page>
  )
}
```

#### Adding a New Component

**Step-by-step:**
1. Check if it exists: Search `src/components/` first
2. Determine location using decision tree above
3. Create file with kebab-case name
4. Use flat structure (no nested folders)
5. For complex components: create folder with `index.tsx` + prefixed files
6. Export component with PascalCase name
7. Wrap props with `Readonly<>`
8. Localize all user-facing text

**Example:**
```tsx
// src/components/loading-button.tsx
import { useIntl } from 'react-intl'

export type LoadingButtonProps = Readonly<{
  loading?: boolean
  onClick: () => void
  children: React.ReactNode
}>

export default function LoadingButton({ loading, onClick, children }: LoadingButtonProps) {
  const { formatMessage } = useIntl()

  return (
    <button onClick={onClick} disabled={loading}>
      {loading ? formatMessage({ id: 'global.loading' }) : children}
    </button>
  )
}
```

#### Adding a New Form

**Step-by-step:**
1. Use custom `useForm` hook from `@/modules/shared/hooks/use-form`
2. Define Yup schema with localized error messages
3. Wrap form with `FormProvider`
4. Use controlled form components (`{component}-controlled.tsx`)
5. Localize all labels, placeholders, and messages
6. Handle submit with `handleSubmit` + `useMutation`

**Example:**
```tsx
import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { FormProvider } from 'react-hook-form'
import useForm from '@/modules/shared/hooks/use-form'

export default function MyForm() {
  const { formatMessage } = useIntl()

  const schema = yup.object().shape({
    email: yup
      .string()
      .email(formatMessage({ id: 'global.invalid_email' }))
      .required(formatMessage({ id: 'global.required_field' }))
  })

  const methods = useForm({ schema, defaultValues: { email: '' } })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* form fields */}
      </form>
    </FormProvider>
  )
}
```

---

## Module Structure

The application uses a **modular architecture** where features are organized into domain-specific modules under `src/modules/`. This promotes feature isolation, code discoverability, and scalability.

### Standard Module Structure

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
- **ALL files must use the module prefix pattern** (see "Module Prefix Pattern" section)

### Module Examples

**Simple Module (auth):**
```
src/modules/auth/
├── components/
│   ├── auth-sign-in-form.tsx
│   ├── auth-sign-up-form.tsx
│   └── auth-password-reset-form.tsx
└── pages/
    ├── auth-sign-in-page.tsx
    ├── auth-sign-up-page.tsx
    └── auth-password-reset-page.tsx
```

**Complex Module (loan-documents):**
```
src/modules/loan-documents/
├── components/
│   ├── loan-documents-list.tsx
│   ├── loan-documents-upload-form.tsx
│   ├── loan-documents-status-badge.tsx
│   ├── loan-documents-actions-menu.tsx
│   └── loan-documents-delete-modal.tsx
├── constants/
│   ├── loan-documents-statuses.ts
│   ├── loan-documents-file-types.ts
│   └── loan-documents-upload-limits.ts
├── contexts/
│   └── loan-documents-filter-context/
│       ├── loan-documents-filter-context.tsx
│       └── loan-documents-filter-context-types.ts
├── hooks/
│   ├── use-loan-documents-upload.ts
│   ├── use-loan-documents-filter.ts
│   └── use-loan-documents-validation.ts
├── pages/
│   ├── loan-documents-list-page.tsx
│   └── loan-documents-details-page.tsx
├── types/
│   ├── loan-documents-upload-types.ts
│   └── loan-documents-filter-types.ts
└── utils/
    ├── loan-documents-size-validator.ts
    └── loan-documents-file-type-checker.ts
```

### Shared Module (`src/modules/shared/`)

The `shared` module contains cross-cutting concerns used across multiple feature modules:

- **`components/`** - Components shared across multiple modules (domain-specific, not generic UI)
- **`hooks/`** - All hooks currently live here (both generic and domain-specific)
- **`types/`** - Shared TypeScript types (loan-types.ts, user-types.ts, etc.)
- **`utils/`** - Shared utility functions (loan-payment-calculator.ts, currency-formatter.ts, etc.)
- **`constants/`** - Cross-module constants (loan-statuses.ts, document-types.ts, etc.)
- **`contexts/`** - Shared contexts used by multiple modules

**When to use `src/modules/shared/` vs `src/components/`:**

| Criteria | `src/components/` | `src/modules/shared/components/` |
|----------|-------------------|----------------------------------|
| **Purpose** | Generic, reusable UI components | Domain-specific shared components |
| **Domain** | No business logic, pure UI | Loan/mortgage business logic included |
| **Examples** | Button, Select, DataTable, Icon | LoanStatusBadge, DocumentPreview, BorrowerCard |
| **Reusability** | Could be used in any application | Specific to this loan application |

## Code Conventions

**For comprehensive coding patterns, detailed examples, and best practices, see [coding-standards.md](coding-standards.md).**

This section provides critical rules that must be followed for all new code. For detailed explanations, examples, and edge cases, consult the full documentation.

---

### Critical Rules Checklist

**ALWAYS:**
- ✅ Use **kebab-case** for all file names (e.g., `user-profile.tsx`, not `UserProfile.tsx`)
- ✅ Prefix **all module files** with the module name (e.g., `loan-documents-list.tsx` in `loan-documents/` module)
- ✅ Wrap **all component props** with `Readonly<>` for immutability
- ✅ **Localize all user-facing text** using `formatMessage()` from `useIntl()` hook
- ✅ Use the custom `Icon` component from `@/components/icon` (never import from `@mui/icons-material`)
- ✅ Use the custom `useForm` hook from `@/modules/shared/hooks/use-form` (not raw `react-hook-form`)
- ✅ Use `type` for prop definitions (not `interface`)
- ✅ Import types separately: `import type { ... }`
- ✅ Use `handle` prefix for event handlers (e.g., `handleClick`, `handleSubmit`)
- ✅ Use `git mv` when renaming files to preserve Git history
- ✅ Search `src/components/` before creating new reusable components

**NEVER:**
- ❌ Use PascalCase or camelCase for file names (always kebab-case)
- ❌ Import icons directly from `@mui/icons-material` (use Icon component)
- ❌ Use hardcoded strings for user-facing text (always localize)
- ❌ Use `FormattedMessage` for simple text (use `formatMessage()` instead; only use `FormattedMessage` when embedding JSX)
- ❌ Use `any` type (use `FixMeLater` only for temporary JS-to-TS migrations)
- ❌ Use components directly from MUI for layout (wrap in custom components first)
- ❌ Use `venti` for new features (use React Context or React Query)

---

### Quick Patterns Reference

**File Naming:**
```tsx
// ✅ CORRECT: kebab-case file names
user-profile.tsx                           // Exports UserProfile component
use-auth.ts                                // Exports useAuth hook

// ❌ WRONG: PascalCase or camelCase
UserProfile.tsx                            // Never!
userProfile.tsx                            // Never!
```

**Module Prefix Pattern:**
```tsx
// ✅ CORRECT: Module files with module prefix
// In src/modules/loan-documents/
loan-documents-list.tsx                    // Component
loan-documents-upload-form.tsx             // Form component
loan-documents-list-page.tsx               // Page
use-loan-documents-filter.ts               // Hook

// ❌ WRONG: Missing module prefix
list.tsx                                   // Missing prefix!
upload-form.tsx                            // Missing prefix!
```

**Readonly Props:**
```tsx
// ✅ CORRECT: Always wrap with Readonly<>
export type ButtonProps = Readonly<{
  disabled?: boolean
  onClick: () => void
}>

// ❌ WRONG: Missing Readonly<>
export type ButtonProps = {
  disabled?: boolean
  onClick: () => void
}
```

**Localization:**
```tsx
// ✅ CORRECT: Use formatMessage() for simple text
import { useIntl } from 'react-intl'

function MyComponent() {
  const { formatMessage } = useIntl()
  return <button>{formatMessage({ id: 'global.save' })}</button>
}

// ✅ CORRECT: Use FormattedMessage ONLY for JSX embedding
import { FormattedMessage } from 'react-intl'

function ContactMessage({ email }) {
  return (
    <p>
      <FormattedMessage
        id="errors.contact_support"
        values={{
          email: <a href={`mailto:${email}`}>{email}</a>
        }}
      />
    </p>
  )
}

// ❌ WRONG: Hardcoded text
<button>Save</button>                      // Never!

// ❌ WRONG: FormattedMessage for simple text
<button><FormattedMessage id="global.save" /></button>
```

**Icons:**
```tsx
// ✅ CORRECT: Use Icon component
import Icon from '@/components/icon'
<Icon name="Add" size={24} />

// ❌ WRONG: Direct MUI import
import AddIcon from '@mui/icons-material/Add'  // Never!
```

**Forms:**
```tsx
// ✅ CORRECT: Use custom useForm hook
import useForm from '@/modules/shared/hooks/use-form'
import { FormProvider } from 'react-hook-form'

const methods = useForm({ schema, defaultValues })

return (
  <FormProvider {...methods}>
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      {/* fields */}
    </form>
  </FormProvider>
)
```

**Event Handlers:**
```tsx
// ✅ CORRECT: 'handle' prefix for handlers, 'on' prefix for props
type ButtonProps = Readonly<{
  onClick: () => void
}>

function MyComponent({ onClick }: ButtonProps) {
  const handleClick = () => {
    // Logic
    onClick()
  }
  return <button onClick={handleClick}>Click</button>
}
```

---

**See [coding-standards.md](coding-standards.md) for:**
- Detailed naming conventions and examples
- TypeScript patterns (Readonly, generics, union types)
- React Hook Form + Yup validation patterns
- Styling guidelines (Tailwind CSS, MUI)
- Complete localization guide
- Import ordering standards
- Component architecture patterns

## Common Workflows

### Adding a New Page

1. **Determine the module**: Identify which feature module the page belongs to (e.g., `loan-documents`, `loan-pricing`, `user-groups`)
2. **Create file in module**: `src/modules/{module}/pages/{module-name}-{page-name}-page.tsx`
   - Example: `src/modules/loan-documents/pages/loan-documents-list-page.tsx`
   - **CRITICAL:** Must use module prefix + `-page` suffix
3. **Wrap with `Page` component**: `<Page title="My Page">{children}</Page>`
4. **Use appropriate context**: `useLoanContext()` if loan-specific; `useAppContext()` for global state
5. **Fetch data**: Use `useQuery` + query keys from `queryKeys.js`
6. **Add route**: Add route in `src/App.jsx` (main routing structure)

**Example:**
```tsx
// src/modules/loan-documents/pages/loan-documents-list-page.tsx
import { useIntl } from 'react-intl'
import { Page } from '@/components/page-wrapper'
import { useLoanContext } from '@/contexts/loan-context'
import { useQuery } from '@tanstack/react-query'
import queryKeys from '@/services/queryKeys'

export default function LoanDocumentsListPage() {
  const { formatMessage } = useIntl()
  const { loan } = useLoanContext()
  const { data } = useQuery({
    queryKey: [queryKeys.loanDocuments, loan?.id],
    queryFn: () => fetchDocuments(loan.id)
  })

  return (
    <Page title={formatMessage({ id: 'loan_documents.page_title' })}>
      {/* page content */}
    </Page>
  )
}
```

### Creating a Form

1. Define Yup schema in component or shared validation file
2. Use custom `useForm` hook with schema from `@/modules/shared/hooks/use-form`
3. Wrap fields in `FormProvider` and HTML `<form>` element
4. Use form input components from `src/components/` (e.g., Select, Autocomplete, TextField)
5. Handle submit via `handleSubmit` + `useMutation` for API calls

### Fetching Loan Data

```tsx
import { useQuery } from '@tanstack/react-query'
import queryKeys from '@/services/queryKeys'
import { useLoanContext } from '@/contexts/loan-context'
import { TheBigPOSApi } from '@/utils/the-big-pos-client'

const { loan, loanData, refetch } = useLoanContext()
// loan = Loan object, loanData = custom LoanData type
// refetch() triggers SignalR + query updates

const { data: documents } = useQuery({
  queryKey: [queryKeys.loanDocuments, loan?.id],
  queryFn: () => TheBigPOSApi.loanDocuments.list(loan.id),
})
```

### Testing Components

**Note:** While the project is set up for Cypress testing, the team's current focus is on feature development. **Do not create new test files (`.cy.tsx`) or add new tests unless explicitly asked to do so.** The information below is for reference on the existing testing structure.

Use Cypress component testing with custom mounts:

```tsx
// my-component.cy.tsx
import { mount } from 'cypress/react'
import MyComponent from './my-component'

describe('MyComponent', () => {
  it('renders correctly', () => {
    mount(<MyComponent prop="value" />)
    cy.get('[data-testid="button"]').click()
  })
})

// With context: cy.mount() helpers in cypress/support/component.tsx
cy.mount(<MyComponent />) // includes IntlProvider, QueryClientProvider, MemoryRouter
cy.mountWithLoanContext(<MyComponent />) // also includes LoanContext
```

## Anti-Patterns & What to Avoid

- **No Direct MUI Icon Imports:** Never import icons directly from `@mui/icons-material`. Always use the `Icon` component from `@/components/icon`.
- **No Mutable Props:** Always wrap component prop types with `Readonly<>` for type safety and immutability.
- **No Hardcoded User-Facing Text:** All user-facing text (labels, buttons, messages, aria-labels, alt text, etc.) must be localized using i18n keys from `src/i18n/{en,es}.ts`.
- **Prefer `formatMessage()` Over `<FormattedMessage>`:** Always use `formatMessage()` from the `useIntl()` hook for simple text. Only use the `<FormattedMessage>` component when you need to embed JSX elements (links, styled components) within translated text using the `values` prop. This ensures consistency and reduces unnecessary JSX nesting.
- **No camelCase or PascalCase File Names:** All files must use kebab-case naming (e.g., `user-profile.tsx`, not `UserProfile.tsx` or `userProfile.tsx`). Component/export names use PascalCase, but file names must be kebab-case.
- **No Prop Drilling:** Use Context for deep state.
- **No Mixed Prop Types:** Avoid `string | ReactNode`; use separate props.
- **Delete Commented Code:** Use Git history.
- **No `TODO`s:** Create tasks; use `FixMeLater` for temporary TS issues.
- **Single Responsibility:** Keep components under ~150 lines. If a component grows too large, split it by:
  - **Extract custom hooks:** Move complex logic into hooks (e.g., `useFormLogic`, `useDataFetching`)
  - **Split into sub-components:** Break UI into smaller, focused components
  - **Use composition:** Pass children or render props instead of conditional rendering
- **No `useImperativeHandle`:** Pass callbacks or lift state.
- **Avoid `this` keyword** in components.
- **Inconsistent Event Handler Naming:** Event handler functions must use the `handle` prefix (e.g., `handleClick`, `handleSubmit`). Don't use `on` prefix for handlers (that's for props), don't use `Handler` suffix, and don't use other naming patterns like `doClick` or `clickHandler`.
- **No Dangling Underscores** in variable names.
- **No Empty Object State:** Use `null` or a typed default instead of `{}`.
- **No `venti` in New Code:** Use React Context or React Query.
- **No Direct Theme Imports:** Use `getTheme()` from `src/config.js`.
- **No Barrel Files** (`index.ts` re-exports).
- **`.ts` for Hooks:** Hooks should not have a `.tsx` extension.
- **No Mixpanel Tracking:** Analytics are added by the team separately.

## Project-Specific Quirks

1. **TypeScript is Mandatory for New Code:** All new code, without exception, must be written in TypeScript (`.ts` or `.tsx`), following all conventions in this guide.

2. **Migrating Legacy Files:** When editing a `.js` or `.jsx` file, rename it to `.ts` or `.tsx` and refactor it. You must fix all type errors and align the code with modern conventions, using `FixMeLater` for complex types.

3. **SignalR Real-time:** Loan updates stream via WebSocket. Multiple queries auto-refetch on mutations. Be aware of race conditions.

4. **Multi-tenant Site Config:** Each user has a `siteConfig` determining enabled features. Check before rendering conditional UI: `siteConfig?.enabledServices.spanishFullApp`

5. **Invitation System:** `invite` object in AppContext drives workflow selection and role-based UI. Reset on logout.

6. **Impersonation:** Admins can impersonate users. Check `state.impersonationRequest` before showing sensitive actions.

7. **Role-Based Access Control:** The application uses a comprehensive role-based system to control access and tailor the user experience.
  - **Role Definitions:** Key user roles are defined as enums in `src/services/client.ts`. These include `Borrower`, `LoanOfficer`, `Admin`, `SuperAdmin`, `Realtor`, `SettlementAgent`, `BranchManager`, `LoanProcessor`, and `LoanOfficerAssistant`.
  - **Route Protection:** The `PrivateRoute` component in `src/routes/` is responsible for protecting routes and ensuring that only authenticated users with the correct role can access them.
  - **Dynamic UI:** The navigation structure and available UI elements adapt based on the current user's role.

### Feature Access by Role

- **SuperAdmin:** Full system access. Can manage all users, perform destructive actions ("Nuke User"), access critical routes, and impersonate anyone.
- **Admin:** Manages daily configurations. Manages users (except SuperAdmins), branches, and system templates.
- **Borrower:** The primary end-user. Completes the loan application, uploads documents, and e-signs.
- **Internal Roles (Loan Officer, Processor, etc.):** Manage the loan lifecycle, work with loan data, and interact with borrowers.
- **External Roles (Realtor, Settlement Agent):** Limited access to view the status of associated loans.

## Key Files Reference

- **App entry:** `src/index.tsx` (providers setup)
- **Theme config:** `src/config.js` (getTheme, storage keys, debug mode)
- **Global styles:** `src/index.css` + `tailwind.config.js`
- **Routing:** `src/App.jsx` (main Routes), `src/routes/PrivateRoute.jsx`
- **Query keys:** `src/services/queryKeys.js` (centralized caching)
- **Custom validators:** `src/modules/shared/utils/yup-validation.js`
- **API helpers:** `src/services/navigation.js`, `src/services/helpers.ts`
- **Component library:** `src/components/` (reusable UI components)
- **Feature modules:** `src/modules/` (Feature-specific pages, components, hooks organized by domain)
- **Pages:** `src/modules/{module}/pages/` (Page components within each feature module)
- **Contexts:** `src/contexts/` (Global contexts: AppContext, LoanContext, LanguageContext, etc.)
- **Hooks:** `src/modules/shared/hooks/` (All hooks currently live here - both generic and domain-specific)
- **Services:** `src/services/` (Business logic, API helpers, and utilities)
- **Translations:** `src/i18n/{en,es}.ts`

## Environment Configuration

The project uses a `.env` file for local development, created by copying `.env.example`. All API calls and external services are configured through environment variables.

- **`REACT_APP_POS_API_HOST`**: Base URL for the backend API.
- **`REACT_APP_LOCALHOST_ALIAS`**: Local alias for development, used for multi-tenant testing.
- **`REACT_APP_SENTRY_DSN`**: Connection string for the Sentry error tracking service.
- **`REACT_APP_GOOGLE_PLACES_API_KEY`**: API key for Google Places services.
- **`REACT_APP_MIXPANEL_API_KEY`**: Key for Mixpanel analytics.
- **`REACT_APP_MIXPANEL_DEBUG`**: Enables debug mode for Mixpanel.
- **`REACT_APP_ENV`**: Specifies the application environment (e.g., `development`).

**Rule:** Never hardcode API endpoints or keys. Always assume they are available via `process.env`.

## Debugging

- Enable debug mode by setting `REACT_APP_DEBUG_ENABLED=true` in your `.env` file.
- This allows for using debug settings found in `src/config.js` (e.g., `debugToken`, `debugLoanId`).

---
# s architecture-guide.md

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
- See [ai-agent-instructions.md](ai-agent-instructions.md) for coding conventions and patterns

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

**For complete implementation examples of all utility hooks (useLocalStorage, useToggle, useMediaQuery, useClickOutside, and more), see [hooks-catalog.md](hooks-catalog.md).**

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

---
# FILE: coding-standards.md

# Code Conventions

This document provides detailed coding conventions, patterns, and best practices for the pos-react codebase.

**Last Updated:** November 14, 2024

**For quick reference and common tasks, see [ai-agent-instructions.md](ai-agent-instructions.md).**
**For architecture and file organization, see [architecture-guide.md](architecture-guide.md).**

---

## Table of Contents

- [File & Naming](#file--naming)
- [TypeScript & Types](#typescript--types)
- [Reusable Component Pattern](#reusable-component-pattern)
- [React Hook Form + Yup Pattern](#react-hook-form--yup-pattern)
- [Styling](#styling)
- [Icons](#icons)
- [Localization](#localization)
- [Boolean Props](#boolean-props)
- [Import Standards](#import-standards)
- [General Best Practices](#general-best-practices)

---

## File & Naming

### File Names

**CRITICAL: All files MUST use kebab-case naming.**

```tsx
// ✅ CORRECT: kebab-case file names
user-profile.tsx
loan-details-form.tsx
use-fetch-data.ts

// ❌ WRONG: PascalCase or camelCase file names
UserProfile.tsx      // Never use PascalCase for file names
userProfile.tsx      // Never use camelCase for file names
user_profile.tsx     // Never use snake_case for file names
```

**Important:** File names use kebab-case, but the component/export name uses PascalCase:
- File: `user-profile.tsx` exports `UserProfile` component
- File: `loan-form.tsx` exports `LoanForm` component
- File: `use-auth.ts` exports `useAuth` hook

### Naming Conventions

- **All new files:** kebab-case (e.g., `my-component.tsx`, `use-form.ts`)
- **Components:** PascalCase export from kebab-case file (e.g., `MyComponent` from `my-component.tsx`), `.tsx` extension
- **Hooks:** camelCase export from kebab-case file (e.g., `useForm` from `use-form.ts`), `.ts` extension
- **Constants:** CONSTANT_CASE
- **Enums:** Singular and PascalCase (e.g. `LoanStatus`)
- **Form Components:** Suffix with `Form` (e.g., `sign-in-form.tsx` exports `SignInForm`)
- **Page Components:** Suffix with `Page` (e.g., `loan-page.tsx` exports `LoanPage`)
- **Modal Components:** Suffix with `Modal` (e.g., `delete-confirmation-modal.tsx` exports `DeleteConfirmationModal`)

### Module Prefix Pattern (CRITICAL)

**ALL files within a feature module must be prefixed with the module name.** This prevents naming conflicts and makes file purpose immediately clear.

Pattern: `{module-name}-{file-name}.{ext}`

Examples by module:
- **`auth/`** module: `auth-sign-in-form.tsx`, `auth-sign-up-page.tsx`, `use-auth-validation.ts`
- **`loan-documents/`** module: `loan-documents-list.tsx`, `loan-documents-upload-form.tsx`, `use-loan-documents-filter.ts`
- **`user-groups/`** module: `user-groups-list.tsx`, `user-groups-form-modal.tsx`, `use-user-groups.ts`

Applies to all module files:
- ✅ Components: `{module-name}-{component-name}.tsx`
- ✅ Pages: `{module-name}-{page-name}-page.tsx`
- ✅ Hooks: `use-{module-name}-{hook-name}.ts`
- ✅ Utils: `{module-name}-{util-name}.ts`
- ✅ Types: `{module-name}-{type-name}-types.ts`
- ✅ Constants: `{module-name}-{constant-name}.ts`
- ✅ Contexts: `{module-name}-{context-name}-context.tsx`

**Examples:**
```tsx
// ✅ CORRECT: Module files with module prefix
// In src/modules/loan-documents/
loan-documents-list.tsx                    // Component
loan-documents-upload-form.tsx             // Form component
loan-documents-delete-modal.tsx            // Modal component
loan-documents-list-page.tsx               // Page
use-loan-documents-filter.ts               // Hook
loan-documents-size-validator.ts           // Util
loan-documents-upload-types.ts             // Types
loan-documents-statuses.ts                 // Constants

// ❌ WRONG: Missing module prefix
// In src/modules/loan-documents/
list.tsx                                   // Missing prefix
upload-form.tsx                            // Missing prefix
use-filter.ts                              // Missing prefix
```

**Note:** This pattern applies to `src/modules/{module}/` files only, NOT to `src/components/` (global reusable components).

### Event Handler Naming

**Event Props:** Prefixed with `on` (e.g., `onSubmit`, `onRemove`, `onChange`)
**Event Handlers:** Prefixed with `handle` (e.g., `handleClick`, `handleSubmit`, `handleChange`)

```tsx
// ✅ CORRECT: handle prefix for event handlers
type ButtonProps = Readonly<{
  onClick: () => void  // Prop uses 'on' prefix
}>

function MyComponent({ onClick }: ButtonProps) {
  const handleClick = () => {  // Handler uses 'handle' prefix
    // Do some work
    onClick()  // Call the prop
  }

  const handleSubmit = (data: FormData) => {
    // Submit logic
  }

  return (
    <>
      <button onClick={handleClick}>Click Me</button>
      <form onSubmit={handleSubmit}>...</form>
    </>
  )
}

// ❌ WRONG: Inconsistent naming
function MyComponent({ onClick }: ButtonProps) {
  const onButtonClick = () => { ... }  // Don't use 'on' prefix for handlers
  const clickHandler = () => { ... }   // Don't use 'Handler' suffix
  const doClick = () => { ... }        // Don't use other prefixes
}
```

---

## TypeScript & Types

- Use `type` for props, not `interface`.
- Import types separately: `import type { ... }`.
- Avoid `any`. Use `FixMeLater` only for temporary JS-to-TS migrations.
- Export prop `type` definitions.
- Use `default export` for components and pages.
- **CRITICAL: Always wrap component props with `Readonly<>`** for immutability and type safety.

### Readonly Props Pattern

**All prop types must be wrapped with `Readonly<>`**. This enforces immutability and prevents accidental mutations.

**Basic Example:**
```tsx
export type MyComponentProps = Readonly<{
  disabled?: boolean
  onSubmit: (data: FormData) => void
}>

export default function MyComponent({ disabled, onSubmit }: MyComponentProps) { ... }
```

**Complex Types (with Omit, Pick, etc.):**
```tsx
export type TextFieldProps = Readonly<
  Omit<MuiTextFieldProps, 'onChange' | 'value'> & {
    onChangeText?: (value: string) => void
    startIcon?: IconName
  }
>
```

**Generic Components:**
```tsx
type AutocompleteProps<T extends FieldValues = FieldValues> = Readonly<{
  name: Path<T>
  control?: Control<T>
  options: SelectItem[]
}>
```

**Inline Function Parameters:**
```tsx
function MyComponent(props: Readonly<MyComponentProps>) {
  // Component implementation
}
```

**Union Types:**
```tsx
type ButtonProps = Readonly<
  (
    | { variant: 'text'; outlined?: never }
    | { variant: 'outlined'; outlined: true }
  ) & {
    onClick: () => void
  }
>
```

---

## Reusable Component Pattern

All new reusable display components must follow these core conventions:

- **Styling:** Use basic HTML elements (`div`, `p`, `img`) styled with **Tailwind CSS classes**. Do not use MUI components like `Card`, `Box`, `Typography`, or `Avatar` for layout or basic elements. These should be wrapped in custom reusable components if needed.
- **Localization:** All user-facing text (e.g., button labels, static text) **must** be localized using the `useIntl` hook and `formatMessage`, referencing keys from the `i18n` files.
- **Structure:** The component must follow all standard file and naming conventions, including an exported `type` for props and a `default export` for the component function.

---

## React Hook Form + Yup Pattern

All forms must use the custom `useForm` hook (not raw `react-hook-form`):

```tsx
import * as yup from 'yup'
import { useIntl } from 'react-intl'
import { FormProvider } from 'react-hook-form'

import useForm from '@/modules/shared/hooks/use-form'

type MyFormProps = {
  onSubmit: (data: { email: string }) => void;
}

function MyForm({ onSubmit }: MyFormProps) {
  const { formatMessage } = useIntl()

  const schema = yup.object().shape({
    email: yup
      .string()
      .email(formatMessage({ id: 'global.invalid_email' }))
      .required(formatMessage({ id: 'global.required_field' })),
  })

  const methods = useForm({ schema, defaultValues: { email: '' } })
  const { handleSubmit } = methods

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* form fields */}
      </form>
    </FormProvider>
  )
}
```

- **Custom validators:** Defined in `src/modules/shared/utils/yup-validation.js`, contains SSN, phone, ZIP, currency, mortgage-specific fields.
- **Validation modes:** Default `onBlur` + `onChange` reValidation
- **Field components:** Use form input components from `src/components/` (e.g., Select, Autocomplete, TextField, Checkbox). Each has both uncontrolled (`index.tsx`) and controlled (`{component}-controlled.tsx`) versions for use with react-hook-form.

---

## Styling

- **Prefer Tailwind CSS** with `div`/`p` tags over MUI Box/Typography
- **Avoid custom CSS** unless Tailwind classes insufficient
- **Media queries:** Use min-width (`sm:`, `md:`) NOT `max-[sm]`
- **Dark mode:** Supported via `dark:` prefix (configured in MUI theme)
- **Do not use components directly from MUI**, create a reusable component in `src/components/` first.

---

## Icons

**IMPORTANT: Never import icons directly from `@mui/icons-material`.** Always use the custom `Icon` component.

**Why?** The project uses a centralized icon system for consistency, type safety, and maintainability.

### Usage Pattern

```tsx
// ✅ CORRECT: Use the Icon component
import Icon from '@/components/icon'
import type { IconName } from '@/components/icon'

type MyComponentProps = Readonly<{
  iconName?: IconName  // Type-safe icon names
}>

function MyComponent({ iconName }: MyComponentProps) {
  return <Icon name="Add" size={24} sx={{ color: 'primary.main' }} />
}
```

```tsx
// ❌ WRONG: Don't import from MUI directly
import WarningIcon from '@mui/icons-material/Warning'  // Never do this!
```

### Adding New Icons

1. Import the MUI icon in `src/components/icon/icon-constants.ts`
2. Add it to the `ICON_DICTIONARY` object
3. The icon name will be automatically available as a type-safe `IconName`

```tsx
// In icon-constants.ts
import Warning from '@mui/icons-material/Warning'

export const ICON_DICTIONARY = {
  // ... existing icons
  Warning,  // Now available as <Icon name="Warning" />
} as const
```

### Available Icons

Check `ICON_DICTIONARY` in `src/components/icon/icon-constants.ts` for all available icon names.

---

## Localization

**CRITICAL: All user-facing text must be localized.** This includes:
- Button labels and static text
- Form labels and placeholders
- Error and success messages
- Tooltips and hints
- `aria-label` attributes for accessibility
- `alt` text for images
- Validation error messages

**Never use hardcoded strings for any text that users will see.**

**IMPORTANT: Use `formatMessage()` for all localization.**

React Intl provides both `formatMessage()` and `<FormattedMessage>`. This project uses `formatMessage()` as the default pattern for consistency and simplicity.

**Exception: Only use `<FormattedMessage>` when you need to embed JSX elements (links, styled text, or React components) within translated text.**

```tsx
// ✅ CORRECT: Use formatMessage for simple text (99% of cases)
import { useIntl } from 'react-intl'

function MyComponent() {
  const { formatMessage } = useIntl()
  return <button>{formatMessage({ id: 'global.save' })}</button>
}

// ✅ CORRECT: Use FormattedMessage ONLY when embedding JSX elements
import { FormattedMessage } from 'react-intl'

function ContactMessage({ email, phone }) {
  return (
    <p>
      <FormattedMessage
        id="errors.contact_support"
        values={{
          email: <a href={`mailto:${email}`}>{email}</a>,
          phone: <a href={`tel:${phone}`}>{phone}</a>,
        }}
      />
    </p>
  )
}
// Translation: "Please email {email} or call {phone} if the problem persists."

// ❌ WRONG: Don't use FormattedMessage for simple text without JSX
function MyComponent() {
  return <button><FormattedMessage id="global.save" /></button>
}

// ❌ WRONG: formatMessage() returns a string and cannot handle JSX
function MyComponent({ email }) {
  const { formatMessage } = useIntl()
  // This will NOT work - JSX will be converted to string "[object Object]"
  return <p>{formatMessage({
    id: 'contact',
    values: { email: <a href={`mailto:${email}`}>{email}</a> }
  })}</p>
}
```

### Basic Usage Pattern

```tsx
import { useIntl } from 'react-intl'

function MyComponent() {
  const { formatMessage } = useIntl()

  return (
    <button>
      {formatMessage({ id: 'global.save' })}
    </button>
  )
}
```

### With Default Fallback

```tsx
const label = formatMessage({
  id: `loan_log.level.${level.toLowerCase()}`,
  defaultMessage: level,  // Fallback if key doesn't exist
})
```

### Dynamic Keys

```tsx
const statusLabel = formatMessage({
  id: `loan.status.${status}`,
})
```

### Localized Validation Messages

```tsx
import * as yup from 'yup'
import { useIntl } from 'react-intl'

function MyForm() {
  const { formatMessage } = useIntl()

  const schema = yup.object().shape({
    email: yup
      .string()
      .email(formatMessage({ id: 'global.invalid_email' }))
      .required(formatMessage({ id: 'global.required_field' })),
  })
  // ...
}
```

### Accessibility Attributes

```tsx
<IconButton
  aria-label={formatMessage({ id: 'global.refresh' })}
  onClick={handleRefresh}
>
  <Icon name="Refresh" />
</IconButton>

<img
  src={logo}
  alt={formatMessage({ id: 'global.company_logo' })}
/>
```

### Translation Files

- **Location:** `src/i18n/en.ts` and `src/i18n/es.ts`
- **Structure:** Hierarchical keys organized by namespace

```tsx
// src/i18n/en.ts
export default {
  global: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    // ...
  },
  loan_log: {
    level: {
      error: 'Error',
      warning: 'Warning',
      // ...
    },
  },
}
```

### Key Naming Convention

- Use hierarchical dot notation: `namespace.key` or `namespace.subcategory.key`
- Common namespaces: `global`, `loan`, `mortgage`, `share_loan`, `role`, etc.
- **Always search existing keys before adding new ones** to avoid duplicates

---

## Boolean Props

- Use short names without `is` prefix: `disabled`, `loading`, `required`
- Exception: Use `is` prefix only if it meaningfully improves clarity

---

## Import Standards

- **Absolute imports:** Use `@/` alias (configured in `tsconfig.json`)
- **Type imports:** `import type { ComponentProps } from './component'`
- **Destructuring hooks:** Prefer destructuring react-hook-form methods
- **Import Order:** Group imports in this order: 1. React/external libs, 2. Internal absolute (`@/`), 3. Relative (`./`), 4. Styles, 5. Assets.

**Example:**
```tsx
// 1. React and external libraries
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import * as yup from 'yup'

// 2. Internal absolute imports (@/)
import { useLoanContext } from '@/contexts/loan-context'
import queryKeys from '@/services/queryKeys'
import Icon from '@/components/icon'

// 3. Relative imports (./)
import { MyLocalComponent } from './my-local-component'
import type { MyLocalType } from './types'

// 4. Styles
import './styles.css'

// 5. Assets
import logo from './logo.png'
```

---

## General Best Practices

- **Return Early:** Use guard clauses to avoid nested `if` statements.
- **Component Reusability:** **Must** search `src/components/` before creating new components.
- **Component Organization:** New reusable components go in `src/components/` with a **flat structure** for discoverability. Co-locate related files (e.g., `button.tsx` and `button.cy.tsx` together). For complex components with multiple files, create a folder with the component files inside (avoid barrel exports with `index.ts`).
- **Consistent Props:** Keep prop names consistent.
- **Boolean Conversion:** Use `!!` to cast to boolean, not `Boolean()`.
- **Ternary Operators:** Prefer ternaries for readable conditional logic.
- **Performance:** Avoid premature optimization. Use `React.memo`, `useMemo`, or `useCallback` only for known performance issues.
- **File Renaming:** **Always** use `git mv` when renaming files to preserve Git history. Ensure the new filename follows kebab-case convention (e.g., `git mv UserProfile.tsx user-profile.tsx`).

---
# FILE: hooks-catalog.md

# Hooks Reference Guide

This document provides comprehensive reference material for creating and implementing custom React hooks in the pos-react codebase.

**Last Updated:** November 14, 2024

**For organization strategy and decision trees on where to place hooks, see [architecture-guide.md](architecture-guide.md) - "Hooks Organization" section.**

**For coding conventions and usage patterns, see [ai-agent-instructions.md](ai-agent-instructions.md).**

---

## Table of Contents

- [Global Hooks Reference](#global-hooks-reference)
  - [DOM & UI Utilities](#dom--ui-utilities)
  - [State Management](#state-management)
  - [Timing & Effects](#timing--effects)
  - [Lifecycle](#lifecycle)
  - [Performance](#performance)
- [Full Implementation Examples](#full-implementation-examples)
- [When NOT to Create a Global Hook](#when-not-to-create-a-global-hook)

---

## Global Hooks Reference

**These hooks contain NO business logic and can be used in any React application.**

Characteristics:
- No domain types (Loan, User, Document, etc.)
- No API calls to your backend
- Pure utility logic (DOM, state, effects, storage)
- Could be extracted into an npm package

### DOM & UI Utilities

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

### State Management

| Hook | Purpose | Returns |
|------|---------|---------|
| **useToggle(initial)** | Boolean toggle with helpers | `{ value, toggle, setTrue, setFalse }` |
| **useLocalStorage(key, initial)** | Persist state to localStorage | `[value, setValue]` |
| **useSessionStorage(key, initial)** | Persist state to sessionStorage | `[value, setValue]` |
| **usePrevious(value)** | Track previous value | `previousValue` |
| **useCounter(initial)** | Counter with increment/decrement | `{ count, increment, decrement, reset }` |
| **useArray(initial)** | Array manipulation helpers | `{ array, push, remove, clear, update }` |
| **useMap(initial)** | Map manipulation helpers | `{ map, set, remove, clear }` |

### Timing & Effects

| Hook | Purpose | Returns |
|------|---------|---------|
| **useDebounce(value, delay)** | Debounce a value | `debouncedValue` |
| **useThrottle(value, delay)** | Throttle a value | `throttledValue` |
| **useInterval(callback, delay)** | Declarative setInterval | `void` |
| **useTimeout(callback, delay)** | Declarative setTimeout | `void` |
| **useUpdateEffect(effect, deps)** | useEffect that skips first render | `void` |

### Lifecycle

| Hook | Purpose | Returns |
|------|---------|---------|
| **useMounted()** | Check if component is mounted | `ref` - mounted.current |
| **useUnmount(callback)** | Run callback on unmount | `void` |
| **useIsFirstRender()** | Check if first render | `boolean` |

### Performance

| Hook | Purpose | Returns |
|------|---------|---------|
| **useWhyDidYouUpdate(name, props)** | Debug re-renders | `void` (logs changes) |

---

## Full Implementation Examples

### useLocalStorage

Sync React state with localStorage for persistence across sessions.

```typescript
// src/hooks/use-local-storage.ts
// Sync state with localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
```

**Usage:**
```typescript
function MyComponent() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme (Current: {theme})
    </button>
  )
}
```

### useToggle

Boolean state with convenient toggle, setTrue, and setFalse helpers.

```typescript
// src/hooks/use-toggle.ts
// Boolean toggle with helper functions
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return { value, toggle, setTrue, setFalse }
}
```

**Usage:**
```typescript
function MyComponent() {
  const { value: isOpen, toggle, setFalse } = useToggle(false)

  return (
    <>
      <button onClick={toggle}>Toggle Modal</button>
      <Modal isOpen={isOpen} onClose={setFalse}>
        Content
      </Modal>
    </>
  )
}
```

### useMediaQuery

Detect responsive breakpoints using CSS media queries.

```typescript
// src/hooks/use-media-query.ts
// Responsive breakpoint detection
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
```

**Usage:**
```typescript
function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {!isMobile && !isTablet && <DesktopView />}
    </div>
  )
}
```

### useClickOutside

Detect clicks outside of a specified element (useful for dropdowns, modals).

```typescript
// src/hooks/use-click-outside.ts
// Detect clicks outside an element
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [handler])

  return ref
}
```

**Usage:**
```typescript
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false))

  return (
    <div ref={ref}>
      <button onClick={() => setIsOpen(!isOpen)}>Open Menu</button>
      {isOpen && <Menu />}
    </div>
  )
}
```

### usePrevious

Track the previous value of any state variable.

```typescript
// src/hooks/use-previous.ts
// Track previous value of any state
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
```

**Usage:**
```typescript
function MyComponent({ count }: { count: number }) {
  const prevCount = usePrevious(count)

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <p>Changed: {count !== prevCount ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

### useInterval

Declarative setInterval with automatic cleanup.

```typescript
// src/hooks/use-interval.ts
// Declarative setInterval
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
```

**Usage:**
```typescript
function Timer() {
  const [count, setCount] = useState(0)
  const [isRunning, setIsRunning] = useState(true)

  useInterval(
    () => setCount(count + 1),
    isRunning ? 1000 : null // Pass null to pause
  )

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setIsRunning(!isRunning)}>
        {isRunning ? 'Pause' : 'Resume'}
      </button>
    </div>
  )
}
```

### useCopyToClipboard

Copy text to clipboard with success feedback.

```typescript
// src/hooks/use-copy-to-clipboard.ts
// Copy text to clipboard
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch (error) {
      setCopied(false)
      return false
    }
  }, [])

  return { copied, copy }
}
```

**Usage:**
```typescript
function ShareLink({ url }: { url: string }) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <button onClick={() => copy(url)}>
      {copied ? 'Copied!' : 'Copy Link'}
    </button>
  )
}
```

### useMounted

Check if a component is currently mounted (useful for async operations).

```typescript
// src/hooks/use-mounted.ts
// Check if component is mounted
export function useMounted() {
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  return mounted
}
```

**Usage:**
```typescript
function MyComponent() {
  const mounted = useMounted()
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchData().then(result => {
      // Only update state if component is still mounted
      if (mounted.current) {
        setData(result)
      }
    })
  }, [mounted])

  return <div>{data}</div>
}
```

### useTimeout

Declarative setTimeout with automatic cleanup.

```typescript
// src/hooks/use-timeout.ts
// Declarative setTimeout
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setTimeout(() => savedCallback.current(), delay)
    return () => clearTimeout(id)
  }, [delay])
}
```

**Usage:**
```typescript
function Notification({ message }: { message: string }) {
  const [isVisible, setIsVisible] = useState(true)

  useTimeout(() => setIsVisible(false), 5000) // Auto-hide after 5 seconds

  if (!isVisible) return null

  return <div>{message}</div>
}
```

---

## When NOT to Create a Global Hook

Global hooks should be **pure utility** with **no business logic**. Avoid creating global hooks that:

### ❌ Use Domain Types
```typescript
// ❌ DON'T - Uses domain types (Loan)
export function useLoanValidation(loan: Loan) {
  // This belongs in src/modules/shared/hooks/
}
```

### ❌ Make API Calls
```typescript
// ❌ DON'T - Makes API calls to your backend
export function useUserProfile(userId: string) {
  // This belongs in src/modules/shared/hooks/
}
```

### ❌ Contain Business Logic
```typescript
// ❌ DON'T - Business logic specific to your app
export function useDocumentUpload(loanId: string) {
  // This belongs in src/modules/shared/hooks/
}
```

### ✅ Pure Utility Hooks (GOOD)
```typescript
// ✅ DO - Pure utility, no business logic
export function useDebounce<T>(value: T, delay: number) {
  // Generic utility, belongs in src/hooks/
}

// ✅ DO - DOM utility, no domain knowledge
export function useClickOutside(handler: () => void) {
  // Generic utility, belongs in src/hooks/
}

// ✅ DO - State helper, no business logic
export function useToggle(initialValue = false) {
  // Generic utility, belongs in src/hooks/
}
```

---

## Quick Reference: Hook Categories

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

---

## Additional Resources

- **[architecture-guide.md](architecture-guide.md)** - Hooks organization strategy and decision trees
- **[ai-agent-instructions.md](ai-agent-instructions.md)** - Coding conventions and patterns for writing hooks
- **React Hooks Documentation** - https://react.dev/reference/react