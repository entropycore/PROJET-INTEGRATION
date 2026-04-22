-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'PROFESSOR', 'ADMINISTRATOR', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING');

-- CreateTable
CREATE TABLE "users" (
    "id_user" TEXT NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" VARCHAR(30),
    "profile_picture" TEXT,
    "account_status" "AccountStatus" NOT NULL DEFAULT 'PENDING',
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "students" (
    "id_student" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "apogee_code" VARCHAR(50),
    "cne" VARCHAR(50),
    "major" VARCHAR(120) NOT NULL,
    "level" VARCHAR(50) NOT NULL,
    "birth_date" DATE,
    "address" TEXT,
    "city" VARCHAR(100),
    "bio" TEXT,
    "career_objective" TEXT,
    "linkedin_url" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id_student")
);

-- CreateTable
CREATE TABLE "professors" (
    "id_professor" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_id" VARCHAR(50),
    "grade" VARCHAR(100),
    "specialty" VARCHAR(150),
    "department" VARCHAR(150),

    CONSTRAINT "professors_pkey" PRIMARY KEY ("id_professor")
);

-- CreateTable
CREATE TABLE "administrators" (
    "id_administrator" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "employee_id" VARCHAR(50),
    "department" VARCHAR(120),
    "admin_level" VARCHAR(50),

    CONSTRAINT "administrators_pkey" PRIMARY KEY ("id_administrator")
);

-- CreateTable
CREATE TABLE "professionals" (
    "id_professional" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company" VARCHAR(150),
    "job_title" VARCHAR(120),
    "sector" VARCHAR(120),
    "bio" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id_professional")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_apogee_code_key" ON "students"("apogee_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_cne_key" ON "students"("cne");

-- CreateIndex
CREATE UNIQUE INDEX "professors_user_id_key" ON "professors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "professors_employee_id_key" ON "professors"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "administrators_user_id_key" ON "administrators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "administrators_employee_id_key" ON "administrators"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_user_id_key" ON "professionals"("user_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professors" ADD CONSTRAINT "professors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrators" ADD CONSTRAINT "administrators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
