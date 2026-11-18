# StatTile

One headline figure with a caption, and `StatTileRow` to lay several out in a responsive grid.

```tsx
import { StatTile, StatTileRow } from "corbel";
```

## Usage

```tsx
<StatTileRow>
  <StatTile label="Open tickets" value={42} />
  <StatTile label="Overdue" value={3} tone="error" hint="2 since Monday" />
  <StatTile label="Uptime" value="99.9%" tone="success" icon={<Activity size={12} />} />
  <StatTile label="Pending" value={7} tone="warning" />
</StatTileRow>

{/* Tiles as filters */}
<StatTile
  label="Overdue"
  value={3}
  tone="error"
  active={filter === "overdue"}
  onClick={() => setFilter("overdue")}
/>

{/* Centred, figure-first look */}
<StatTile label="Orders" value={128} classNames={{ root: "text-center", value: "text-primary" }} />
```

The tone tints the tile and colours the caption. The figure stays neutral so a row of tiles compares at a glance.

## Props

### StatTile

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | | Small uppercase caption. |
| `value` | `ReactNode` | | The figure. |
| `hint` | `ReactNode` | | One line under the figure. |
| `tone` | `"neutral" \| "primary" \| "success" \| "warning" \| "error" \| "info"` | `"neutral"` | Tile tint and caption colour. |
| `icon` | `ReactNode` | | Before the caption, in the tone colour. |
| `onClick` | `() => void` | | Makes the tile a `<button>`. |
| `active` | `boolean` | | Ring highlight, and `aria-pressed` on a button tile. |
| `className` | `string` | | Classes for the tile. |
| `classNames` | `{ root, label, icon, value, hint }` | | Classes for the parts. |

### StatTileRow

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | | The tiles. |
| `className` | `string` | | Classes for the grid (1 / 2 / 4 columns by default). |
