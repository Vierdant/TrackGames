WITH duplicate_names AS (
    SELECT
        id,
        name,
        ROW_NUMBER() OVER (PARTITION BY name ORDER BY "createdAt", id) AS duplicate_number
    FROM "User"
    WHERE name IS NOT NULL
)
UPDATE "User"
SET name = LEFT(duplicate_names.name, 17) || '-' || SUBSTRING("User".id, 1, 6)
FROM duplicate_names
WHERE "User".id = duplicate_names.id
  AND duplicate_names.duplicate_number > 1;

CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
