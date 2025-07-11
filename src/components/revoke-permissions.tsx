'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { UserMinus, Search, Trash2, AlertTriangle } from 'lucide-react';
import UserSearch from '@/components/user-search';

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

interface RevokePermissionsProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onAction: (action: string, details: string, status?: 'success' | 'error') => void;
}

export default function RevokePermissions({ onSuccess, onError, onAction }: RevokePermissionsProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setLoading(true);
    
    try {
      const response = await fetch(`/api/users/${user.id}/permissions`);
      const result = await response.json();
      
      if (result.success) {
        setUserPermissions(result.data.permissions || []);
      } else {
        setUserPermissions([]);
        onError(`Failed to load permissions for ${user.name}`);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      setUserPermissions([]);
      onError('Failed to load user permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePermission = async (permission: Permission) => {
    if (!selectedUser) return;
    
    setRevoking(permission.permissionId);
    
    try {
      const response = await fetch(
        `/api/users/${selectedUser.id}/permissions/${permission.permissionId}`,
        { method: 'DELETE' }
      );
      
      const result = await response.json();
      
      if (result.success) {
        const successMsg = `Revoked ${selectedUser.name}'s access to ${permission.structure.name}`;
        onSuccess(successMsg);
        onAction('Revoke Permission', successMsg);
        
        // Remove the permission from the local state
        setUserPermissions(prev => 
          prev.filter(p => p.permissionId !== permission.permissionId)
        );
      } else {
        const errorMsg = result.message || 'Failed to revoke permission';
        onError(errorMsg);
        onAction('Revoke Permission', `Failed: ${errorMsg}`, 'error');
      }
    } catch (error) {
      console.error('Error revoking permission:', error);
      const errorMsg = 'Network error occurred';
      onError(errorMsg);
      onAction('Revoke Permission', `Failed: ${errorMsg}`, 'error');
    } finally {
      setRevoking(null);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = {
      0: 'bg-purple-50 text-purple-700 border-purple-200',
      1: 'bg-blue-50 text-blue-700 border-blue-200', 
      2: 'bg-green-50 text-green-700 border-green-200',
      3: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserMinus className="h-5 w-5" />
          Revoke Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="user-search-revoke">Search User</Label>
          <UserSearch
            onUserSelect={handleUserSelect}
            placeholder="Search users to revoke permissions..."
            className="w-full"
          />
        </div>

        {selectedUser && (
          <div className="space-y-4">
            {/* Selected User Display */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                </div>
                <Badge variant="secondary">{selectedUser.spiritAnimal}</Badge>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading permissions...</p>
              </div>
            )}

            {/* Permissions List */}
            {!loading && (
              <div>
                <Label>Current Permissions ({userPermissions.length})</Label>
                
                {userPermissions.length === 0 ? (
                  <div className="text-center py-6 bg-muted/20 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.name} has no permissions assigned
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {userPermissions.map((permission) => (
                      <div
                        key={permission.permissionId}
                        className="flex items-center justify-between p-3 bg-background border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{permission.structure.name}</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getLevelColor(permission.structure.level)}`}
                            >
                              {permission.structure.levelName}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {permission.structure.path}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Assigned: {new Date(permission.assignedAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokePermission(permission)}
                          disabled={revoking === permission.permissionId}
                          className="ml-4"
                        >
                          {revoking === permission.permissionId ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Revoke
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!selectedUser && (
          <div className="text-center py-6 bg-muted/20 rounded-lg">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Search for a user to view and revoke their permissions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}