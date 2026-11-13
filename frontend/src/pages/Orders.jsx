import { useCallback, useEffect, useState } from "react";
import {
  getOrders,
  getCustomers,
  getProducts,
  createOrder,
  updateOrderStatus,
  cancelOrder,
} from "../services/api";
import {
  Plus,
  RefreshCw,
  X,
  ShoppingCart,
  CheckCircle,
  XCircle,
} from "lucide-react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const loadOrdersData = useCallback(async () => {
    try {
      const [ordersData, customersData, productsData] =
        await Promise.all([
          getOrders(),
          getCustomers(),
          getProducts(),
        ]);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadOrdersData());
  }, [loadOrdersData]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!customerId || !productId) {
      setError("Please select a customer and product.");
      return;
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      setError("Quantity must be at least 1.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createOrder({
        customerId: Number(customerId),
        items: [
          {
            productId: Number(productId),
            quantity: Number(quantity),
          },
        ],
      });

      setSuccess("Order created successfully!");
      setShowForm(false);
      setCustomerId("");
      setProductId("");
      setQuantity(1);

      await loadOrdersData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create order. Check available stock."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setError("");
      setSuccess("");

      await updateOrderStatus(id, status);

      setSuccess(`Order #${id} updated to ${status}.`);
      await loadOrdersData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update order status."
      );
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm(`Are you sure you want to cancel order #${id}?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await cancelOrder(id);

      setSuccess(`Order #${id} cancelled successfully.`);
      await loadOrdersData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel this order."
      );
    }
  };

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatStatus = (status) =>
    status
      ? status.charAt(0) + status.slice(1).toLowerCase()
      : "Unknown";

  if (loading) {
    return <div className="loading-state">Loading orders...</div>;
  }

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <h1>Orders</h1>
          <p>Manage customer orders and transactions.</p>
        </div>

        <div className="customer-actions">
          <button
            className="secondary-button"
            onClick={loadOrdersData}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="primary-button"
            onClick={() => {
              setError("");
              setSuccess("");
              setShowForm(!showForm);
            }}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Close" : "Create Order"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="data-panel">
          <div className="panel-header">
            <h2>Create New Order</h2>
          </div>

          <form onSubmit={handleCreateOrder} className="customer-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} (#{customer.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product *</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} — {formatCurrency(product.price)}
                      {" "}({product.stockQuantity} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving ? "Creating..." : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-panel">
        <div className="panel-header">
          <div>
            <h2>Order Management</h2>
            <p>{orders.length} registered orders</p>
          </div>
          <ShoppingCart size={22} />
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={36} />
            <p>No orders found. Create your first order.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <strong>
                        {order.customerName || `Customer #${order.customerId}`}
                      </strong>
                    </td>
                    <td>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      {order.items?.length || 0} item(s)
                    </td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span
                        className={`status-badge status-${(
                          order.status || ""
                        ).toLowerCase()}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td>
                      <div className="customer-actions">
                        {order.status === "PENDING" && (
                          <button
                            className="edit-button"
                            title="Confirm order"
                            onClick={() =>
                              handleStatusUpdate(order.id, "CONFIRMED")
                            }
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {order.status === "CONFIRMED" && (
                          <button
                            className="edit-button"
                            title="Ship order"
                            onClick={() =>
                              handleStatusUpdate(order.id, "SHIPPED")
                            }
                          >
                            <ShoppingCart size={16} />
                          </button>
                        )}

                        {order.status === "SHIPPED" && (
                          <button
                            className="edit-button"
                            title="Mark delivered"
                            onClick={() =>
                              handleStatusUpdate(order.id, "DELIVERED")
                            }
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {(order.status === "PENDING" ||
                          order.status === "CONFIRMED") && (
                          <button
                            className="delete-button"
                            title="Cancel order"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
