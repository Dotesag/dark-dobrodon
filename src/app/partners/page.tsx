"use client";
import { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import Link from "next/link";
import { SparklesIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { API_ADRESS } from "@/lib/api/config";
import { useRouter } from "next/navigation";

interface Organization {
  id: number;
  name: string;
  inn: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  category: string;
}

const categories = ["Все", "Питание", "Здоровье", "Одежда"];

export default function PartnersPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Все");
  const [userRole, setUserRole] = useState<string | null>(null);

  // Функция для получения организаций с учетом категории
  const fetchOrganizations = async (category: string) => {
    try {
      setIsLoading(true);
      const url = category === "Все" ? `${API_ADRESS}/organizations` : `${API_ADRESS}/organizations?category=${category}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Ошибка при загрузке организаций");
      }

      const data = await response.json();
      setOrganizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка при загрузке данных");
      console.error("Ошибка:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Вызов функции при монтировании компонента
  useEffect(() => {
    fetchOrganizations(selectedCategory);
  }, [selectedCategory]);

  // Дебаунс для поиска
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(term.toLowerCase()) &&
        (selectedCategory === "Все" || org.category === selectedCategory)
      );
      setOrganizations(filtered);
    }, 300),
    [selectedCategory, organizations]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // Обработчик изменения категории
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Получение роли пользователя из localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      setUserRole(role);
    }
  }, []);

  const isAuthorized = userRole === "volunteer" || userRole === "admin" || userRole === "organization";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <nav className="sticky top-0 bg-white shadow-sm z-50">
        {/* Навигация */}
      </nav>

      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Организации-партнёры
          </h1>

          <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm text-gray-600 hover:text-gray-800 font-medium transition duration-200"
            >
              ← Вернуться в главное меню
            </button>

          

          {/* Поиск и фильтрация */}
          <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Поиск по названию организации"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Список партнеров */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center mb-4 h-20">
                    <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {org.name}
                    </h2>
                  </div>
                  <div className="mb-4 h-24">
                    <p className="text-gray-600 line-clamp-3">{org.description}</p>
                  </div>
                  <div className="mb-4 h-8">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {org.category}
                    </span>
                  </div>
                  <div className="h-12">
                    <p className="text-gray-500 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="line-clamp-2">{org.address}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}