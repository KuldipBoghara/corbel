# Theming

corbel has no theme provider and no JavaScript config. Every colour a component uses is a Tailwind v4 theme token,
so **your app's `@theme` block is the theme**.

## How it works

`corbel/styles.css` registers default tokens with `@theme default { ... }`. A token you declare in your own `@theme`
replaces the default, whatever order the imports are in:

```css
@import "tailwindcss";
@import "corbel/styles.css";

@theme {
  --color-primary: #1b4f98;
  --color-primary-light: #2563a8;
  --color-primary-dark: #163f7a;
}
```

Every component that uses the primary colour (buttons, focus rings, checkboxes, active tabs, …) now uses `#1b4f98`.
Tokens you don't declare keep their defaults.

Because they are ordinary Tailwind tokens, you can use them in your own markup too: `bg-primary`, `text-text-secondary`, `border-border-default`.

## Tokens

| Token | Default | Used for |
|---|---|---|
| `--color-primary` | `#2563eb` | Primary buttons, links, focus rings, selected states |
| `--color-primary-light` | `#3b82f6` | Lighter accents |
| `--color-primary-dark` | `#1d4ed8` | Hover/pressed state of primary surfaces |
| `--color-primary-50` | `#eff6ff` | Subtle primary backgrounds (selected rows, secondary buttons) |
| `--color-primary-100` | `#dbeafe` | Hover on subtle primary backgrounds, borders |
| `--color-primary-200` | `#bfdbfe` | Stronger subtle primary |
| `--color-primary-contrast` | `#ffffff` | Text/icons placed on `bg-primary`. Set it dark if your primary is light (e.g. yellow). |
| `--color-text-primary` | `#0f172a` | Headings, values, input text |
| `--color-text-secondary` | `#475569` | Descriptions, hints, secondary text |
| `--color-text-muted` | `#94a3b8` | Placeholders, icons, disabled text |
| `--color-text-light` | `#f8fafc` | Text on dark surfaces |
| `--color-bg-main` | `#f1f5f9` | Page background, hover backgrounds, disabled fields |
| `--color-bg-card` | `#ffffff` | Cards, inputs, modals, menus |
| `--color-border-default` | `#e2e8f0` | Input and card borders, dividers |
| `--color-border-light` | `#f1f5f9` | Subtle dividers (table rows) |
| `--color-success` | `#16a34a` | Success states and badges |
| `--color-warning` | `#d97706` | Warning states and badges |
| `--color-error` | `#dc2626` | Errors, invalid fields, danger buttons |
| `--color-info` | `#0284c7` | Informational states and badges |

Status tints are derived with opacity (`bg-error/10`), so one token per status is enough.

### Radius and font

Components use Tailwind's radius scale (`rounded-lg`, `rounded-xl`) and inherit the font. Change them the usual Tailwind way:

```css
@theme {
  --radius-lg: 4px;     /* squarer controls */
  --font-sans: "Inter", sans-serif;
}
```

## Overriding a single component

Every component merges your `className` last, with [tailwind-merge](https://github.com/dcastil/tailwind-merge),
so a conflicting class replaces the default instead of fighting it:

```tsx
<Button className="bg-success hover:bg-success/90">Approve</Button>
<Input className="rounded-full" />
```

Components with several parts accept `classNames` with one key per part:

```tsx
<Modal classNames={{ overlay: "bg-black/70", header: "bg-primary text-primary-contrast" }} />
```

Each component's doc lists its parts.

## Dark mode

Redefine the tokens under your dark selector:

```css
@layer base {
  .dark {
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-bg-main: #0f172a;
    --color-bg-card: #1e293b;
    --color-border-default: #334155;
  }
}
```

## Migrating an existing `@theme`

If your app already defines these token names (the Omega app does), corbel adopts your colours with no changes.
If your names differ (MedEquip uses `primary-500`, `status-danger`), point the corbel tokens at your existing ones:

```css
@theme {
  --color-primary: var(--color-primary-500);
  --color-primary-dark: var(--color-primary-600);
  --color-error: var(--color-status-danger);
  --color-success: var(--color-status-success);
  --color-warning: var(--color-status-warning);
  --color-info: var(--color-status-info);
}
```
