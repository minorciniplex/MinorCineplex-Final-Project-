import Link from "next/link";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [resError, setResError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/register", form);
      if (response.status === 201) {
        setForm({ name: "", email: "", password: "" });
        setError({ name: "", email: "", password: "" });
        setResError("");
        setLoading(false);
        router.push("/auth/register-complete");
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.error);
        setResError("email already exists");
        setLoading(false);
        setForm({ ...form, password: "" });
      } else {
        console.error("Error:", error.message);
      }
    }
  };

  const validateForm = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.name) {
      newErrors.name = "Name is required";
    }
    if (!form.email) {
      setResError("");
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setError(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {loading ? (
        <p>loading</p>
      ) : (
        <form
          onSubmit={validateForm}
          className="w-full max-w-md text-white space-y-5"
        >
          <h2 className="text-center text-[36px] font-bold">Register</h2>

          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              className={
                error.name
                  ? "w-full px-4 py-2 bg-[#1c223a] border border-red-600 rounded focus:outline-none"
                  : "w-full px-4 py-2 bg-[#1c223a] border border-gray-600 rounded focus:outline-none"
              }
            />
            {error.name && <p className="text-red-600 text-sm">{error.name}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={
                error.email || resError
                  ? "w-full px-4 py-2 bg-[#1c223a] border border-red-600 rounded focus:outline-none"
                  : "w-full px-4 py-2 bg-[#1c223a] border border-gray-600 rounded focus:outline-none"
              }
            />
            {error.email && (
              <p className="text-red-600 text-sm">{error.email}</p>
            )}
            {resError && <p className="text-red-600 text-sm">{resError}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className={
                error.password
                  ? "w-full px-4 py-2 bg-[#1c223a] border border-red-600 rounded focus:outline-none"
                  : "w-full px-4 py-2 bg-[#1c223a] border border-gray-600 rounded focus:outline-none"
              }
            />
            {error.password && (
              <p className="text-red-600 text-sm">{error.password}</p>
            )}
          </div>

          <button
            type="submit"
            className={
              form.name && form.email && form.password
                ? `w-full py-2 bg-[#4E7BEE] text-white rounded hover:bg-[#4E7BEE] hover:bg-opacity-40 transition`
                : `w-full py-2 bg-[#4E7BEE] bg-opacity-40 text-[rgba(255,255,255,0.4)] rounded`
            }
          >
            Register
          </button>

          <p className="text-center text-[16px] text-[#8B93B0] mt-2 ">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="underline font-medium text-white"
            >
              Login
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
