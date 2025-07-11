"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Building2, Star, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  spiritAnimal: string;
  structures?: Array<{
    id: string;
    name: string;
    path: string;
    level: number;
  }>;
}

interface AccessibleUsersPanelProps {
  users: User[];
  loading: boolean;
  currentUserName?: string;
}

// Level-based color coding (consistent with permissions panel)
const getLevelStyling = (level: number) => {
  switch (level) {
    case 0: // Company
      return {
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        background: "bg-purple-50/30",
        icon: "text-purple-600"
      };
    case 1: // Division
      return {
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        background: "bg-blue-50/30",
        icon: "text-blue-600"
      };
    case 2: // Department
      return {
        badge: "bg-green-50 text-green-700 border-green-200",
        background: "bg-green-50/30",
        icon: "text-green-600"
      };
    case 3: // Team
      return {
        badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
        background: "bg-yellow-50/30",
        icon: "text-yellow-600"
      };
    default:
      return {
        badge: "bg-gray-50 text-gray-700 border-gray-200",
        background: "bg-gray-50/30",
        icon: "text-gray-600"
      };
  }
};

const getLevelName = (level: number): string => {
  switch (level) {
    case 0: return "Company";
    case 1: return "Division";
    case 2: return "Department";
    case 3: return "Team";
    default: return `Level ${level}`;
  }
};

// Helper function to determine user's highest organizational level
const getUserHighestLevel = (user: User): number => {
  if (!user.structures || user.structures.length === 0) return 4; // Default to individual level
  return Math.min(...user.structures.map(s => s.level));
};

// Group users by their highest organizational level
const groupUsersByLevel = (users: User[]) => {
  const groups: Record<number, User[]> = {};
  
  users.forEach(user => {
    const level = getUserHighestLevel(user);
    if (!groups[level]) {
      groups[level] = [];
    }
    groups[level].push(user);
  });

  // Sort groups by level (0 = highest authority)
  const sortedLevels = Object.keys(groups)
    .map(Number)
    .sort((a, b) => a - b);

  return sortedLevels.map(level => ({
    level,
    levelName: getLevelName(level),
    users: groups[level].sort((a, b) => a.name.localeCompare(b.name)),
    styling: getLevelStyling(level)
  }));
};

export function AccessibleUsersPanel({ users, loading, currentUserName }: AccessibleUsersPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accessible Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading accessible users...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Accessible Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">No accessible users found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedUsers = groupUsersByLevel(users);
  const totalUsers = users.length;
  const totalLevels = groupedUsers.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Accessible Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Access Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Accessible Users</p>
              <p className="text-xl font-bold text-foreground">{totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organizational Levels</p>
              <p className="text-xl font-bold text-foreground">{totalLevels}</p>
            </div>
          </div>
          
          {/* Level Distribution */}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Level Distribution:</p>
            <div className="flex flex-wrap gap-2">
              {groupedUsers.map(({ level, levelName, users: levelUsers, styling }) => (
                <Badge 
                  key={level} 
                  variant="outline" 
                  className={cn("text-xs", styling.badge)}
                >
                  {levelName}: {levelUsers.length}
                </Badge>
              ))}
            </div>
          </div>

          {currentUserName && (
            <div className="mt-4 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                Showing downstream users visible to {currentUserName}
              </p>
            </div>
          )}
        </div>

        {/* User Groups */}
        <div className="space-y-6">
          {groupedUsers.map(({ level, levelName, users: levelUsers, styling }) => (
            <div key={level} className="space-y-3">
              {/* Level Header */}
              <div className={cn("p-3 rounded-lg border", styling.background)}>
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-foreground flex items-center gap-2">
                    <Building2 className={cn("h-4 w-4", styling.icon)} />
                    {levelName} Level
                  </h5>
                  <Badge variant="secondary">
                    {levelUsers.length} user{levelUsers.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* User Cards */}
              <div className="grid gap-3">
                {levelUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border border-border rounded-lg hover:shadow-sm transition-all hover:border-primary/30 bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h6 className="font-semibold text-foreground">{user.name}</h6>
                          {user.name === currentUserName && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                        <p className="text-sm font-medium text-foreground">{user.role}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="flex items-center gap-1 mb-2">
                          <Star className="h-3 w-3" />
                          {user.spiritAnimal}
                        </Badge>
                      </div>
                    </div>

                    {/* User's Organizational Structures */}
                    {user.structures && user.structures.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Assigned to:</p>
                        <div className="flex flex-wrap gap-2">
                          {user.structures.map((structure) => {
                            const structureStyling = getLevelStyling(structure.level);
                            return (
                              <Badge
                                key={structure.id}
                                variant="outline"
                                className={cn("text-xs", structureStyling.badge)}
                              >
                                {structure.name}
                              </Badge>
                            );
                          })}
                        </div>
                        
                        {/* Structure Paths */}
                        <div className="space-y-1">
                          {user.structures.map((structure) => (
                            <div key={`${structure.id}-path`} className="flex items-center gap-1 text-xs text-muted-foreground">
                              {structure.path.split('/').map((segment, index, array) => (
                                <span key={index} className="flex items-center gap-1">
                                  <span className="px-1 py-0.5 bg-background/80 rounded text-xs">
                                    {segment}
                                  </span>
                                  {index < array.length - 1 && (
                                    <span className="text-muted-foreground/50">→</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 