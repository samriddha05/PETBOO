-- ============================================================
-- Medical Records Schema Migration
-- Run this in your PostgreSQL database (psql or Supabase SQL Editor)
-- ============================================================

-- =========================
-- MedicalRecord Table
-- =========================

CREATE TABLE IF NOT EXISTS "MedicalRecord" (
    "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "petId"             UUID NOT NULL,
    "visitDate"         DATE NOT NULL,
    "doctorName"        TEXT,
    "clinicName"        TEXT,
    "symptoms"          TEXT,
    "diagnosis"         TEXT,
    "prescriptionNotes" TEXT,
    "medicines"         TEXT,
    "additionalNotes"   TEXT,
    "nextVisitDate"     DATE,
    "createdAt"         TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "MedicalRecord_petId_fkey"
    FOREIGN KEY ("petId")
    REFERENCES "Pet"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- =========================
-- MedicalFile Table
-- =========================

CREATE TABLE IF NOT EXISTS "MedicalFile" (
    "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "recordId"   UUID NOT NULL,
    "fileName"   TEXT NOT NULL,
    "fileType"   TEXT NOT NULL,
    "fileUrl"    TEXT NOT NULL,
    "fileSize"   INTEGER,
    "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "MedicalFile_recordId_fkey"
    FOREIGN KEY ("recordId")
    REFERENCES "MedicalRecord"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- =========================
-- Vaccination Table
-- =========================

CREATE TABLE IF NOT EXISTS "Vaccination" (
    "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "petId"            UUID NOT NULL,
    "vaccineName"      TEXT NOT NULL,
    "vaccinationDate"  DATE NOT NULL,
    "nextDueDate"      DATE,
    "doctorName"       TEXT,
    "clinicName"       TEXT,
    "batchNumber"      TEXT,
    "notes"            TEXT,
    "createdAt"        TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT "Vaccination_petId_fkey"
    FOREIGN KEY ("petId")
    REFERENCES "Pet"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- =========================
-- Indexes
-- =========================

CREATE INDEX IF NOT EXISTS "MedicalRecord_petId_idx"  ON "MedicalRecord"("petId");
CREATE INDEX IF NOT EXISTS "MedicalFile_recordId_idx" ON "MedicalFile"("recordId");
CREATE INDEX IF NOT EXISTS "Vaccination_petId_idx"    ON "Vaccination"("petId");
CREATE INDEX IF NOT EXISTS "MedicalRecord_visitDate_idx" ON "MedicalRecord"("visitDate" DESC);
CREATE INDEX IF NOT EXISTS "Vaccination_vaccinationDate_idx" ON "Vaccination"("vaccinationDate" DESC);
