import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Login to Necha</h1>
        <SignIn path="/login" routing="path" signUpUrl="/register" />
      </div>
    </div>
  );
}

