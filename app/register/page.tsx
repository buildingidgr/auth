import { SignUp } from "@clerk/nextjs";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Register for Necha</h1>
        <SignUp path="/register" routing="path" signInUrl="/login" />
      </div>
    </div>
  );
}

