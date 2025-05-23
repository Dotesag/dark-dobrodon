"use client";
import { SparklesIcon, TrophyIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ADRESS } from '@/lib/api/config';

type UserRole = "volunteer" | "organization" | "admin";

// Определение типа данных для истории бонусов
interface BonusHistoryType {
  id: number;
  serviceName: string;
  date: string;
  status: string;
  pointsSpent: number;
}

function VolunteerCabinet() {
  // Статические данные для доступных услуг
  const volunteerData = {
    level: 2,
    availableBonuses: [
      {
        level: 1,
        services: [
          { id: 1, name: "Скидка 10% в кафе", description: "Скидка на все позиции меню" },
          { id: 2, name: "Бесплатный вход в музей", description: "Разовый бесплатный вход" },
        ],
      },
      {
        level: 2,
        services: [
          { id: 3, name: "Скидка 15% на курсы", description: "Скидка на все образовательные программы" },
          { id: 4, name: "Бесплатная консультация", description: "Консультация специалиста" },
        ],
      },
      {
        level: 3,
        services: [
          { id: 5, name: "VIP-доступ", description: "Приоритетное обслуживание" },
          { id: 6, name: "Персональный менеджер", description: "Индивидуальное сопровождение" },
        ],
      },
    ],
  };

  // Состояния для хранения данных
  const [bonusHistory, setBonusHistory] = useState<BonusHistoryType[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Функция для выполнения GET-запроса
  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = localStorage.getItem("volunteer_email");
        if (!email) {
          throw new Error("Email не найден в localStorage");
        }

        const response = await fetch(
          `${API_ADRESS}/user-qr-history?email=${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data = await response.json();
        const formattedData = transformData(data);
        setBonusHistory(formattedData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция для преобразования данных из API в нужный формат
  const transformData = (apiData: any): BonusHistoryType[] => {
    return apiData.map((item: any) => ({
      id: item.id,
      serviceName: `${item.used_location}`,
      date: item.created_at,
      status: item.used ? "Использовано" : "Не использовано",
      pointsSpent: item.rating * 10, // Пример расчета потраченных баллов
    }));
  };

  const handleGenerateQR = async () => {
    try {
      const qrData = 'https://github.com/dobrodon/front-dobrodon/';
      router.push(`/qr-code?data=${encodeURIComponent(qrData)}`);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };


  // Получаем доступные услуги для текущего уровня
  const availableServices = volunteerData.availableBonuses
    .filter((bonus) => bonus.level <= volunteerData.level)
    .flatMap((bonus) => bonus.services);

  // Отображение состояния загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Отображение ошибки
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Блок с доступными услугами */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Личный кабинет волонтера</h1>
          <button 
            onClick={handleGenerateQR}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Создать QR-код
          </button>
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-yellow-500 mr-2" />
            <span className="text-lg text-gray-600">Уровень бонусов: {volunteerData.level}</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Доступные услуги</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableServices.map((service) => (
            <div key={service.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-800 mb-2">{service.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Блок с историей использования бонусов */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">История использования бонусов</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden text-left">
            <thead className="bg-blue-50">
              <tr>
                <th className="w-1/3 px-6 py-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Организация</th>
                <th className="w-1/3 px-6 py-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Дата</th>
                <th className="w-1/3 px-6 py-3 text-xs font-semibold text-blue-700 uppercase tracking-wider">Статус</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bonusHistory?.map((bonus) => (
                <tr key={bonus.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="w-1/3 px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bonus.serviceName}</td>
                  <td className="w-1/3 px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bonus.date}</td>
                  <td className="w-1/3 px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-sm leading-5 font-medium rounded-full ${
                        bonus.status === "Использовано" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {bonus.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Компонент для организации
function OrganizationCabinet() {
  const router = useRouter();
  useEffect(() => {
    router.push("/organization/dashboard");
  }, [router]);
  return null;
}

// Компонент для администратора
function AdminCabinet() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Панель администратора</h1>
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center">
          <ShieldCheckIcon className="h-8 w-8 text-green-500 mr-2" />
          <span className="text-lg text-gray-600">Уровень доступа: Администратор</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">Управление пользователями</h3>
          <p className="text-sm text-gray-600 mb-3">Управление аккаунтами и ролями</p>
          <Link
            href="/admin/users"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Перейти
          </Link>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">Аналитика</h3>
          <p className="text-sm text-gray-600 mb-3">Системная статистика и отчеты</p>
          <Link
            href="/admin/analytics"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Перейти
          </Link>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-2">Импорт данных</h3>
          <p className="text-sm text-gray-600 mb-3">Загрузка CSV-файлов с данными пользователей</p>
          <Link
            href="/admin/import"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Перейти
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CabinetPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") as UserRole | null;
    if (storedRole && ["volunteer", "organization", "admin"].includes(storedRole)) {
      setUserRole(storedRole);
    } else {
      router.push("/");
    }
  }, []);

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <a href="/" className="flex items-center text-2xl font-bold text-blue-600">
                <SparklesIcon className="h-8 w-8 mr-2" />
                Добродон
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === "volunteer" && <VolunteerCabinet />}
        {userRole === "organization" && <OrganizationCabinet />}
        {userRole === "admin" && <AdminCabinet />}
      </main>
    </div>
  );
}