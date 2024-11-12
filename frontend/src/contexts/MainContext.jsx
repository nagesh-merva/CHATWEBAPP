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

    useEffect(() => {
        sessionStorage.setItem('Chats', JSON.stringify(Chats))
    }, [Chats])

    useEffect(() => {
        sessionStorage.setItem('Username', Username)
    }, [Username])

    return (
        <MainContext.Provider value={{ Username, setUsername, Chats, setChats }}>
            {children}
        </MainContext.Provider>
    )
}