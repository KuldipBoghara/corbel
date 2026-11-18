"use client";

import { useCallback, useRef, type ReactNode } from "react";
import Select, {
  components,
  type ActionMeta,
  type ClassNamesConfig,
  type DropdownIndicatorProps,
  type GroupBase,
  type InputProps,
  type Props as SelectProps,
} from "react-select";
import CreatableSelect from "react-select/creatable";
import AsyncSelect from "react-select/async";
import AsyncCreatableSelect from "react-select/async-creatable";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils/cn.js";
import { FormField, type FieldProps, type FieldSlot } from "./FormField.js";

export type DropdownSize = "sm" | "md" | "lg";
export type DropdownSlot = FieldSlot | "control" | "menu" | "option";

export interface DropdownOption<V = string> {
  value: V;
  /** Shown in the field and menu, and matched by the search. */
  label: string;
  /** Second line under the label, in the menu only. */
  description?: ReactNode;
  /** Image URL shown as a round thumbnail before the label (avatars, logos). */
  image?: string;
  /** Icon before the label. Ignored when `image` is set. */
  icon?: ReactNode;
  disabled?: boolean;
}

/** A labelled group of options, shown under a heading in the menu. */
export interface DropdownGroup<V = string> {
  label: string;
  options: DropdownOption<V>[];
}

interface DropdownBaseProps<V> extends FieldProps {
  /** Options (or groups of options). In async mode: shown before the user types and used to label the current value. */
  options?: (DropdownOption<V> | DropdownGroup<V>)[];
  /**
   * Turns on async mode: called with the search text (debounced 300 ms; `""` on mount)
   * and resolves to the matching options.
   */
  loadOptions?: (search: string) => Promise<DropdownOption<V>[]>;
  /** Lets the user add a value that is not in the list. The new value is the typed text, so use it with string values. */
  creatable?: boolean;
  /** Called with the trimmed text when the user creates a value (before `onChange`). */
  onCreateOption?: (input: string) => void;
  /** Extra check on the typed text before "Add …" is offered. */
  isValidNewOption?: (input: string) => boolean;
  /** @default (input) => `Add "${input}"` */
  formatCreateLabel?: (input: string) => ReactNode;
  /** Called on every keystroke in the search box, e.g. to search server-side in sync mode. */
  onSearchChange?: (search: string) => void;
  /** @default true */
  searchable?: boolean;
  /** @default true */
  clearable?: boolean;
  disabled?: boolean;
  /** Shows the loading indicator (sync mode; async mode tracks it itself). */
  loading?: boolean;
  /** @default "md" */
  size?: DropdownSize;
  /** @default "Select…" */
  placeholder?: string;
  /** @default 240 */
  maxMenuHeight?: number;
  /** @default "No options" */
  noOptionsMessage?: string;
  /** Name of the hidden input, for native form submission. */
  name?: string;
  id?: string;
  /** Accessible name when there is no visible `label`. */
  "aria-label"?: string;
  onBlur?: () => void;
  /** Where the menu is portalled. @default document.body */
  container?: HTMLElement | null;
  /** Styles the control (the visible box). */
  className?: string;
  classNames?: Partial<Record<DropdownSlot, string>>;
}

export interface DropdownSingleProps<V> extends DropdownBaseProps<V> {
  multiple?: false;
  value: V | null | undefined;
  onChange: (value: V | null, option: DropdownOption<V> | null) => void;
}

export interface DropdownMultiProps<V> extends DropdownBaseProps<V> {
  multiple: true;
  value: V[];
  onChange: (value: V[], options: DropdownOption<V>[]) => void;
}

export type DropdownProps<V = string> = DropdownSingleProps<V> | DropdownMultiProps<V>;

type Opt = DropdownOption<unknown>;
type Grp = GroupBase<Opt>;

const SIZES: Record<DropdownSize, string> = {
  sm: "min-h-8 text-xs",
  md: "min-h-10 text-sm",
  lg: "min-h-11 text-sm",
};

const isGroup = <V,>(o: DropdownOption<V> | DropdownGroup<V>): o is DropdownGroup<V> =>
  "options" in o && Array.isArray(o.options);

/** react-select sets its own aria-describedby on the input; this adds the hint/error id to it. */
function DescribedInput(props: InputProps<Opt, boolean, Grp>) {
  const extra = (props.selectProps as { describedBy?: string }).describedBy;
  const own = props["aria-describedby"];
  return (
    <components.Input
      {...props}
      aria-describedby={[own, extra].filter(Boolean).join(" ") || undefined}
    />
  );
}

function Indicator(props: DropdownIndicatorProps<Opt, boolean, Grp>) {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown
        size={16}
        aria-hidden
        className={cn("transition-transform", props.selectProps.menuIsOpen && "rotate-180")}
      />
    </components.DropdownIndicator>
  );
}

function formatOptionLabel(option: Opt & { createLabel?: ReactNode }, { context }: { context: "menu" | "value" }) {
  if (context === "menu" && option.createLabel !== undefined) return option.createLabel;
  const lead = option.image ? (
    <img src={option.image} alt="" className="size-6 shrink-0 rounded-full object-cover" />
  ) : (
    option.icon && <span className="flex shrink-0">{option.icon}</span>
  );
  const description = context === "menu" && option.description;
  if (!lead && !description) return option.label;
  return (
    <span className="flex min-w-0 items-center gap-2">
      {lead}
      <span className="min-w-0">
        <span className="block truncate">{option.label}</span>
        {description && <span className="block truncate text-xs opacity-75">{description}</span>}
      </span>
    </span>
  );
}

/**
 * Select built on react-select: single or multiple, searchable, creatable,
 * sync or async, with option thumbnails and descriptions. Takes and returns
 * plain values, not option objects. The menu is portalled to `document.body`,
 * so it is never clipped inside a Modal.
 *
 * ```tsx
 * <Dropdown label="Status" options={statuses} value={status} onChange={setStatus} />
 * <Dropdown label="Tags" multiple creatable options={tags} value={ids} onChange={setIds} />
 * <Dropdown label="User" loadOptions={(q) => api.searchUsers(q)} value={userId} onChange={setUserId} />
 * ```
 */
export function Dropdown<V = string>(props: DropdownProps<V>) {
  const {
    label,
    hint,
    error,
    required,
    optional,
    options = [],
    loadOptions,
    creatable = false,
    onCreateOption,
    isValidNewOption,
    formatCreateLabel = (input: string) => `Add "${input}"`,
    onSearchChange,
    searchable = true,
    clearable = true,
    disabled = false,
    loading = false,
    size = "md",
    placeholder = "Select…",
    maxMenuHeight = 240,
    noOptionsMessage = "No options",
    name,
    id,
    onBlur,
    container,
    className,
    classNames,
  } = props;

  // Every option ever seen (given or loaded), so a value keeps its label after the menu reloads.
  const known = useRef(new Map<unknown, Opt>());
  for (const o of options) {
    for (const opt of isGroup(o) ? o.options : [o]) known.current.set(opt.value, opt as Opt);
  }
  const resolve = (v: unknown): Opt | null =>
    known.current.get(v) ?? (creatable && v != null && v !== "" ? { value: v, label: String(v) } : null);

  const selected = props.multiple
    ? props.value.map(resolve).filter((o): o is Opt => !!o)
    : props.value == null
      ? null
      : resolve(props.value);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const debouncedLoad = useCallback(
    (search: string) =>
      new Promise<Opt[]>((resolvePromise, reject) => {
        clearTimeout(timer.current);
        const run = () =>
          loadOptions!(search).then((loaded) => {
            loaded.forEach((o) => known.current.set(o.value, o as Opt));
            resolvePromise(loaded as Opt[]);
          }, reject);
        // ponytail: superseded calls never settle; react-select only reads the latest anyway.
        if (search === "") run();
        else timer.current = setTimeout(run, 300);
      }),
    [loadOptions],
  );

  const handleChange = (next: unknown, meta: ActionMeta<Opt>) => {
    // A just-created option carries its "Add …" menu text; drop it before it leaves.
    const clean = (o: DropdownOption<V> & { createLabel?: ReactNode }): DropdownOption<V> => {
      const { createLabel: _, ...rest } = o;
      return rest;
    };
    if (meta.action === "create-option" && meta.option) {
      const created = clean(meta.option as DropdownOption<V>);
      known.current.set(created.value, created as Opt);
      onCreateOption?.(created.label);
    }
    if (props.multiple) {
      const list = ((next as readonly DropdownOption<V>[] | null) ?? []).map(clean);
      props.onChange(
        list.map((o) => o.value),
        list,
      );
    } else {
      const o = next ? clean(next as DropdownOption<V>) : null;
      props.onChange(o ? o.value : null, o);
    }
  };

  const slots: ClassNamesConfig<Opt, boolean, Grp> = {
    control: (s) =>
      cn(
        "w-full cursor-pointer rounded-lg border bg-bg-card text-text-primary transition-colors",
        SIZES[size],
        s.isFocused ? "border-primary ring-2 ring-primary/20" : "border-border-default hover:border-text-muted",
        error && "border-error hover:border-error",
        error && s.isFocused && "ring-error/20",
        s.isDisabled && "cursor-not-allowed bg-bg-main text-text-muted hover:border-border-default",
        className,
        classNames?.control,
      ),
    valueContainer: () => cn("gap-1 py-0.5", size === "sm" ? "px-2.5" : "px-3"),
    placeholder: () => "text-text-muted",
    singleValue: () => "text-text-primary",
    input: () => "text-text-primary",
    multiValue: () => "items-center rounded-md bg-primary-50",
    multiValueLabel: () => "px-1.5 py-0.5 text-xs font-semibold text-primary",
    multiValueRemove: () => "rounded-r-md px-1 py-0.5 text-primary hover:bg-primary-100",
    indicatorsContainer: () => "gap-0.5 pr-2 text-text-muted",
    clearIndicator: () => "rounded p-1 hover:text-text-secondary",
    dropdownIndicator: () => "rounded p-1 hover:text-text-secondary",
    loadingIndicator: () => "p-1",
    menuPortal: () => "z-[60]",
    menu: () =>
      cn(
        "my-1.5 overflow-hidden rounded-xl border border-border-default bg-bg-card shadow-lg animate-corbel-fade-in",
        classNames?.menu,
      ),
    menuList: () => "corbel-scrollbar p-1",
    groupHeading: () => "px-2.5 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-text-muted uppercase",
    option: (s) =>
      cn(
        "cursor-pointer rounded-lg px-2.5 py-2",
        size === "sm" ? "text-xs" : "text-sm",
        s.isSelected
          ? "bg-primary text-primary-contrast"
          : s.isFocused
            ? "bg-primary-50 text-text-primary"
            : "text-text-primary",
        s.isDisabled && "cursor-not-allowed opacity-50",
        classNames?.option,
      ),
    noOptionsMessage: () => "px-3 py-2 text-sm text-text-muted",
    loadingMessage: () => "px-3 py-2 text-sm text-text-muted",
  };

  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      classNames={classNames}
    >
      {({ id: inputId, describedBy, invalid }) => {
        const shared = {
          inputId,
          name,
          required,
          describedBy,
          "aria-invalid": invalid || undefined,
          "aria-label": label ? undefined : props["aria-label"],
          unstyled: true,
          classNamePrefix: "corbel-select",
          classNames: slots,
          components: { DropdownIndicator: Indicator, Input: DescribedInput },
          formatOptionLabel,
          isOptionDisabled: (o: Opt) => !!o.disabled,
          value: selected,
          onChange: handleChange,
          onBlur,
          onInputChange: (search: string, meta: { action: string }) => {
            if (meta.action === "input-change") onSearchChange?.(search);
          },
          isMulti: !!props.multiple,
          isDisabled: disabled,
          isClearable: clearable,
          isSearchable: searchable,
          isLoading: loading || undefined,
          placeholder,
          maxMenuHeight,
          menuPlacement: "auto" as const,
          noOptionsMessage: () => noOptionsMessage,
          menuPortalTarget: container ?? (typeof document === "undefined" ? undefined : document.body),
          menuPosition: "fixed" as const,
        } as unknown as SelectProps<Opt, boolean, Grp>;

        const create = {
          formatCreateLabel,
          getNewOptionData: (input: string, createLabel: ReactNode) => ({
            value: input.trim(),
            label: input.trim(),
            createLabel,
          }),
          isValidNewOption: (input: string, _value: unknown, opts: readonly (Opt | Grp)[]) => {
            const t = input.trim().toLowerCase();
            if (!t || (isValidNewOption && !isValidNewOption(input.trim()))) return false;
            return !opts
              .flatMap((o) => ("options" in o ? o.options : [o]))
              .some((o) => o.label.toLowerCase() === t);
          },
        };

        if (loadOptions) {
          const async = {
            loadOptions: debouncedLoad,
            defaultOptions: options.length ? (options as (Opt | Grp)[]) : true,
            cacheOptions: true,
          };
          return creatable ? (
            <AsyncCreatableSelect {...shared} {...async} {...create} />
          ) : (
            <AsyncSelect {...shared} {...async} />
          );
        }
        return creatable ? (
          <CreatableSelect {...shared} options={options as (Opt | Grp)[]} {...create} />
        ) : (
          <Select {...shared} options={options as (Opt | Grp)[]} />
        );
      }}
    </FormField>
  );
}
