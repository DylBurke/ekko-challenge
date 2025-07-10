'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  spiritAnimal: string;
}

interface UserSearchProps {
  onUserSelect: (user: User) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSearch({ onUserSelect, placeholder = "Search users by name or email...", className = "" }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search function
  const searchUsers = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const result = await response.json();

      if (result.success) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Search failed');
        setUsers([]);
      }
    } catch {
      setError('Failed to search users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(searchUsers, 300),
    []
  );

  // Trigger search when query changes
  useEffect(() => {
    if (query.trim()) {
      debouncedSearch(query.trim());
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [query, debouncedSearch]);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setQuery(`${user.name} - ${user.role}`);
    setIsOpen(false);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur (with delay to allow clicking on results)
  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (query.length >= 2 || error) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {error && (
            <div className="p-3 text-red-600 text-sm border-b">
              {error}
            </div>
          )}
          
          {!error && users.length === 0 && !loading && query.length >= 2 && (
            <div className="p-3 text-gray-500 text-sm">
              No users found matching &quot;{query}&quot;
            </div>
          )}
          
          {!error && users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.email} • {user.role}
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {user.spiritAnimal}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Debounce utility function
function debounce(
  func: (searchQuery: string) => Promise<void>,
  wait: number
): (searchQuery: string) => void {
  let timeout: NodeJS.Timeout;
  return (searchQuery: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(searchQuery), wait);
  };
}