import React, { useState } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import axios from "axios";
import { useStatus } from "@/context/StatusContext";
import CouponAlert from "@/components/Coupons-components/CouponAlert";
import Image from "next/image";
import ProfileAlert from "@/components/ProfileAlert";

// ฟังก์ชันเช็ค src ให้ปลอดภัย
const getProfileSrc = (src) => {
  if (
    typeof src === "string" &&
    src.trim() &&
    (src.startsWith("/") || src.startsWith("http"))
  ) {
    return src;
  }
  return "/default-profile.png"; // fallback ที่ควรมีใน public/
};

const ProfileUpload = () => {
  const router = useRouter();
  const { user } = useStatus();
  const { isLoggedIn, checkAuthStatus } = useStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ name: "", email: "", both: "" });
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    user_profile: "",
  });
  const [alertOpen, setAlertOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImg, setProfileImg] = useState(
    user?.user_profile || "/assets/images/default-logo.png.png"
  );

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          setProfileImg(data.secure_url);
          setForm((prev) => ({
            ...prev,
            user_profile: data.secure_url,
          }));
        } else {
          alert("Image upload failed: " + (data.error || ""));
        }
      } catch (err) {
        console.error("Error uploading image:", err);
        alert("An error occurred while uploading the image");
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/api/auth/update-profile", {
        user_profile: form.user_profile,
      });
      setLoading(true);
      await fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while saving your profile");
    }
  };

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({
        ...prev,
        email: user?.email,
      }));
    }
  }, [user?.email]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/auth/check-user");
      setForm((prev) => ({
        ...prev,

        name: response.data.data.name || "",
        user_profile: response.data.data.user_profile || "",
      }));

      setUserData(response.data.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({ name: "", email: "", both: "" }); // แก้จาก setError(null)
    setAlertOpen(false);
    setShowAlert(false);

    if (form.user_profile) {
      handleSave(e);
    }

    if (!form.name) {
      setError({ name: "Name is required ", email: "", both: "" });
      setLoading(false);
      return;
    }

    if (!form.email) {
      setError({ name: "", email: "Email is required ", both: "" });
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError({ name: "", email: "Email is invalid", both: "" });
      setLoading(false);
      return;
    }

    // เช็ค userData ก่อนใช้งาน
    if (
      userData &&
      form.name === userData.name &&
      form.email === userData.email &&
      form.user_profile === userData.user_profile
    ) {
      setError({ name: "", email: "", both: "No changes made" });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put("/api/auth/change-profile", form);
      if (response.status === 200) {
        setError({ name: "", email: "", both: "" });
        setAlertOpen("อัพเดทโปรไฟล์สำเร็จ");
        // รีเฟรชข้อมูลผู้ใช้
        checkAuthStatus();
        fetchUserData();
      }
    } catch (error) {
      setError({
        name: "",
        email: "",
        both: error.response?.data?.error || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full md:w-max h-[596px] gap-10 px-4 md:px-0 md:ml-12">
      <h1 className="text-[36px] font-bold mb-4">Profile</h1>
      <h2 className="text-[#8B93B0] text-lg w-full lg:w-[550px]">
        Keep your personal details private.
      </h2>
      <h2 className="text-[#8B93B0] text-lg mb-4 w-full lg:w-[550px]">
        Information you add here is visible to anyone who can view your profile
      </h2>
      <div>
        {/* Content */}
        <div className="flex-1 w-full max-w-[400px] mx-auto md:pt-14 md:ml-[20px] md:mt-[-38px]">
          <div className="flex flex-col items-start mb-6">
            <div className="w-[120px] h-[120px] rounded-full bg-[#23263A] flex items-center justify-center overflow-hidden mb-2 relative">
              <Image
                src={getProfileSrc(form.user_profile)}
                alt="Profile"
                width={120}
                height={120}
                className="object-cover w-[120px] h-[120px] rounded-full"
              />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-10">
                  <svg
                    className="animate-spin h-8 w-8 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <label className="body-1-regular text-white cursor-pointer text-sm underline ml-[140px] mt-[-26px] ">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={uploadingImage}
              />
            </label>
          </div>
        </div>
      </div>
      <ProfileAlert
        show={showAlert}
        title="Saved profile"
        description="Your profile has been successfully updated"
        onClose={() => setShowAlert(false)}
      />

      <form onSubmit={handleSubmit} className="w-full text-[#8B93B0]">
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
            className={
              error?.name
                ? "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                : "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-[#565F7E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          />
          {error?.name ? <p className="text-red-500">{error?.name}</p> : null}

          <label htmlFor="name" className="block mb-2 font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={
              error?.email
                ? "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                : "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-[#565F7E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          />
          {error?.email ? <p className="text-red-500">{error?.email}</p> : null}
        </div>

        <button
          type="submit"
          className="w-[111px] h-[48px] pt-3 pr-10 pb-3 pl-10 gap-1.5 rounded border bg-[#070C1B] text-white border-[#565F7E] hover:bg-[#1c223a] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save
        </button>
        {error?.both ? (
          <p className="text-red-500 pt-2">{error?.both}</p>
        ) : null}
      </form>
      <CouponAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        text="Update profile data successfully"
        text_sub="Your data have been changed"
      />
    </div>
  );
};

export default ProfileUpload;
