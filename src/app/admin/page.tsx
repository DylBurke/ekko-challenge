"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, Plus, Users, Building2, Activity, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  spiritAnimal: string;
}

interface Structure {
  id: string;
  name: string;
  level: number;
  path: string;
  parentId: string | null;
}

interface HierarchyTreeNode {
  id: string;
  name: string;
  level: number;
  path: string;
  parentId: string | null;
  children?: HierarchyTreeNode[];
}



export default function AdminPage() {
  // Admin mode is always active on this page
  const [activeTab, setActiveTab] = useState("overview");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allStructures, setAllStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalStructures: 0,
    totalPermissions: 0,
    lastUpdated: new Date().toISOString()
  });

  // Admin Actions Log
  const [adminActions, setAdminActions] = useState<Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    status: 'success' | 'error';
  }>>([]);

  // Structure Creation State
  const [newStructure, setNewStructure] = useState({
    name: '',
    parentId: '',
  });

  // Permission Assignment State
  const [permissionAssignment, setPermissionAssignment] = useState({
    userId: '',
    structureIds: [] as string[],
  });

  // Fetch initial data
  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const [usersResponse, structuresResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/hierarchy/tree')
      ]);

      if (usersResponse.ok && structuresResponse.ok) {
        const usersData = await usersResponse.json();
        const structuresData = await structuresResponse.json();

        if (usersData.success) {
          setAllUsers(usersData.data);
        }

        if (structuresData.success) {
          const flatStructures = flattenStructureTree(structuresData.data.tree);
          setAllStructures(flatStructures);
          
          setSystemStats({
            totalUsers: usersData.data?.length || 0,
            totalStructures: flatStructures.length,
            totalPermissions: 0, // Will be calculated separately
            lastUpdated: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };



  const flattenStructureTree = (tree: HierarchyTreeNode[]): Structure[] => {
    const flattened: Structure[] = [];
    
    const traverse = (nodes: HierarchyTreeNode[]) => {
      nodes.forEach(node => {
        flattened.push({
          id: node.id,
          name: node.name,
          level: node.level,
          path: node.path,
          parentId: node.parentId
        });
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    
    traverse(tree);
    return flattened;
  };

  const addAdminAction = (action: string, details: string, status: 'success' | 'error' = 'success') => {
    const newAction = {
      id: Date.now().toString(),
      action,
      details,
      timestamp: new Date().toISOString(),
      status
    };
    setAdminActions(prev => [newAction, ...prev.slice(0, 9)]); // Keep last 10 actions
  };

  const handleCreateStructure = async () => {
    if (!newStructure.name || !newStructure.parentId) {
      addAdminAction('Create Structure', 'Failed: Name and parent are required', 'error');
      return;
    }

    try {
      const response = await fetch('/api/hierarchy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStructure.name,
          parentId: newStructure.parentId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        addAdminAction('Create Structure', `Created "${newStructure.name}" successfully`);
        setNewStructure({ name: '', parentId: '' });
        fetchSystemData(); // Refresh data
      } else {
        addAdminAction('Create Structure', `Failed: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Create structure error:', error);
      addAdminAction('Create Structure', 'Failed: Network error', 'error');
    }
  };

  const handleAssignPermission = async () => {
    if (!permissionAssignment.userId || permissionAssignment.structureIds.length === 0) {
      addAdminAction('Assign Permission', 'Failed: User and structures are required', 'error');
      return;
    }

    try {
      for (const structureId of permissionAssignment.structureIds) {
        const response = await fetch('/api/permissions/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: permissionAssignment.userId,
            structureId
          })
        });

        const result = await response.json();
        
        if (result.success) {
          const user = allUsers.find(u => u.id === permissionAssignment.userId);
          const structure = allStructures.find(s => s.id === structureId);
          addAdminAction('Assign Permission', `Assigned ${user?.name} to ${structure?.name}`);
        } else {
          addAdminAction('Assign Permission', `Failed: ${result.message}`, 'error');
        }
      }
      
      setPermissionAssignment({ userId: '', structureIds: [] });
    } catch (error) {
      console.error('Assign permission error:', error);
      addAdminAction('Assign Permission', 'Failed: Network error', 'error');
    }
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
                <h1 className="text-xl font-bold text-foreground">
                  Gekko Admin Console
                  <Badge className="ml-2 bg-orange-500">Admin Mode</Badge>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Administrative Management Interface
                </p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">Home</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/hierarchy">Hierarchy</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/demo">User Demo</Link>
              </Button>
              <Button variant="default" size="sm">Admin</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Admin Mode Warning */}
      <div className="bg-orange-50 border-b border-orange-200">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Admin Mode Active - You have administrative privileges to modify the system
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">


        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Overview
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center gap-2">
              Admin Management
            </TabsTrigger>
          </TabsList>

          {/* System Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Admin Quick Actions */}
            <div className="w-full">
              <Button 
                onClick={() => fetchSystemData()} 
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Refresh Data
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* System Statistics */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </CardTitle>
                  <div className="text-2xl font-bold text-foreground">{systemStats.totalUsers}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Active employees in system</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Org Structures
                  </CardTitle>
                  <div className="text-2xl font-bold text-foreground">{systemStats.totalStructures}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Hierarchical structures</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </CardTitle>
                  <div className="text-lg font-bold text-foreground">
                    {new Date(systemStats.lastUpdated).toLocaleTimeString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">System data refresh</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {adminActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No admin actions recorded yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {adminActions.map((action) => (
                      <div key={action.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        {action.status === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{action.action}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(action.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{action.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* Admin Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Structure Creation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Create New Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="structure-name">Structure Name</Label>
                    <Input
                      id="structure-name"
                      placeholder="e.g., Operations Division"
                      value={newStructure.name}
                      onChange={(e) => setNewStructure(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="parent-structure">Parent Structure</Label>
                    <Select 
                      value={newStructure.parentId} 
                      onValueChange={(value) => setNewStructure(prev => ({ ...prev, parentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent structure" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStructures
                          .filter(s => s.level < 3) // Only allow creating under level 0-2
                          .map((structure) => (
                            <SelectItem key={structure.id} value={structure.id}>
                              {"  ".repeat(structure.level)}{structure.name} (Level {structure.level})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={handleCreateStructure} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Structure
                  </Button>
                </CardContent>
              </Card>

              {/* Permission Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assign Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="user-select">Select User</Label>
                    <Select 
                      value={permissionAssignment.userId} 
                      onValueChange={(value) => setPermissionAssignment(prev => ({ ...prev, userId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} - {user.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="structure-select">Select Structures</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select structures to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStructures.map((structure) => (
                          <SelectItem 
                            key={structure.id} 
                            value={structure.id}
                            onClick={() => {
                              if (!permissionAssignment.structureIds.includes(structure.id)) {
                                setPermissionAssignment(prev => ({
                                  ...prev,
                                  structureIds: [...prev.structureIds, structure.id]
                                }));
                              }
                            }}
                          >
                            {"  ".repeat(structure.level)}{structure.name} (Level {structure.level})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {permissionAssignment.structureIds.length > 0 && (
                    <div>
                      <Label>Selected Structures:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {permissionAssignment.structureIds.map(id => {
                          const structure = allStructures.find(s => s.id === id);
                          return structure ? (
                            <Badge key={id} variant="outline">
                              {structure.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleAssignPermission} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Assign Permissions
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>
      </main>
    </div>
  );
} 