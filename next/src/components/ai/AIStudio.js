import React, {useEffect, useRef, useState} from 'react';
import {Collapse, Drawer, Paper} from "@mui/material";

import ChatLogic from "@/lib/chat/ChatLogic";
import ConfigDiv from "./ConfigDiv";
import SendButton from "./SendButton";
import RetryButton from "./RetryButton";
import ChatMessagesDiv from "./ChatMessagesDiv";
import ConversationSidebar from "./conversation-sidebar/ConversationSidebar";
import ToggleConversationButton from "./ToggleConversationButton";
import useScreenSize from '@/hooks/useScreenSize';
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

  // Generation Control
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);

  // Ref for handleGenerate function
  const handleGenerateRef = useRef(null);
  const abortGenerateRef = useRef(null);
  const clearUIStateRef = useRef(null);

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
              messages={messages}
              setMessages={setMessages}
              selectedConversationId={selectedConversationId}
              setSelectedConversationId={setSelectedConversationId}
              conversationUpdateKey={conversationUpdateKey}
              conversationUpdatePromiseRef={conversationUpdatePromiseRef}
              conversationVersionRef={conversationVersionRef}
              conversations={conversations}
              setConversations={setConversations}
              conversationsReloadKey={conversationsReloadKey}
              setConversationsReloadKey={setConversationsReloadKey}
              setResumeKey={setResumeKey}
              isGeneratingRef={isGeneratingRef}
              abortGenerateRef={abortGenerateRef}
              clearUIStateRef={clearUIStateRef}
            />
          </Drawer>
        ) : (
          <Paper elevation={2} sx={{borderRadius: 0}} className="flex">
            <Collapse orientation="horizontal" in={drawerOpen}>
              <ConversationSidebar
                messages={messages}
                setMessages={setMessages}
                selectedConversationId={selectedConversationId}
                setSelectedConversationId={setSelectedConversationId}
                conversationUpdateKey={conversationUpdateKey}
                conversationUpdatePromiseRef={conversationUpdatePromiseRef}
                conversationVersionRef={conversationVersionRef}
                conversations={conversations}
                setConversations={setConversations}
                conversationsReloadKey={conversationsReloadKey}
                setConversationsReloadKey={setConversationsReloadKey}
                setResumeKey={setResumeKey}
                isGeneratingRef={isGeneratingRef}
                abortGenerateRef={abortGenerateRef}
                clearUIStateRef={clearUIStateRef}
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
              messages={messages}
              setMessages={setMessages}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              isGeneratingRef={isGeneratingRef}
              abortGenerateRef={abortGenerateRef}
              setConversationUpdateKey={setConversationUpdateKey}
              promptsReloadKey={promptsReloadKey}
              setPromptsReloadKey={setPromptsReloadKey}
              selectedConversationId={selectedConversationId}
              isLastChunkThought={isLastChunkThought}
              setUploadingCount={setUploadingCount}
              isAtBottomRef={isAtBottomRef}
            />
          </Paper>

          <ScrollToBottomButton/>
          <AIStudioTour/>

          <div className="flex-around">
            <div className="flex-center">
              <SendButton
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                isGeneratingRef={isGeneratingRef}
                setIsLastChunkThought={setIsLastChunkThought}
                setConversationsReloadKey={setConversationsReloadKey}
                resumeKey={resumeKey}
                setCreditRefreshKey={setCreditRefreshKey}
                handleGenerateRef={handleGenerateRef}
                abortGenerateRef={abortGenerateRef}
                clearUIStateRef={clearUIStateRef}
                selectedConversationId={selectedConversationId}
                conversationUpdatePromiseRef={conversationUpdatePromiseRef}
                conversationVersionRef={conversationVersionRef}
                messages={messages}
                setMessages={setMessages}
                apiType={apiType}
                model={model}
                temperature={temperature}
                stream={stream}
                thought={thought}
                webSearch={webSearch}
                codeExecution={codeExecution}
                isUploading={isUploading}
                isAtBottomRef={isAtBottomRef}
              />
              <RetryButton
                messages={messages}
                setMessages={setMessages}
                abortGenerateRef={abortGenerateRef}
                handleGenerateRef={handleGenerateRef}
                setConversationUpdateKey={setConversationUpdateKey}
                isUploading={isUploading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIStudio;
