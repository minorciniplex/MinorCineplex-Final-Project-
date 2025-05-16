import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import axios from 'axios';
import { useStatus } from '@/context/StatusContext';
import Navbar from '@/components/Navbar/Navbar';

const ProfileUpload = () => {
    const router = useRouter();
    const { user } = useStatus();
    const { isLoggedIn, checkAuthStatus } = useStatus();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const response = await axios.put('/api/auth/change-email-name', form);
            if (response.status === 200) {
                setSuccess('อัพเดทโปรไฟล์สำเร็จ');
                setForm({ name: '', email: '', password: '' });
                // รีเฟรชข้อมูลผู้ใช้
                checkAuthStatus();
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <Navbar />
            <div className="w-[711px] h-[596px] gap-10">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <h2 className="text-lg font-bold mb-4">Keep your personal details private. 
                Information you add here is visible to anyone who can view your profile</h2>
                
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

                <form onSubmit={handleSubmit} className="max-w-md">
                    <div className="mb-4">
                        <label htmlFor="name" className="block mb-2 font-medium">ชื่อ</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={form.name}
                            placeholder={user?.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 font-medium">อีเมล</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            placeholder={user?.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? 'กำลังอัพเดท...' : 'อัพเดทโปรไฟล์'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfileUpload;