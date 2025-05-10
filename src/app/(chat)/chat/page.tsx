'use client';

import React, { useEffect, useState } from 'react';
import ChatPage from "@/app/(chat)/chat/chat";
import { fetchInitChatList } from "@/app/(chat)/chat/chat-server";
import { Conversation } from "@ant-design/x/es/conversations";

const ChatHome = () => {
    const [defaultConversationItems, setDefaultConversationItems] = useState<Conversation[]>([]);

    useEffect(() => {
        fetchInitChatList().then(setDefaultConversationItems);
    }, []);

    return (
        <ChatPage defaultConversationItems={defaultConversationItems} />
    );
};

export default ChatHome;