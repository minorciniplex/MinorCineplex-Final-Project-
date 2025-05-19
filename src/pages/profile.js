import { useState, useEffect } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HistoryIcon from '@mui/icons-material/History';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
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
      <div className="min-h-screen w-full bg-[#070C1B]">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#070C1B]">
      <Navbar />
      <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto pt-12">
        {/* Tab Menu */}
        <div className="grid grid-cols-2 gap-2 w-full md:w-[320px] p-4 md:pt-8">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full">
            <HistoryIcon />
            Booking history
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full">
            <LocalOfferIcon />
            My coupons
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#23263A] text-white font-semibold w-full">
            <PersonOutlineIcon />
            Profile
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-base-gray-100 font-semibold hover:bg-[#181B29] transition w-full">
            <RestartAltIcon />
            Reset password
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 w-full max-w-[400px] mx-auto p-4 md:pt-8">
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