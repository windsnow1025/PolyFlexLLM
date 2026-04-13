import React, {useEffect, useRef, useState} from 'react';
import {Alert, Button, CircularProgress, Snackbar, Tooltip} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {v4 as uuidv4} from 'uuid';
import ChatLogic from "@/lib/chat/ChatLogic";
import ConversationLogic from "@/lib/conversation/ConversationLogic";
import {StorageKeys} from "@/lib/common/Constants";

function SendButton({
                      isGenerating,
                      setIsGenerating,
                      isGeneratingRef,
                      setIsLastChunkThought,
                      setConversationsReloadKey,
                      setCreditRefreshKey,
                      handleGenerateRef,
                      abortGenerateRef,
                      clearUIStateRef,
                      isTemporaryChat,
                      selectedConversationId,
                      conversationUpdatePromiseRef,
                      conversationVersionRef,
                      messages,
                      setMessages,
                      apiType,
                      model,
                      temperature,
                      stream,
                      thought,
                      webSearch,
                      codeExecution,
                      isUploading,
                      isAtBottomRef,
                    }) {
  const chatLogic = new ChatLogic();
  const conversationLogic = new ConversationLogic();

  const sendButtonRef = useRef(null);

  const latestRequestIndex = useRef(0);
  const isFirstStreamOpen = useRef(true);
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.activeElement.blur();
        setTimeout(() => sendButtonRef.current.click(), 0);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [messages]);

  const handleNonStreamGenerate = async (currentReqIndex) => {
    const conversationId = isTemporaryChat ? undefined : selectedConversationId;
    requestIdRef.current = uuidv4();

    const content = await chatLogic.nonStreamGenerate(
      requestIdRef.current, messages, apiType, model, temperature, thought, webSearch, codeExecution,
      conversationId
    );

    if (latestRequestIndex.current !== currentReqIndex || !isGeneratingRef.current) {
      return false;
    }

    let fileUrls = [];
    if (content.files && content.files.length > 0) {
      if (isTemporaryChat) {
        setAlertMessage('File generation is not supported in Temporary Chat mode. Please create a new conversation to save files.');
        setAlertSeverity('warning');
        setAlertOpen(true);
      }
    }

    setMessages(prevMessages => [
      ...prevMessages,
      ChatLogic.createAssistantMessage(content, fileUrls),
      ...(isTemporaryChat ? [ChatLogic.getEmptyUserMessage()] : []),
    ]);

    if (conversationId) {
      setConversationsReloadKey(prev => prev + 1);
    }

    return true;
  };

  const handleStreamGenerate = async (currentReqIndex, onOpenCallback, onDoneCallback) => {
    let isFirstChunk = true;
    const conversationId = isTemporaryChat ? undefined : selectedConversationId;
    requestIdRef.current = uuidv4();
    abortControllerRef.current = new AbortController();

    const generator = chatLogic.streamGenerate(
      requestIdRef.current, messages, apiType, model, temperature, thought, webSearch, codeExecution,
      conversationId, onOpenCallback, onDoneCallback, abortControllerRef.current.signal
    );

    for await (const chunk of generator) {
      // Frontend Abort
      if (!(currentReqIndex === latestRequestIndex.current && isGeneratingRef.current)) {
        return false;
      }

      // Create Empty Assistant Message on First Chunk
      if (isFirstChunk) {
        setMessages(prevMessages => [...prevMessages, ChatLogic.getEmptyAssistantMessage()]);
        isFirstChunk = false;
      }

      // For thought loading status
      if (chunk.thought) {
        setIsLastChunkThought(true);
      } else if (chunk.text || (chunk.files && chunk.files.length !== 0) || chunk.display) {
        setIsLastChunkThought(false);
      }

      let fileUrls = [];
      if (chunk.files && chunk.files.length > 0) {
        if (isTemporaryChat) {
          setAlertMessage('File generation is not supported in Temporary Chat mode. Please create a new conversation to save files.');
          setAlertSeverity('warning');
          setAlertOpen(true);
        }
      }

      setMessages(prevMessages => ChatLogic.updateMessage(
        prevMessages, prevMessages.length - 1, chunk, fileUrls
      ));

      if (isAtBottomRef.current) {
        const scrollableContainer = document.querySelector('#chat-messages');
        setTimeout(() => {
          scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        }, 0);
      }
    }

    if (isTemporaryChat) {
      setMessages(prevMessages => [...prevMessages, ChatLogic.getEmptyUserMessage()]);
    }

    return true;
  };

  const switchStatus = (status) => {
    isGeneratingRef.current = status;
    setIsGenerating(status);
  };

  const clearUIState = () => {
    requestIdRef.current = null;
    abortControllerRef.current = null;
    switchStatus(false);
  }

  const abortRequest = () => {
    // Backend Abort
    if (requestIdRef.current) {
      chatLogic.abortChat(requestIdRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearUIState();
    switchStatus(false);
  };

  const handleGenerate = async () => {
    if (!localStorage.getItem(StorageKeys.Token)) {
      setAlertMessage('Please sign in first.');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    if (!isGeneratingRef.current) {
      switchStatus(true);
      latestRequestIndex.current += 1;
      const currentReqIndex = latestRequestIndex.current;

      isFirstStreamOpen.current = true;
      const handleStreamOpen = () => {
        if (isFirstStreamOpen.current) {
          isFirstStreamOpen.current = false;
          return;
        }

        // This is a reconnection. Clear the last assistant message.
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const newMessages = [...prevMessages];
            // Replace the partially filled message with a new empty one
            newMessages[newMessages.length - 1] = ChatLogic.getEmptyAssistantMessage();
            return newMessages;
          }
          return prevMessages;
        });
      };

      try {
        if (!isTemporaryChat) {
          if (conversationUpdatePromiseRef.current) {
            await conversationUpdatePromiseRef.current;
          }
          const latestConversation = await conversationLogic.fetchConversation(selectedConversationId);
          const currentVersion = conversationVersionRef.current[selectedConversationId];
          if (latestConversation.version > currentVersion) {
            throw new Error("Conversation is stale. Please reload the conversation.")
          }
          if (latestConversation.version < currentVersion) {
            setAlertMessage("Local conversation is ahead of server. Continuing generation.");
            setAlertSeverity("warning");
            setAlertOpen(true);
          }
        }
        let success;
        if (stream) {
          success = await handleStreamGenerate(currentReqIndex, handleStreamOpen, () => {});
        } else {
          success = await handleNonStreamGenerate(currentReqIndex);
        }
        if (success) {
          switchStatus(false);
          if (!isTemporaryChat && selectedConversationId) {
            setConversationsReloadKey(prev => prev + 1);
          }
        }
      } catch (err) {
        abortRequest();
        setAlertMessage(err.message);
        setAlertSeverity('error');
        setAlertOpen(true);
      } finally {
        setCreditRefreshKey(prev => prev + 1);
      }
    } else {
      abortRequest();
    }
  };

  useEffect(() => {
    handleGenerateRef.current = handleGenerate;
    abortGenerateRef.current = abortRequest;
    clearUIStateRef.current = clearUIState;
  })

  return (
    <div className="m-2">
      <Tooltip title="Ctrl/Cmd + Enter">
        <span>
          <Button
            id="send"
            variant="contained"
            color="primary"
            onClick={handleGenerate}
            startIcon={isGenerating ? <CircularProgress size={16} color="inherit"/> : <PlayArrowIcon/>}
            disabled={!messages || isUploading}
            ref={sendButtonRef}
          >
            {isGenerating ? "Stop" : "Send"}
          </Button>
        </span>
      </Tooltip>
      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default SendButton;
