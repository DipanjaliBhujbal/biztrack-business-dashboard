import { useCallback, useEffect, useState } from "react";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../services/api";
import { Plus, Pencil, Trash2, X, RefreshCw } from "lucide-react";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCustomers = useCallback(async () => {
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadCustomers());
  }, [loadCustomers]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (customer) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSaving(true);

      if (editingId) {
        await updateCustomer(editingId, form);
        setSuccess("Customer updated successfully.");
      } else {
        await createCustomer(form);
        setSuccess("Customer created successfully.");
      }

      closeForm();
      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save customer. Please check the details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteCustomer(customer.id);
      setSuccess("Customer deleted successfully.");
      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete customer."
      );
    }
  };

  return (
    <section className="panel data-panel">
      <div className="panel-heading">
        <div>
          <h3>Customer Management</h3>
          <p>{customers.length} registered customers</p>
        </div>

        <div className="customer-actions">
          <button
            className="secondary-button"
            onClick={loadCustomers}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="primary-button" onClick={openAddForm}>
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <form className="customer-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h3>{editingId ? "Edit Customer" : "Add New Customer"}</h3>
            <button
              type="button"
              className="icon-button"
              onClick={closeForm}
              aria-label="Close form"
            >
              <X size={19} />
            </button>
          </div>

          <div className="form-grid">
            <label>
              Customer Name *
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                maxLength={100}
                required
              />
            </label>

            <label>
              Email Address *
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                maxLength={150}
                required
              />
            </label>

            <label>
              Phone Number
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength={20}
              />
            </label>

            <label>
              Company
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Enter company name"
                maxLength={150}
              />
            </label>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={closeForm}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving ? "Saving..." : editingId ? "Update Customer" : "Save Customer"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spin" size={25} />
          <p>Loading customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          No customers found. Add your first customer.
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>#{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>{customer.company || "—"}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="icon-button edit-button"
                        onClick={() => openEditForm(customer)}
                        title="Edit customer"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        className="icon-button delete-button"
                        onClick={() => handleDelete(customer)}
                        title="Delete customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Customers;