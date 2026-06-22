import {Button} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import React from "react";
import ChatLogic from "@/lib/chat/ChatLogic";

function TemporaryChatButton({
                               setMessages,
                               setSelectedConversationId,
                               clearUIState,
                             }) {
  const handleTemporaryChat = async () => {
    clearUIState();
    setMessages(ChatLogic.getInitMessages());
    setSelectedConversationId(null);
  };

  return (
    <div className="text-nowrap">
      <Button
        size="small"
        variant="text"
        startIcon={<ChatBubbleOutlineIcon/>}
        onClick={handleTemporaryChat}
        id="temporary-chat-button"
        fullWidth
      >
        Temp Chat
      </Button>
    </div>
  )
}

export default TemporaryChatButton;