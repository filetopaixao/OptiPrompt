-- Renomeia o valor do enum Provider de META para GROQ (preserva as linhas
-- existentes, ao contrário de um DROP + CREATE do enum).
ALTER TYPE "Provider" RENAME VALUE 'META' TO 'GROQ';
