'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronDown, 
  Users, 
  Search, 
  Building2, 
  User,
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  path: string;
  level: number;
  userCount: number;
  children: TreeNode[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  spiritAnimal: string;
  primaryStructure?: string;
  structureLevel?: number;
}

interface ScalableAccessibleUsersProps {
  userId: string;
  loading?: boolean;
  currentUserName?: string;
}

type ViewMode = 'tree' | 'users' | 'search';

interface ViewState {
  mode: ViewMode;
  selectedStructureId?: string;
  selectedStructureName?: string;
  searchQuery?: string;
}

export default function ScalableAccessibleUsers({ 
  userId, 
  loading = false, 
  currentUserName 
}: ScalableAccessibleUsersProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewState, setViewState] = useState<ViewState>({ mode: 'tree' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch tree data on component mount
  useEffect(() => {
    if (userId && viewState.mode === 'tree') {
      fetchTreeData();
    }
  }, [userId, viewState.mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTreeData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/accessible-users?mode=tree`);
      const result = await response.json();
      
      if (result.success) {
        setTreeData(result.data.tree || []);
      }
    } catch (error) {
      console.error('Error fetching tree data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (structureId: string, page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/users/${userId}/accessible-users?mode=users&structureId=${structureId}&page=${page}&limit=50`
      );
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data.users || []);
        setPagination(result.data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/users/${userId}/accessible-users?mode=search&q=${encodeURIComponent(query)}&limit=100`
      );
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleStructureClick = (structure: TreeNode) => {
    setViewState({
      mode: 'users',
      selectedStructureId: structure.id,
      selectedStructureName: structure.name,
    });
    fetchUsers(structure.id);
  };

  const handleSearch = () => {
    if (searchQuery.trim().length >= 2) {
      setViewState({
        mode: 'search',
        searchQuery: searchQuery.trim(),
      });
      fetchSearchResults(searchQuery.trim());
    }
  };

  const handleBackToTree = () => {
    setViewState({ mode: 'tree' });
    setUsers([]);
    setSearchQuery('');
  };

  const handlePageChange = (newPage: number) => {
    if (viewState.selectedStructureId) {
      fetchUsers(viewState.selectedStructureId, newPage);
    }
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="select-none">
        <div 
          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {hasChildren ? (
            <button onClick={() => toggleNode(node.id)} className="p-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          
          <Building2 className="h-4 w-4 text-muted-foreground" />
          
          <button
            onClick={() => handleStructureClick(node)}
            className="flex-1 text-left hover:text-primary transition-colors"
          >
            <span className="font-medium">{node.name}</span>
            <Badge variant="secondary" className="ml-2">
              {node.userCount} {node.userCount === 1 ? 'user' : 'users'}
            </Badge>
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderUserList = () => (
    <div className="space-y-3">
      {users.map(user => (
        <div key={user.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          <User className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
            <div className="text-sm text-muted-foreground">{user.role}</div>
          </div>
          <Badge variant="outline">{user.spiritAnimal}</Badge>
          {user.primaryStructure && (
            <Badge variant="secondary" className="text-xs">
              {user.primaryStructure}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

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
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {viewState.mode === 'tree' && 'Accessible Users - Organization View'}
          {viewState.mode === 'users' && `Users in ${viewState.selectedStructureName}`}
          {viewState.mode === 'search' && `Search Results for "${viewState.searchQuery}"`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searchQuery.length < 2}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {viewState.mode !== 'tree' && (
            <Button variant="outline" onClick={handleBackToTree}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tree
            </Button>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {viewState.mode === 'tree' && (
              <div className="space-y-1">
                {treeData.length > 0 ? (
                  treeData.map(node => renderTreeNode(node))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No organizational structures found
                  </div>
                )}
              </div>
            )}

            {(viewState.mode === 'users' || viewState.mode === 'search') && (
              <>
                {users.length > 0 ? (
                  <>
                    {renderUserList()}
                    {viewState.mode === 'users' && renderPagination()}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {viewState.mode === 'users' 
                      ? 'No users found in this structure'
                      : 'No users found matching your search'
                    }
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Summary */}
        {viewState.mode === 'tree' && !isLoading && currentUserName && (
          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
            <strong>{currentUserName}</strong> can access users in the organizational structures shown above.
            Click on any structure to view its users, or use search to find specific people.
          </div>
        )}
      </CardContent>
    </Card>
  );
}