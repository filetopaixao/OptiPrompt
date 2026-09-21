-- Remove o antigo plano interno "teste-gratis" (substituído pelo plano
-- "Gratuito", ver src/lib/plans/trial.ts). Qualquer usuário que ainda
-- referencie esse plano tem o FK "users_planId_fkey" em ON DELETE SET NULL,
-- então fica sem plano em vez de travar o delete.
DELETE FROM "plans" WHERE "slug" = 'teste-gratis';
