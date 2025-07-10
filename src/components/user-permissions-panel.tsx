"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Users, Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface UserPermissionsPanelProps {
  user: User | null;
  permissions: Permission[];
  loading: boolean;
}

// Level-based color coding
const getLevelStyling = (level: number) => {
  switch (level) {
    case 0: // Company
      return {
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        background: "bg-purple-50/50 border-purple-200",
        icon: "text-purple-600"
      };
    case 1: // Division
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        background: "bg-blue-50/50 border-blue-200",
        icon: "text-blue-600"
      };
    case 2: // Department
      return {
        badge: "bg-green-50 text-green-700 border-green-200",
        background: "bg-green-50/50 border-green-200",
        icon: "text-green-600"
      };
    case 3: // Team
      return {
        badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
        background: "bg-yellow-50/50 border-yellow-200",
        icon: "text-yellow-600"
      };
    default:
      return {
        badge: "bg-gray-50 text-gray-700 border-gray-200",
        background: "bg-gray-50/50 border-gray-200",
        icon: "text-gray-600"
      };
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function UserPermissionsPanel({ user, permissions, loading }: UserPermissionsPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading permissions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No user selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary statistics
  const levelDistribution = permissions.reduce((acc, permission) => {
    const levelName = permission.structure.levelName;
    acc[levelName] = (acc[levelName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueLevels = [...new Set(permissions.map(p => p.structure.level))].sort();
  const hasMultiplePermissions = permissions.length > 1;
  const hasCrossFunctionalAccess = permissions.length > 1 && 
    new Set(permissions.map(p => p.structure.path.split('/')[1])).size > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Information Display */}
        <div className="p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-sm font-medium text-foreground">{user.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {user.spiritAnimal}
              </Badge>
            </div>
          </div>
        </div>

        {/* Permission Summary */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Permission Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Permissions</p>
              <p className="text-xl font-bold text-foreground">{permissions.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Access Levels</p>
              <p className="text-xl font-bold text-foreground">{uniqueLevels.length}</p>
            </div>
          </div>
          
          {/* Level Distribution */}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Hierarchy Levels:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(levelDistribution).map(([levelName, count]) => (
                <Badge 
                  key={levelName} 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    getLevelStyling(
                      levelName === "Company" ? 0 : 
                      levelName === "Division" ? 1 : 
                      levelName === "Department" ? 2 : 
                      levelName === "Team" ? 3 : 4
                    ).badge
                  )}
                >
                  {levelName}: {count}
                </Badge>
              ))}
            </div>
          </div>

          {/* Special Indicators */}
          {hasMultiplePermissions && (
            <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Multiple Permissions
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {hasCrossFunctionalAccess ? 
                  "Cross-functional access across different divisions" : 
                  "Multiple permissions within organisational scope"
                }
              </p>
            </div>
          )}
        </div>

        {/* Permissions List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Permission Details
          </h4>
          
          {permissions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No permissions found for this user</p>
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map((permission) => {
                const styling = getLevelStyling(permission.structure.level);
                return (
                  <div
                    key={permission.permissionId}
                    className={cn(
                      "p-4 rounded-lg border transition-all hover:shadow-sm",
                      styling.background
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-foreground">
                            {permission.structure.name}
                          </h5>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", styling.badge)}
                          >
                            {permission.structure.levelName}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {permission.structure.path}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Assigned</p>
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(permission.assignedAt)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(permission.assignedAt)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Permission Path Breadcrumb */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {permission.structure.path.split('/').map((segment, index, array) => (
                        <span key={index} className="flex items-center gap-1">
                          <span className="px-2 py-1 bg-background/80 rounded">
                            {segment}
                          </span>
                          {index < array.length - 1 && (
                            <span className="text-muted-foreground/50">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 