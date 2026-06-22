import React, {useEffect, useRef, useState} from 'react';
import {Alert, Collapse, Drawer, Paper, Snackbar} from "@mui/material";

import ChatLogic from "@/lib/chat/ChatLogic";
import ConfigDiv from "./ConfigDiv";
import SendButton from "./SendButton";
import RetryButton from "./RetryButton";
import ChatMessagesDiv from "./ChatMessagesDiv";
import ConversationSidebar from "./conversation-sidebar/ConversationSidebar";
import ToggleConversationButton from "./ToggleConversationButton";
import useScreenSize from '@/hooks/useScreenSize';
import useChatGeneration from './useChatGeneration';
import AIStudioTour from './AIStudioTour';
import ScrollToBottomButton from './ScrollToBottomButton';

function AIStudio({
                    initMessages = null,
                  }) {
  const screenSize = useScreenSize();
  const [drawerOpen, setDrawerOpen] = useState(() => {
    return screenSize === 'xs' || screenSize === 'sm' ? false : true;
  });

  // Chat Parameters
  const [messages, setMessages] = useState(initMessages ?? ChatLogic.getInitMessages());
  const [apiType, setApiType] = useState(ChatLogic.defaultApiTypeModels[0].apiType);
  const [model, setModel] = useState(ChatLogic.defaultApiTypeModels[0].model);
  const [temperature, setTemperature] = useState(0);
  const [stream, setStream] = useState(true);
  const [thought, setThought] = useState(true);
  const [webSearch, setWebSearch] = useState(true);
  const [codeExecution, setCodeExecution] = useState(false);

  // Thought Loading
  const [isLastChunkThought, setIsLastChunkThought] = useState(false);

  // Upload Tracking
  const [uploadingCount, setUploadingCount] = useState(0);
  const isUploading = uploadingCount > 0;

  // Conversation
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversationUpdateKey, setConversationUpdateKey] = useState(0);
  const [conversationsReloadKey, setConversationsReloadKey] = useState(0);
  const [resumeKey, setResumeKey] = useState(0);

  // Ref for conversation sync
  const conversationUpdatePromiseRef = useRef(null);
  const conversationVersionRef = useRef({});

  // Conversation version sync
  useEffect(() => {
    conversations.forEach((conversation) => {
      const current = conversationVersionRef.current[conversation.id];
      if (current === undefined || conversation.version > current) {
        conversationVersionRef.current[conversation.id] = conversation.version;
      }
    });
  }, [conversations]);

  // Prompt refresh
  const [promptsReloadKey, setPromptsReloadKey] = useState(0);

  // Credit refresh
  const [creditRefreshKey, setCreditRefreshKey] = useState(0);

  // Whether user is at bottom of chat scroll container
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    const container = document.querySelector('#chat-messages');
    if (!container) return;
    const handleScroll = () => {
      isAtBottomRef.current = (container.scrollHeight - container.scrollTop) <= (container.clientHeight + 50);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Refresh conversations and resume stream when tab focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setConversationsReloadKey(prev => prev + 1);
        setResumeKey(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Generation Control
  const chat = useChatGeneration({
    // Messages
    messages,
    setMessages,

    // Conversation
    selectedConversationId,
    conversationUpdatePromiseRef,
    conversationVersionRef,

    // Conversations
    setConversationsReloadKey,

    // Chat config
    apiType,
    model,
    temperature,
    stream,
    thought,
    webSearch,
    codeExecution,

    // Side-effect setters
    setIsLastChunkThought,
    setCreditRefreshKey,

    // UI
    isAtBottomRef,

    // Resume trigger
    resumeKey,
  });

  return (
    <div className="local-scroll-container">
      <div className="local-scroll-unscrollable-x">
        {screenSize === 'xs' || screenSize === 'sm' ? (
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{zIndex: 1202}}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <ConversationSidebar
              // Messages
              messages={messages}
              setMessages={setMessages}

              // Conversation
              selectedConversationId={selectedConversationId}
              setSelectedConversationId={setSelectedConversationId}
              conversationUpdateKey={conversationUpdateKey}
              conversationUpdatePromiseRef={conversationUpdatePromiseRef}
              conversationVersionRef={conversationVersionRef}

              // Conversations
              conversations={conversations}
              setConversations={setConversations}
              conversationsReloadKey={conversationsReloadKey}
              setConversationsReloadKey={setConversationsReloadKey}

              // Generation
              isGeneratingRef={chat.isGeneratingRef}
              abortGenerate={chat.abortGenerate}
              clearUIState={chat.clearUIState}
              setResumeKey={setResumeKey}
            />
          </Drawer>
        ) : (
          <Paper elevation={2} sx={{borderRadius: 0}} className="flex">
            <Collapse orientation="horizontal" in={drawerOpen}>
              <ConversationSidebar
                // Messages
                messages={messages}
                setMessages={setMessages}

                // Conversation
                selectedConversationId={selectedConversationId}
                setSelectedConversationId={setSelectedConversationId}
                conversationUpdateKey={conversationUpdateKey}
                conversationUpdatePromiseRef={conversationUpdatePromiseRef}
                conversationVersionRef={conversationVersionRef}

                // Conversations
                conversations={conversations}
                setConversations={setConversations}
                conversationsReloadKey={conversationsReloadKey}
                setConversationsReloadKey={setConversationsReloadKey}

                // Generation
                isGeneratingRef={chat.isGeneratingRef}
                abortGenerate={chat.abortGenerate}
                clearUIState={chat.clearUIState}
                setResumeKey={setResumeKey}
              />
            </Collapse>
          </Paper>
        )}
        <div className="local-scroll-unscrollable-y relative">
          <div className="flex">
            <ToggleConversationButton
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
            />
            <div className="grow">
              <ConfigDiv
                apiType={apiType}
                setApiType={setApiType}
                model={model}
                setModel={setModel}
                temperature={temperature}
                setTemperature={setTemperature}
                stream={stream}
                setStream={setStream}
                thought={thought}
                setThought={setThought}
                webSearch={webSearch}
                setWebSearch={setWebSearch}
                codeExecution={codeExecution}
                setCodeExecution={setCodeExecution}
                refreshKey={creditRefreshKey}
              />
            </div>
          </div>
          <Paper elevation={0} className="local-scroll-scrollable px-1" id="chat-messages">
            <ChatMessagesDiv
              // Messages
              messages={messages}
              setMessages={setMessages}

              // Conversation
              selectedConversationId={selectedConversationId}
              setConversationUpdateKey={setConversationUpdateKey}

              // Prompts
              promptsReloadKey={promptsReloadKey}
              setPromptsReloadKey={setPromptsReloadKey}

              // Generation
              isGenerating={chat.isGenerating}
              isGeneratingRef={chat.isGeneratingRef}
              abortGenerate={chat.abortGenerate}

              // Side-effect setters
              isLastChunkThought={isLastChunkThought}
              setUploadingCount={setUploadingCount}

              // UI
              isAtBottomRef={isAtBottomRef}
            />
          </Paper>

          <ScrollToBottomButton/>
          <AIStudioTour/>

          <div className="flex-around">
            <div className="flex-center">
              <SendButton
                isGenerating={chat.isGenerating}
                handleGenerate={chat.handleGenerate}
                abortGenerate={chat.abortGenerate}
                disabled={!messages || isUploading}
              />
              <RetryButton
                // Messages
                messages={messages}
                setMessages={setMessages}

                // Conversation
                setConversationUpdateKey={setConversationUpdateKey}

                // Generation
                handleGenerate={chat.handleGenerate}
                abortGenerate={chat.abortGenerate}

                // UI
                isUploading={isUploading}
              />
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={chat.alertOpen}
        autoHideDuration={6000}
        onClose={() => chat.setAlertOpen(false)}
      >
        <Alert onClose={() => chat.setAlertOpen(false)} severity={chat.alertSeverity} sx={{width: '100%'}}>
          {chat.alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default AIStudio;
