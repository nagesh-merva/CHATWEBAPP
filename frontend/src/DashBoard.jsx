import React, { useState, useEffect, useRef } from "react"
import { RiCheckDoubleFill, RiCheckFill } from "react-icons/ri"
import { io } from "socket.io-client"
import { BsEmojiSmile } from "react-icons/bs"
import EmojiPicker from "emoji-picker-react"
import { useMainContext } from "./contexts/MainContext"
import { useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from 'uuid'
import DropdownMenu from "./DropDown"

function Dashboard() {
    const [socket, setSocket] = useState(null);
    const { Username, setChats, Chats, pendingMessages, addPendingMessage, removePendingMessage } = useMainContext()
    const [messages, setMessages] = useState(Chats || [])
    const [newMessage, setNewMessage] = useState("")
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const navigate = useNavigate()
    const chatContainerRef = useRef(null)

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
    }, [messages])

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

    const retryFailedMessages = () => {
        console.log('called')
        pendingMessages.forEach((msg) => {
            if (socket) {
                socket.emit("message", msg, () => {
                    setMessages((prevMessages) =>
                        prevMessages.map((msg) =>
                            msg.id === msg.id ? { ...msg, status: "received" } : msg
                        )
                    )
                    console.log('sent')
                    removePendingMessage(msg.text)
                })
            }
        })
    }

    useEffect(() => {
        if (socket && pendingMessages.length > 0) {
            retryFailedMessages()
        }
    }, [pendingMessages, socket])


    const handleSendMessage = () => {
        if (!newMessage.trim()) return

        const messageData = {
            id: uuidv4(),
            text: newMessage,
            sender: Username,
            status: "sending",
            timestamp: getCurrentTimestamp(),
        }
        addPendingMessage(messageData)
        const updatedMessages = [...messages, messageData].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        )
        setMessages(updatedMessages)
        setChats(updatedMessages)
        setNewMessage("")

        if (socket) {
            socket.emit("message", messageData, () => {
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === messageData.id ? { ...msg, status: "received" } : msg
                    )
                )
                removePendingMessage(messageData.text)
            })
        }
    }

    console.log(pendingMessages)

    useEffect(() => {
        const newSocket = io("http://localhost:8080/", {
            query: {
                username: Username
            }
        })
        setSocket(newSocket)

        // newSocket.on("connect", () => {
        //     retryFailedMessages()
        // })

        newSocket.on("message", (data) => {
            setMessages((prevMessages) => {
                const isDuplicate = prevMessages.some((msg) => msg.id === data.id)
                if (isDuplicate) return prevMessages
                const updatedMessages = [...prevMessages, { ...data, status: "delivered" }].sort(
                    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                )
                setChats(updatedMessages)
                return updatedMessages
            })
        })
        newSocket.on("message_received", (messageData) => {
            removePendingMessage(messageData.text)
        })
        newSocket.on("allmsgs", (data) => {
            const sortedMessages = data.sort(
                (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
            )
            setChats(sortedMessages)
            setMessages(sortedMessages)
        })
        return () => {
            newSocket.disconnect()
        }
    }, [])

    const handleEmojiClick = (emojiObject) => {
        setNewMessage((prev) => prev + emojiObject.emoji)
        setShowEmojiPicker(false)
    }

    const groupedMessages = groupMessagesByDate(messages)

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300">
            {!Username ? (
                navigate('/')
            ) : (
                <>
                    <nav className="bg-white shadow-md p-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-700">{Username}</h2>
                        <DropdownMenu />
                    </nav>

                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
                        {Object.keys(groupedMessages)
                            .reverse()
                            .map((date, dateIndex) => (
                                <div key={dateIndex} className="space-y-1">
                                    <div className="text-center my-4 text-gray-500 text-xs font-medium">
                                        {date}
                                    </div>
                                    {groupedMessages[date]
                                        .map((message, messageIndex) => (
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
                    <div className="bg-white p-4 flex items-center space-x-2 border-t border-gray-300">
                        <button
                            onClick={() => setShowEmojiPicker((prev) => !prev)}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            <BsEmojiSmile size={24} />
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-16 left-4 z-10">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </div>
                        )}
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
    )
}

export default Dashboard
