-- CreateTable
CREATE TABLE "user" (
    "user_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NULL,
    "profile_picture" VARCHAR(225) NULL,
    "bio" VARCHAR(255) NULL,
    CONSTRAINT "user_email_key" UNIQUE ("email"),
    PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "post" (
    "post_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "media_url" TEXT NOT NULL,
    "media_path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "comment" (
    "comment_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "post_id" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "like" (
    "like_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "post_id" VARCHAR(255) NOT NULL,
    PRIMARY KEY ("like_id")
);

-- CreateTable
CREATE TABLE "follower" (
    "follower_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "follower_user_id" VARCHAR(255) NOT NULL,
    PRIMARY KEY ("follower_id")
);

-- AddForeignKey
ALTER TABLE "post" 
ADD CONSTRAINT "post_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" 
ADD CONSTRAINT "comment_post_id_fkey" 
FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "like" 
ADD CONSTRAINT "like_post_id_fkey" 
FOREIGN KEY ("post_id") REFERENCES "post"("post_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follower" 
ADD CONSTRAINT "follower_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follower" 
ADD CONSTRAINT "follower_follower_user_id_fkey" 
FOREIGN KEY ("follower_user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
