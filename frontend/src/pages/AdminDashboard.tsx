import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mail,
  CheckCircle,
  TrendingUp,
  Activity,
  Send,
  Trophy,
  Globe,
  Podcast,
  Heart,
  Scale
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminService } from '@/services/admin.service';
import { eventService } from '@/services/event.service';
import { pollService } from '@/services/poll.service';
import EidGallery from './EidGallery';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const AdminDashboard = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    systemStatus: 'operational'
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({
    userGrowth: [] as any[],
    eventStats: [] as any[],
    userRoles: [] as any[],
    monthlyActivity: [] as any[]
  });

  const menuItems = [
    {
      title: 'Back to Website',
      icon: Globe,
      path: '/',
    },
    {
      title: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
    },
    {
      title: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Committees',
      icon: Scale,
      path: '/admin/manage-committees',
    },
    {
      title: 'Events',
      icon: Calendar,
      path: '/admin/manage-events',
    },
    {
      title: 'Polls',
      icon: BarChart3,
      path: '/admin/manage-polls',
    },
    {
      title: 'Forms',
      icon: FileText,
      path: '/admin/manage-forms',
    },
    {
      title: 'Quizzes',
      icon: Trophy,
      path: '/admin/manage-quizzes',
    },
    {
      title: 'Podcasts',
      icon: Podcast,
      path: '/admin/podcasts',
    },
    {
      title: 'Home Content',
      icon: Home,
      path: '/admin/home-content',
    },
    {
      title: 'Contact Messages',
      icon: Mail,
      path: '/admin/contact-messages',
    },
    // {
    //   title: 'Women\'s Day Gallery',
    //   icon: Heart,
    //   path: '/admin/womens-day-gallery',
    // },
    {
      title: "Eid Gallery",
      icon: Heart,
      path: '/admin/eid-gallery',
    },
    {
      title: 'Approve Registrations',
      icon: CheckCircle,
      path: '/admin/approve-registrations',
    },
    {
      title: 'Send Messages',
      icon: Send,
      path: '/admin/send-message',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await adminService.getAllUsers();
        const users = usersResponse.data || [];
        const totalUsers = users.length;

        // Fetch events
        const eventsResponse = await eventService.getAllEvents();
        const eventsData = eventsResponse.data || [];
        
        // Check and update event status based on dates
        const now = new Date();
        const events = eventsData.map((event: any) => {
          // Don't change CANCELLED status
          if (event.status === 'CANCELLED') {
            return event;
          }
          
          const startDate = new Date(event.startAt);
          const endDate = new Date(event.endAt);
          
          let newStatus = event.status;
          if (now < startDate) {
            newStatus = 'UPCOMING';
          } else if (now >= startDate && now < endDate) {
            newStatus = 'ONGOING';
          } else if (now >= endDate) {
            newStatus = 'COMPLETED';
          }
          
          return { ...event, status: newStatus };
        });
        
        const activeEvents = events.filter((event: any) => 
          event.status === 'UPCOMING' || event.status === 'ONGOING'
        ).length;

        // Fetch polls
        const pollsResponse = await pollService.getAllPolls();
        const pollsData = pollsResponse.data || [];
        
        // Check if polls have expired and update status
        const polls = pollsData.map((poll: any) => {
          const endDate = new Date(poll.endAt);
          // If current date is past end date and status is still ACTIVE, mark as CLOSED
          if (endDate < now && poll.status === 'ACTIVE') {
            return { ...poll, status: 'CLOSED' };
          }
          return poll;
        });

        // Calculate user growth data (last 6 months)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const userGrowthData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const usersInMonth = users.filter((user: any) => {
            const createdAt = new Date(user.createdAt);
            return createdAt >= monthDate && createdAt <= monthEnd;
          }).length;
          userGrowthData.push({
            month: monthNames[monthDate.getMonth()],
            users: usersInMonth
          });
        }

        // Calculate event statistics
        const eventStatsData = [
          { status: 'Upcoming', count: events.filter((e: any) => e.status === 'UPCOMING').length },
          { status: 'Ongoing', count: events.filter((e: any) => e.status === 'ONGOING').length },
          { status: 'Completed', count: events.filter((e: any) => e.status === 'COMPLETED').length },
          { status: 'Cancelled', count: events.filter((e: any) => e.status === 'CANCELLED').length }
        ];

        // Calculate user roles distribution
        const userRolesData = [
          { name: 'Users', value: users.filter((u: any) => u.role === 'USER').length },
          { name: 'Staff', value: users.filter((u: any) => u.role === 'STAFF').length },
          { name: 'Admin', value: users.filter((u: any) => u.role === 'ADMIN').length }
        ];

        // Calculate monthly activity (events + polls)
        const monthlyActivityData = [];
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          const eventsInMonth = events.filter((event: any) => {
            const createdAt = new Date(event.createdAt);
            return createdAt >= monthDate && createdAt <= monthEnd;
          }).length;
          const pollsInMonth = polls.filter((poll: any) => {
            const createdAt = new Date(poll.createdAt);
            return createdAt >= monthDate && createdAt <= monthEnd;
          }).length;
          monthlyActivityData.push({
            month: monthNames[monthDate.getMonth()],
            events: eventsInMonth,
            polls: pollsInMonth
          });
        }

        // Update chart data
        setChartData({
          userGrowth: userGrowthData,
          eventStats: eventStatsData,
          userRoles: userRolesData,
          monthlyActivity: monthlyActivityData
        });

        // Fetch stats if available
        try {
          const statsResponse = await adminService.getStats();
          setStats({
            totalUsers,
            activeEvents,
            totalRegistrations: statsResponse.data?.totalRegistrations || 0,
            systemStatus: 'operational'
          });
        } catch {
          // If stats endpoint doesn't exist, use fetched data
          setStats({
            totalUsers,
            activeEvents,
            totalRegistrations: 0,
            systemStatus: 'operational'
          });
        }
      } catch (error: any) {
        console.error('Error fetching stats:', error);
        // Set default stats on error
        setStats({
          totalUsers: 0,
          activeEvents: 0,
          totalRegistrations: 0,
          systemStatus: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === '/admin/dashboard') {
      fetchStats();
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      {/* Sidebar - Desktop only */}
      <aside
        className={cn(
          'hidden lg:flex bg-[hsl(0_0%_5%)] text-white border-r border-white/10 transition-all duration-300 flex-col lg:sticky lg:top-0 lg:h-screen',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <img src="/logo-white.png" alt="logo" className="h-9 w-9 object-contain" />
              <span className="font-display font-extrabold uppercase tracking-wide text-sm">Admin <span className="text-primary">Panel</span></span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center font-bold shadow-glow">
              {user?.displayName?.charAt(0).toUpperCase()}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.displayName}</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-semibold transition-all',
                  active
                    ? 'gradient-primary text-white shadow-glow'
                    : 'text-white/55 hover:bg-white/5 hover:text-white',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={() => { logout(); navigate('/login'); }}
            className={cn(
              'w-full text-white/55 hover:bg-white/5 hover:text-white justify-start rounded-xl',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-[hsl(0_0%_5%)] text-white border-b border-white/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo-white.png" alt="logo" className="h-9 w-9 object-contain" />
          <span className="font-display font-extrabold uppercase tracking-wide text-sm">Admin <span className="text-primary">Panel</span></span>
        </div>
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center font-bold text-sm shadow-glow">
          {user?.displayName?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-8 pb-20 lg:pb-0">
          {/* Dashboard Overview - Only show on main dashboard route */}
          {location.pathname === '/admin/dashboard' && (
            <>
              <div className="mb-8">
                <p className="section-label mb-4">Admin</p>
                <h1 className="font-display font-black uppercase tracking-tight leading-[0.95] text-4xl md:text-5xl mb-2">
                  Welcome back,<br /><span className="gradient-text">{user?.displayName}.</span>
                </h1>
                <p className="text-muted-foreground">
                  Manage the academy from here
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="font-display text-3xl font-black">
                      {loading ? '...' : stats.totalUsers}
                    </div>
                    <p className="text-xs text-muted-foreground">All registered users</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="font-display text-3xl font-black">
                      {loading ? '...' : stats.activeEvents}
                    </div>
                    <p className="text-xs text-muted-foreground">Upcoming & ongoing</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="font-display text-3xl font-black">
                      {loading ? '...' : stats.totalRegistrations}
                    </div>
                    <p className="text-xs text-muted-foreground">Event registrations</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                    <p className="text-xs text-muted-foreground">All systems running</p>
                  </CardContent>
                </Card>
              </div>

              {/* Create Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/create-event')}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create Event</CardTitle>
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Event
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/create-poll')}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create Poll</CardTitle>
                      <BarChart3 className="h-8 w-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Poll
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/admin/create-form')}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Create Form</CardTitle>
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      New Form
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Charts */}
              <div className="mb-6 space-y-6">
                {/* User Growth Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>New user registrations over the last 6 months</CardDescription>
                      </div>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="users" stroke="#f22e93" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Event Statistics and User Roles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Statistics Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Statistics</CardTitle>
                      <CardDescription>Events by status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.eventStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#a855f7" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* User Roles Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Roles Distribution</CardTitle>
                      <CardDescription>Distribution of users by role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={chartData.userRoles}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#f22e93"
                            dataKey="value"
                          >
                            {chartData.userRoles.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#f22e93', '#a855f7', '#fb923c'][index % 3]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Activity Chart */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Monthly Activity</CardTitle>
                        <CardDescription>Events and polls created over the last 6 months</CardDescription>
                      </div>
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.monthlyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="events" stackId="1" stroke="#f22e93" fill="#f22e93" />
                        <Area type="monotone" dataKey="polls" stackId="1" stroke="#a855f7" fill="#a855f7" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link to="/admin/users">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/create-event')}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/create-poll')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Create Poll
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {loading ? 'Loading...' : 'No recent activity to display'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Child content for nested routes */}
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[hsl(0_0%_5%)] border-t border-white/10 z-50">
        <div className="flex">
          {/* Scrollable menu items */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1 p-2 min-w-max">
                  <Link
                to="/admin/dashboard"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/dashboard')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Home</span>
              </Link>
              <Link
                to="/admin/users"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/users')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <Users className="h-5 w-5" />
                <span className="text-xs mt-1">Users</span>
              </Link>
              <Link
                to="/admin/manage-events"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/manage-events')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs mt-1">Events</span>
              </Link>
              <Link
                to="/admin/manage-polls"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/manage-polls')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs mt-1">Polls</span>
              </Link>
              <Link
                to="/admin/manage-forms"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/manage-forms')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <FileText className="h-5 w-5" />
                <span className="text-xs mt-1">Forms</span>
              </Link>
              <Link
                to="/admin/manage-quizzes"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/manage-quizzes')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <Trophy className="h-5 w-5" />
                <span className="text-xs mt-1">Quizzes</span>
              </Link>
              <Link
                to="/admin/home-content"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/home-content')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Content</span>
              </Link>
              <Link
                to="/admin/contact-messages"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/contact-messages')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs mt-1">Messages</span>
              </Link>
              <Link
                to="/admin/settings"
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors min-w-[70px]',
                  isActive('/admin/settings')
                    ? 'gradient-primary text-white'
                    : 'text-white/55 hover:bg-white/10'
                )}
              >
                <Settings className="h-5 w-5" />
                <span className="text-xs mt-1">Settings</span>
              </Link>
            </div>
          </div>
          {/* Fixed logout button */}
          <div className="border-l border-white/10 flex items-center">
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-white/55 hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
