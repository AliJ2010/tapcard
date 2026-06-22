-- Drop old tables to ensure clean slate (cascades handle foreign keys)
DROP TABLE IF EXISTS "CustomLink" CASCADE;
DROP TABLE IF EXISTS "Tap" CASCADE;
DROP TABLE IF EXISTS "Profile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "cardName" TEXT NOT NULL DEFAULT 'My Card',
    "fullName" TEXT NOT NULL,
    "jobTitle" TEXT,
    "company" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "twitter" TEXT,
    "whatsapp" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "sectionOrder" TEXT NOT NULL DEFAULT 'contact,social,links',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomLink" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'link',
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "CustomLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tap" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Tap_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");
CREATE INDEX "Tap_profileId_idx" ON "Tap"("profileId");

ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomLink" ADD CONSTRAINT "CustomLink_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tap" ADD CONSTRAINT "Tap_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Re-seed admin user (password: demo1234)
INSERT INTO "User" ("id", "email", "password", "isAdmin", "emailVerified", "plan", "createdAt")
VALUES (
  'admin-seed-id-001',
  'ali@tapcard.app',
  '$2b$12$vrjEKRrxHp2VBPRfxTynJenDjB5Ov7WeWu4DUqPWsoV.bWHpJNwzu',
  true,
  true,
  'business',
  CURRENT_TIMESTAMP
);

INSERT INTO "Profile" ("id", "slug", "userId", "isDefault", "cardName", "fullName", "jobTitle", "company", "theme", "isPublic", "sectionOrder", "createdAt", "updatedAt")
VALUES (
  'profile-seed-id-001',
  'ali-jebai',
  'admin-seed-id-001',
  true,
  'My Card',
  'Ali Jebai',
  'Founder',
  'RelayCrd',
  'dark',
  true,
  'contact,social,links',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
