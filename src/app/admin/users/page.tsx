"use client";

import { SparklesIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_ADRESS } from "@/lib/api/config";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
      router.push("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          `${API_ADRESS}/people`,
          { headers: { Accept: 'application/json' } }
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        alert("Не удалось загрузить пользователей");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  if (loading) return <div>Загрузка...</div>;

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
            <div className="flex items-center">
              <Link href="/cabinet" className="text-gray-600 hover:text-gray-900">
                Назад в кабинет
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Управление пользователями</h1>
            <div className="flex items-center">
              <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-gray-600">Администратор</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "volunteer" ? 'bg-green-100 text-green-800' : 
                        user.role === 1 ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role === "volunteer" ? 'Волонтер' : 
                         user.role === 1 ? 'Организация' : 
                         'Администратор'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/admin/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-3">
                        Изменить
                      </Link>
                      <button className="text-red-600 hover:text-red-900">Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}