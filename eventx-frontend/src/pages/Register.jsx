import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("https://eventx-studio-project2.onrender.com/api/auth/register", {
        name,
        email,
        password,
        age,
        gender,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded shadow-md w-96"
        onSubmit={handleSubmit}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {/* Name */}
        <input
          className="border p-2 mb-4 w-full rounded"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Email */}
        <input
          className="border p-2 mb-4 w-full rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          className="border p-2 mb-4 w-full rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Age */}
        <input
          className="border p-2 mb-4 w-full rounded"
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />

        {/* Gender */}
        <select
          className="border p-2 mb-4 w-full rounded"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {/* Submit */}
        <button
          className="bg-green-500 text-white p-2 w-full rounded hover:bg-green-600 transition"
          type="submit"
        >
          Register
        </button>

        {/* Login Redirect */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
