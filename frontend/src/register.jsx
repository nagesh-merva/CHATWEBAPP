import { useState } from "react";
import Lottie from "lottie-react";
import RegisterAnimation from "./assets/Register-animation.json";

function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = () => {
        // Placeholder functionality for registration
        console.log("User Registered:", { username, email, password });
        setUsername("");
        setEmail("");
        setPassword("");
        alert("Registration Successful!");
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-green-400 via-teal-500 to-blue-600">
            <div className="bg-white shadow-2xl rounded-lg p-8 w-[90%] sm:w-[400px]">
                <div className="flex flex-col items-center">
                    <Lottie animationData={RegisterAnimation} className="w-[200px] mb-6" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                    <p className="text-gray-500 text-sm mb-6 text-center">
                        Join us and start your journey today!
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                    <button
                        onClick={handleRegister}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
                    >
                        Register
                    </button>
                </div>
                <p className="text-sm text-center text-gray-500 mt-6">
                    Already have an account?{" "}
                    <a href="#" className="text-green-500 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
