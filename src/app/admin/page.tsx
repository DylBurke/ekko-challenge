"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Shield, Plus, Users, Building2, Activity, Clock, CheckCircle2, AlertCircle, RefreshCw, UserPlus, Search } from "lucide-react";
import Link from "next/link";
import UserSearch from "@/components/user-search";
import RevokePermissions from "@/components/revoke-permissions";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

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
  const [, setAllUsers] = useState<User[]>([]);
  const [allStructures, setAllStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalStructures: 0,
    totalPermissions: 0,
    lastUpdated: new Date().toISOString()
  });

  // Toast notifications
  const { toasts, success, error, removeToast } = useToast();

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
    selectedUser: null as User | null,
    structureIds: [] as string[],
  });

  // User Creation State
  const [userCreation, setUserCreation] = useState({
    mode: 'search' as 'search' | 'create',
    newUser: {
      name: '',
      email: '',
      role: '',
      spiritAnimal: '',
    },
  });

  const fetchSystemData = useCallback(async () => {
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
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  const handleUserSelect = (user: User) => {
    setPermissionAssignment(prev => ({ ...prev, selectedUser: user }));
  };

  const handleCreateUser = async () => {
    const { name, email, role, spiritAnimal } = userCreation.newUser;
    
    if (!name || !email || !role || !spiritAnimal) {
      const errorMsg = 'All fields are required for creating a user';
      error('User Creation Failed', errorMsg);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          role,
          spiritAnimal,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        const createdUser = result.data;
        const successMsg = `Created user "${createdUser.name}" successfully`;
        success('User Created', successMsg);
        addAdminAction('Create User', successMsg);
        
        // Auto-select the created user for permission assignment
        setPermissionAssignment(prev => ({ ...prev, selectedUser: createdUser }));
        
        // Reset form and switch to search mode
        setUserCreation({
          mode: 'search',
          newUser: { name: '', email: '', role: '', spiritAnimal: '' },
        });
      } else {
        const errorMsg = result.message || 'Failed to create user';
        error('User Creation Failed', errorMsg);
        addAdminAction('Create User', `Failed: ${errorMsg}`, 'error');
      }
    } catch (err) {
      console.error('Create user error:', err);
      const errorMsg = 'Network error occurred';
      error('User Creation Failed', errorMsg);
      addAdminAction('Create User', `Failed: ${errorMsg}`, 'error');
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
      const errorMsg = 'Name and parent are required';
      addAdminAction('Create Structure', `Failed: ${errorMsg}`, 'error');
      error('Create Structure Failed', errorMsg);
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
        const successMsg = `Created "${newStructure.name}" successfully`;
        addAdminAction('Create Structure', successMsg);
        success('Structure Created', successMsg);
        setNewStructure({ name: '', parentId: '' });
        fetchSystemData(); // Refresh data
      } else {
        const errorMsg = result.message || 'Failed to create structure';
        addAdminAction('Create Structure', `Failed: ${errorMsg}`, 'error');
        error('Create Structure Failed', errorMsg);
      }
    } catch (err) {
      console.error('Create structure error:', err);
      const errorMsg = 'Network error occurred';
      addAdminAction('Create Structure', `Failed: ${errorMsg}`, 'error');
      error('Create Structure Failed', errorMsg);
    }
  };

  const handleAssignPermission = async () => {
    if (!permissionAssignment.selectedUser || permissionAssignment.structureIds.length === 0) {
      const errorMsg = 'User and structures are required';
      addAdminAction('Assign Permission', `Failed: ${errorMsg}`, 'error');
      error('Assignment Failed', errorMsg);
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const structureId of permissionAssignment.structureIds) {
        const response = await fetch('/api/permissions/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: permissionAssignment.selectedUser.id,
            structureId
          })
        });

        const result = await response.json();
        
        if (result.success) {
          const structure = allStructures.find(s => s.id === structureId);
          const successMsg = `Assigned ${permissionAssignment.selectedUser.name} to ${structure?.name}`;
          addAdminAction('Assign Permission', successMsg);
          successCount++;
        } else {
          const errorMsg = result.message || 'Unknown error';
          addAdminAction('Assign Permission', `Failed: ${errorMsg}`, 'error');
          errors.push(errorMsg);
          errorCount++;
        }
      }
      
      // Show summary notifications
      if (successCount > 0) {
        success(
          'Permissions Assigned',
          `Successfully assigned ${successCount} permission${successCount > 1 ? 's' : ''} to ${permissionAssignment.selectedUser.name}`
        );
      }
      
      if (errorCount > 0) {
        error(
          'Some Assignments Failed',
          `${errorCount} assignment${errorCount > 1 ? 's' : ''} failed: ${errors.join(', ')}`
        );
      }
      
      setPermissionAssignment({ selectedUser: null, structureIds: [] });
    } catch (err) {
      console.error('Assign permission error:', err);
      const errorMsg = 'Network error occurred';
      addAdminAction('Assign Permission', `Failed: ${errorMsg}`, 'error');
      error('Assignment Failed', errorMsg);
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

                  <Button 
                    onClick={handleCreateStructure} 
                    className="w-full transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newStructure.name || !newStructure.parentId}
                  >
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
                  {/* Mode Toggle */}
                  <div className="flex items-center justify-center">
                    <div className="flex bg-muted rounded-lg p-1">
                      <button
                        onClick={() => setUserCreation(prev => ({ ...prev, mode: 'search' }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          userCreation.mode === 'search'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Search className="h-4 w-4" />
                        Search Existing
                      </button>
                      <button
                        onClick={() => setUserCreation(prev => ({ ...prev, mode: 'create' }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          userCreation.mode === 'create'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <UserPlus className="h-4 w-4" />
                        Create New
                      </button>
                    </div>
                  </div>

                  {/* Search Mode */}
                  {userCreation.mode === 'search' && (
                    <div>
                      <Label htmlFor="user-search">Search User</Label>
                      <UserSearch
                        onUserSelect={handleUserSelect}
                        placeholder="Search users by name or email..."
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Create Mode */}
                  {userCreation.mode === 'create' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="user-name">Full Name</Label>
                          <Input
                            id="user-name"
                            placeholder="John Doe"
                            value={userCreation.newUser.name}
                            onChange={(e) => setUserCreation(prev => ({
                              ...prev,
                              newUser: { ...prev.newUser, name: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-email">Email</Label>
                          <Input
                            id="user-email"
                            type="email"
                            placeholder="john@company.com"
                            value={userCreation.newUser.email}
                            onChange={(e) => setUserCreation(prev => ({
                              ...prev,
                              newUser: { ...prev.newUser, email: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="user-role">Role</Label>
                          <Input
                            id="user-role"
                            placeholder="Software Engineer"
                            value={userCreation.newUser.role}
                            onChange={(e) => setUserCreation(prev => ({
                              ...prev,
                              newUser: { ...prev.newUser, role: e.target.value }
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="user-spirit-animal">Spirit Animal</Label>
                          <Input
                            id="user-spirit-animal"
                            placeholder="Eagle"
                            value={userCreation.newUser.spiritAnimal}
                            onChange={(e) => setUserCreation(prev => ({
                              ...prev,
                              newUser: { ...prev.newUser, spiritAnimal: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateUser}
                        className="w-full transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                        disabled={!userCreation.newUser.name || !userCreation.newUser.email || !userCreation.newUser.role || !userCreation.newUser.spiritAnimal}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                    </div>
                  )}

                  {/* Selected User Display */}
                  {permissionAssignment.selectedUser && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{permissionAssignment.selectedUser.name}</p>
                          <p className="text-sm text-muted-foreground">{permissionAssignment.selectedUser.role}</p>
                        </div>
                        <Badge variant="secondary">{permissionAssignment.selectedUser.spiritAnimal}</Badge>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="structure-select">Select Structures</Label>
                    <Select
                      onValueChange={(structureId) => {
                        if (!permissionAssignment.structureIds.includes(structureId)) {
                          setPermissionAssignment(prev => ({
                            ...prev,
                            structureIds: [...prev.structureIds, structureId]
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select structures to assign" />
                      </SelectTrigger>
                      <SelectContent>
                        {allStructures.map((structure) => (
                          <SelectItem 
                            key={structure.id} 
                            value={structure.id}
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
                            <Badge 
                              key={id} 
                              variant="outline"
                              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => {
                                setPermissionAssignment(prev => ({
                                  ...prev,
                                  structureIds: prev.structureIds.filter(structureId => structureId !== id)
                                }));
                              }}
                            >
                              {structure.name} ×
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleAssignPermission} 
                    className="w-full transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!permissionAssignment.selectedUser || permissionAssignment.structureIds.length === 0}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Assign Permissions
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Revoke Permissions - Centered below the two-column layout */}
            <div className="flex justify-center">
              <div className="w-full max-w-2xl">
                <RevokePermissions
                  onSuccess={success}
                  onError={error}
                  onAction={addAdminAction}
                />
              </div>
            </div>
          </TabsContent>


        </Tabs>
      </main>
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
} 