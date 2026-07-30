# Secret manifest

Project: legal-doc-studio

This generated view contains variable names and operating metadata only. Secret values, vault session keys, recovery keys, and access tokens are forbidden.

| Variable | Purpose | Provider | Trust boundary | Owner | Rotation | Consumers | Status |
|---|---|---|---|---|---|---|---|
| `PROJECT_DATA_ROOT` | Optional local root reserved for harness-managed project data; the application does not currently consume it | Bitwarden Secrets Manager or deployment platform | local filesystem configuration | Douglas | on compromise, ownership change, or provider policy |  | non-secret-config |

Canonical source: `secret-manifest.json`
Refresh: `C:\Users\dougl\.agents\tools\Update-SecretManifest.cmd -Repository <repo>`
