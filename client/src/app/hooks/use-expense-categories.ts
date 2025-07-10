import { useState, useEffect } from 'react';

export interface Category {
  categoryId: string;
  name: string;
}

export const useExpenseCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryIdToName, setCategoryIdToName] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
    fetch(`${API_URL}/api/expenses/categories`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data: Category[]) => {
        setCategories(data);
        const map: Record<string, string> = {};
        data.forEach(cat => {
          if (cat.categoryId && cat.name) {
            map[cat.categoryId] = cat.name;
          }
        });
        setCategoryIdToName(map);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch expense categories:", error);
        setIsLoading(false);
      });
  }, []);

  return { categories, categoryIdToName, isLoading };
}; 