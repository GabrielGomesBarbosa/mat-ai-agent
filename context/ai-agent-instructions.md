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