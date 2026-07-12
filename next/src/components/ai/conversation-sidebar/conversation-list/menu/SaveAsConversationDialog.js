import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
} from '@mui/material';
import ConversationLogic from "@/lib/conversation/ConversationLogic";
import FileLogic from "@/lib/common/file/FileLogic";
import {ContentTypeEnum} from "@/client/nest";

function SaveAsConversationDialog({
  open,
  onClose,
  conversationId,
  defaultName,
  onSaved,
}) {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const conversationLogic = new ConversationLogic();
  const fileLogic = new FileLogic();

  useEffect(() => {
    if (open) {
      setName(defaultName);
    }
  }, [open, defaultName]);

  const handleSave = async () => {
    if (!conversationId) return;
    const newName = name.trim();
    if (!newName) {
      setAlertMessage('Please enter a name');
      setAlertSeverity('warning');
      setAlertOpen(true);
      return;
    }

    setSaving(true);
    try {
      const conversation = await conversationLogic.fetchConversation(conversationId);

      const newMessages = structuredClone(conversation.messages);

      // 1) Collect all file urls from messages
      const fileUrls = [];
      for (const msg of newMessages) {
        if (!msg?.contents) continue;
        for (const content of msg.contents) {
          if (content.type === ContentTypeEnum.File) {
            fileUrls.push(content.data);
          }
        }
      }

      // 2) Filter to server-hosted files and clone them
      const urlMapping = await fileLogic.cloneFileUrls(fileUrls);

      // 3) Replace file urls in message contents with the newly cloned urls
      for (const message of newMessages) {
        if (!message?.contents) continue;
        for (const content of message.contents) {
          if (content.type === ContentTypeEnum.File) {
            const storageFilenames = await fileLogic.getStorageFilenameFromUrl(content.data);
            if (storageFilenames) {
              content.data = urlMapping.get(content.data);
            }
          }
        }
      }

      const newConversation = await conversationLogic.addConversation({
        name: newName,
        messages: newMessages,
      });

      if (onSaved) onSaved(newConversation);
      onClose();
      setAlertMessage('Conversation saved as new');
      setAlertSeverity('success');
      setAlertOpen(true);
    } catch (err) {
      setAlertMessage(err.message);
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth>
        <DialogTitle>Save Conversation As</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            label="New name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16}/> : null}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default SaveAsConversationDialog;
