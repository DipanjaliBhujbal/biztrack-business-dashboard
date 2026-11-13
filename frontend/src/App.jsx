import { useCallback, useEffect, useState } from "react";

import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Menu,
  X,
} from "lucide-react";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getDashboardSummary, getOrders } from "./services/api";

import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

import "./App.css";

// Sidebar navigation
const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Products", icon: Package },
  { label: "Orders", icon: ShoppingCart },
];

// Currency formatter
function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

// Dashboard statistic card
function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={22} />
      </div>

      <div className="stat-info">
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

// Recent orders table on Dashboard
function DataTable({ data }) {
  if (!data.length) {
    return (
      <div className="empty-state">
        No orders found.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Order Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>#{item.id}</td>

              <td>
                {item.customerName ||
                  `Customer #${item.customerId}`}
              </td>

              <td>
                {item.orderDate
                  ? new Date(
                      item.orderDate
                    ).toLocaleDateString("en-IN")
                  : "—"}
              </td>

              <td>
                {formatCurrency(item.totalAmount)}
              </td>

              <td>
                <span
                  className={`status-badge ${String(
                    item.status || ""
                  ).toLowerCase()}`}
                >
                  {item.status || "Unknown"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryData, orderData] = await Promise.all([
        getDashboardSummary(),
        getOrders(),
      ]);

      setSummary(summaryData);

      setOrders(
        Array.isArray(orderData)
          ? orderData
          : []
      );
    } catch (err) {
      console.error(
        "Dashboard loading failed:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      await loadDashboardData();
    };

    initializeDashboard();
  }, [loadDashboardData]);

  // Sidebar navigation
  const handleNavigation = (page) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  // Dashboard chart data
  const chartData = summary
    ? [
        {
          name: "Customers",
          count: summary.totalCustomers || 0,
        },
        {
          name: "Products",
          count: summary.totalProducts || 0,
        },
        {
          name: "Orders",
          count: summary.totalOrders || 0,
        },
        {
          name: "Pending",
          count: summary.pendingOrders || 0,
        },
        {
          name: "Completed",
          count: summary.completedOrders || 0,
        },
      ]
    : [];

  // Render selected page
  const renderPageContent = () => {
    // Initial loading
    if (loading) {
      return (
        <div className="loading-state">
          <RefreshCw className="spin" size={28} />
          <p>Loading your business data...</p>
        </div>
      );
    }

    // Dashboard loading error
    if (error) {
      return (
        <div className="error-state">
          <AlertTriangle size={30} />

          <h3>Something went wrong</h3>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={loadDashboardData}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      );
    }

    // Customers page
    if (activePage === "Customers") {
      return <Customers />;
    }

    // Products page
    if (activePage === "Products") {
      return <Products />;
    }

    // Orders page
    if (activePage === "Orders") {
      return <Orders />;
    }

    // Dashboard page
    if (activePage === "Dashboard") {
      return (
        <>
          {/* Dashboard statistics */}
          <section className="stats-grid">
            <DashboardCard
              title="Total Customers"
              value={summary?.totalCustomers ?? 0}
              subtitle="Registered customers"
              icon={Users}
              color="blue"
            />

            <DashboardCard
              title="Total Products"
              value={summary?.totalProducts ?? 0}
              subtitle="Products in inventory"
              icon={Package}
              color="purple"
            />

            <DashboardCard
              title="Total Orders"
              value={summary?.totalOrders ?? 0}
              subtitle="All recorded orders"
              icon={ShoppingCart}
              color="orange"
            />

            <DashboardCard
              title="Total Revenue"
              value={formatCurrency(
                summary?.totalRevenue
              )}
              subtitle="Excluding cancelled orders"
              icon={IndianRupee}
              color="green"
            />
          </section>

          {/* Dashboard chart and order summary */}
          <section className="dashboard-grid">
            <div className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h3>Business Overview</h3>
                  <p>
                    Current records across your business
                  </p>
                </div>

                <TrendingUp size={21} />
              </div>

              <div className="chart-container">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 15,
                      right: 10,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Bar
                      dataKey="count"
                      fill="#4f46e5"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h3>Order Summary</h3>
                  <p>Order status overview</p>
                </div>

                <ShoppingCart size={21} />
              </div>

              <div className="summary-row">
                <span>
                  <Clock size={18} />
                  Pending Orders
                </span>

                <strong>
                  {summary?.pendingOrders ?? 0}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  <CheckCircle size={18} />
                  Completed Orders
                </span>

                <strong>
                  {summary?.completedOrders ?? 0}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  <AlertTriangle size={18} />
                  Low-stock Products
                </span>

                <strong>
                  {summary?.lowStockProducts ?? 0}
                </strong>
              </div>

              <div className="inventory-note">
                Inventory alerts are based on stock below
                10 units.
              </div>
            </div>
          </section>

          {/* Recent orders */}
          <section className="panel recent-panel">
            <div className="panel-heading">
              <div>
                <h3>Recent Orders</h3>
                <p>
                  Latest orders recorded in BizTrack
                </p>
              </div>

              <button
                className="text-button"
                onClick={() =>
                  handleNavigation("Orders")
                }
              >
                View all
              </button>
            </div>

            <DataTable
              data={orders.slice(0, 5)}
            />
          </section>
        </>
      );
    }

    return null;
  };

  return (
    <div className="app-layout">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="brand">
          <div className="brand-logo">B</div>

          <div>
            <h2>BizTrack</h2>
            <span>Business Management</span>
          </div>

          <button
            className="close-sidebar"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activePage === label ? "active" : ""
              }`}
              onClick={() => handleNavigation(label)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Sidebar profile */}
        <div className="sidebar-footer">
          <div className="profile-avatar">A</div>

          <div>
            <strong>Administrator</strong>
            <span>Business Account</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">

        {/* Top navigation bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div>
              <p className="breadcrumb">
                Workspace / {activePage}
              </p>

              <h1>{activePage}</h1>
            </div>
          </div>

          <button
            className="refresh-button"
            onClick={loadDashboardData}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spin" : ""}
            />

            <span>Refresh data</span>
          </button>
        </header>

        {/* Selected page */}
        <div className="page-content">
          {renderPageContent()}
        </div>

        {/* Footer */}
        <footer className="page-footer">
          BizTrack Business Management System
        </footer>

      </main>
    </div>
  );
}

export default App;
