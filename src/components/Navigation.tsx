import React from 'react';
import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type NavigationProps = {
  user?: User | null;
};

export default function Navigation({ user }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary-600 dark:text-primary-500 font-semibold text-xl">Food Diary</span>
            </a>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            <div className="flex space-x-4">
              {user ? (
                <>
                  <a href="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</a>
                  <a href="/meals" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Comidas</a>
                  <a href="/symptoms" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Síntomas</a>
                  <a href="/analysis" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Análisis</a>
                  
                  {/* User menu */}
                  <div className="ml-3 relative">
                    <div>
                      <button 
                        type="button" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)} 
                        className="flex text-sm rounded-full focus:outline-none"
                      >
                        {user.image ? (
                          <img className="h-8 w-8 rounded-full" src={user.image} alt={user.name} />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </button>
                    </div>
                    
                    {isMenuOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                          </div>
                          <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Perfil
                          </a>
                          <button
                            onClick={toggleDarkMode}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                          </button>
                          <form action="/" method="get" className="block">
                            <button type="submit" className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                              Cerrar sesión
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <a href="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Iniciar sesión</a>
                  <a href="/register" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded">Registrarse</a>
                  <button
                    onClick={toggleDarkMode}
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Abrir menú</span>
              <svg 
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg 
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <a href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</a>
              <a href="/meals" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Comidas</a>
              <a href="/symptoms" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Síntomas</a>
              <a href="/analysis" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Análisis</a>
            </>
          ) : (
            <>
              <a href="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">Iniciar sesión</a>
              <a href="/register" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700 my-2">Registrarse</a>
            </>
          )}
          <button
            onClick={toggleDarkMode}
            className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          </button>
        </div>
        
        {user && (
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              {user.image ? (
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full" src={user.image} alt={user.name} />
                </div>
              ) : (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="ml-3">
                <div className="text-base font-medium">{user.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <a href="/profile" className="block px-4 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                Perfil
              </a>
              <form action="/" method="get" className="block">
                <button type="submit" className="w-full text-left px-4 py-2 text-base font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}