import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gekko Pty Ltd</h1>
                <p className="text-sm text-muted-foreground">Organizational Management System</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Button variant="default" size="sm">Dashboard</Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/hierarchy">Hierarchy</Link>
              </Button>
              <Button variant="ghost" size="sm">Users</Button>
              <Button variant="ghost" size="sm">Permissions</Button>
              <Button variant="ghost" size="sm">Settings</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Gekko
          </h2>
          <p className="text-lg text-muted-foreground">
            Manage your organizational hierarchy and user permissions with ease.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Structures
              </CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">17</span>
                <Badge variant="secondary">+3 new</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Organizational levels across all divisions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Users
              </CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">14</span>
                <Badge className="bg-primary">All active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Employees with system access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Permission Assignments
              </CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">16</span>
                <Badge variant="outline">Updated</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Total active permission assignments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hierarchy Levels
              </CardTitle>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-foreground">4</span>
                <Badge variant="secondary">Max depth</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Company → Division → Department → Team
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and management operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/hierarchy">
                  <span className="mr-2">👥</span>
                  View Organizational Tree
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">➕</span>
                Create New Structure
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <span className="mr-2">🔐</span>
                Manage Permissions
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Status</CardTitle>
              <CardDescription>
                Current system health and operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <Badge className="bg-primary">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Database</span>
                <Badge className="bg-primary">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Sync</span>
                <span className="text-sm text-foreground">2 minutes ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
