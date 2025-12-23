BEGIN;

ALTER TABLE parentes
ADD COLUMN IF NOT EXISTS android_id VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS parentes_android_id_unique
ON parentes (android_id)
WHERE android_id IS NOT NULL;

COMMIT;
