// max-hub/src/app/admin/news/components/lib/services/news.service.ts
import { createClient } from "@/lib/supabase/client";
import { NewsInsert, NewsUpdate } from "../types/news";

const supabase = createClient();

export const getNews = async () => {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const createNews = async (news: NewsInsert) => {
  const { data, error } = await supabase
    .from("news")
    .insert(news)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const updateNews = async (newsId: number, updatedNews: NewsUpdate) => {
  const { data, error } = await supabase
    .from("news")
    .update(updatedNews)
    .eq("id", newsId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const deleteNews = async (newsId: number) => {
  const { error } = await supabase
    .from("news")
    .delete()
    .eq("id", newsId);

  if (error) throw new Error(error.message);
};