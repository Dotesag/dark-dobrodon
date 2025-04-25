"use client";
import { SparklesIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { API_ADRESS } from "@/lib/api/config";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: number;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    new_full_name: "",
    new_email: "",
    new_role: 2
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      router.push("/");
      return;
    }

    const fetchUserData = async () => {
      try {
        const resolvedParams = await params;
        const { data } = await axios.get(`${API_ADRESS}/people?person_id=${resolvedParams.id}`);
        
        if (!data || !data[0]) {
          throw new Error("Пользователь не найден");
        }

        const userData = data[0];
        setUser(userData);
        setFormData({
          new_full_name: userData.full_name || "",
          new_email: userData.email || "",
          new_role: userData.role || 2
        });

      } catch (error) {
        console.error("Ошибка загрузки:", error);
        setError("Не удалось загрузить данные пользователя");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "new_role" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const resolvedParams = await params;
      const response = await axios.post(
        `${API_ADRESS}/update-person`,
        {
          id: Number(resolvedParams.id),
          ...formData
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log("Успешный ответ:", response.data);
      alert(response.data.message || "Изменения сохранены успешно");
      router.push("/admin/users");
      
    } catch (error) {
      const axiosError = error as AxiosError<{ detail?: string }>;
      let errorMessage = "Неизвестная ошибка при сохранении";
      
      if (axiosError.response) {
        errorMessage = axiosError.response.data?.detail || `Ошибка сервера: ${axiosError.response.status}`;
      } else if (axiosError.request) {
        errorMessage = "Сервер не отвечает. Проверьте подключение к интернету.";
      } else {
        errorMessage = axiosError.message || "Ошибка при отправке запроса";
      }

      console.error("Полная информация об ошибке:", {
        error: axiosError,
        message: errorMessage,
        config: axiosError.config
      });
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!user) return <div className="text-center py-8">Пользователь не найден</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-2xl font-bold text-blue-600">
                <SparklesIcon className="h-8 w-8 mr-2" />
                Добродон
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900">
                Назад к списку
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Редактирование пользователя</h1>
            <div className="flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-gray-600">Администратор</span>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="new_full_name" className="block text-sm font-medium text-gray-700">
                Имя
              </label>
              <input
                type="text"
                name="new_full_name"
                id="new_full_name"
                value={formData.new_full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="new_email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="new_email"
                id="new_email"
                value={formData.new_email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="new_role" className="block text-sm font-medium text-gray-700">
                Роль
              </label>
              <select
                id="new_role"
                name="new_role"
                value={formData.new_role}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value={2}>Волонтер</option>
                <option value={1}>Организация</option>
                <option value={3}>Администратор</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <Link
                href="/admin/users"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Отмена
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}