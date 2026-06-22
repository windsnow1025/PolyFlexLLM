import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/router';
import AIStudio from '@/components/ai/AIStudio';
import ConversationLogic from '@/lib/conversation/ConversationLogic';
import {Alert, CircularProgress, Snackbar} from "@mui/material";

export default function PublicConversationPage() {
  const router = useRouter();
  const { id } = router.query;

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const [messages, setMessages] = useState(null);

  const conversationLogic = useMemo(() => new ConversationLogic(), []);

  const fetchPublicConversation = useCallback(async () => {
    const numId = Number(id);
    try {
      const conversation = await conversationLogic.fetchPublicConversation(numId);
      setMessages(conversation.messages);
    } catch (err) {
      setMessages([]);
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }, [id, conversationLogic]);

  useEffect(() => {
    if (!id) return;
    fetchPublicConversation();
  }, [id, fetchPublicConversation]);

  if (messages === null) {
    return (
      <div className="flex-center h-full">
        <CircularProgress/>
      </div>
    );
  }

  return (
    <>
      <AIStudio initMessages={messages} />

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
