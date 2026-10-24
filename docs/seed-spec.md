# Seed spec & test-data purge — for `constDocManagment`

The public site reads live catalogue data from the API; the junk rows (`aqw`, `QQ`, `ss`,
`$3,000,000`) live in the backend database, and this repo makes **no API or data changes**.
So this is a spec for the backend to implement in `apps/api/src/scripts/seed-phase0.ts`
(idempotent find-or-create, per `CLAUDE.md`), **not** something customer-portal seeds.

## A. Purge the test data (one-off)
Delete only these demo-junk rows (confirm ids against the DB first; do not touch real data):

```sql
-- categories / services / packages created while testing
DELETE FROM packages  WHERE name IN ('aqw','QQ','ss') OR price = 3000000;
DELETE FROM services  WHERE name IN ('aqw','QQ','ss');
DELETE FROM categories WHERE name_en IN ('aqw','QQ','ss') OR name_es IN ('aqw','QQ','ss');
```
Package↔service links in `package_services` cascade from the package delete if the FK is
`ON DELETE CASCADE`; otherwise delete those join rows first. Add a `scripts/purge-test-data.ts`
that runs these as a transaction and logs the affected counts.

## B. Idempotent demo seed (find-or-create)
All money in **MXN**. Bilingual `name_en/name_es`, `description_en/description_es`. Match on the
unique key (`categories.slug`, `services.name`, `packages.name`) with `findOne` before insert —
running twice must be a no-op (exit 0), fixing the current `UQ_services_name` crash.

### Categories (slug · EN · ES)
| slug | name_en | name_es |
|---|---|---|
| permits | Permits & Licensing | Permisos y Licencias |
| environmental | Environmental Compliance | Cumplimiento Ambiental |
| safety | Workplace Safety | Seguridad Laboral |
| fiscal | Fiscal & Legal | Fiscal y Legal |

### Services (category · EN / ES · basePrice MXN)
| category | name_en / name_es | basePrice |
|---|---|---|
| permits | Construction Permit Filing / Trámite de Licencia de Construcción | 8500 |
| permits | Land Use Certificate / Certificado de Uso de Suelo | 6200 |
| environmental | Environmental Impact Statement / Manifestación de Impacto Ambiental | 24000 |
| environmental | Water Discharge Permit / Permiso de Descarga de Agua | 12500 |
| safety | STPS Safety Program / Programa de Seguridad STPS | 9800 |
| safety | Civil Protection Plan / Programa Interno de Protección Civil | 14500 |
| fiscal | Business Registration (SAT/RFC) / Alta ante el SAT (RFC) | 3500 |
| fiscal | Municipal Operating License / Licencia de Funcionamiento Municipal | 5400 |

### Packages (price MXN · durationDays · isFeatured · category · services)
| name_en / name_es | price | days | featured | category | includes |
|---|---|---|---|---|---|
| Starter Compliance / Cumplimiento Básico | 18000 | 180 | no | fiscal | SAT/RFC, Municipal License |
| Construction Launch / Arranque de Obra | 42000 | 365 | **yes** | permits | Construction Permit, Land Use, Civil Protection |
| Full Environmental / Ambiental Integral | 68000 | 365 | no | environmental | Env. Impact, Water Discharge, STPS Program |

Each package needs `categoryId` (required per decision 2026-10-20) and its `package_services`
rows. Set 1–2 `isFeatured` so the home "featured packages" row renders. Add short bilingual
descriptions for each row.

## C. Verify (backend)
`npm run db:reset && npm run db:seed` twice → second run exits 0, no `UQ_*` violation; then
`npm run smoke`. The public site will then show real categories/services/packages with no junk.
