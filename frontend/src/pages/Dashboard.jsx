import { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const res = await api.get(
        "/dashboard/user",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Name: {user.name}</p>

      <p>Email: {user.email}</p>

      <p>
        Total Appointments:
        {user.total_appointments}
      </p>

      <p>
        Total Payments:
        {user.total_payments}
      </p>
    </div>
  );
}

export default Dashboard;