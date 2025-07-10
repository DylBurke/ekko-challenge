import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, Users, Shield, Search, TreePine, ChevronRight } from "lucide-react";

export default function Home() {
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
                <h1 className="text-xl font-bold text-foreground">Gekko Pty Ltd</h1>
                <p className="text-sm text-muted-foreground">Hierarchical Permission System</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Button variant="default" size="sm">Home</Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/hierarchy">Hierarchy</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/demo">User Demo</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">Admin</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            🏢 Welcome to Gekko&apos;s Permission System
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A scalable organizational hierarchy system that manages user permissions 
            based on company structure. <strong>See who can access what, and why.</strong>
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">🔍 How It Works</h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  1. Organizational Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  🏗️ Built like a company: Company → Division → Department → Team
                </p>
                <p className="text-sm">
                  Each level represents different management tiers. Higher positions can see downstream users.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  2. Permission Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  🔐 Simple rule: You can only see people below you in the hierarchy
                </p>
                <p className="text-sm">
                  CEOs see everyone, managers see their teams, employees see themselves.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-purple-600" />
                  3. Smart Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  🚀 Scales to 100,000+ users with instant search and tree navigation
                </p>
                <p className="text-sm">
                  No performance issues, even with massive organizations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">✨ Key Features</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">🔍 Smart Search</Badge>
                  <span className="text-sm">Find users instantly</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">👥 Create Users</Badge>
                  <span className="text-sm">Add new team members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">🎯 Assign Permissions</Badge>
                  <span className="text-sm">Grant access quickly</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">🌳 Visual Tree</Badge>
                  <span className="text-sm">See the whole structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">📊 User Counts</Badge>
                  <span className="text-sm">Track team sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">⚡ Real-time</Badge>
                  <span className="text-sm">Instant updates</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">🧭 Explore the System</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/hierarchy" className="flex flex-col items-center text-center gap-3">
                  <TreePine className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-semibold">🏗️ Hierarchy</h4>
                    <p className="text-xs text-muted-foreground">View organizational structure</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/demo" className="flex flex-col items-center text-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <h4 className="font-semibold">👀 User Demo</h4>
                    <p className="text-xs text-muted-foreground">See what different users can access</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <Link href="/admin" className="flex flex-col items-center text-center gap-3">
                  <Shield className="h-8 w-8 text-orange-600" />
                  <div>
                    <h4 className="font-semibold">⚙️ Admin</h4>
                    <p className="text-xs text-muted-foreground">Manage users and permissions</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold">🚀</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800">Scalable</h4>
                    <p className="text-xs text-purple-600">Handles 100k+ users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-center">🚀 Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl mb-2">1️⃣</div>
                <h4 className="font-semibold mb-1">View the Hierarchy</h4>
                <p className="text-sm text-muted-foreground">Start by exploring the organizational structure</p>
              </div>
              <div>
                <div className="text-2xl mb-2">2️⃣</div>
                <h4 className="font-semibold mb-1">Try the Demo</h4>
                <p className="text-sm text-muted-foreground">Search for users and see their permissions</p>
              </div>
              <div>
                <div className="text-2xl mb-2">3️⃣</div>
                <h4 className="font-semibold mb-1">Use Admin Tools</h4>
                <p className="text-sm text-muted-foreground">Create users and assign permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}