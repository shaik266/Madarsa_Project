# Cloud deployment from v2

The frontend builds and deploys in GitHub Actions. The API runs on Render and uses a hosted MySQL database. You do not need Node.js or MySQL installed on your computer.

GitHub Pages serves static files; it cannot run the app's Node.js API or MySQL database. GitHub Actions runners are temporary build/test machines, so they cannot serve as an always-on backend.

## 1. Create a hosted MySQL database

Use a hosted MySQL provider, such as Aiven. Copy the host, port, username, password, database name, and CA certificate from its dashboard. Use a new database for the sample app. The setup script creates tables, applies schema updates, and inserts demonstration data and accounts.

Never add database credentials to source files, GitHub repository variables, or any `VITE_` variable. Vite embeds `VITE_` values into public frontend JavaScript.

## 2. Initialize the database using GitHub Actions

1. Open [repository environments](https://github.com/shaik266/Madarsa_Project/settings/environments).
2. Create an environment named `cloud-database`.
3. Add these **environment secrets** using your database provider's connection details:

   | Secret | Value |
   | --- | --- |
   | `DB_HOST` | MySQL hostname |
   | `DB_PORT` | MySQL port |
   | `DB_USER` | MySQL username |
   | `DB_PASSWORD` | MySQL password |
   | `DB_NAME` | Existing database name, for example `defaultdb` |
   | `DB_CA_CERT` | Provider's full PEM CA certificate, if required |

4. Open [Initialize cloud MySQL](https://github.com/shaik266/Madarsa_Project/actions/workflows/setup-cloud-database.yml).
5. Select **Run workflow**, choose branch **v2**, and run it once for the new database.

This workflow uses TLS with certificate verification. The database must allow connections from GitHub-hosted runners. If your provider restricts network access, configure its allowed addresses or run setup using its own cloud shell. Setup adds schema and sample data; it does not reset the database.

## 3. Deploy the API on Render

1. In Render, create a **Blueprint** from `shaik266/Madarsa_Project`, choosing branch **v2**. The checked-in `render.yaml` selects `v2` for the API service.
2. Enter the same database connection values when prompted.
3. `DB_SSL=true` and `DB_SSL_REJECT_UNAUTHORIZED=true` are configured in the Blueprint. Supply `DB_CA_CERT` from your provider when required.
4. The configured frontend origin is `https://shaik266.github.io`. CORS uses the origin only, without `/Madarsa_Project/` or a trailing slash.
5. `SETUP_TOKEN` is only for the existing optional HTTP setup endpoint. You can leave it unset when using the GitHub database setup workflow.
6. Deploy the service and copy its actual HTTPS URL from Render. Do not assume the service name is its final hostname.
7. Open `https://YOUR-ACTUAL-BACKEND.onrender.com/api/health` and check that it returns `"ok": true`.

The Blueprint runs `npm ci` and `npm run server`. Subsequent pushes to `v2` deploy the API through Render's Git integration.

## 4. Connect GitHub Pages to the API

1. Open [Actions variables](https://github.com/shaik266/Madarsa_Project/settings/variables/actions).
2. Create a **repository variable** named `VITE_API_BASE` with the actual backend URL ending in `/api`, for example `https://YOUR-ACTUAL-BACKEND.onrender.com/api`.
3. Open [Pages settings](https://github.com/shaik266/Madarsa_Project/settings/pages) and set **Source** to **GitHub Actions**.
4. If the `github-pages` environment has deployment branch restrictions, allow **v2** in [environment settings](https://github.com/shaik266/Madarsa_Project/settings/environments).
5. Open [Cloud checks and GitHub Pages](https://github.com/shaik266/Madarsa_Project/actions/workflows/cloud.yml), choose **Run workflow**, and select **v2**. GitHub may only show the manual Run workflow control once the workflow also exists on the default branch; if it is unavailable, push a commit to `v2` to trigger deployment.

The website will be published at:

**https://shaik266.github.io/Madarsa_Project/**

Every push to `v2` builds the frontend, tests the API against a temporary MySQL service, and publishes the frontend when both pass. Pull requests run the checks without deployment. The temporary MySQL database is discarded after testing; it is separate from your hosted database.

Until `VITE_API_BASE` is configured, cloud checks still run and the built frontend artifact can be downloaded from the workflow. Pages deployment is skipped to avoid publishing an app that cannot log in. After changing this variable, rerun the workflow or push a commit: Vite reads the API URL at build time.

## Final checks

- Open the Pages URL and check that the logo and favicon load.
- Confirm that the institution list loads and a seeded demonstration account can log in.
- Check the backend health URL if login or data loading fails. A sleeping free backend can take time to start.
- The setup script includes demonstration accounts; review account access before adding real student data.

No database credentials are needed by the frontend or the Pages deployment job. The API end-to-end tests modify data, so the workflow runs them only against its disposable test database.

## Alternative frontend hosting

The existing Vercel configuration still works. Set `VITE_API_BASE` in Vercel and leave `VITE_BASE_PATH` unset to serve at `/`. Add the Vercel origin to the API's comma-separated `FRONTEND_URL` if using it alongside Pages.

## References

- [GitHub Pages: static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Vite deployment and project base paths](https://vite.dev/guide/static-deploy)
- [Render Blueprint configuration](https://render.com/docs/blueprint-spec)
