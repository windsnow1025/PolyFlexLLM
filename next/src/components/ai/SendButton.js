import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Button, CircularProgress, Snackbar, Tooltip} from "@mui/material";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {AbortIntent} from "@/client/fastapi";
import ChatLogic from "@/lib/chat/ChatLogic";
import ConversationLogic from "@/lib/conversation/ConversationLogic";
import {StorageKeys} from "@/lib/common/Constants";

function SendButton({
                      isGenerating,
                      setIsGenerating,
                      isGeneratingRef,
                      setIsLastChunkThought,
                      setConversationsReloadKey,
                      resumeKey,
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
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const chatLogic = useMemo(() => new ChatLogic(), []);
  const conversationLogic = useMemo(() => new ConversationLogic(), []);

  const sendButtonRef = useRef(null);

  const latestRequestIndexRef = useRef(0);
  const abortControllerRef = useRef(null);

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
  }, []);

  const consumeStreamChunks = async (currentReqIndex, generator) => {
    let isFirstChunk = true;
    for await (const chunk of generator) {
      // Frontend Abort
      if (!(currentReqIndex === latestRequestIndexRef.current && isGeneratingRef.current)) {
        return false;
      }

      // Create Empty Assistant Message on First Chunk
      if (isFirstChunk) {
        setMessages(prevMessages => [...prevMessages, ChatLogic.getEmptyAssistantMessage()]);
        isFirstChunk = false;
      }

      // Thought loading status
      if (chunk.thought) {
        setIsLastChunkThought(true);
      } else if (chunk.text || (chunk.files && chunk.files.length !== 0) || chunk.display) {
        setIsLastChunkThought(false);
      }

      let fileUrls = [];
      if (chunk.files && chunk.files.length > 0 && isTemporaryChat) {
        setAlertMessage('File generation is not supported in Temporary Chat mode. Please create a new conversation to save files.');
        setAlertSeverity('warning');
        setAlertOpen(true);
      }

      setMessages(prevMessages => ChatLogic.updateMessage(
        prevMessages, prevMessages.length - 1, chunk, fileUrls
      ));

      // Scroll
      if (isAtBottomRef.current) {
        const scrollableContainer = document.querySelector('#chat-messages');
        setTimeout(() => {
          scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        }, 0);
      }
    }
    return true;
  };

  const handleNonStreamGenerate = async (currentReqIndex) => {
    const conversationId = isTemporaryChat ? undefined : selectedConversationId;

    const content = await chatLogic.nonStreamGenerate(
      messages, apiType, model, temperature, thought, webSearch, codeExecution,
      conversationId
    );

    if (latestRequestIndexRef.current !== currentReqIndex || !isGeneratingRef.current) {
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

  const handleStreamGenerate = async (currentReqIndex) => {
    const conversationId = isTemporaryChat ? undefined : selectedConversationId;
    abortControllerRef.current = new AbortController();

    const generator = chatLogic.streamGenerate(
      messages, apiType, model, temperature, thought, webSearch, codeExecution,
      conversationId, undefined, abortControllerRef.current.signal
    );

    const success = await consumeStreamChunks(currentReqIndex, generator);

    if (success && isTemporaryChat) {
      setMessages(prevMessages => [...prevMessages, ChatLogic.getEmptyUserMessage()]);
    }

    return success;
  };

  const switchStatus = (status) => {
    isGeneratingRef.current = status;
    setIsGenerating(status);
    if (!status) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = null;
    }
  };

  const abortGenerate = async (intent = AbortIntent.Discard) => {
    switchStatus(false);
    if (!isTemporaryChat && selectedConversationId) {
      try {
        await chatLogic.abortChat(selectedConversationId, intent);
        if (intent === AbortIntent.Keep) {
          setConversationsReloadKey(prev => prev + 1);
        }
      } catch (err) {
        setAlertMessage(err.message);
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    }
  };

  const handleGenerate = async () => {
    if (!localStorage.getItem(StorageKeys.Token)) {
      setAlertMessage('Please sign in first.');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }
    if (isGeneratingRef.current) return;

    switchStatus(true);
    latestRequestIndexRef.current += 1;
    const currentReqIndex = latestRequestIndexRef.current;

    try {
      // Conversation Sync
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
        success = await handleStreamGenerate(currentReqIndex);
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
      switchStatus(false);
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setCreditRefreshKey(prev => prev + 1);
    }
  };

  const handleClick = () => {
    if (isGeneratingRef.current) {
      abortGenerate(AbortIntent.Keep);
    } else {
      handleGenerate();
    }
  };

  useEffect(() => {
    handleGenerateRef.current = handleGenerate;
    abortGenerateRef.current = abortGenerate;
    clearUIStateRef.current = () => switchStatus(false);
  })

  // Stream resume
  useEffect(() => {
    if (!selectedConversationId || isTemporaryChat) return;
    if (isGeneratingRef.current) return;

    let aborted = false;
    const controller = new AbortController();

    // Clear stale assistant message
    const onOpen = () => {
      setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          return prevMessages.slice(0, -1);
        }
        return prevMessages;
      });
      latestRequestIndexRef.current += 1;
      abortControllerRef.current = controller;
      switchStatus(true);
    };

    const tryResume = async () => {
      try {
        const generator = chatLogic.resumeStream(
          selectedConversationId, onOpen, controller.signal
        );
        const currentReqIndex = latestRequestIndexRef.current + 1;
        const success = await consumeStreamChunks(currentReqIndex, generator);
        if (aborted) return;
        if (isGeneratingRef.current) {
          if (success) {
            switchStatus(false);
            setConversationsReloadKey(prev => prev + 1);
          }
          setCreditRefreshKey(prev => prev + 1);
        }
      } catch (err) {
        if (aborted) return;
        switchStatus(false);
        setCreditRefreshKey(prev => prev + 1);
        setAlertMessage(err.message);
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    };

    tryResume();

    return () => {
      aborted = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId, resumeKey]);

  return (
    <div className="m-2">
      <Tooltip title="Ctrl/Cmd + Enter">
        <span>
          <Button
            id="send"
            variant="contained"
            color="primary"
            onClick={handleClick}
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
