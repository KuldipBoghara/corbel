# SideTabs

A section rail down the side of a record: a vertical list from the `lg` breakpoint up, a scrolling row below it.
It takes the same items as [`Tabs`](Tabs.md) and has the same keyboard support.

```tsx
import { SideTabs } from "corbel";
```

## Usage

```tsx
<div className="flex flex-col gap-6 lg:flex-row">
  <SideTabs
    id="asset"
    className="lg:w-56"
    items={[
      { value: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
      { value: "service", label: "Service history", icon: <Wrench size={16} />, count: 12 },
      { value: "docs", label: "Documents", icon: <FileText size={16} /> },
    ]}
    value={section}
    onChange={setSection}
  />
  <div role="tabpanel" id={`asset-panel-${section}`} aria-labelledby={`asset-tab-${section}`}>…</div>
</div>
```

Icons are `ReactNode`s and take their colour from the tab's state (lucide icons use `currentColor`).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TabItem<T>[]` | | `{ value, label, count?, icon?, disabled? }`. |
| `value` | `T` | | The selected tab's value. |
| `onChange` | `(value: T) => void` | | Called with the newly selected value. |
| `id` | `string` | | Base for the tab ids and `aria-controls`, as in `Tabs`. |
| `aria-label` | `string` | `"Sections"` | Accessible name of the tab list. |
| `className` | `string` | | Classes for the tab list. |
| `classNames` | `{ root, tab, icon, label, count }` | | Classes for the parts. |
