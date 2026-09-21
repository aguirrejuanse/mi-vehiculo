@AGENTS.md

## Conventions & gotchas

- `<legend>` inside a flex fieldset does not take part in `gap`: give it its own margin (see `components/ui/option-card-group.tsx`).
- Clerk returns the specific error code in `errors[0].code`; the top-level `code` is always `api_response_error`.
- Inline sign-in for existing accounts needs "Email verification code" enabled in Clerk Dashboard → Sign-in options.
- Toasts live in `components/ui/toast.tsx` (Base UI, hand-adapted from the shadcn registry). Do NOT run `shadcn init`: it overwrites project tokens (`--muted`, `--background`, `--foreground`), switches dark mode to a `.dark` class and adds `--font-sans` cycles.
- Prettier is not installed; rely on ESLint.
