---
"@mercury-fw/cli": minor
---

- A scaffolded app with tool plugins gets a `docker-entrypoint.sh`: at the first start without a CLI's config folder on the credentials volume, it unpacks that CLI's variable from the env file there, then starts the service. What the CLI refreshes afterwards stays on the volume.
- The scaffolded env example lists each tool plugin's credentials variable, and the README explains the flow.
- `mfw credentials set <plugin>` packs a CLI's config folder (`~/.config/<cli>`, or `--from <dir>`) into its variable in the app's env file, never printing it; `--print` prints the line to paste elsewhere.
- `mfw credentials reset <plugin>` clears a CLI's folder from the credentials volume after you type the plugin's name, so a corrected variable is unpacked at the next start.
