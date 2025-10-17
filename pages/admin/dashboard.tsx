import AdminModern from "../../components/AdminModern";

export default function DashboardPage() {
  return (
    <AdminModern title="Dashboard">
      <div className="admin-grid">
        <div className="span-3 stat-card">
          <div>
            <div className="stat-metric">฿ 1,284,900</div>
            <div className="stat-label">Total Revenue (30d)</div>
          </div>
          <div className="badge success">+12.4%</div>
        </div>
        <div className="span-3 stat-card">
          <div>
            <div className="stat-metric">1,842</div>
            <div className="stat-label">Orders</div>
          </div>
          <div className="badge">Avg. ฿698</div>
        </div>
        <div className="span-3 stat-card">
          <div>
            <div className="stat-metric">328</div>
            <div className="stat-label">Active Auctions</div>
          </div>
          <div className="badge warn">Live</div>
        </div>
        <div className="span-3 stat-card">
          <div>
            <div className="stat-metric">96%</div>
            <div className="stat-label">Fulfillment SLA</div>
          </div>
          <div className="badge success">SLA OK</div>
        </div>

        <div className="span-12 card">
          <div className="card-body">
            <div className="card-title">Recent Orders</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#INV-00192</td>
                  <td>Somchai T.</td>
                  <td>฿2,590</td>
                  <td>
                    <span className="badge success">Paid</span>
                  </td>
                  <td>2025-10-15</td>
                </tr>
                <tr>
                  <td>#INV-00191</td>
                  <td>Suda C.</td>
                  <td>฿890</td>
                  <td>
                    <span className="badge">Pending</span>
                  </td>
                  <td>2025-10-15</td>
                </tr>
                <tr>
                  <td>#INV-00190</td>
                  <td>Anan P.</td>
                  <td>฿4,120</td>
                  <td>
                    <span className="badge warn">Packing</span>
                  </td>
                  <td>2025-10-14</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminModern>
  );
}
