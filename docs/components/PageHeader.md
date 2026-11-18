# PageHeader

Title block at the top of a page: an optional back link, the title, a description and actions.

```tsx
import { PageHeader } from "corbel";
```

## Usage

```tsx
<PageHeader title="Orders" description="Everything placed this month" actions={<Button>New order</Button>} />

{/* Back link as an <a> */}
<PageHeader title={order.number} back={{ label: "All orders", href: "/orders" }} />

{/* Back link as a <button>, e.g. with React Router */}
<PageHeader title={order.number} back={{ label: "Back", onClick: () => navigate(-1) }} />
```

The back link is a [`BackLink`](BackLink.md).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | | Page heading (`<h1>`). |
| `description` | `ReactNode` | | Text under the title. |
| `actions` | `ReactNode` | | Buttons on the right. |
| `back` | `{ label: ReactNode; href?: string; onClick?: () => void }` | | Back link above the title. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, back, title, description, actions }` | | Classes for the parts. |
