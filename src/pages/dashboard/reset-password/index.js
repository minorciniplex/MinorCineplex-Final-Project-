import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CouponAlert from "@/components/Coupons-components/CouponAlert";


function ResetPassword() {
  const router = useRouter();
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [resError, setResError] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let isValid = true;
    const newError = { password: "", confirmPassword: "" };

    if (!form.password) {
      newError.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 6) {
      newError.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (!form.confirmPassword) {
      newError.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (form.confirmPassword !== form.password) {
      newError.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setError(newError);
    if (isValid) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/reset-password", {
        newPassword: form.password,
        confirmPassword: form.confirmPassword,
      });
      if (response.status === 200) {
        setForm({ password: "", confirmPassword: "" });
        setError({ password: "", confirmPassword: "" });
        setResError("");
        setLoading(false);
        setAlertOpen(true);
      }
    } catch (error) {
      if (error.response) {
        console.log(error.response.data.error);
        setResError("Invalid password");
        setLoading(false);
        setForm({ ...form, password: "", confirmPassword: "" });
      } else {
        console.error("Error:", error.message);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-start justify-start min-h-screen w-[400px] px-4 ">
        <form
          className="flex flex-col justify-center item-center w-full max-w-sm text-white space-y-2 "
          onSubmit={(e) => {
            e.preventDefault();
            validateForm();
          }}
        >
          <div className="flex flex-col justify-start items-start w-full ">
            <h1 className="text-[36px] lg:text-[36px] font-bold mb-4 ">
              Reset Password
            </h1>
          </div>

          <p className="py-4 text-[#C8CEDD]">New password</p>
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={form.password}
            onChange={handleChange}
            className={
              error.password ||
              error.confirmPassword === "Passwords do not match"
                ? "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                : "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-[#565F7E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          />
          {error.password && <p className="text-red-500">{error.password}</p>}
          <p className="py-4 text-[#C8CEDD]">Confirm password</p>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={
              error.confirmPassword
                ? "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                : "w-full px-4 py-2 mb-4 bg-[#1c223a] border border-[#565F7E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            }
          />
          {error.confirmPassword === "Confirm password is required" && (
            <p className="text-red-500 ">{error.confirmPassword}</p>
          )}
          <div className="py-4 ">
          <button
            type="submit"
            disabled={loading}
            className="w-1/2 h-[48px] px-4 py-2  text-white rounded-lg border border-[#565F7E] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset Password
          </button>
          </div>
        </form>
        {error.confirmPassword === "Passwords do not match" && (
          <p className=" text-red-500">{error.confirmPassword}</p>
        )}
        {resError && <p className="mt-4 text-red-500">{resError}</p>}
      </div>
      <CouponAlert
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        text="Password reset successfully"
        text_sub="You can now log in with your new password."
      />
    </>
  );
}

export default ResetPassword;
