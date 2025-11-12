create user "express"
with
  PASSWORD 'WnDm79X$M%%1v$iG';

-- Attribution des permissions à "express" sur le schéma "public"
grant USAGE,
create on SCHEMA public to "express";

grant all PRIVILEGES on all TABLES in SCHEMA public to "express";

grant all PRIVILEGES on all SEQUENCES in SCHEMA public to "express";

grant all PRIVILEGES on all ROUTINES in SCHEMA public to "express";

-- Garantit que "express" aura les permissions sur les FUTURS objets.
alter default privileges for ROLE "postgres" in SCHEMA public
grant all on TABLES to "express";

alter default privileges for ROLE "postgres" in SCHEMA public
grant all on SEQUENCES to "express";

alter default privileges for ROLE "postgres" in SCHEMA public
grant all on ROUTINES to "express";