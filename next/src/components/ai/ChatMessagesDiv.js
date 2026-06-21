import MessageDiv from "../message/MessageDiv";
import React, {useCallback, useMemo, useRef, useState} from "react";
import AddMessageDivider from "./AddMessageDivider";
import FileLogic from "@/lib/common/file/FileLogic";
import ChatLogic from "@/lib/chat/ChatLogic";
import {Alert, Collapse, Snackbar} from "@mui/material";
import {TransitionGroup} from "react-transition-group";

function ChatMessagesDiv({
                           messages,
                           setMessages,
                           isGenerating,
                           setIsGenerating,
                           isGeneratingRef,
                           abortGenerateRef,
                           setConversationUpdateKey,
                           promptsReloadKey,
                           setPromptsReloadKey,
                           isTemporaryChat,
                           isLastChunkThought,
                           setUploadingCount,
                           isAtBottomRef,
                         }) {
  // Scroll to manually added message after Collapse animation
  const scrollPendingRef = useRef(false);

  const setScrollToIndex = useCallback(() => {
    scrollPendingRef.current = true;
  }, []);

  const handleCollapseEntered = useCallback((node) => {
    // Manual add via AddMessageDivider: always scroll
    if (scrollPendingRef.current) {
      scrollPendingRef.current = false;
      node.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      return;
    }
    // Auto-added messages: scroll if user was at bottom
    if (isAtBottomRef.current) {
      node.scrollIntoView({behavior: 'smooth', block: 'nearest'});
    }
  }, [isAtBottomRef]);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");

  const fileLogic = useMemo(() => new FileLogic(), []);

  const handleMessageUpdate = useCallback((id, updatedMessage) => {
    setMessages((prevMessages) =>
      prevMessages.map((prevMessage) => {
        if (prevMessage.id === id) {
          return typeof updatedMessage === 'function'
            ? updatedMessage(prevMessage)
            : updatedMessage;
        }
        return prevMessage;
      })
    );
  }, [setMessages]);

  const handleMessageDelete = useCallback(async (id) => {
    let fileUrlsToDelete = [];
    const isDeletingLastMessage = messages.length > 0 && messages[messages.length - 1].id === id;
    if (isDeletingLastMessage && isGeneratingRef.current) {
      abortGenerateRef.current();
    }

    // Remove the message from the UI
    setMessages((prevMessages) => {
      // Find files in the message
      const messageToDelete = prevMessages.find(msg => msg.id === id);
      if (messageToDelete && !messageToDelete.promptId) {
        fileUrlsToDelete = ChatLogic.getFileUrlsFromMessage(messageToDelete);
      }

      return prevMessages.filter((msg) => msg.id !== id);
    });

    // Delete the files from storage
    if (fileUrlsToDelete.length > 0) {
      try {
        const filenames = FileLogic.getFilenamesFromUrls(fileUrlsToDelete);
        await fileLogic.deleteFiles(filenames);
      } catch (err) {
        setAlertMessage(err.message);
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    }

    setConversationUpdateKey(prev => prev + 1);

  }, [messages, setMessages, isGeneratingRef, abortGenerateRef, setConversationUpdateKey, fileLogic]);

  return (
    <div>
      <AddMessageDivider
        messages={messages}
        setMessages={setMessages}
        index={-1}
        setIsGenerating={setIsGenerating}
        isGeneratingRef={isGeneratingRef}
        abortGenerateRef={abortGenerateRef}
        setConversationUpdateKey={setConversationUpdateKey}
        setScrollToIndex={setScrollToIndex}
      />
      <TransitionGroup>
        {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isThoughtLoading = isLastMessage && isGenerating && isLastChunkThought;
            return (
              <Collapse key={message.id} onEntered={handleCollapseEntered}>
                <div data-message-index={index}>
                  <MessageDiv
                    message={message}
                    setMessage={handleMessageUpdate}
                    onMessageDelete={handleMessageDelete}
                    setConversationUpdateKey={setConversationUpdateKey}
                    promptsReloadKey={promptsReloadKey}
                    setPromptsReloadKey={setPromptsReloadKey}
                    isTemporaryChat={isTemporaryChat}
                    isThoughtLoading={isThoughtLoading}
                    setUploadingCount={setUploadingCount}
                  />
                  <AddMessageDivider
                    messages={messages}
                    setMessages={setMessages}
                    index={index}
                    setIsGenerating={setIsGenerating}
                    isGeneratingRef={isGeneratingRef}
                    abortGenerateRef={abortGenerateRef}
                    setConversationUpdateKey={setConversationUpdateKey}
                    setScrollToIndex={setScrollToIndex}
                  />
                </div>
              </Collapse>
            )
          }
        )}
      </TransitionGroup>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: "100%"}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default ChatMessagesDiv;
