import {useEffect, useMemo, useRef, useState} from 'react';
import {AbortIntent} from "@/client/fastapi";
import AudioPlayer from "@/lib/chat/AudioPlayer";
import ChatLogic from "@/lib/chat/ChatLogic";
import ConversationLogic from "@/lib/conversation/ConversationLogic";
import {StorageKeys} from "@/lib/common/Constants";


export default function useChatGeneration({
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
                                          }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const isGeneratingRef = useRef(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const chatLogic = useMemo(() => new ChatLogic(), []);
  const conversationLogic = useMemo(() => new ConversationLogic(), []);
  const audioPlayer = useMemo(() => new AudioPlayer(), []);

  useEffect(() => {
    return () => audioPlayer.stop();
  }, [audioPlayer]);

  const latestRequestIndexRef = useRef(0);
  const abortControllerRef = useRef(null);

  const isActiveRequest = (reqIndex) => reqIndex === latestRequestIndexRef.current && isGeneratingRef.current;

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

  const onGenerationEnded = () => {
    if (selectedConversationId) {
      setConversationsReloadKey(prev => prev + 1);
    }
    setCreditRefreshKey(prev => prev + 1);
  };

  const warnFilesInTemporaryChat = (files) => {
    if (files && files.length > 0 && selectedConversationId === null) {
      setAlertMessage('File generation is not supported in Temporary Chat mode. Please create a new conversation to save files.');
      setAlertSeverity('warning');
      setAlertOpen(true);
    }
  };

  const consumeStreamChunks = async (currentReqIndex, generator) => {
    let isFirstChunk = true;
    for await (const chunk of generator) {
      if (!isActiveRequest(currentReqIndex)) {
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
      } else if (chunk.text || chunk.audio || (chunk.files && chunk.files.length !== 0) || chunk.display) {
        setIsLastChunkThought(false);
      }

      if (chunk.audio) {
        audioPlayer.playPcm16Chunk(chunk.audio);
      }

      warnFilesInTemporaryChat(chunk.files);

      setMessages(prevMessages => ChatLogic.updateMessage(
        prevMessages, prevMessages.length - 1, chunk
      ));

      // Scroll
      if (isAtBottomRef.current) {
        const scrollableContainer = document.querySelector('#chat-messages');
        setTimeout(() => {
          scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
        }, 0);
      }
    }

    return isActiveRequest(currentReqIndex);
  };

  const handleNonStreamGenerate = async (currentReqIndex) => {
    const content = await chatLogic.nonStreamGenerate(
      messages, apiType, model, temperature, thought, webSearch, codeExecution,
      selectedConversationId ?? undefined
    );

    if (!isActiveRequest(currentReqIndex)) {
      return false;
    }

    if (content.audio) {
      audioPlayer.playWav(content.audio);
    }

    warnFilesInTemporaryChat(content.files);

    setMessages(prevMessages => [
      ...prevMessages,
      ChatLogic.createAssistantMessage(content),
      ...(selectedConversationId === null ? [ChatLogic.getEmptyUserMessage()] : []),
    ]);

    return true;
  };

  const handleStreamGenerate = async (currentReqIndex) => {
    abortControllerRef.current = new AbortController();

    const generator = chatLogic.streamGenerate(
      messages, apiType, model, temperature, thought, webSearch, codeExecution,
      selectedConversationId ?? undefined, undefined, abortControllerRef.current.signal
    );

    const success = await consumeStreamChunks(currentReqIndex, generator);

    if (success && selectedConversationId === null) {
      setMessages(prevMessages => [...prevMessages, ChatLogic.getEmptyUserMessage()]);
    }

    return success;
  };

  const handleGenerate = async () => {
    if (!localStorage.getItem(StorageKeys.Token)) {
      setAlertMessage('Please sign in first.');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    switchStatus(true);
    latestRequestIndexRef.current += 1;
    const currentReqIndex = latestRequestIndexRef.current;

    audioPlayer.stop();
    audioPlayer.ensureRunning();

    try {
      // Conversation Sync
      if (selectedConversationId) {
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
      if (stream) {
        await handleStreamGenerate(currentReqIndex);
      } else {
        await handleNonStreamGenerate(currentReqIndex);
      }
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      if (latestRequestIndexRef.current === currentReqIndex) {
        switchStatus(false);
      }
      onGenerationEnded();
    }
  };

  const abortGenerate = async (intent = AbortIntent.Discard) => {
    audioPlayer.stop();
    switchStatus(false);
    if (selectedConversationId) {
      try {
        await chatLogic.abortChat(selectedConversationId, intent);
      } catch (err) {
        setAlertMessage(err.message);
        setAlertSeverity('error');
        setAlertOpen(true);
      }
      onGenerationEnded();
    }
  };

  const clearUIState = () => {
    audioPlayer.stop();
    switchStatus(false);
  };

  // Stream Resume
  useEffect(() => {
    if (!selectedConversationId) return;
    if (isGeneratingRef.current) return;

    let aborted = false;
    let tookOver = false;
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
      tookOver = true;
      switchStatus(true);
    };

    const tryResume = async () => {
      try {
        const generator = chatLogic.resumeStream(
          selectedConversationId, onOpen, controller.signal
        );
        const currentReqIndex = latestRequestIndexRef.current + 1;
        await consumeStreamChunks(currentReqIndex, generator);
        if (aborted) return;
        if (!tookOver) return;
        switchStatus(false);
        onGenerationEnded();
      } catch (err) {
        if (aborted) return;
        if (tookOver) {
          switchStatus(false);
        }
        onGenerationEnded();
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

  return {
    isGenerating,
    isGeneratingRef,
    handleGenerate,
    abortGenerate,
    clearUIState,
    alertOpen,
    alertMessage,
    alertSeverity,
    setAlertOpen,
  };
}
