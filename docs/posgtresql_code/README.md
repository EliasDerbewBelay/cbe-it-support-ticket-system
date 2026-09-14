# PostgreSQL Code & Schema Scripts

> **Database:** `cbe-it-support-system-db`  
> **RDBMS Engine:** PostgreSQL 14+  
> **Tool:** pgAdmin 4 Query Tool  

This directory contains the executable PostgreSQL SQL scripts for the CBE IT Support Ticket Management System.

---

## Directory Contents

| File | Purpose | Recommended Use |
| :--- | :--- | :--- |
| **[`schema.sql`](file:///home/elias-derbew/Projects/cbe-it-support-ticket-system/docs/posgtresql_code/schema.sql)** | Contains the pure DDL schema (extensions, sequences, enums, tables, foreign keys, check constraints, indexes, triggers). | Run this to create the empty database structure without inserting test records. |
| **[`seed.sql`](file:///home/elias-derbew/Projects/cbe-it-support-ticket-system/docs/posgtresql_code/seed.sql)** | Contains initial reference data (departments, categories, and sample development accounts). | Run this after `schema.sql` to populate reference data. |
| **[`full_schema.sql`](file:///home/elias-derbew/Projects/cbe-it-support-ticket-system/docs/posgtresql_code/full_schema.sql)** | Complete combined script (DDL Schema + Reference Seed Data). | **Recommended for fast setup:** Run this single file in pgAdmin 4 to initialize and seed everything in one step. |

---

## How to Execute in pgAdmin 4

1. Open **pgAdmin 4** and connect to your local PostgreSQL server.
2. In the Object Explorer tree, expand **Databases**.
3. Right-click on `cbe-it-support-system-db` and select **Query Tool**.
4. Open or copy the contents of **[`full_schema.sql`](file:///home/elias-derbew/Projects/cbe-it-support-ticket-system/docs/posgtresql_code/full_schema.sql)** into the Query Editor.
5. Press **`F5`** (or click the Play/Execute button).
6. Right-click on **Schemas** → **public** and select **Refresh**.
7. Confirm that all 7 tables, 3 enums, 1 sequence, and 1 trigger function appear under `public`.
