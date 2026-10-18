# Deploying Poscon

Poscon deploys as three free-tier services:

| Part     | Service | What it runs |
| :------- | :------ | :----------- |
| Database | [Neon](https://neon.tech) | PostgreSQL 16 |
| API      | [Render](https://render.com) | `server/` as a Node web service |
| Frontend | [Vercel](https://vercel.com) | `postocom/` as a static React build |

Deploy them in this order, because each one needs the address of the one before it. Plan for about 20 minutes.

Dashboards change over time, so button names below may differ slightly. The settings themselves are what matter.

## 1. Database on Neon

1. Sign up at Neon and create a project. Pick the region closest to your users (for India, **AWS Asia Pacific (Singapore)**) and PostgreSQL 16.
2. Name the database `poscon`.
3. Open **Connection Details** and copy the connection string. It looks like:

   ```
   postgresql://user:password@ep-example-123456.ap-southeast-1.aws.neon.tech/poscon?sslmode=require
   ```

Keep it private: it contains the database password. You do not need to create any tables; the API does that on its first start.

## 2. API on Render

1. Sign up at Render with your GitHub account and allow it to access the `poscon` repository.
2. Choose **New → Blueprint** and select the repository. Render reads [`render.yaml`](../render.yaml) and proposes a web service called `poscon-api`.
3. Render asks for the values marked `sync: false`:

   | Variable | Value |
   | :------- | :---- |
   | `DATABASE_URL` | The Neon connection string from step 1 |
   | `CLIENT_ORIGIN` | Leave as `https://example.com` for now; you will set it in step 4 |
   | `ADMIN_PASSWORD` | A private password for `admin@poscon.dev` |

   `SESSION_SECRET` is generated automatically, and `TRUST_PROXY=1` is already set so rate limiting sees each visitor's real address.
4. Create the service. The first deploy installs dependencies, applies the migrations, loads the sample products and starts the API.
5. When it shows **Live**, open `https://<your-service>.onrender.com/health`. It should return `{"status":"ok"}`. The API docs are at `/docs`.

Copy the service URL, for example `https://poscon-api.onrender.com`.

> **Free tier note:** Render stops free services after about 15 minutes without traffic. The next request wakes it up, which takes up to a minute, so the site can look empty on the first visit. Opening `/health` a minute before showing the site avoids this.

## 3. Frontend on Vercel

1. Sign up at Vercel with GitHub and choose **Add New → Project**, then import the `poscon` repository.
2. Set **Root Directory** to `postocom`. Vercel detects Create React App and fills in `npm run build` and the `build` output folder.
3. Under **Environment Variables**, add:

   | Variable | Value |
   | :------- | :---- |
   | `REACT_APP_API_URL` | The Render URL from step 2, with no trailing slash |

4. Deploy. [`postocom/vercel.json`](../postocom/vercel.json) sends every route to `index.html`, so links such as `/product/3` work when opened directly.

Copy the site URL, for example `https://poscon.vercel.app`.

## 4. Connect the frontend to the API

The API only accepts requests from addresses listed in `CLIENT_ORIGIN`.

1. In Render, open `poscon-api` → **Environment** and set `CLIENT_ORIGIN` to the Vercel URL, with no trailing slash. To allow more than one address, separate them with commas.
2. Save. Render redeploys the API.

## 5. Check the live site

- Open the Vercel URL. Products and images should load on the home page.
- Log in with `demo@poscon.dev` / `demo1234`, add something to the cart, check out and pay with the test card `4242 4242 4242 4242`.
- Log in as `admin@poscon.dev` with your `ADMIN_PASSWORD` and open **Admin**.

## Updating the site

Both Render and Vercel redeploy automatically when `main` changes. New migrations are applied when the API starts, and existing data is kept.

To start over with fresh sample data, run the reset against Neon from your computer:

```bash
cd server
DATABASE_URL="<neon connection string>" ADMIN_PASSWORD="<your admin password>" npm run db:reset
```

## Troubleshooting

| Symptom | Likely cause and fix |
| :------ | :------------------- |
| The site loads but shows no products, and the browser console mentions CORS | `CLIENT_ORIGIN` on Render does not exactly match the Vercel URL. Check for `https://` and no trailing slash. |
| The first visit is slow or empty, then works | The free Render service was asleep. See the free tier note above. |
| `/health` returns `{"status":"error"}` | The API cannot reach the database. Check `DATABASE_URL` and that the Neon project is not suspended. |
| The Render deploy fails with a database error during `db:setup` | The connection string is wrong or missing `sslmode=require`. |
| Opening `/product/3` directly on Vercel gives a 404 | The project root is not `postocom`, so `vercel.json` is not being used. |
| Requests still go to `localhost:9000` | `REACT_APP_API_URL` was added after the last build. Redeploy on Vercel; the value is built into the app. |
