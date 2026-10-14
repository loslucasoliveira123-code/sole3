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

- Keep SOLE AI financial commands deterministic and confirmation-gated before persisting, because inferred financial data must remain reviewable.
- Capture voice commands as complete WAV files, stop locally after speech-ending silence, and transcribe through an authenticated server route to keep AI credentials out of the browser.
- Project details use the authenticated /projeto/$projetoId route and shared transaction forms/lists; deletion preserves transactions through the existing ON DELETE SET NULL relation and invalidates both project and transaction caches.
