-- CMS schema for the Metsamor COP17 site.
-- Apply this file first. It is the only migration.
-- It creates tables, RLS, and the site-media bucket.
-- It does not delete existing data, does not insert settlements,
-- and does not create an administrator login.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

create or replace function private.text_ok(value text, max_len integer)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select value is not null and pg_catalog.char_length(value) <= max_len;
$$;

revoke all on function private.touch_updated_at() from public;
revoke all on function private.text_ok(text, integer) from public;
-- Authenticated administrators run these from triggers and check constraints.
-- Without EXECUTE, every save fails with "permission denied for function".
grant execute on function private.touch_updated_at() to authenticated;
grant execute on function private.text_ok(text, integer) to authenticated;

create table public.admin_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  label text not null default '',
  alt_hy text not null default '',
  alt_en text not null default '',
  alt_ru text not null default '',
  mime_type text not null,
  byte_size integer not null,
  focal_x numeric(5,2) not null default 50,
  focal_y numeric(5,2) not null default 50,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint media_assets_type check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint media_assets_size check (byte_size > 0 and byte_size <= 5242880),
  constraint media_assets_focal check (focal_x between 0 and 100 and focal_y between 0 and 100),
  constraint media_assets_text check (
    private.text_ok(label, 120)
    and private.text_ok(alt_hy, 300)
    and private.text_ok(alt_en, 300)
    and private.text_ok(alt_ru, 300)
  )
);

create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  hero_title_hy text not null default '',
  hero_title_en text not null default '',
  hero_title_ru text not null default '',
  hero_subtitle_hy text not null default '',
  hero_subtitle_en text not null default '',
  hero_subtitle_ru text not null default '',
  cta_treasures_label_hy text not null default '',
  cta_treasures_label_en text not null default '',
  cta_treasures_label_ru text not null default '',
  cta_settlements_label_hy text not null default '',
  cta_settlements_label_en text not null default '',
  cta_settlements_label_ru text not null default '',
  cta_treasures_href text not null default '/treasures',
  cta_settlements_href text not null default '/settlements',
  featured_eyebrow_hy text not null default '',
  featured_eyebrow_en text not null default '',
  featured_eyebrow_ru text not null default '',
  featured_title_hy text not null default '',
  featured_title_en text not null default '',
  featured_title_ru text not null default '',
  pillar_1_title_hy text not null default '',
  pillar_1_title_en text not null default '',
  pillar_1_title_ru text not null default '',
  pillar_1_body_hy text not null default '',
  pillar_1_body_en text not null default '',
  pillar_1_body_ru text not null default '',
  pillar_2_title_hy text not null default '',
  pillar_2_title_en text not null default '',
  pillar_2_title_ru text not null default '',
  pillar_2_body_hy text not null default '',
  pillar_2_body_en text not null default '',
  pillar_2_body_ru text not null default '',
  pillar_3_title_hy text not null default '',
  pillar_3_title_en text not null default '',
  pillar_3_title_ru text not null default '',
  pillar_3_body_hy text not null default '',
  pillar_3_body_en text not null default '',
  pillar_3_body_ru text not null default '',
  band_title_hy text not null default '',
  band_title_en text not null default '',
  band_title_ru text not null default '',
  band_body_hy text not null default '',
  band_body_en text not null default '',
  band_body_ru text not null default '',
  about_title_hy text not null default '',
  about_title_en text not null default '',
  about_title_ru text not null default '',
  about_body_hy text not null default '',
  about_body_en text not null default '',
  about_body_ru text not null default '',
  about_note_hy text not null default '',
  about_note_en text not null default '',
  about_note_ru text not null default '',
  footer_body_hy text not null default '',
  footer_body_en text not null default '',
  footer_body_ru text not null default '',
  rights_line_hy text not null default '',
  rights_line_en text not null default '',
  rights_line_ru text not null default '',
  treasures_lead_hy text not null default '',
  treasures_lead_en text not null default '',
  treasures_lead_ru text not null default '',
  settlements_lead_hy text not null default '',
  settlements_lead_en text not null default '',
  settlements_lead_ru text not null default '',
  contact_lead_hy text not null default '',
  contact_lead_en text not null default '',
  contact_lead_ru text not null default '',
  updated_at timestamptz not null default pg_catalog.now(),
  constraint site_settings_hrefs check (
    cta_treasures_href ~ '^/[a-z0-9/-]*$'
    and cta_settlements_href ~ '^/[a-z0-9/-]*$'
    and cta_treasures_href !~ '//'
    and cta_settlements_href !~ '//'
  )
);

create table public.site_slots (
  slot_key text primary key,
  media_id uuid references public.media_assets (id) on delete restrict,
  alt_hy text not null default '',
  alt_en text not null default '',
  alt_ru text not null default '',
  focal_x numeric(5,2) not null default 50,
  focal_y numeric(5,2) not null default 50,
  updated_at timestamptz not null default pg_catalog.now(),
  constraint site_slots_key check (slot_key in ('hero', 'hero_secondary', 'about', 'band', 'favicon')),
  constraint site_slots_focal check (focal_x between 0 and 100 and focal_y between 0 and 100),
  constraint site_slots_alt check (
    private.text_ok(alt_hy, 300)
    and private.text_ok(alt_en, 300)
    and private.text_ok(alt_ru, 300)
  )
);

create table public.treasure_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_hy text not null default '',
  name_en text not null default '',
  name_ru text not null default '',
  description_hy text not null default '',
  description_en text not null default '',
  description_ru text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint treasure_categories_slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint treasure_categories_text check (
    private.text_ok(name_hy, 200) and private.text_ok(name_en, 200) and private.text_ok(name_ru, 200)
    and private.text_ok(description_hy, 2000) and private.text_ok(description_en, 2000) and private.text_ok(description_ru, 2000)
  )
);

create table public.treasures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references public.treasure_categories (id) on delete restrict,
  title_hy text not null default '',
  title_en text not null default '',
  title_ru text not null default '',
  summary_hy text not null default '',
  summary_en text not null default '',
  summary_ru text not null default '',
  body_hy text not null default '',
  body_en text not null default '',
  body_ru text not null default '',
  alt_hy text not null default '',
  alt_en text not null default '',
  alt_ru text not null default '',
  cover_media_id uuid references public.media_assets (id) on delete restrict,
  fallback_image text,
  source_url text,
  featured boolean not null default false,
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint treasures_slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint treasures_status check (status in ('draft', 'published', 'archived')),
  constraint treasures_fallback check (
    fallback_image is null or fallback_image in (
      'vordan-karmir', 'biodiversity', 'landscapes', 'traditions', 'green', 'awareness'
    )
  ),
  constraint treasures_source check (
    source_url is null or (pg_catalog.char_length(source_url) <= 500 and source_url ~ '^https://')
  ),
  constraint treasures_text check (
    private.text_ok(title_hy, 200) and private.text_ok(title_en, 200) and private.text_ok(title_ru, 200)
    and private.text_ok(summary_hy, 600) and private.text_ok(summary_en, 600) and private.text_ok(summary_ru, 600)
    and private.text_ok(body_hy, 8000) and private.text_ok(body_en, 8000) and private.text_ok(body_ru, 8000)
    and private.text_ok(alt_hy, 300) and private.text_ok(alt_en, 300) and private.text_ok(alt_ru, 300)
  )
);

create table public.treasure_gallery (
  id uuid primary key default gen_random_uuid(),
  treasure_id uuid not null references public.treasures (id) on delete cascade,
  media_id uuid not null references public.media_assets (id) on delete restrict,
  alt_hy text not null default '',
  alt_en text not null default '',
  alt_ru text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  constraint treasure_gallery_alt check (
    private.text_ok(alt_hy, 300) and private.text_ok(alt_en, 300) and private.text_ok(alt_ru, 300)
  )
);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  kind text not null,
  name_hy text not null default '',
  name_en text not null default '',
  name_ru text not null default '',
  summary_hy text not null default '',
  summary_en text not null default '',
  summary_ru text not null default '',
  body_hy text not null default '',
  body_en text not null default '',
  body_ru text not null default '',
  alt_hy text not null default '',
  alt_en text not null default '',
  alt_ru text not null default '',
  cover_media_id uuid references public.media_assets (id) on delete restrict,
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint settlements_slug check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint settlements_kind check (kind in ('town', 'village')),
  constraint settlements_status check (status in ('draft', 'published', 'archived')),
  constraint settlements_text check (
    private.text_ok(name_hy, 200) and private.text_ok(name_en, 200) and private.text_ok(name_ru, 200)
    and private.text_ok(summary_hy, 600) and private.text_ok(summary_en, 600) and private.text_ok(summary_ru, 600)
    and private.text_ok(body_hy, 8000) and private.text_ok(body_en, 8000) and private.text_ok(body_ru, 8000)
    and private.text_ok(alt_hy, 300) and private.text_ok(alt_en, 300) and private.text_ok(alt_ru, 300)
  )
);

create table public.contact_settings (
  id smallint primary key default 1 check (id = 1),
  description_hy text not null default '',
  description_en text not null default '',
  description_ru text not null default '',
  updated_at timestamptz not null default pg_catalog.now(),
  constraint contact_settings_text check (
    private.text_ok(description_hy, 2000)
    and private.text_ok(description_en, 2000)
    and private.text_ok(description_ru, 2000)
  )
);

create table public.contact_links (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  label_hy text not null default '',
  label_en text not null default '',
  label_ru text not null default '',
  value text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint contact_links_kind check (kind in ('email', 'phone', 'instagram', 'facebook', 'other')),
  constraint contact_links_label check (
    private.text_ok(label_hy, 120) and private.text_ok(label_en, 120) and private.text_ok(label_ru, 120)
  ),
  constraint contact_links_value check (
    (kind = 'email' and value ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and pg_catalog.char_length(value) <= 200)
    or (kind = 'phone' and value ~ '^\+?[0-9][0-9 ()-]{5,24}$')
    or (kind in ('instagram', 'facebook', 'other') and value ~ '^https://' and pg_catalog.char_length(value) <= 500)
  )
);

create index treasures_public_idx on public.treasures (status, featured, sort_order);
create index treasures_category_idx on public.treasures (category_id);
create index treasures_cover_idx on public.treasures (cover_media_id);
create index treasure_gallery_treasure_idx on public.treasure_gallery (treasure_id, sort_order);
create index treasure_gallery_media_idx on public.treasure_gallery (media_id);
create index settlements_public_idx on public.settlements (status, sort_order);
create index settlements_cover_idx on public.settlements (cover_media_id);
create index site_slots_media_idx on public.site_slots (media_id);
create index media_assets_label_idx on public.media_assets (label);

create trigger media_assets_touch before update on public.media_assets
for each row execute function private.touch_updated_at();
create trigger site_settings_touch before update on public.site_settings
for each row execute function private.touch_updated_at();
create trigger site_slots_touch before update on public.site_slots
for each row execute function private.touch_updated_at();
create trigger treasure_categories_touch before update on public.treasure_categories
for each row execute function private.touch_updated_at();
create trigger treasures_touch before update on public.treasures
for each row execute function private.touch_updated_at();
create trigger settlements_touch before update on public.settlements
for each row execute function private.touch_updated_at();
create trigger contact_settings_touch before update on public.contact_settings
for each row execute function private.touch_updated_at();
create trigger contact_links_touch before update on public.contact_links
for each row execute function private.touch_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

alter table public.admin_profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_slots enable row level security;
alter table public.treasure_categories enable row level security;
alter table public.treasures enable row level security;
alter table public.treasure_gallery enable row level security;
alter table public.settlements enable row level security;
alter table public.contact_settings enable row level security;
alter table public.contact_links enable row level security;

create policy admin_profiles_select_own on public.admin_profiles
for select to authenticated
using (user_id = (select auth.uid()));

create policy media_assets_public_read on public.media_assets
for select to anon, authenticated
using (
  private.is_admin()
  or exists (select 1 from public.site_slots s where s.media_id = media_assets.id)
  or exists (
    select 1 from public.treasures t
    where t.cover_media_id = media_assets.id and t.status = 'published'
  )
  or exists (
    select 1 from public.treasure_gallery g
    join public.treasures t on t.id = g.treasure_id
    where g.media_id = media_assets.id and t.status = 'published'
  )
  or exists (
    select 1 from public.settlements s
    where s.cover_media_id = media_assets.id and s.status = 'published'
  )
);

create policy media_assets_admin_write on public.media_assets
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy site_settings_read on public.site_settings
for select to anon, authenticated
using (true);

create policy site_settings_admin_write on public.site_settings
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy site_slots_read on public.site_slots
for select to anon, authenticated
using (true);

create policy site_slots_admin_write on public.site_slots
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy categories_read on public.treasure_categories
for select to anon, authenticated
using (true);

create policy categories_admin_write on public.treasure_categories
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy treasures_read on public.treasures
for select to anon, authenticated
using (status = 'published' or private.is_admin());

create policy treasures_admin_write on public.treasures
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy gallery_read on public.treasure_gallery
for select to anon, authenticated
using (
  private.is_admin()
  or exists (
    select 1 from public.treasures t
    where t.id = treasure_gallery.treasure_id and t.status = 'published'
  )
);

create policy gallery_admin_write on public.treasure_gallery
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy settlements_read on public.settlements
for select to anon, authenticated
using (status = 'published' or private.is_admin());

create policy settlements_admin_write on public.settlements
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy contact_settings_read on public.contact_settings
for select to anon, authenticated
using (true);

create policy contact_settings_admin_write on public.contact_settings
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy contact_links_read on public.contact_links
for select to anon, authenticated
using (true);

create policy contact_links_admin_write on public.contact_links
for all to authenticated
using (private.is_admin())
with check (private.is_admin());

revoke all on public.admin_profiles from anon, authenticated;
grant select on public.admin_profiles to authenticated;

revoke insert, update, delete, truncate on
  public.media_assets,
  public.site_settings,
  public.site_slots,
  public.treasure_categories,
  public.treasures,
  public.treasure_gallery,
  public.settlements,
  public.contact_settings,
  public.contact_links
from anon;

grant select on
  public.media_assets,
  public.site_settings,
  public.site_slots,
  public.treasure_categories,
  public.treasures,
  public.treasure_gallery,
  public.settlements,
  public.contact_settings,
  public.contact_links
to anon, authenticated;

grant insert, update, delete on
  public.media_assets,
  public.site_settings,
  public.site_slots,
  public.treasure_categories,
  public.treasures,
  public.treasure_gallery,
  public.settlements,
  public.contact_settings,
  public.contact_links
to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- storage.objects is owned by supabase_storage_admin.
-- Supabase already enables row level security on it.
-- Do not ALTER this table or change its owner.
-- Creating policies is the supported way to control access.

drop policy if exists site_media_admin_select on storage.objects;
create policy site_media_admin_select on storage.objects
for select to authenticated
using (bucket_id = 'site-media' and private.is_admin());

drop policy if exists site_media_admin_insert on storage.objects;
create policy site_media_admin_insert on storage.objects
for insert to authenticated
with check (bucket_id = 'site-media' and private.is_admin());

drop policy if exists site_media_admin_update on storage.objects;
create policy site_media_admin_update on storage.objects
for update to authenticated
using (bucket_id = 'site-media' and private.is_admin())
with check (bucket_id = 'site-media' and private.is_admin());

drop policy if exists site_media_admin_delete on storage.objects;
create policy site_media_admin_delete on storage.objects
for delete to authenticated
using (bucket_id = 'site-media' and private.is_admin());

insert into public.site_settings (
  hero_title_hy, hero_title_en, hero_title_ru,
  hero_subtitle_hy, hero_subtitle_en, hero_subtitle_ru,
  cta_treasures_label_hy, cta_treasures_label_en, cta_treasures_label_ru,
  cta_settlements_label_hy, cta_settlements_label_en, cta_settlements_label_ru,
  featured_eyebrow_hy, featured_eyebrow_en, featured_eyebrow_ru,
  featured_title_hy, featured_title_en, featured_title_ru,
  pillar_1_title_hy, pillar_1_title_en, pillar_1_title_ru,
  pillar_1_body_hy, pillar_1_body_en, pillar_1_body_ru,
  pillar_2_title_hy, pillar_2_title_en, pillar_2_title_ru,
  pillar_2_body_hy, pillar_2_body_en, pillar_2_body_ru,
  pillar_3_title_hy, pillar_3_title_en, pillar_3_title_ru,
  pillar_3_body_hy, pillar_3_body_en, pillar_3_body_ru,
  band_title_hy, band_title_en, band_title_ru,
  band_body_hy, band_body_en, band_body_ru,
  about_title_hy, about_title_en, about_title_ru,
  about_body_hy, about_body_en, about_body_ru,
  about_note_hy, about_note_en, about_note_ru,
  footer_body_hy, footer_body_en, footer_body_ru,
  rights_line_hy, rights_line_en, rights_line_ru,
  treasures_lead_hy, treasures_lead_en, treasures_lead_ru,
  settlements_lead_hy, settlements_lead_en, settlements_lead_ru,
  contact_lead_hy, contact_lead_en, contact_lead_ru
) values (
  $t$Մեծամոր․ բնության հրաշալիքները՝ մեկ պատմության մեջ$t$,
  $t$Metsamor: the wonders of nature in one story$t$,
  $t$Мецамор: чудеса природы в одной истории$t$,
  $t$Բացահայտի՛ր Մեծամոր համայնքի բնական և մշակութային արժեքները, ծանոթացի՛ր նրա բնակավայրերին և տես, թե ինչպես կարող ենք միասին հոգ տանել մեր շրջակա միջավայրի մասին$t$,
  $t$Discover the natural and cultural values of Metsamor Community, get to know its settlements, and see how together we can care for our environment$t$,
  $t$Откройте природные и культурные ценности общины Мецамор, познакомьтесь с её населёнными пунктами и узнайте, как вместе мы можем заботиться об окружающей среде$t$,
  $t$Բացահայտել գանձերը$t$, $t$Explore the treasures$t$, $t$Открыть сокровища$t$,
  $t$Ծանոթանալ բնակավայրերին$t$, $t$Meet the settlements$t$, $t$Населённые пункты$t$,
  $t$Բնության գանձեր$t$, $t$Nature treasures$t$, $t$Сокровища природы$t$,
  $t$Պատմություններ, որոնք արժե պահպանել$t$, $t$Stories worth protecting$t$, $t$Истории, которые стоит сберечь$t$,
  $t$Բնական արժեքներ$t$, $t$Natural values$t$, $t$Природные ценности$t$,
  $t$Կենսաբազմազանություն, բնապատկերներ և Որդան կարմիր։$t$, $t$Biodiversity, landscapes and Vordan Karmir.$t$, $t$Биоразнообразие, пейзажи и вордан кармир.$t$,
  $t$Մշակութային ժառանգություն$t$, $t$Cultural heritage$t$, $t$Культурное наследие$t$,
  $t$Ավանդույթներ, որոնք կապում են մարդուն և բնությանը։$t$, $t$Traditions that connect people and nature.$t$, $t$Традиции, связывающие человека и природу.$t$,
  $t$Միասին գործել$t$, $t$Acting together$t$, $t$Действовать вместе$t$,
  $t$Իրազեկում և համայնքային նախաձեռնություններ։$t$, $t$Awareness and community initiatives.$t$, $t$Просвещение и инициативы общины.$t$,
  $t$Ծանոթացի՛ր համայնքի բնակավայրերին$t$, $t$Get to know the community’s settlements$t$, $t$Познакомьтесь с населёнными пунктами общины$t$,
  $t$Այստեղ կներկայացվեն միայն Մեծամոր համայնքի ներկայիս բնակավայրերը։$t$,
  $t$Only the current settlements of Metsamor Community will be listed here.$t$,
  $t$Здесь будут представлены только текущие населённые пункты общины Мецамор.$t$,
  $t$Նախագծի մասին$t$, $t$About$t$, $t$О проекте$t$,
  $t$«Մեծամոր — Գործենք հանուն բնության» նախաձեռնությունը ներկայացնում է համայնքի բնական և մշակութային ժառանգությունը ԿՕՊ17-ի համատեքստում։ Բովանդակությունը աստիճանաբար կլրացվի ստուգված տվյալներով։$t$,
  $t$“Metsamor — Taking Action for Nature” presents the community’s natural and cultural heritage in the context of COP17. Content will be added progressively as it is verified.$t$,
  $t$«Мецамор — Действуем ради природы» представляет природное и культурное наследие общины в контексте COP17. Материалы будут добавляться по мере проверки.$t$,
  $t$Կայքը չի հանդիսանում ԿՕՊ17-ի պաշտոնական ռեսուրս։ Թիթեռի մոտիվները դեկորատիվ են և պաշտոնական լոգո չեն։$t$,
  $t$This site is not an official COP17 resource. Butterfly motifs are decorative and are not the official logo.$t$,
  $t$Сайт не является официальным ресурсом COP17. Мотивы бабочки декоративны и не являются официальным логотипом.$t$,
  $t$Կոնտակտային տվյալները կհրապարակվեն հաստատումից հետո։$t$,
  $t$Contact details will be published once confirmed.$t$,
  $t$Контактные данные будут опубликованы после подтверждения.$t$,
  $t$Բովանդակությունը նախնական է։$t$, $t$Content is preliminary.$t$, $t$Материалы предварительные.$t$,
  $t$Թեմաներ, որոնք ներկայացնում են Մեծամոր համայնքի բնական և մշակութային արժեքները։$t$,
  $t$Topics presenting the natural and cultural values of Metsamor Community.$t$,
  $t$Темы, представляющие природные и культурные ценности общины Мецамор.$t$,
  $t$Այստեղ կներկայացվեն միայն Մեծամոր համայնքի ներկայիս բնակավայրերը։$t$,
  $t$Only the current settlements of Metsamor Community will be listed here.$t$,
  $t$Здесь будут представлены только текущие населённые пункты общины Мецамор.$t$,
  $t$Կոնտակտային տվյալները կհրապարակվեն պաշտոնական հաստատումից հետո։$t$,
  $t$Contact details will be published once officially confirmed.$t$,
  $t$Контактные данные будут опубликованы после официального подтверждения.$t$
);

insert into public.contact_settings (id) values (1);

insert into public.site_slots (slot_key) values
  ('hero'), ('hero_secondary'), ('about'), ('band'), ('favicon');

insert into public.treasure_categories (id, slug, name_hy, name_en, name_ru, sort_order) values
  ('11111111-1111-4111-8111-111111111111', 'natural-heritage', $t$Բնական ժառանգություն$t$, $t$Natural heritage$t$, $t$Природное наследие$t$, 0),
  ('22222222-2222-4222-8222-222222222222', 'biodiversity', $t$Կենսաբազմազանություն$t$, $t$Biodiversity$t$, $t$Биоразнообразие$t$, 1),
  ('33333333-3333-4333-8333-333333333333', 'landscapes', $t$Բնապատկեր$t$, $t$Landscapes$t$, $t$Ландшафты$t$, 2),
  ('44444444-4444-4444-8444-444444444444', 'cultural-heritage', $t$Մշակութային ժառանգություն$t$, $t$Cultural heritage$t$, $t$Культурное наследие$t$, 3),
  ('55555555-5555-4555-8555-555555555555', 'green-spaces', $t$Կանաչ տարածքներ$t$, $t$Green spaces$t$, $t$Зелёные зоны$t$, 4),
  ('66666666-6666-4666-8666-666666666666', 'environmental-awareness', $t$Բնապահպանական իրազեկում$t$, $t$Environmental awareness$t$, $t$Экологическое просвещение$t$, 5);

insert into public.treasures (
  id, slug, category_id, fallback_image, status, featured, sort_order,
  title_hy, title_en, title_ru, summary_hy, summary_en, summary_ru,
  body_hy, body_en, body_ru
) values
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'vordan-karmir', '11111111-1111-4111-8111-111111111111', 'vordan-karmir', 'draft', false, 0,
  $t$Որդան կարմիր$t$, $t$Vordan Karmir$t$, $t$Вордан кармир$t$,
  $t$Հայկական որդան կարմիրը և նրա հետ կապված բնական ու մշակութային պատմությունը։$t$,
  $t$The Armenian cochineal and the natural and cultural story connected to it.$t$,
  $t$Армянская кошениль и связанная с ней природная и культурная история.$t$,
  $t$Այս բաժնի վերջնական տեքստը կպատրաստվի ստուգված աղբյուրների և մասնագետների հետ համագործակցությամբ։ Հստակ վայրեր, թվեր կամ պատմական փաստեր այստեղ դեռ չեն ներկայացվում։$t$,
  $t$Final text for this topic will be prepared with verified sources and experts. No exact locations, figures or historical claims are presented here yet.$t$,
  $t$Окончательный текст по этой теме будет подготовлен по проверенным источникам совместно со специалистами. Точные места, цифры и исторические сведения пока не приводятся.$t$
),
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'native-species', '22222222-2222-4222-8222-222222222222', 'biodiversity', 'draft', false, 1,
  $t$Տեղական տեսակներ$t$, $t$Native species$t$, $t$Местные виды$t$,
  $t$Բույսերի, միջատների և թռչունների բազմազանությունը որպես համայնքի հարստություն։$t$,
  $t$Plants, insects and birds as part of the community’s living wealth.$t$,
  $t$Растения, насекомые и птицы как живое богатство общины.$t$,
  $t$Այս բաժնի վերջնական տեքստը կպատրաստվի ստուգված աղբյուրների և մասնագետների հետ համագործակցությամբ։ Հստակ վայրեր, թվեր կամ պատմական փաստեր այստեղ դեռ չեն ներկայացվում։$t$,
  $t$Final text for this topic will be prepared with verified sources and experts. No exact locations, figures or historical claims are presented here yet.$t$,
  $t$Окончательный текст по этой теме будет подготовлен по проверенным источникам совместно со специалистами. Точные места, цифры и исторические сведения пока не приводятся.$t$
),
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', 'landscapes', '33333333-3333-4333-8333-333333333333', 'landscapes', 'draft', false, 2,
  $t$Դաշտավայրի բնապատկերներ$t$, $t$Valley landscapes$t$, $t$Пейзажи долины$t$,
  $t$Լույս, ջուր և հորիզոն՝ բնապատկերներ, որոնք ձևավորում են տեղի դիմագիծը։$t$,
  $t$Light, water and horizon — the landscapes that shape the place’s character.$t$,
  $t$Свет, вода и горизонт — пейзажи, формирующие облик места.$t$,
  $t$Այս բաժնի վերջնական տեքստը կպատրաստվի ստուգված աղբյուրների և մասնագետների հետ համագործակցությամբ։ Հստակ վայրեր, թվեր կամ պատմական փաստեր այստեղ դեռ չեն ներկայացվում։$t$,
  $t$Final text for this topic will be prepared with verified sources and experts. No exact locations, figures or historical claims are presented here yet.$t$,
  $t$Окончательный текст по этой теме будет подготовлен по проверенным источникам совместно со специалистами. Точные места, цифры и исторические сведения пока не приводятся.$t$
),
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4', 'traditions', '44444444-4444-4444-8444-444444444444', 'traditions', 'draft', false, 3,
  $t$Ավանդույթներ և արհեստներ$t$, $t$Traditions and crafts$t$, $t$Традиции и ремёсла$t$,
  $t$Մարդու և բնության կապը՝ ավանդույթների ու ձեռարվեստի միջոցով։$t$,
  $t$The bond between people and nature, carried through traditions and crafts.$t$,
  $t$Связь человека и природы через традиции и ремёсла.$t$,
  $t$Այս բաժնի վերջնական տեքստը կպատրաստվի ստուգված աղբյուրների և մասնագետների հետ համագործակցությամբ։ Հստակ վայրեր, թվեր կամ պատմական փաստեր այստեղ դեռ չեն ներկայացվում։$t$,
  $t$Final text for this topic will be prepared with verified sources and experts. No exact locations, figures or historical claims are presented here yet.$t$,
  $t$Окончательный текст по этой теме будет подготовлен по проверенным источникам совместно со специалистами. Точные места, цифры и исторические сведения пока не приводятся.$t$
),
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa5', 'green-spaces', '55555555-5555-4555-8555-555555555555', 'green', 'draft', false, 4,
  $t$Կանաչ տարածքներ$t$, $t$Green spaces$t$, $t$Зелёные пространства$t$,
  $t$Այգիներ և ծառուղիներ՝ որպես առօրյա կյանքի և առողջ միջավայրի մաս։$t$,
  $t$Parks and tree-lined paths as part of daily life and a healthy environment.$t$,
  $t$Парки и аллеи как часть повседневной жизни и здоровой среды.$t$,
  $t$Այս բաժնի վերջնական տեքստը կպատրաստվի ստուգված աղբյուրների և մասնագետների հետ համագործակցությամբ։ Հստակ վայրեր, թվեր կամ պատմական փաստեր այստեղ դեռ չեն ներկայացվում։$t$,
  $t$Final text for this topic will be prepared with verified sources and experts. No exact locations, figures or historical claims are presented here yet.$t$,
  $t$Окончательный текст по этой теме будет подготовлен по проверенным источникам совместно со специалистами. Точные места, цифры и исторические сведения пока не приводятся.$t$
),
(
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa6', 'community-action', '66666666-6666-4666-8666-666666666666', 'awareness', 'draft', false, 5,
  $t$Համայնքային նախաձեռնություններ$t$, $t$Community initiatives$t$, $t$Инициативы общины$t$,
  $t$Ինչպես կարող ենք միասին հոգ տանել շրջակա միջավայրի մասին։$t$,
  $t$How we can take care of our environment together.$t$,
  $t$Как мы можем вместе заботиться об окружающей среде.$t$,
  $t$Այս բաժնի վերջնական տեքստը կպատրաստվի ստուգված աղբյուրների և մասնագետների հետ համագործակցությամբ։ Հստակ վայրեր, թվեր կամ պատմական փաստեր այստեղ դեռ չեն ներկայացվում։$t$,
  $t$Final text for this topic will be prepared with verified sources and experts. No exact locations, figures or historical claims are presented here yet.$t$,
  $t$Окончательный текст по этой теме будет подготовлен по проверенным источникам совместно со специалистами. Точные места, цифры и исторические сведения пока не приводятся.$t$
);
