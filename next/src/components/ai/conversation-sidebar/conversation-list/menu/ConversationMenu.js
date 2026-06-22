import {Alert, Divider, Menu, MenuItem, Snackbar, Typography} from "@mui/material";
import {
  DeleteOutlined as DeleteOutlinedIcon,
  SaveOutlined as SaveOutlinedIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import React, {useState} from "react";
import ConversationLogic from "@/lib/conversation/ConversationLogic";
import ChatLogic from "@/lib/chat/ChatLogic";
import FileLogic from "@/lib/common/file/FileLogic";
import {NO_LABEL_COLOR} from "../label/PresetColors";
import ShareConversationDialog from "./ShareConversationDialog";
import SaveAsConversationDialog from "./SaveAsConversationDialog";
import ColorDot from "../label/ColorDot";

function ConversationMenu({
                            conversationIndex,
                            anchorEl,
                            setAnchorEl,
                            menuIndex,
                            setMenuIndex,
                            conversations,
                            setConversations,
                            selectedConversationId,
                            setSelectedConversationId,
                            setMessages,
                            setConversationsReloadKey,
                            abortGenerate,
                            clearUIState,
                            activateConversation,
                            setLoadingConversationId,
                            labels,
                          }) {
  const conversationLogic = new ConversationLogic();

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedConversationIndex, setSelectedConversationIndex] = useState(null);

  // Save As dialog state
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [saveAsConversationIndex, setSaveAsConversationIndex] = useState(null);

  const fileLogic = new FileLogic();

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const openShareDialog = (index) => {
    setSelectedConversationIndex(index);
    setShareDialogOpen(true);
  };

  const openSaveAsDialog = (index) => {
    setSaveAsConversationIndex(index);
    setSaveAsDialogOpen(true);
  };

  const deleteConversation = async (index) => {
    const conversationId = conversations[index].id;

    // If the conversation is currently selected, stop generating
    if (conversationId === selectedConversationId) {
      abortGenerate();
    }

    setLoadingConversationId(conversationId);

    try {
      // Find files in the conversation
      const conversation = await conversationLogic.fetchConversation(conversationId);
      let fileUrls = [];
      if (conversation) {
        fileUrls = ChatLogic.getFileUrlsFromMessages(conversation.messages);
      }

      // Delete the conversation
      await conversationLogic.deleteConversation(conversationId);

      // Delete the files from storage
      if (fileUrls.length > 0) {
        try {
          const fileNames = FileLogic.getFilenamesFromUrls(fileUrls);
          await fileLogic.deleteFiles(fileNames);
        } catch (err) {
          setAlertOpen(true);
          setAlertMessage(err.message);
          setAlertSeverity('error');
        }
      }

      // Remove the conversation in UI
      setConversations((prevConversations) => prevConversations.filter(c => c.id !== conversationId));

      setConversationsReloadKey(prev => prev + 1);
      setAlertOpen(true);
      setAlertMessage('Conversation deleted');
      setAlertSeverity('success');
    } catch (err) {
      setAlertOpen(true);
      setAlertMessage(err.message);
      setAlertSeverity('error');
    }

    if (conversationId === selectedConversationId) {
      setSelectedConversationId(null);
      setMessages(ChatLogic.getInitMessages());
    }
    setLoadingConversationId(null);
  };

  const updateConversationLabelLink = async (index, labelId) => {
    const conversationId = conversations[index].id;
    setLoadingConversationId(conversationId);
    try {
      const updatedConversation = await conversationLogic.updateConversationLabelLink(
        conversationId, conversations[index].version, labelId
      );
      setConversations((prevConversations) => {
        const newConversations = [...prevConversations];
        newConversations[index] = updatedConversation;
        return newConversations;
      });
      setAlertOpen(true);
      setAlertMessage('Conversation label updated');
      setAlertSeverity('success');
    } catch (err) {
      setAlertOpen(true);
      setAlertMessage(err.message);
      setAlertSeverity('error');
    }
    setLoadingConversationId(null);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={menuIndex === conversationIndex}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          openSaveAsDialog(conversationIndex);
          handleMenuClose();
        }}>
          <SaveOutlinedIcon fontSize="small" className="mr-1"/>
          Save As
        </MenuItem>
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          openShareDialog(conversationIndex);
          handleMenuClose();
        }}>
          <ShareIcon fontSize="small" className="mr-1"/>
          Share
        </MenuItem>
        <MenuItem onClick={(e) => {
          e.stopPropagation();
          deleteConversation(conversationIndex);
          handleMenuClose();
        }}>
          <DeleteOutlinedIcon fontSize="small" className="mr-1"/>
          Delete
        </MenuItem>
        <Divider/>
        <MenuItem disabled>Set label</MenuItem>
        {/* No label option */}
        <MenuItem dense onClick={(e) => {
          e.stopPropagation();
          updateConversationLabelLink(conversationIndex, null);
          handleMenuClose();
        }}>
          <ColorDot color={NO_LABEL_COLOR} sx={{mr: 1}}/>
          No label
        </MenuItem>
        {/* User's existing labels */}
        {labels.length > 0 ? (
          labels.map((label) => (
            <MenuItem dense key={label.id} onClick={(e) => {
              e.stopPropagation();
              updateConversationLabelLink(conversationIndex, label.id);
              handleMenuClose();
            }}>
              <ColorDot color={label.color} sx={{mr: 1}}/>
              {label.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">
              No labels created yet
            </Typography>
          </MenuItem>
        )}
      </Menu>

      <ShareConversationDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        conversation={conversations[selectedConversationIndex]}
        setConversation={(updatedConversation) => {
          setConversations((prevConversations) => {
            const newConversations = [...prevConversations];
            newConversations[selectedConversationIndex] = updatedConversation;
            return newConversations;
          });
        }}
      />

      <SaveAsConversationDialog
        open={saveAsDialogOpen}
        onClose={() => setSaveAsDialogOpen(false)}
        conversationId={conversations[saveAsConversationIndex]?.id}
        defaultName={(conversations[saveAsConversationIndex]?.name) + ' Copy'}
        onSaved={async (newConversation) => {
          clearUIState();
          setConversations(prev => [newConversation, ...prev]);
          await activateConversation(newConversation);
          setConversationsReloadKey(prev => prev + 1);
        }}
      />

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

export default ConversationMenu;