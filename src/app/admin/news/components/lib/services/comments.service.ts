// max-hub/src/app/admin/comments/components/lib/services/comments.service.ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateComment = async (commentId: string, updatedComment: any) => {
  const { error } = await supabase
    .from("comments")
    .update(updatedComment)
    .eq("id", commentId);

  if (error) {
    throw new Error(error.message);
  }
};