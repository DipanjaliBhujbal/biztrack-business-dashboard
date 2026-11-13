import { useCallback, useEffect, useState } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Package,
} from "lucide-react";

const initialForm = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  stockQuantity: "",
};

function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => loadProducts());
  }, [loadProducts]);

  const openAddForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price ?? "",
      stockQuantity: product.stockQuantity ?? "",
    });
    setEditingId(product.id);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const price = Number(form.price);
    const stockQuantity = Number(form.stockQuantity);

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (
      form.stockQuantity === "" ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setError("Stock quantity must be a non-negative whole number.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price,
      stockQuantity,
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await updateProduct(editingId, productData);
        setSuccess("Product updated successfully.");
      } else {
        await createProduct(productData);
        setSuccess("Product created successfully.");
      }

      setShowForm(false);
      setForm(initialForm);
      setEditingId(null);
      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save product. Please check the details."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteProduct(product.id);
      setSuccess("Product deleted successfully.");
      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete product."
      );
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p>Manage your products and inventory.</p>
        </div>

        <div className="customer-actions">
          <button
            className="secondary-button"
            onClick={loadProducts}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button className="primary-button" onClick={openAddForm}>
            <Plus size={17} />
            Add Product
          </button>
        </div>
      </div>

      <section className="data-panel">
        <div className="panel-header">
          <div>
            <h2>Product Management</h2>
            <p>{products.length} registered products</p>
          </div>
          <Package size={22} />
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <form className="customer-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <h3>{editingId !== null ? "Edit Product" : "Add New Product"}</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Product Name *
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  maxLength={120}
                  required
                />
              </label>

              <label>
                SKU *
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="e.g. WM-002"
                  maxLength={50}
                  required
                />
              </label>

              <label>
                Category *
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                  maxLength={80}
                  required
                />
              </label>

              <label>
                Price (₹) *
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  required
                />
              </label>

              <label>
                Stock Quantity *
                <input
                  name="stockQuantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockQuantity}
                  onChange={handleChange}
                  placeholder="Enter stock quantity"
                  required
                />
              </label>

              <label className="full-width">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  rows="3"
                />
              </label>
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
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found. Add your first product.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.sku}</td>
                    <td>{product.category}</td>
                    <td>
                      ₹{Number(product.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span
                        className={
                          Number(product.stockQuantity) < 10
                            ? "status-badge status-pending"
                            : "status-badge status-completed"
                        }
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button edit-button"
                          onClick={() => openEditForm(product)}
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="icon-button delete-button"
                          onClick={() => handleDelete(product)}
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
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
    </div>
  );
}

export default Products;
