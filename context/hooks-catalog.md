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