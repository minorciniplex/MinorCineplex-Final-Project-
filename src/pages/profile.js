import { useState } from 'react';
import Image from 'next/image';

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
    <div className="min-h-screen bg-[#181B29] text-white px-4 pt-20 flex flex-col items-center">
      <div className="w-full max-w-[400px] mx-auto">
        <h1 className="text-2xl font-bold mb-2">Profile</h1>
        <p className="text-base text-[#8B93B0] mb-6">
          Keep your personal details private.<br />
          Information you add here is visible to anyone who can view your profile
        </p>
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[#23263A] flex items-center justify-center overflow-hidden mb-2">
            <Image
              src={profileImg}
              alt="Profile"
              width={96}
              height={96}
              className="object-cover w-24 h-24 rounded-full"
            />
          </div>
          <label className="text-[#8B93B0] cursor-pointer text-sm underline">
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
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#23263A] border border-[#31365A] rounded text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-[#23263A] border border-[#31365A] rounded text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 mt-2 rounded border border-[#31365A] bg-[#23263A] text-white font-semibold hover:bg-[#23263A]/80 transition"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
} 