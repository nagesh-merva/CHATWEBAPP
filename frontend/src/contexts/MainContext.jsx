import { createContext, useContext, useState, useEffect } from "react"

const MainContext = createContext()

export const useMainContext = () => useContext(MainContext)

export const ContextProvider = ({ children }) => {
    const [Username, setUsername] = useState(() => {
        const StoredUser = sessionStorage.getItem('Username')
        return StoredUser !== null ? StoredUser : ''
    })

    const [Chats, setChats] = useState(() => {
        const StoredChats = sessionStorage.getItem('Chats')
        return StoredChats !== null ? JSON.parse(StoredChats) : []
    })

    const [pendingMessages, setPendingMessages] = useState(() => {
        const StoredPendingMessages = localStorage.getItem('pendingMessages')
        return StoredPendingMessages !== null ? JSON.parse(StoredPendingMessages) : []
    })

    useEffect(() => {
        sessionStorage.setItem('Chats', JSON.stringify(Chats))
    }, [Chats])

    useEffect(() => {
        sessionStorage.setItem('Username', Username)
    }, [Username])

    useEffect(() => {
        localStorage.setItem('pendingMessages', JSON.stringify(pendingMessages))
    }, [pendingMessages])

    const addPendingMessage = (message) => {
        setPendingMessages((prev) => [...prev, message])
    }

    const removePendingMessage = (messageText) => {
        setPendingMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.text !== messageText)
        )
    }

    return (
        <MainContext.Provider value={{ Username, setUsername, Chats, setChats, pendingMessages, addPendingMessage, removePendingMessage }}>
            {children}
        </MainContext.Provider>
    )
}