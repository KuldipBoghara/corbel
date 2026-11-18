# OtpInput

One-time-code entry: one box per digit, with auto-advance, paste, SMS autofill and keyboard navigation.

```tsx
import { OtpInput } from "corbel";
```

## Usage

```tsx
const [code, setCode] = useState("");

<OtpInput label="Verification code" value={code} onChange={setCode} onComplete={verify} autoFocus />

<OtpInput length={4} value={pin} onChange={setPin} error={wrongPin && "That code is not right."} />
```

### Behaviour

- Only digits are accepted. Typing moves to the next box.
- Pasting (or iOS/Android SMS autofill) spreads the code across the boxes; a full-length paste always starts at the first box.
- Backspace on an empty box clears the previous one and moves back. Left/Right arrows move between boxes.
- Digits fill from the left: clicking a box past the first empty one focuses that empty one, and deleting a middle digit shifts the later digits left. `value` never has gaps.
- `onComplete` fires whenever an edit makes the code full length.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | | Required. Digits entered so far. |
| `onChange` | `(value: string) => void` | | Required. |
| `onComplete` | `(value: string) => void` | | Called when all boxes are filled. |
| `length` | `number` | `6` | Number of boxes. |
| `autoFocus` | `boolean` | `false` | Focus the first box on mount. |
| `disabled` | `boolean` | `false` | |
| `label` | `ReactNode` | | Text above the boxes (also names the group when it is a string). |
| `hint` | `ReactNode` | | Helper text under the boxes. Hidden while `error` is set. |
| `error` | `ReactNode` | | Error message. Marks every box invalid. |
| `required` / `optional` | `boolean` | `false` | Label markers. |
| `id` | `string` | | Id of the first box. |
| `className` | `string` | | Classes for the root. |
| `classNames` | `{ root, label, hint, error, group, input }` | | Classes for the parts; `input` applies to every box. |

The ref points at the first box, so `ref.current.focus()` works.

## Styling

```tsx
<OtpInput value={code} onChange={setCode} classNames={{ group: "justify-center", input: "size-10 sm:size-10" }} />
```
