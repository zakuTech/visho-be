-- CreateIndex
CREATE INDEX "idx_comment_post_id" ON "comment"("post_id");

-- CreateIndex
CREATE INDEX "idx_followers_follower_id" ON "follower"("follower_user_id");

-- CreateIndex
CREATE INDEX "idx_follower_user_id" ON "follower"("user_id");

-- CreateIndex
CREATE INDEX "idx_like_post_id" ON "like"("post_id");

-- CreateIndex
CREATE INDEX "idx_post_user_id" ON "post"("user_id");

-- RenameForeignKey
ALTER TABLE "comment" RENAME CONSTRAINT "comment_post_id_fkey" TO "fk_comment_post_id";

-- RenameForeignKey
ALTER TABLE "follower" RENAME CONSTRAINT "follower_follower_user_id_fkey" TO "followers_follower_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "post" RENAME CONSTRAINT "post_user_id_fkey" TO "fk_post_user_id";
