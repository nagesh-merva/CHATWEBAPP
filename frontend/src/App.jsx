import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

function App() {
  const [socket, setSocket] = useState(null)
  const [username, setUsername] = useState(sessionStorage.getItem('username') || '')
  const [messages, setMessages] = useState(JSON.parse(sessionStorage.getItem('messages')) || [])
  const [newMessage, setNewMessage] = useState('')
  const [isUsernameSet, setIsUsernameSet] = useState(!!sessionStorage.getItem('username'))

  const handleSendMessage = () => {
    const messageData = { text: newMessage, sender: username }
    const updatedMessages = [...messages, messageData]
    setMessages(updatedMessages)
    sessionStorage.setItem('messages', JSON.stringify(updatedMessages))
    setNewMessage('')
    if (socket) {
      socket.emit('message', messageData)
    }
  }

  useEffect(() => {
    const newSocket = io('https://chatwebapp-9gae.onrender.com/')
    // http://localhost:8080/
    setSocket(newSocket)
    newSocket.on('message', (data) => {
      const updatedMessages = [...messages, data]
      setMessages(updatedMessages)
      sessionStorage.setItem('messages', JSON.stringify(updatedMessages))
    })

    return () => {
      newSocket.off('message')
    }
  }, [messages])

  const handleSetUsername = () => {
    if (username.trim()) {
      setIsUsernameSet(true)
      sessionStorage.setItem('username', username)
      if (socket) {
        socket.emit('user_joined', username)
      }
    }
  }

  console.log(messages)

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {!isUsernameSet ? (
        <div className="flex flex-col justify-center items-center h-full">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="p-2 text-sm border border-gray-400 rounded"
          />
          <button
            onClick={handleSetUsername}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
          >
            Join Chat
          </button>
        </div>
      ) : (
        <>
          <nav className="navbar bg-white shadow-md py-4 px-4">
            <h2 className="text-lg font-bold">{username}</h2>
          </nav>
          <div className="message-list flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === username ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`rounded-lg p-2 max-w-md ${message.sender === username ? 'bg-blue-500 text-white my-[1px]' : 'bg-white text-black my-[1px]'
                    }`}
                >
                  <div className="text-sm"><p className='text-[8px] text-blue-500'>{message.sender}</p><p>{message.text}</p></div>
                </div>
              </div>
            ))}
          </div>
          <div className="message-input bg-white p-4 flex justify-between">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full p-2 pl-10 text-sm text-gray-700"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default App