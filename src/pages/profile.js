import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';
import Button from '@/components/Button';
import axios from 'axios';
import { useRouter } from 'next/router';
import ProfileAlert from '@/components/ProfileAlert';

export default function Profile() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImg, setProfileImg] = useState('/assets/images/default-logo.png.png');
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/auth/check-user');
      if (response.data?.data) {
        const userData = response.data.data;
        setName(userData.name);
        setEmail(userData.email);
        setProfileImg(userData.user_profile || '/assets/images/default-logo.png.png');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        router.push('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [router]);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          setProfileImg(data.secure_url);
        } else {
          alert('Image upload failed: ' + (data.error || ''));
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('An error occurred while uploading the image');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/update-profile', {
        name,
        email,
        user_profile: profileImg
      });
      setShowAlert(true);
      setLoading(true);
      await fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while saving your profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background md:h-screen md:overflow-hidden md:flex md:items-center md:justify-center">
      <Navbar />
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto pt-12 md:pt-0 md:mt-[100px]">
        {/* Tab Menu */}
        {/* Desktop menu */}
        <div className="hidden md:flex flex-col w-[257px] h-[288px] bg-[#070C1B] rounded-[4px] p-4 pb-6 gap-2 shadow-[0_4px_30px_0_rgba(0,0,0,0.5)] mr-6">
          <button className="flex items-center gap-3 px-4 py-3 rounded-[4px] text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full">
            {/* Booking history SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="3.333" width="10.833" height="14.167" rx="2" stroke="#8B93B0" />
              <path d="M12.5 8.333V6.666" stroke="#8B93B0" stroke-linecap="round" />
              <path d="M3.334 7.5H6.667" stroke="#8B93B0" stroke-linecap="round" />
              <path d="M3.334 10.833H6.667" stroke="#8B93B0" stroke-linecap="round" />
              <path d="M3.334 14.167H6.667" stroke="#8B93B0" stroke-linecap="round" />
            </svg>
            Booking history
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-[4px] text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full">
            {/* My coupons SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.125 11.421L11.875 7.745M8.125 7.745H8.134M11.867 11.421H11.875M2.848 7.63C2.662 7.63 2.492 7.482 2.5 7.288C2.551 6.154 2.692 5.416 3.085 4.832C3.31 4.5 3.592 4.208 3.918 3.969C4.792 3.333 6.025 3.333 8.494 3.333H11.505C13.974 3.333 15.208 3.333 16.083 3.969C16.406 4.204 16.688 4.496 16.915 4.832C17.308 5.416 17.45 6.154 17.5 7.288C17.508 7.482 17.338 7.63 17.151 7.63C16.111 7.63 15.268 8.504 15.268 9.583C15.268 10.662 16.111 11.536 17.151 11.536C17.338 11.536 17.508 11.685 17.5 11.879C17.45 13.012 17.308 13.75 16.915 14.335C16.69 14.667 16.408 14.959 16.082 15.197C15.208 15.833 13.974 15.833 11.505 15.833H8.495C6.026 15.833 4.792 15.833 3.917 15.197C3.591 14.958 3.31 14.666 3.085 14.334C2.692 13.75 2.551 13.012 2.5 11.878C2.492 11.685 2.662 11.536 2.848 11.536C3.888 11.536 4.731 10.662 4.731 9.583C4.731 8.504 3.888 7.63 2.848 7.63Z" stroke="#8B93B0" stroke-width="1.2" stroke-linecap="round" />
            </svg>
            My coupons
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-[4px] bg-[#23263A] text-white font-semibold w-full">
            {/* Profile SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="8" rx="4" ry="4" stroke="#8B93B0" stroke-width="1.2" />
              <path d="M20 20C20 16.6863 16.4183 14 12 14C7.58172 14 4 16.6863 4 20" stroke="#8B93B0" stroke-width="1.2" />
            </svg>
            Profile
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-[4px] text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full">
            {/* Reset password SVG (ใหม่) */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 15L10 19L14 23" stroke="#8B93B0" />
              <path
                d="M5.93782 15.5C5.14475 14.1264 4.84171 12.5241 5.07833 10.9557C5.31495 9.38734 6.07722 7.94581 7.24024 6.86729C8.40327 5.78877 9.8981 5.13721 11.4798 5.01935C13.0616 4.90149 14.6365 5.32432 15.9465 6.21856C17.2565 7.1128 18.224 8.42544 18.6905 9.94144C19.1569 11.4574 19.0947 13.0869 18.5139 14.5629C17.9332 16.0389 16.8684 17.2739 15.494 18.0656C14.1196 18.8573 12.517 19.1588 10.9489 18.9206"
                stroke="#8B93B0"
                stroke-linecap="round"
              />
            </svg>
            Reset password
          </button>
        </div>
        {/* Mobile menu */}
        <div className="grid grid-cols-2 md:hidden gap-2 w-full p-2 pt-4">
          <button className="flex items-center gap-2 px-2 py-2 rounded-[4px] text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full text-sm">
            {/* Booking history SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="3.333" width="10.833" height="14.167" rx="2" stroke="#8B93B0" />
              <path d="M12.5 8.333V6.666" stroke="#8B93B0" stroke-linecap="round" />
              <path d="M3.334 7.5H6.667" stroke="#8B93B0" stroke-linecap="round" />
              <path d="M3.334 10.833H6.667" stroke="#8B93B0" stroke-linecap="round" />
              <path d="M3.334 14.167H6.667" stroke="#8B93B0" stroke-linecap="round" />
            </svg>
            Booking history
          </button>
          <button className="flex items-center gap-2 px-2 py-2 rounded-[4px] text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full text-sm">
            {/* My coupons SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.125 11.421L11.875 7.745M8.125 7.745H8.134M11.867 11.421H11.875M2.848 7.63C2.662 7.63 2.492 7.482 2.5 7.288C2.551 6.154 2.692 5.416 3.085 4.832C3.31 4.5 3.592 4.208 3.918 3.969C4.792 3.333 6.025 3.333 8.494 3.333H11.505C13.974 3.333 15.208 3.333 16.083 3.969C16.406 4.204 16.688 4.496 16.915 4.832C17.308 5.416 17.45 6.154 17.5 7.288C17.508 7.482 17.338 7.63 17.151 7.63C16.111 7.63 15.268 8.504 15.268 9.583C15.268 10.662 16.111 11.536 17.151 11.536C17.338 11.536 17.508 11.685 17.5 11.879C17.45 13.012 17.308 13.75 16.915 14.335C16.69 14.667 16.408 14.959 16.082 15.197C15.208 15.833 13.974 15.833 11.505 15.833H8.495C6.026 15.833 4.792 15.833 3.917 15.197C3.591 14.958 3.31 14.666 3.085 14.334C2.692 13.75 2.551 13.012 2.5 11.878C2.492 11.685 2.662 11.536 2.848 11.536C3.888 11.536 4.731 10.662 4.731 9.583C4.731 8.504 3.888 7.63 2.848 7.63Z" stroke="#8B93B0" stroke-width="1.2" stroke-linecap="round" />
            </svg>
            My coupons
          </button>
          <button className="flex items-center gap-2 px-2 py-2 rounded-[4px] bg-[#23263A] text-white font-semibold w-full text-sm">
            {/* Profile SVG */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="12" cy="8" rx="4" ry="4" stroke="#8B93B0" stroke-width="1.2" />
              <path d="M20 20C20 16.6863 16.4183 14 12 14C7.58172 14 4 16.6863 4 20" stroke="#8B93B0" stroke-width="1.2" />
            </svg>
            Profile
          </button>
          <button className="flex items-center gap-2 px-2 py-2 rounded-[4px] text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full text-sm">
            {/* Reset password SVG (ใหม่) */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 15L10 19L14 23" stroke="#8B93B0" />
              <path
                d="M5.93782 15.5C5.14475 14.1264 4.84171 12.5241 5.07833 10.9557C5.31495 9.38734 6.07722 7.94581 7.24024 6.86729C8.40327 5.78877 9.8981 5.13721 11.4798 5.01935C13.0616 4.90149 14.6365 5.32432 15.9465 6.21856C17.2565 7.1128 18.224 8.42544 18.6905 9.94144C19.1569 11.4574 19.0947 13.0869 18.5139 14.5629C17.9332 16.0389 16.8684 17.2739 15.494 18.0656C14.1196 18.8573 12.517 19.1588 10.9489 18.9206"
                stroke="#8B93B0"
                stroke-linecap="round"
              />
            </svg>
            Reset password
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 w-full max-w-[400px] mx-auto p-4 md:pt-8 md:ml-[20px] md:mt-[-38px]">
          <h1 className="headline-2 mb-2">Profile</h1>
          <p className="body-1-regular text-base-gray-300 mb-6">
            Keep your personal details private.<br />
            Information you add here is visible to anyone who can view your profile
          </p>
          <div className="flex flex-col items-start mb-6">
            <div className="w-[120px] h-[120px] rounded-full bg-[#23263A] flex items-center justify-center overflow-hidden mb-2 relative">
              <Image
                src={profileImg}
                alt="Profile"
                width={120}
                height={120}
                className="object-cover w-[120px] h-[120px] rounded-full"
              />
              {uploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full z-10">
                  <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
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
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="block body-2-regular text-base-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 bg-[#23263A] border border-[#31365A] rounded body-2-regular text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block body-2-regular text-base-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#23263A] border border-[#31365A] rounded body-2-regular text-white focus:outline-none"
              />
            </div>
            <Button type="submit" variant="secondary" className="!w-[111px] !h-[48px] !rounded-[4px] !text-white !mb-[80px] ">
              Save
            </Button>
          </form>
        </div>
      </div>
      <ProfileAlert
        show={showAlert}
        title="Saved profile"
        description="Your profile has been successfully updated"
        onClose={() => setShowAlert(false)}
      />
    </div>
  );
} 