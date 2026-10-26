// max-hub/src/app/admin/news/components/NewsAdminPanel.tsx
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { deleteNewsAction, saveNewsAction } from "@/app/admin/news/actions/newsAction";
import { News } from "@/app/admin/news/components/lib/types/news";
import NewsForm from "@/app/admin/news/components/NewsForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

const NewsAdminPanel: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await fetchNewsFromAPI(); // Implement this function to fetch news from Supabase
      if (!error) {
        setNews(data);
      }
    };

    fetchNews();
  }, []);

  const fetchNewsFromAPI = async () => {
    const { data, error } = await supabase.from("news").select("*");
    if (error) {
      throw error;
    }
    return { data, error };
  };

  const handleDelete = async (newsId: number) => {
    const result = await deleteNewsAction(newsId);
    if (result.success) {
      setNews(prevNews => prevNews.filter(n => n.id !== newsId));
    }
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setEditMode(true);
  };

  const handleSave = async (updatedNews: News) => {
    const formData = new FormData();
    Object.entries(updatedNews).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    const result = await saveNewsAction(formData);
    if (result.success) {
      setNews(prevNews =>
        prevNews.map(n => (n.id === updatedNews.id ? updatedNews : n))
      );
      setEditMode(false);
    }
  };

  return (
    <div>
      <h2>News Manager</h2>
      <ul>
        {news.map(n => (
          <li key={n.id}>
            {n.title}
            <button onClick={() => handleDelete(n.id)}>Delete</button>
            <button onClick={() => handleEdit(n)}>Edit</button>
          </li>
        ))}
      </ul>
      {editMode && (
        <NewsForm
          news={selectedNews}
          onSave={(news) => handleSave(news as News)}
          onCancel={() => setEditMode(false)}
        />
      )}
    </div>
  );
};

export default NewsAdminPanel;