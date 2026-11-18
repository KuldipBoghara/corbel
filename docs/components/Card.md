# Card

The standard bordered surface, plus `CardHeader` for its title row.

```tsx
import { Card, CardHeader } from "corbel";
```

## Usage

```tsx
<Card>
  <CardHeader
    title="Team"
    description="People with access to this workspace"
    action={<Button size="sm">Invite</Button>}
  />
  <p className="mt-4">…</p>
</Card>

{/* No padding, for a full-bleed table */}
<Card flush>
  <table>…</table>
</Card>
```

## Props

### Card

All native `<div>` attributes are accepted (the ref is forwarded), plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `flush` | `boolean` | `false` | Removes the inner padding. |
| `className` | `string` | | Classes for the card. |

### CardHeader

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | | Heading (`<h2>`). |
| `description` | `ReactNode` | | Smaller text under the title. |
| `action` | `ReactNode` | | Button or menu on the right. |
| `className` | `string` | | Classes for the header row. |
| `classNames` | `{ root, title, description, action }` | | Classes for the parts. |
