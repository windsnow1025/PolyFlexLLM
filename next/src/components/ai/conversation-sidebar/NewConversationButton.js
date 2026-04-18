import {Alert, Button, CircularProgress, Snackbar} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import React, {useState} from "react";
import {Temporal} from "@js-temporal/polyfill";
import ChatLogic from "@/lib/chat/ChatLogic";
import ConversationLogic from "@/lib/conversation/ConversationLogic";

function NewConversationButton({
                                 setMessages,
                                 setConversations,
                                 setSelectedConversationId,
                                 setConversationsReloadKey,
                                 setIsTemporaryChat,
                                 buttonStyle,
                                 clearUIStateRef,
                               }) {
  const conversationLogic = new ConversationLogic();

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [loading, setLoading] = useState(false);

  const handleNewConversation = async () => {
    clearUIStateRef.current?.();
    setLoading(true);
    try {
      // YYYY-MM-DD HH:MM:SS (local time)
      const dateStr = Temporal.Now.plainDateTimeISO().toString({smallestUnit: 'second'}).replace('T', ' ');

      const defaultMessages = ChatLogic.getInitMessages();

      const newConversation = await conversationLogic.addConversation({
        name: dateStr,
        messages: defaultMessages
      });

      setIsTemporaryChat(false);
      setConversations(prev => [newConversation, ...prev]);
      setSelectedConversationId(newConversation.id);
      setMessages(newConversation.messages);
      setConversationsReloadKey(prev => prev + 1);
    } catch (err) {
      setAlertOpen(true);
      setAlertMessage(err.message);
      setAlertSeverity('error');
    } finally {
      setLoading(false);
    }
  };

  const isMainStyle = buttonStyle === "main";
  const buttonProps = isMainStyle ? {
    size: "large",
    variant: "contained",
    color: "primary",
    fullWidth: false,
    sx: {
      borderRadius: 999,
      px: 4,
      py: 1.2,
      textTransform: 'none',
      fontWeight: 600,
      boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)'
    }
  } : {
    size: "small",
    variant: "text",
    fullWidth: true
  };

  return (
    <div className="text-nowrap">
      <Button
        size={buttonProps.size}
        variant={buttonProps.variant}
        color={buttonProps.color}
        startIcon={loading ? <CircularProgress size={16}/> : <ChatIcon/>}
        onClick={handleNewConversation}
        disabled={loading}
        id={`new-conversation-button-${buttonStyle}`}
        fullWidth={buttonProps.fullWidth}
        sx={buttonProps.sx}
      >
        {loading ? "Creating..." : "New Conversation"}
      </Button>
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
  )
}

export default NewConversationButton;
