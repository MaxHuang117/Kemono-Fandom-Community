// max-hub/src/app/admin/news/components/lib/types/news.ts
import { Tables, TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

export type News = Tables<"news">;
export type NewsInsert = TablesInsert<"news">;
export type NewsUpdate = TablesUpdate<"news">;