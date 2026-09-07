import { useState } from "react";
import api from "../api/axios";

function Compare() {
  const [testId, setTestId] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const res = await api.get(
        `/compare/${testId}`
      );

      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Compare Tests</h1>

      <input
        type="number"
        placeholder="Enter Test ID"
        value={testId}
        onChange={(e) =>
          setTestId(e.target.value)
        }
      />

      <button onClick={handleSearch}>
        Compare
      </button>

      <hr />

      {results.map((item, index) => (
        <div key={index}>
          <h3>{item.lab_name}</h3>

          <p>Price: ₹{item.price}</p>

          <p>Rating: {item.rating}</p>
        </div>
      ))}
    </div>
  );
}

export default Compare;