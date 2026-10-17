<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- All content reads go through `src/lib/repository.ts`; swap its internals for a backend later without touching UI. Why: single integration point.
- All user-facing strings are `Localized` ({hy,en,ru}) and rendered via `useI18n()`; Armenian is default. Why: trilingual site.
- Content items carry `status: "draft" | "verified"`; drafts must render `DraftBadge`. Why: no unverified claims shown as fact.
