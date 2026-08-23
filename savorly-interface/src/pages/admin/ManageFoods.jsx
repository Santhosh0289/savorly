import { useEffect, useState } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import api from "../../api/axios";

export default function ManageFoods() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", image_url: "" });
  const [preview, setPreview] = useState(null);

  const load = () => api.get("/foods/").then((res) => setFoods(res.data));
  useEffect(() => { load(); }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is already a base64 data URI, e.g. "data:image/png;base64,...."
      setForm((f) => ({ ...f, image_url: reader.result }));
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post("/admin/foods", { ...form, price: parseFloat(form.price) });
    setForm({ name: "", description: "", price: "", category: "", image_url: "" });
    setPreview(null);
    load();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/foods/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete this dish.");
    }
  };

  const handleAvailability = async (food) => {
    try {
      await api.put(`/admin/foods/${food.id}`, { is_available: !food.is_available });
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update this dish.");
    }
  };

  return (
    <div>
      <h2 className="admin-page-title">Manage Foods</h2>
      <p className="admin-page-subtitle">Add new dishes to the live menu. Images are stored securely as encoded data.</p>

      <form className="chart-card admin-food-form" onSubmit={handleAdd}>
        <div className="admin-form-grid">
          <div className="field">
            <label>Dish Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Price (₹)</label>
            <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              <option>Mains</option>
              <option>Sides</option>
              <option>Salad</option>
              <option>Gravy</option>
            </select>
          </div>
          <div className="field">
            <label>Dish Image</label>
            <label className="upload-box">
              <UploadCloud size={20} />
              <span>{preview ? "Change image" : "Click to upload from your device"}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            </label>
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="preview" />
          </div>
        )}

        <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }}>Add to Menu</button>
      </form>

      <table className="admin-table">
        <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th></th></tr></thead>
        <tbody>
          {foods.map((f) => (
            <tr key={f.id}>
              <td><img src={f.image_url} alt={f.name} className="table-thumb" /></td>
              <td>{f.name}</td>
              <td><span className="category-pill">{f.category}</span></td>
              <td>₹{f.price}</td>
              <td>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "6px 12px", marginRight: 8 }}
                  onClick={() => handleAvailability(f)}
                >
                  {f.is_available ? "Mark Unavailable" : "Mark Available"}
                </button>
                <button className="btn-icon-danger" onClick={() => handleDelete(f.id)}>
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}