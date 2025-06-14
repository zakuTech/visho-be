CREATE TABLE user_otp (
  "otp_id" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "otp_code" VARCHAR(6) NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "verified" BOOLEAN NULL,
  PRIMARY KEY ("otp_id")
);
