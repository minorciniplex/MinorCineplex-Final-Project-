import React from 'react';
import Button from '../../components/Button';

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="headline-1 bg-brand-blue-300 text-white p-4 rounded-lg mb-8 text-center">การใช้ Tailwind CSS กับ Props</h1>

        {/* Typography Examples */}
        <div className="grid gap-6 mb-12">
          <h1 className="headline-1 text-white">หัวข้อหลัก (Headline 1)</h1>
          <h2 className="headline-2 text-brand-blue-100">หัวข้อรอง (Headline 2)</h2>
          <h3 className="headline-3 text-brand-red">หัวข้อย่อย (Headline 3)</h3>
          <p className="text-base text-base-gray-200">เนื้อหาปกติ (Body 1 Regular)</p>
          <p className="text-base font-bold text-base-gray-200">เนื้อหาเน้น (Body 1 Medium)</p>
        </div>

        {/* Responsive Design Examples */}
        <div className="grid gap-4 mb-12">
          <div className="block md:hidden lg:hidden p-4 bg-brand-blue-100 text-white rounded-lg">
            แสดงเฉพาะบนมือถือ
          </div>
          <div className="hidden md:block lg:hidden p-4 bg-brand-green text-white rounded-lg">
            แสดงเฉพาะบนแท็บเล็ต
          </div>
          <div className="hidden md:hidden lg:block p-4 bg-brand-red text-white rounded-lg">
            แสดงเฉพาะบนเดสก์ท็อป
          </div>
        </div>

        {/* Color Examples */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          <div className="p-4 bg-base-gray-100 text-white rounded-lg shadow-md">
            พื้นหลังสีเทา
          </div>
          <div className="p-4 bg-brand-blue-100 text-white rounded-lg shadow-md">
            พื้นหลังสีน้ำเงิน
          </div>
          <div className="p-4 bg-brand-green text-white rounded-lg shadow-md">
            พื้นหลังสีเขียว
          </div>
          <div className="p-4 bg-brand-red text-white rounded-lg shadow-md">
            พื้นหลังสีแดง
          </div>
          <div className="p-4">
            <button className="w-full sm:w-auto px-6 py-3 bg-brand-blue-100 text-white rounded-[10px] hover:bg-brand-blue-200">
              Button
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center p-4 gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="w-14 h-14 border-2 border-blue-600 rounded-full flex items-center justify-center">
              <div className="body-1-regular text-white">1</div>
            </div>
          </div>
        </div>

        {/* Button Examples */}
        <div className="mb-12">
          <h3 className="headline-3 text-white mb-6">ตัวอย่างการใช้ Button Component</h3>
          
          {/* Button Variants */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <p className="text-white w-32">ค่าเริ่มต้น:</p>
              <Button>Button</Button>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-white w-32">Primary:</p>
              <Button variant="primary">Button</Button>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-white w-32">Secondary:</p>
              <Button variant="secondary">Button</Button>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-white w-32">Outline:</p>
              <Button variant="outline">Button</Button>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-white w-32">Danger:</p>
              <Button variant="danger">Button</Button>
            </div>

            <div className="flex items-center gap-4">
              <p className="text-white w-32">Success:</p>
              <Button variant="success">Button</Button>
            </div>
          </div>
        </div>

         

      </div>
    </div>
  );
}

