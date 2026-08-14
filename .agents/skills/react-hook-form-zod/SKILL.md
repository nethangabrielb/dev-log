---
name: react-hook-form-zod
description: React Hook Form + Zod validation patterns — useForm, zodResolver, field arrays, server validation, shadcn integration, known issues and workarounds. Use when building or editing any form (Projects, Articles, Snippets, Auth). Not for Sessions — see devlog-sessions-model instead.
license: MIT
compatibility: opencode
metadata:
  source: jezweb/claude-skills
  verified: "2026-01-20"
  skill_version: "2.1.0"
---

# React Hook Form + Zod Validation

Latest verified versions: react-hook-form@7.71.1, zod@4.3.5, @hookform/resolvers@5.2.2

## Quick Start

```bash
npm install react-hook-form@7.70.0 zod@4.3.5 @hookform/resolvers@5.2.2
```

Basic Form Pattern:

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' }, // REQUIRED to prevent uncontrolled warnings
})

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} />
  {errors.email && <span role="alert">{errors.email.message}</span>}
</form>
```

Server Validation (CRITICAL — never skip):

```ts
// SAME schema on server
const data = schema.parse(await req.json());
```

## Key Patterns

**useForm Options (validation modes):**

- `mode: 'onSubmit'` (default) — best performance
- `mode: 'onBlur'` — good balance
- `mode: 'onChange'` — live feedback, more re-renders
- `shouldUnregister: true` — remove field data when unmounted (multi-step forms)

**Zod Refinements (cross-field validation):**

```ts
z.object({ password: z.string(), confirm: z.string() }).refine(
  (data) => data.password === data.confirm,
  {
    message: "Passwords don't match",
    path: ["confirm"], // CRITICAL: error appears on this field
  },
);
```

**Zod Transforms:**

```ts
z.string().transform((val) => val.toLowerCase());
z.string()
  .transform(parseInt)
  .refine((v) => v > 0);
```

**Zod v4.3.0+ Features:**

```ts
z.string().exactOptional(); // can omit field, but NOT undefined
z.xor([z.string(), z.number()]); // exactly one must match
z.fromJSONSchema({ type: "object", properties: { name: { type: "string" } } });
```

`zodResolver` connects Zod to React Hook Form, preserving type safety.

## Registration

**register** (standard HTML inputs, uncontrolled, best performance):

```tsx
<input {...register("email")} />
```

**Controller** (third-party components without a ref):

```tsx
<Controller
  name="category"
  control={control}
  render={({ field }) => <CustomSelect {...field} />} // MUST spread {...field}
/>
```

Use `Controller` for React Select, date pickers, custom components without ref. Otherwise use `register`.

## Error Handling

```tsx
{
  errors.email && <span role="alert">{errors.email.message}</span>;
}
{
  errors.address?.street?.message;
} // nested errors — use optional chaining
```

Server errors:

```ts
const onSubmit = async (data) => {
  const res = await fetch("/api/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const { errors: serverErrors } = await res.json();
    Object.entries(serverErrors).forEach(([field, msg]) =>
      setError(field, { message: msg }),
    );
  }
};
```

## Advanced Patterns

**useFieldArray (dynamic lists):**

```tsx
const { fields, append, remove } = useFieldArray({ control, name: "contacts" });

{
  fields.map((field, index) => (
    <div key={field.id}>
      {" "}
      {/* CRITICAL: use field.id, NOT index */}
      <input {...register(`contacts.${index}.name` as const)} />
      {errors.contacts?.[index]?.name && (
        <span>{errors.contacts[index].name.message}</span>
      )}
      <button onClick={() => remove(index)}>Remove</button>
    </div>
  ));
}
<button onClick={() => append({ name: "", email: "" })}>Add</button>;
```

**Async Validation (debounce):**

```ts
const debouncedValidation = useDebouncedCallback(
  () => trigger("username"),
  500,
);
```

**Conditional Validation:**

```ts
z.discriminatedUnion("accountType", [
  z.object({ accountType: z.literal("personal"), name: z.string() }),
  z.object({ accountType: z.literal("business"), companyName: z.string() }),
]);
```

## shadcn/ui Integration

shadcn/ui deprecated the `Form` component in favor of `Field` for new implementations — check what `npx shadcn@latest init` actually generated in this project before assuming either is current.

**Common import mistake** — IDEs/AI auto-import `Form` from `react-hook-form` instead of shadcn:

```tsx
// ✅ Correct:
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem } from "@/components/ui/form";

// ❌ Wrong:
import { useForm, Form } from "react-hook-form";
```

## Performance

- Use `register` (uncontrolled) over `Controller` for standard inputs
- Use `watch('email')` not `watch()` — isolates re-renders to specific fields
- `shouldUnregister: true` for multi-step forms

## Critical Rules

✅ Always set `defaultValues` (prevents uncontrolled→controlled warnings)
✅ Validate on BOTH client and server (client can be bypassed)
✅ Use `field.id` as key in `useFieldArray` (not index)
✅ Spread `{...field}` in `Controller` render
✅ Use `z.infer<typeof schema>` for type inference

❌ Never skip server validation
❌ Never mutate values directly (use `setValue()`)
❌ Never mix controlled + uncontrolled patterns
❌ Never use index as key in `useFieldArray`

## Known Issues

- **Zod v4 Type Inference (#13109):** use `z.infer<typeof schema>` explicitly. `@hookform/resolvers` has had Zod v4 type-inference friction (#813) — pin versions rather than taking latest.
- **Uncontrolled→Controlled Warning:** always set `defaultValues` for all fields.
- **Nested Object Errors:** use optional chaining — `errors.address?.street?.message`.
- **Zod v4 Optional Fields Bug (#13102):** `.optional()` on an empty string `""` incorrectly triggers validation. Workarounds: `.nullish()`, `.or(z.literal(""))`, or `z.preprocess((val) => val === "" ? undefined : val, z.email().optional())`.
- **useFieldArray Primitive Arrays Not Supported (#12570):** only works with arrays of objects — wrap primitives: `[{ value: "string" }]` not `["string"]`.
- **Validation Race Condition (#13156):** don't derive validity from `errors` alone during resolver validation — use `!errors.field && !isValidating`.
- **shadcn Form Import Confusion:** always import Form components from `@/components/ui/form`, never from `react-hook-form`.

## Bundled References

Docs: https://react-hook-form.com/ | https://zod.dev/ | https://ui.shadcn.com/docs/components/form
