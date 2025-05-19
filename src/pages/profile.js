import { useState } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar/Navbar';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import HistoryIcon from '@mui/icons-material/History';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Button from '@/components/Button';

export default function Profile() {
  const [name, setName] = useState('Bruce Wayne');
  const [email, setEmail] = useState('iambatman@gmail.com');
  const [profileImg, setProfileImg] = useState('/assets/images/default-logo.png.png');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImg(ev.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: เพิ่ม logic บันทึกข้อมูล
    alert('บันทึกข้อมูลสำเร็จ!');
  };

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
            <div className="w-[120px] h-[120px] rounded-full bg-[#23263A] flex items-center justify-center overflow-hidden mb-2">
              <Image
                src={profileImg}
                alt="Profile"
                width={120}
                height={120}
                className="object-cover w-[120px] h-[120px] rounded-full"
              />
            </div>
            <label className="body-1-regular text-white cursor-pointer text-sm underline ml-[140px] mt-[-26px] ">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
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
            <Button variant="secondary" className="!w-[111px] !h-[48px] !rounded-[4px] !text-white !mb-[80px] ">
              Save
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 