import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useMainContext } from "./contexts/MainContext"
import { io } from "socket.io-client"
import Lottie from "lottie-react"
import Login from "./assets/Login-animation.json"
import Popup from "./PopUp"
import Loader from "./Loader"

function LoginPage() {
    const { setUsername } = useMainContext()
    const [username, setLocalUsername] = useState("")
    const [password, setPassword] = useState("")
    const [socket, setSocket] = useState(null)
    const navigate = useNavigate()
    const [showPopup, setShowPopup] = useState(false)
    const [popupMessage, setPopupMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const onRegisterClick = () => {
        navigate('/register')
    }

    const triggerPopup = (message) => {
        setPopupMessage(message)
        setShowPopup(true)
    }

    const handleLogin = () => {
        setLoading(true)
        if (socket) {
            socket.emit("login_request", { username, password })
        }
    }

    useEffect(() => {
        const newSocket = io("https://9j38sz47-3000.inc1.devtunnels.ms/")
        setSocket(newSocket)

        newSocket.on('login_response', (data) => {
            if (data.success) {
                setLoading(false)
                let user = username.toLowerCase()
                setUsername(user)
                navigate('/dashboard')
                window.location.reload
                triggerPopup(data.message)
            } else {
                triggerPopup(data.message)
            }
        })

        return () => {
            newSocket.disconnect()
        }
    }, [username])

    useEffect(() => {
        const newSocket = io("https://9j38sz47-3000.inc1.devtunnels.ms/")
        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [])

    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-800">
            <Popup message={popupMessage} show={showPopup} onClose={() => setShowPopup(false)} />
            <div className="bg-white shadow-2xl rounded-lg p-8 w-[90%] sm:w-[400px]">
                <div className="flex flex-col items-center">
                    <Lottie animationData={Login} className="w-[200px] mb-6" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
                    <p className="text-gray-500 text-sm mb-6 text-center">
                        Enter your username to join the chat.
                    </p>
                </div>
                {loading ? (<Loader />) : (
                    <div className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setLocalUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                        />
                        <button
                            onClick={handleLogin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out"
                        >
                            Join Chat
                        </button>
                    </div>
                )}
                <p className="text-sm text-center text-gray-500 mt-6">
                    New here?{" "}
                    <button onClick={onRegisterClick} className="text-blue-500 hover:underline">
                        Create an account
                    </button>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
