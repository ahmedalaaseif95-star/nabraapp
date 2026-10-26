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

- App state (language, draft, result, approved copies) lives in a React context in `src/lib/app-state.tsx`, persisted to localStorage; no backend DB in the MVP to keep the pilot login-free.
- AI copy generation runs only in `src/lib/generate.functions.ts` via `@lovable.dev/ai-gateway`, so prompts stay server-side.
- Library provenance and review eligibility are centralized in nabra-data; PhraseLibrary handles browsing independently of the writing form so every display uses the same review rule.
- Admin access uses `public.user_roles` + `has_role`; the first signed-in user claims admin via `claim_first_admin()` — keeps the pilot bootstrap without manual DB edits.
- Licensed research datasets live in `public.source_segments` (unique source+file_name+segment_id), separate from the commercial phrase library, so restricted data never reaches generation.
