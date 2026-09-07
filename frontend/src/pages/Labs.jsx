import { useEffect, useState } from "react";
import api from "../api/axios";

function Labs() {
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      const res = await api.get("/lab");

      setLabs(res.data);

      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Labs</h1>

      {labs.map((lab) => (
        <div
          key={lab.id}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
          }}
        >
          <h3>{lab.name}</h3>

          <p>{lab.address}</p>

          <p>Rating: {lab.rating}</p>
        </div>
      ))}
    </div>
  );
}

export default Labs;