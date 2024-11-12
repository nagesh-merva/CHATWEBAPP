import React, { useState, useEffect } from "react"
import { RiCheckDoubleFill, RiCheckFill } from "react-icons/ri"
import { io } from "socket.io-client"
import { useMainContext } from "./MainContext"
import LoginPage from "../login"

function Dashboard() {
    const [socket, setSocket] = useState(null);
    const { Username, setChats, Chats } = useMainContext()
    const [messages, setMessages] = useState(Chats || [])
    const [newMessage, setNewMessage] = useState("")
    const [isUsernameSet, setIsUsernameSet] = useState(!!Username)

    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
    }

    const groupMessagesByDate = (messages) => {
        const grouped = {}
        messages.forEach((message) => {
            const date = new Date(message.timestamp).toLocaleDateString()
            if (!grouped[date]) grouped[date] = []
            grouped[date].push(message)
        })
        return grouped
    }

    const getCurrentTimestamp = () => {
        const now = new Date()
        return now.toISOString()
    }

    const handleSendMessage = () => {
        const messageData = {
            text: newMessage,
            sender: Username,
            status: "sending",
            timestamp: getCurrentTimestamp(),
        }
        const updatedMessages = [...messages, messageData]
        setMessages(updatedMessages)
        setChats(updatedMessages)
        setNewMessage("")
        if (socket) {
            socket.emit("message", messageData, () => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg, index) =>
                        index === updatedMessages.length - 1
                            ? { ...msg, status: "received" }
                            : msg
                    )
                )
            })
        }
    }

    useEffect(() => {
        const newSocket = io("http://localhost:8080/")
        setSocket(newSocket)
        newSocket.on("message", (data) => {
            const updatedMessages = [
                ...messages,
                { ...data, status: "delivered" },
            ]
            setMessages(updatedMessages)
            setChats(updatedMessages)
            sessionStorage.setItem("messages", JSON.stringify(updatedMessages))
        })
        newSocket.on("allmsgs", (data) => {
            setChats(data)
        })
        return () => {
            newSocket.disconnect()
        }
    }, [messages])

    const groupedMessages = groupMessagesByDate(messages)

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            {!isUsernameSet ? (
                <LoginPage />
            ) : (
                <>
                    {/* Navbar */}
                    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-700">{Username}</h2>
                        <button
                            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                            onClick={() => setIsUsernameSet(false)}
                        >
                            Logout
                        </button>
                    </nav>

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {Object.keys(groupedMessages).map((date, dateIndex) => (
                            <div key={dateIndex} className="space-y-1">
                                <div className="text-center my-4 text-gray-500 text-xs font-medium">
                                    {date}
                                </div>
                                {groupedMessages[date].map((message, messageIndex) => (
                                    <div
                                        key={messageIndex}
                                        className={`flex ${message.sender === Username
                                            ? "justify-end"
                                            : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`p-3 max-w-sm rounded-xl shadow-md ${message.sender === Username
                                                ? "bg-blue-500 text-white"
                                                : "bg-white text-gray-800"
                                                }`}
                                        >
                                            <p className="text-xs text-blue-300">
                                                {message.sender === Username ? "You" : message.sender}
                                            </p>
                                            <p className="text-sm">{message.text}</p>
                                            <div className="text-right text-[9px] text-gray-400 mt-1">
                                                {formatTime(message.timestamp)}
                                                {message.sender === Username && (
                                                    <span className="ml-1">
                                                        {message.status === "sending" && (
                                                            <RiCheckFill className="inline text-gray-400" />
                                                        )}
                                                        {message.status === "received" && (
                                                            <RiCheckFill className="inline text-green-400" />
                                                        )}
                                                        {message.status === "delivered" && (
                                                            <RiCheckDoubleFill className="inline text-green-500" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="bg-white p-4 flex items-center space-x-2 border-t border-gray-300">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Send
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default Dashboard;
