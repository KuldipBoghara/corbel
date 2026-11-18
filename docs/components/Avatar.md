# Avatar

A photo or logo, or an initials bubble when there is no image or it fails to load.

```tsx
import { Avatar } from "corbel";
```

## Usage

```tsx
<Avatar name="Ada Lovelace" src={user.photoUrl} />

{/* Organisation logo, with its brand colour behind the initials */}
<Avatar name={org.name} src={org.logoUrl} color={org.brandColor} square size="lg" />

{/* Standing alone, so it needs an accessible name */}
<Avatar name={user.name} alt={user.name} size="sm" />
```

Initials are the first letter of the first two words: "Ada Lovelace King" → "AL".
A broken `src` switches to the initials. A new `src` is tried again.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | | Source of the initials. |
| `src` | `string \| null` | | Image URL. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 32 / 36 / 44 px. |
| `color` | `string \| null` | | Background colour of the initials (any CSS colour). Text turns white. |
| `square` | `boolean` | `false` | Rounded square instead of a circle. |
| `alt` | `string` | | Accessible name. Leave it out when the name is shown next to the avatar, so it stays decorative. |
| `className` | `string` | | Classes for the image or the initials bubble. |
