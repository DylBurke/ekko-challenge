"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, Users } from "lucide-react";
import Link from "next/link";
import { UserPermissionsPanel } from "@/components/user-permissions-panel";
import { AccessibleUsersPanel } from "@/components/accessible-users-panel";

// Helper function to determine user level based on role
const getUserLevelInfo = (role: string) => {
  const roleMap: Record<string, { level: string; levelColor: string }> = {
    'Chief Executive Officer': {
      level: 'Company',
      levelColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    'HR Manager': {
      level: 'Company',
      levelColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    'Engineering Director': {
      level: 'Division',
      levelColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    'Sales Director': {
      level: 'Division',
      levelColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    'Marketing Director': {
      level: 'Division',
      levelColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    'Frontend Manager': {
      level: 'Department',
      levelColor: 'bg-green-50 text-green-700 border-green-200'
    },
    'Backend Manager': {
      level: 'Department',
      levelColor: 'bg-green-50 text-green-700 border-green-200'
    },
    'Enterprise Sales Manager': {
      level: 'Department',
      levelColor: 'bg-green-50 text-green-700 border-green-200'
    },
    'Sales Manager': {
      level: 'Department',
      levelColor: 'bg-green-50 text-green-700 border-green-200'
    }
  };

  // Default for individual contributors
  return roleMap[role] || {
    level: 'Individual',
    levelColor: 'bg-gray-50 text-gray-700 border-gray-200'
  };
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  spiritAnimal: string;
}

interface Permission {
  permissionId: string;
  structure: {
    id: string;
    name: string;
    path: string;
    level: number;
    levelName: string;
    parentId: string | null;
  };
  assignedAt: string;
}

interface AccessibleUsersResponse {
  success: boolean;
  data: {
    userId: string;
    userPermissions: unknown[];
    accessibleStructures: unknown[];
    accessibleUsers: User[];
    totalUsers: number;
    totalStructures: number;
  };
  message?: string;
}

interface PermissionsResponse {
  success: boolean;
  data: {
    user: User;
    permissions: Permission[];
    summary: unknown;
    permissionsByLevel: unknown;
  };
  message?: string;
}

export default function DemoPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [accessibleUsers, setAccessibleUsers] = useState<User[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedUser = allUsers.find(user => user.id === selectedUserId);

  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const startTime = Date.now();

      const [accessibleResponse, permissionsResponse] = await Promise.all([
        fetch(`/api/users/${userId}/accessible-users`),
        fetch(`/api/users/${userId}/permissions`)
      ]);

      const endTime = Date.now();
      setResponseTime(endTime - startTime);

      if (!accessibleResponse.ok || !permissionsResponse.ok) {
        throw new Error(`API Error: ${accessibleResponse.status} / ${permissionsResponse.status}`);
      }

      const accessibleData: AccessibleUsersResponse = await accessibleResponse.json();
      const permissionsData: PermissionsResponse = await permissionsResponse.json();

      if (accessibleData.success && permissionsData.success) {
        setAccessibleUsers(accessibleData.data.accessibleUsers || []);
        setUserPermissions(permissionsData.data.permissions || []);
        setCurrentUser(permissionsData.data.user || null);
      } else {
        throw new Error(accessibleData.message || permissionsData.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setAccessibleUsers([]);
      setUserPermissions([]);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users on component mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await fetch('/api/users');
        const result = await response.json();
        
        if (result.success) {
          setAllUsers(result.data);
          // Auto-select first user
          if (result.data.length > 0) {
            setSelectedUserId(result.data[0].id);
          }
        } else {
          setError('Failed to load users');
        }
             } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to fetch users');
       } finally {
        setUsersLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserData(selectedUserId);
    }
  }, [selectedUserId]);

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Hierarchical Permission System Demo</h1>
                <p className="text-sm text-muted-foreground">Gekko Pty Ltd - Organizational Access Control Demonstration</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/hierarchy">Hierarchy</Link>
              </Button>
              <Button variant="default" size="sm">User Demo</Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* User Switcher Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demo User Switcher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Selection */}
              <div>
                <label htmlFor="user-select" className="block text-sm font-medium mb-2">
                  Select Demo User:
                </label>
                <select
                  id="user-select"
                  value={selectedUserId}
                  onChange={(e) => handleUserChange(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  disabled={usersLoading}
                >
                  {usersLoading ? (
                    <option>Loading users...</option>
                  ) : (
                    allUsers.map((user) => {
                      const levelInfo = getUserLevelInfo(user.role);
                      return (
                        <option key={user.id} value={user.id}>
                          {user.name} - {user.role} ({levelInfo.level})
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              {/* Performance Metrics */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Response Time:</span>
                  <Badge variant="outline">
                    {loading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      responseTime ? `${responseTime}ms` : 'N/A'
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Selected User Info */}
            {selectedUser && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{selectedUser.name}</h3>
                  <Badge variant="outline" className={getUserLevelInfo(selectedUser.role).levelColor}>
                    {getUserLevelInfo(selectedUser.role).level} Level
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{selectedUser.role}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Spirit Animal:</span>
                  <Badge variant="secondary">{selectedUser.spiritAnimal}</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <span className="font-medium">Error:</span>
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

                {/* Two-Column Grid Layout for Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* User Permissions Panel */}
          <UserPermissionsPanel 
            user={currentUser}
            permissions={userPermissions}
            loading={loading}
          />

          {/* Accessible Users Panel */}
          <AccessibleUsersPanel 
            users={accessibleUsers}
            loading={loading}
            currentUserName={currentUser?.name}
          />
        </div>
      </main>
    </div>
  );
} 