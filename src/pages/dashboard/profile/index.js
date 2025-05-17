import React, { useState } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import axios from "axios";
import { useStatus } from "@/context/StatusContext";
import Navbar from "@/components/Navbar/Navbar";

const ProfileUpload = () => {
  const router = useRouter();
  const { user } = useStatus();
  const { isLoggedIn, checkAuthStatus } = useStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });



  useEffect(() => {
  if (user?.email) {
    setForm((prev) => ({
      ...prev,
      email: user.email,
    }));
  }
}, [user?.email]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/auth/check-user");
         setForm({
        name: response.data.data.name || "",
      });

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!form.name || !form.email) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Email is invalid");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put("/api/auth/change-profile", form);
      if (response.status === 200) {
        setSuccess("อัพเดทโปรไฟล์สำเร็จ");
        // รีเฟรชข้อมูลผู้ใช้
        checkAuthStatus();
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[711px] h-[596px] gap-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <h2 className="text-lg font-bold mb-4">
        Keep your personal details private. Information you add here is visible
        to anyone who can view your profile
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
        <div >
            upload profile image
            {/* upload profile image icon*/}
            <div className="bg-white rounded-full w-[40px] h-[40px]">
            <svg
              width="40"
              height="40"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="px-2"
            >
              <path
                d="M16.4402 17.0389C16.0603 15.9757 15.2234 15.0363 14.0591 14.3662C12.8948 13.6962 11.4682 13.333 10.0007 13.333C8.53309 13.333 7.10654 13.6962 5.94224 14.3662C4.77795 15.0363 3.94098 15.9757 3.56115 17.0389"
                stroke="#8B93B0"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <ellipse
                cx="9.99935"
                cy="6.66634"
                rx="3.33333"
                ry="3.33333"
                stroke="#8B93B0"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            </div>
             {/* upload profile image icon*/}
        </div>

      <form onSubmit={handleSubmit} className="max-w-md text-[#8B93B0]">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 font-medium">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#21263F] border-[#565F7E] rounded-[4px]"
            required
          />

          <label htmlFor="name" className="block mb-2 font-medium">
            Email
          </label>
          <input 
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#21263F] border-[#565F7E] rounded-[4px]"
            required
          />
        </div>
       
        <button
          type="submit"
          disabled={loading}
          className={`w-[111px] h-[48px] pt-3 pr-10 pb-3 pl-10 gap-1.5 rounded border bg-[#070C1B] text-white border-[#565F7E] ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Updating..." : "Save"}
        </button>
      </form>
    </div>
  );
};

export default ProfileUpload;
