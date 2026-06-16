import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Alert, Box, Divider, Snackbar,} from '@mui/material';
import ConversationList from './conversation-list/ConversationList';
import NewConversationButton from "./NewConversationButton";
import TemporaryChatButton from "../TemporaryChatButton";
import ConversationLogic from "@/lib/conversation/ConversationLogic";

function ConversationSidebar({
                               messages,
                               setMessages,
                               selectedConversationId,
                               setSelectedConversationId,
                               conversationUpdateKey,
                               conversationUpdatePromiseRef,
                               conversationVersionRef,
                               conversations,
                               setConversations,
                               conversationsReloadKey,
                               setConversationsReloadKey,
                               setIsTemporaryChat,
                               isGeneratingRef,
                               abortGenerateRef,
                               clearUIStateRef,
                               setIsBackendGenerating,
                             }) {
  const conversationLogic = useMemo(() => new ConversationLogic(), []);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const getMessagesForUpdate = useCallback(() => {
    const strippedMessages = ConversationLogic.stripPromptContents(messages);
    if (isGeneratingRef?.current && strippedMessages.length > 0) {
      const lastMessage = strippedMessages[strippedMessages.length - 1];
      if (lastMessage?.role === 'assistant') {
        return strippedMessages.slice(0, -1);
      }
    }
    return strippedMessages;
  }, [messages, isGeneratingRef]);

  const handleUpdateConversation = useCallback(async (index) => {
    const conversationId = conversations[index]?.id;
    if (!conversationId) return;

    // Skip reload for intermediate updates when multiple updates are queued
    let currentPromise;

    const updateConversation = async () => {
      try {
        const updatedConversation = await conversationLogic.updateConversation(
          conversationId,
          conversationVersionRef.current[conversationId] ?? conversations[index]?.version,
          {
            name: conversations[index].name,
            messages: getMessagesForUpdate()
          }
        );
        conversationVersionRef.current[updatedConversation.id] = updatedConversation.version;

        setConversations((prevConversations) => {
          const targetIndex = prevConversations.findIndex(c => c.id === conversationId);

          if (targetIndex === -1) {
            return prevConversations;
          }

          const newConversations = [...prevConversations];

          newConversations[targetIndex] = updatedConversation;

          return newConversations;
        });

        if (conversationUpdatePromiseRef.current === currentPromise) {
          setConversationsReloadKey(prev => prev + 1);
        }
      } catch (err) {
        setAlertOpen(true);
        setAlertMessage(err.message);
        setAlertSeverity('error');
      }
    };

    const previous = conversationUpdatePromiseRef.current ?? Promise.resolve();
    const updatePromise = previous
      .catch(() => {})
      .then(updateConversation);

    currentPromise = updatePromise;
    conversationUpdatePromiseRef.current = updatePromise;

    try {
      await updatePromise;
    } finally {
      if (conversationUpdatePromiseRef.current === updatePromise) {
        conversationUpdatePromiseRef.current = null;
      }
    }
  }, [conversations, conversationLogic, conversationVersionRef, conversationUpdatePromiseRef, getMessagesForUpdate, setConversations, setConversationsReloadKey]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }
    const conversationToUpdate = conversations.find(c => c.id === selectedConversationId);
    if (!conversationToUpdate) {
      return;
    }
    handleUpdateConversation(conversations.indexOf(conversationToUpdate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationUpdateKey]);

  return (
    <Box
      sx={{
        maxWidth: {
          xs: '75vw',
          sm: '70vw',
          md: '35vw',
          lg: '30vw',
          xl: '25vw'
        }
      }}
      className="local-scroll-container"
    >
      <div className="local-scroll-unscrollable-y">
        <div className="flex-center gap-2 px-4 py-2">
          <TemporaryChatButton
            setMessages={setMessages}
            setSelectedConversationId={setSelectedConversationId}
            setIsTemporaryChat={setIsTemporaryChat}
            buttonStyle="sidebar"
            clearUIStateRef={clearUIStateRef}
          />
          <NewConversationButton
            setMessages={setMessages}
            setConversations={setConversations}
            setSelectedConversationId={setSelectedConversationId}
            setConversationsReloadKey={setConversationsReloadKey}
            setIsTemporaryChat={setIsTemporaryChat}
            buttonStyle="sidebar"
            clearUIStateRef={clearUIStateRef}
          />
        </div>
        <Divider/>

        <ConversationList
          conversations={conversations}
          setConversations={setConversations}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
          setMessages={setMessages}
          conversationsReloadKey={conversationsReloadKey}
          setConversationsReloadKey={setConversationsReloadKey}
          setIsTemporaryChat={setIsTemporaryChat}
          isGeneratingRef={isGeneratingRef}
          abortGenerateRef={abortGenerateRef}
          clearUIStateRef={clearUIStateRef}
          conversationUpdatePromiseRef={conversationUpdatePromiseRef}
          setIsBackendGenerating={setIsBackendGenerating}
        />
      </div>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ConversationSidebar;
