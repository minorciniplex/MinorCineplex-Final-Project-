import Link from "next/link";
import { use, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import NavbarByCinema from "../../home-landing/sections/NavbarByCinema/NavbarByCinema";
import { Loading } from "@/components/ui/loading";
import { useStatus } from "@/context/StatusContext";
import { useEffect } from "react";

export default function Login() {
  const {isLoggedIn, checkAuthStatus} = useStatus();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/home-landing");
    }
  }, [isLoggedIn]);

  const [error, setError] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [resError, setResError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/login", form);
      if (response.status === 200) {
        setForm({ email: "", password: "", remember: false });
        setError({ email: "", password: "" });
        setResError("");
        setLoading(false);
        console.log("login success");
        await checkAuthStatus();
        router.push("/home-landing");
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.error);
        setResError("Invalid email or password");
        setLoading(false);
        setForm({ ...form, password: "" });
      } else {
        console.error("Error:", error.message);
        setLoading(false);
      }
    }
  };

  const validateForm = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.email) {
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
    <>
      <NavbarByCinema />
      <div className="min-h-screen flex items-center justify-center px-4">
        {loading ? (
          <Loading />
        ) : (
          <form
            onSubmit={validateForm}
            className="w-full max-w-md text-white space-y-5"
          >
            <h2 className="text-center headline-2 ">Login</h2>

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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="accent-blue-600"
                />
                <span>Remember me</span>
              </label>
              <Link href="/forgot-password" className="underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className={
                form.email && form.password
                  ? `w-full py-2 bg-[#4E7BEE] text-white rounded hover:bg-[#4E7BEE] hover:bg-opacity-40 transition`
                  : `w-full py-2 bg-[#4E7BEE] bg-opacity-40 text-[rgba(255,255,255,0.4)] rounded`
              }
            >
              Login
            </button>

            <p className="text-center text-sm mt-2">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="underline font-medium">
                Register
              </Link>
            </p>
          </form>
        )}
      </div>
    </>
  );
}
