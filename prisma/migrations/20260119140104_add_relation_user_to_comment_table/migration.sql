-- CreateIndex
CREATE INDEX "idx_comment_user_id" ON "comment"("user_id");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "fk_comment_user_id" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
