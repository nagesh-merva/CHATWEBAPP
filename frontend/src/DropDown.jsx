import React, { useState, useEffect } from "react"
import { useMainContext } from "./contexts/MainContext"
import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'

const DropdownMenu = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [activeUsers, setActiveUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const { setUsername } = useMainContext()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchActiveUsers = async () => {
            try {
                const response = await fetch("https://chatwebapp-9gae.onrender.com/api/active_users")
                if (response.ok) {
                    const data = await response.json()
                    setActiveUsers(data.activeUsers || [])
                } else {
                    console.error("Failed to fetch active users")
                }
            } catch (error) {
                console.error("Error fetching active users:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchActiveUsers()
    }, [])

    const Logout = () => {
        setUsername("")
        navigate('/')
    }

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hover:text-white text-2xl px-4 py-1 rounded hover:bg-blue-600 text-black"
            >
                <FontAwesomeIcon icon={faBars} className="inline text-gray-500" />
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg">
                    <div className="py-2">
                        <button
                            onClick={Logout}
                            className="block px-4 py-2 text-gray-100 bg-red-500 hover:bg-red-300 w-full text-left"
                        >
                            Logout
                        </button>
                    </div>
                    <div className="border-t">
                        <h3 className="px-4 py-2 text-sm text-gray-500">Active Users</h3>
                        {loading ? (
                            <p className="px-4 py-2 text-gray-500">Loading...</p>
                        ) : activeUsers.length > 0 ? (
                            <ul className="max-h-40 overflow-y-auto">
                                {activeUsers.map((user, index) => (
                                    <li
                                        key={index}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100"
                                    >
                                        {user.username}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="px-4 py-2 text-gray-500">No active users</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DropdownMenu
