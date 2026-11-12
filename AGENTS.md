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

## Application architecture
- Preserve the imported Roomvar workspace in its same-origin root iframe; this retains the uploaded interface and existing interactions.
- Use integration-managed Cloud clients, never archive credentials; this keeps the imported app bound to this project.
- Mount the React Three Fiber quota water through a portal into the iframe and bridge quota/motion callbacks; this provides real 3D without replacing the original workspace.
- Enforce image quotas with atomic database functions shared by image and room generation; client counters are display-only.
- Resolve response language from the latest message on the server; interface settings are only the fallback for ambiguous messages.
- Preserve the imported AI providers, models, endpoints and retry behavior during presentation and language changes; provider migration requires explicit authorization.
