import React from 'react';
import {IconButton, Tooltip} from "@mui/material";
import ReplayIcon from '@mui/icons-material/Replay';
import {wait} from "@/components/common/utils/Wait";

function RetryButton({
                       // Messages
                       messages,
                       setMessages,

                       // Conversation
                       setConversationUpdateKey,

                       // Generation
                       handleGenerate,
                       abortGenerate,

                       // UI
                       isUploading,
                     }) {
  const isRetryEnabled = () => {
    if (messages === null) return false;

    if (messages.length === 0) return false;

    // Find the last assistant message
    let lastAssistantIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        lastAssistantIndex = i;
        break;
      }
    }

    if (lastAssistantIndex === -1) return false;

    // Check if all messages after the last assistant message are empty
    for (let i = lastAssistantIndex + 1; i < messages.length; i++) {
      const message = messages[i];
      const hasNonEmptyContent = message.contents.some(content =>
        (content.type === 'text' && content.data.trim() !== '') ||
        content.type === 'file'
      );

      if (hasNonEmptyContent) return false;
    }

    return true;
  };

  const handleRetry = async () => {
    // 1. Stop sending if it is sending
    abortGenerate();

    // 2. Remove empty messages after the last assistant message and remove the last assistant message
    setMessages(prevMessages => {
      let lastAssistantIndex = -1;
      for (let i = prevMessages.length - 1; i >= 0; i--) {
        if (prevMessages[i].role === 'assistant') {
          lastAssistantIndex = i;
          break;
        }
      }

      if (lastAssistantIndex === -1) return prevMessages;

      return prevMessages.slice(0, lastAssistantIndex);
    });

    if (setConversationUpdateKey) {
      setConversationUpdateKey(prev => prev + 1);
    }

    // 3. Trigger sending
    // Wait for setMessages
    await wait(0);
    handleGenerate();
  };

  return (
    <div>
      <Tooltip title="Retry last response">
        <span>
          <IconButton
            id="retry"
            color="secondary"
            onClick={handleRetry}
            disabled={!isRetryEnabled() || isUploading}
          >
            <ReplayIcon/>
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
}

export default RetryButton;
