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