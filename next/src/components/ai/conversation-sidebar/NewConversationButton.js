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

  return (
    <div className="text-nowrap">
      <Button
        size="small"
        variant="text"
        startIcon={loading ? <CircularProgress size={16}/> : <ChatIcon/>}
        onClick={handleNewConversation}
        disabled={loading}
        id="new-conversation-button"
        fullWidth
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
