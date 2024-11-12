import { useEffect, useState } from "react"
import { useMainContext } from "./contexts/MainContext"
import { io } from "socket.io-client"
import Lottie from "lottie-react"
import Login from "./assets/Login-animation.json"

function LoginPage() {
    const { setUsername } = useMainContext()
    const [username, setLocalUsername] = useState("")
    const [socket, setSocket] = useState(null)

    const handleSetUsername = () => {
        setUsername(username)
        if (socket) {
            socket.emit("user_joined", username)
        }
        setLocalUsername("")
        window.location.reload()
    }

    useEffect(() => {
        const newSocket = io("http://localhost:8080/")
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [])

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-800">
            <div className="bg-white shadow-2xl rounded-lg p-8 w-[90%] sm:w-[400px]">
                <div className="flex flex-col items-center">
                    <Lottie animationData={Login} className="w-[200px] mb-6" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
                    <p className="text-gray-500 text-sm mb-6 text-center">
                        Enter your username to join the chat.
                    </p>
                </div>
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setLocalUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                    <button
                        onClick={handleSetUsername}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
                    >
                        Join Chat
                    </button>
                </div>
                <p className="text-sm text-center text-gray-500 mt-6">
                    New here?{" "}
                    <a href="#" className="text-blue-500 hover:underline">
                        Create an account
                    </a>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
