import Link from "next/link";

export default function RegisterSuccess() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 ">
      <section className="w-full max-w-md text-white text-center flex flex-col items-center space-y-8">
        <div className="w-24 h-24 bg-brand-green rounded-full flex items-center justify-center">
          <svg
            className="w-16 h-16 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-[36px] font-bold">Registration success</h2>
        <p className="text-[16px] text-[#8B93B0]">
          Your account has been successfully created!
        </p>

        <Link href="/auth/login" className="w-full">
          <button
            type="button"
            className="w-full py-2 bg-[#4E7BEE] text-white rounded hover:bg-[#4E7BEE] hover:bg-opacity-40 transition"
          >
            Go to Login
          </button>
        </Link>
      </section>
    </main>
  );
}
