import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Customers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/admin/customers").then((res) => setCustomers(res.data));
  }, []);

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Customers</h2>
      <div className="admin-table-wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td><td>{c.email}</td><td>{c.phone || "—"}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}
