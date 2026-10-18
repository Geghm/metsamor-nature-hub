# Metsamor — Taking Action for Nature

Public website for the natural and cultural treasures of Metsamor Community, prepared for CBD COP17 in Yerevan. The visual design, opening animation, and trilingual interface come from the existing Lovable project. Content can be managed without editing source code once Supabase is connected.

There is no map, and the site does not list settlements from other Armenian communities.

## What works before Supabase is connected

Without `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, the public site keeps the bundled exhibition: Armenian, English, and Russian text, the hero photograph, and the draft treasure cards. The settlement directory stays empty because an official list has not been verified.

The hidden administrator entry is present, but authentication is **not operational** until the steps below are finished. The login dialog explains that configuration is missing. Do not treat the shortcut as a password.

## Administrator entry

- Windows and Linux: `Ctrl + Shift + F`
- macOS: `Command + Shift + F`

The shortcut is ignored while focus is in an input, textarea, select, or editable field. It opens a login dialog. After a real administrator signs in, the same shortcut opens the dashboard. There is no public admin link.

## 1. Create the Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In Authentication → Providers, enable Email.
3. Copy this file's variable names into `.env` in this directory:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Use the anon or publishable key only. The app refuses to start the client if the value is a service-role or secret key. Never put that key in `.env`, client code, or a `VITE_` variable.

## 2. Apply the database migration

Apply these files once, in this order:

1. `supabase/migrations/20261017120000_cms_schema.sql`
2. `supabase/migrations/20261017180000_grant_private_functions.sql`

If the first file is already applied, run only the second. It grants administrators permission to run the private save functions. Without it, homepage saves, treasure edits, and image records fail even though sign-in works.

In the Supabase SQL editor, paste and run the whole file. Or, with the Supabase CLI linked to the project, run `supabase db push`.

The migration creates:

- `site_settings`, `site_slots`
- `treasure_categories`, `treasures`, `treasure_gallery`
- `settlements` (no rows; the official list is not verified)
- `contact_settings`, `contact_links` (no invented contact details)
- `media_assets`, `admin_profiles`
- the public `site-media` storage bucket
- row level security on the application tables, and storage policies on `storage.objects`

The migration does not alter `storage.objects`. Supabase already enables row level security on that system table, and the SQL editor cannot change it.

Seeded treasures are drafts and are not featured. They stay off the public site until an administrator publishes them. Until then, disconnecting the environment variables shows the original bundled cards again.

Anonymous visitors can read published rows only. Writes require a row in `admin_profiles`. The migration does not create a login and does not grant administrator rights to the first user.

## 3. Provision an administrator

1. In Supabase → Authentication → Users, create one user with an email and a password you keep private.
2. In the SQL editor, run the following with that email. This is the only supported way to grant access:

```sql
insert into public.admin_profiles (user_id)
select id from auth.users where email = 'you@example.org';
```

To remove access, delete that row and sign the user out. Do not store the password in the repository.

## 4. Confirm the policies

After the migration, check:

- Anonymous `POST` to `/rest/v1/treasures` with the anon key is rejected.
- Storage → `site-media` allows JPEG, PNG, and WebP up to 5 MB.
- There is no storage policy that lets anonymous users upload.
- Authentication uses the anon or publishable key in the browser, never the service role.

The `site-media` bucket is public so published pages can show images by URL. Object paths are random. The Data API does not list an image to anonymous visitors unless a public section or a published record references it. Anyone who already knows an object path can request that file.

## 5. Run the site

```sh
npm install
npm run dev
```
<<<<<<< HEAD
.
=======

Then open the site and use `Ctrl + Shift + F`.

The dashboard edits homepage text, the hero and section images, treasures, categories, settlements, contact links, and the media library. Saving writes to Supabase. The public pages reload that data without a new deployment. Image URLs include the record timestamp so a replacement is not stuck behind an old cached file.

## Dashboard sections

- Overview counts come from the database.
- Homepage edits titles, buttons, section text, the hero image, about image, banner image, and favicon. The current layout does not display the optional secondary hero; it is stored only.
- Treasures support draft, published, and archived states. A featured treasure appears on the homepage only when it is also published.
- Settlements can be added only by an administrator. Add a settlement only when it is an official current settlement of Metsamor Community.
- Categories cannot be deleted while treasures still use them unless those treasures are reassigned.
- Contact links are validated and shown only when saved. External links open with `rel="noopener noreferrer"`.
- Translations are stored per language. An empty language stays empty; it is not filled from another language.
- The media library uploads, previews, replaces, reuses, and deletes images. A file that is still referenced cannot be deleted.

## Scripts

```sh
npm run test
npm run lint
npx tsc --noEmit
npm run build
```

## Current limit

This repository does not contain Supabase credentials, so sign-in, database writes, storage uploads, and row-level security have not been executed against a live project here. The application code, migration, and policies are ready for the owner to apply. Until that configuration exists, the admin system is not secured in production and the public site uses the bundled content.
>>>>>>> 3a9ff63 (Update admin shortcut and site features)
