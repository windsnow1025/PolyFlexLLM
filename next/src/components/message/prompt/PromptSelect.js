import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PromptLogic from '@/lib/prompt/PromptLogic';
import FileLogic from '@/lib/common/file/FileLogic';
import {ContentTypeEnum} from '@/client/nest';
import ConfirmDialog from '@/components/common/components/ConfirmDialog';

function PromptSelect({
                        message,
                        setMessage,
                        setConversationUpdateKey,
                        promptsReloadKey,
                        setPromptsReloadKey,
                      }) {
  const fileLogic = useMemo(() => new FileLogic(), []);
  const promptLogic = useMemo(() => new PromptLogic(), []);

  // Prompts list
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  // Save dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  // Unlink dialog
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  // Rename dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [renaming, setRenaming] = useState(false);

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const selectedPromptId = message.promptId || '';

  const showAlert = (message, severity = 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const prompts = await promptLogic.fetchPrompts();
      setPrompts(prompts);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [promptLogic]);

  useEffect(() => {
    fetchPrompts();
  }, [promptsReloadKey, fetchPrompts]);

  const handleSelect = async (event) => {
    const value = event.target.value;

    if (value === 'save') {
      setSaveDialogOpen(true);
      return;
    }

    if (value === 'unlink') {
      setUnlinkDialogOpen(true);
      return;
    }

    if (value === 'clear') {
      await handleUnlink(false);
      return;
    }

    if (value === '') {
      return;
    }

    const selectedPrompt = prompts.find(prompt => prompt.id === value);
    if (selectedPrompt) {
      setMessage(message.id, {
        ...message,
        promptId: selectedPrompt.id,
        contents: selectedPrompt.contents,
      });
      setConversationUpdateKey(prev => prev + 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newPrompt = await promptLogic.savePrompt({
        name: newName.trim(),
        contents: message.contents,
      });

      setMessage(message.id, {
        ...message,
        promptId: newPrompt.id,
      });
      setConversationUpdateKey(prev => prev + 1);

      setPromptsReloadKey(prev => prev + 1);

      setSaveDialogOpen(false);
      setNewName('');
      showAlert('Prompt saved', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (keepContent) => {
    setUnlinking(true);
    try {
      if (!keepContent) {
        setMessage(message.id, {
          ...message,
          promptId: undefined,
          contents: [{type: ContentTypeEnum.Text, data: ''}],
        });
      } else {
        const newContents = structuredClone(message.contents);
        const fileUrls = newContents
          .filter(content => content.type === ContentTypeEnum.File)
          .map(content => content.data);

        const urlMapping = await fileLogic.cloneFileUrls(fileUrls);

        for (const content of newContents) {
          if (content.type === ContentTypeEnum.File) {
            const storageFilename = await fileLogic.getStorageFilenameFromUrl(content.data);
            if (storageFilename) {
              content.data = urlMapping.get(content.data);
            }
          }
        }

        setMessage(message.id, {
          ...message,
          promptId: undefined,
          contents: newContents,
        });
      }

      setConversationUpdateKey(prev => prev + 1);
      setUnlinkDialogOpen(false);
      showAlert('Unlinked from prompt', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setUnlinking(false);
    }
  };

  const handleDeleteClick = (event, id) => {
    event.stopPropagation();
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleRenameClick = (event, id, name) => {
    event.stopPropagation();
    setRenamingId(id);
    setRenameValue(name);
    setRenameDialogOpen(true);
  };

  const handleDeleteDialogClose = async (confirmed) => {
    if (!confirmed) {
      setDeleteDialogOpen(false);
      setDeletingId(null);
      return;
    }

    setDeleting(true);
    try {
      const deletedPrompt = await promptLogic.deletePrompt(deletingId);

      // Delete the files from storage
      const fileUrls = (deletedPrompt.contents)
        .filter(content => content.type === ContentTypeEnum.File)
        .map(content => content.data);
      const fileNames = await fileLogic.getStorageFilenamesFromUrls(fileUrls);

      if (fileNames.length > 0) {
        await fileLogic.deleteFiles(fileNames);
      }

      // If current message was linked to deleted prompt, unlink it
      if (message.promptId === deletingId) {
        setMessage(message.id, {
          ...message,
          promptId: undefined,
          contents: [{type: ContentTypeEnum.Text, data: ''}],
        });
        setConversationUpdateKey(prev => prev + 1);
      }

      setPromptsReloadKey(prev => prev + 1);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      showAlert('Prompt deleted', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleRenameConfirm = async () => {
    const currentPrompt = prompts.find(prompt => prompt.id === renamingId);
    if (!currentPrompt) return;

    setRenaming(true);
    try {
      await promptLogic.updatePromptName(
        currentPrompt.id,
        currentPrompt.version,
        renameValue.trim()
      );
      setPromptsReloadKey(prev => prev + 1);
      setRenameDialogOpen(false);
      setRenamingId(null);
      showAlert('Prompt renamed', 'success');
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setRenaming(false);
    }
  };

  const handleContentsUpdate = useCallback(async () => {
    if (!message.promptId) return;

    const currentPrompt = prompts.find(prompt => prompt.id === message.promptId);
    if (!currentPrompt) return;

    try {
      await promptLogic.updatePrompt(
        message.promptId,
        currentPrompt.version,
        {
          name: currentPrompt.name,
          contents: message.contents,
        }
      );
      await fetchPrompts();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  }, [message.promptId, message.contents, prompts, promptLogic, fetchPrompts]);

  useEffect(() => {
    if (message.promptId) {
      handleContentsUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.contents]);

  return (
    <>
      <FormControl size="small" sx={{minWidth: 160, ml: 1}}>
        <InputLabel id="prompt-select-label">Prompt</InputLabel>
        <Select
          id="prompt-select"
          labelId="prompt-select-label"
          value={selectedPromptId}
          onChange={handleSelect}
          label="Prompt"
          disabled={loading}
          renderValue={(value) => {
            const prompt = prompts.find(sp => sp.id === value);
            return prompt ? prompt.name : '';
          }}
        >
          {/* Save option */}
          {!selectedPromptId && (
            <MenuItem value="save">
              <ListItemIcon><AddIcon fontSize="small"/></ListItemIcon>
              <ListItemText>Save</ListItemText>
            </MenuItem>
          )}

          {/* Clear option */}
          {selectedPromptId && (
            <MenuItem value="clear">
              <ListItemIcon><ClearIcon fontSize="small"/></ListItemIcon>
              <ListItemText>Clear</ListItemText>
            </MenuItem>
          )}

          {/* Unlink option */}
          {selectedPromptId && (
            <MenuItem value="unlink">
              <ListItemIcon><LinkOffIcon fontSize="small"/></ListItemIcon>
              <ListItemText>Unlink</ListItemText>
            </MenuItem>
          )}

          <Divider/>

          {/* List of prompts */}
          {prompts.map((sp) => (
            <MenuItem key={sp.id} value={sp.id}>
              <ListItemText primary={sp.name}/>
              <IconButton
                size="small"
                onClick={(e) => handleRenameClick(e, sp.id, sp.name)}
                sx={{ml: 1}}
              >
                <EditIcon fontSize="small"/>
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={(e) => handleDeleteClick(e, sp.id)}
                sx={{ml: 0.5}}
              >
                <DeleteIcon fontSize="small"/>
              </IconButton>
            </MenuItem>
          ))}

          {prompts.length === 0 && !loading && (
            <MenuItem disabled>No saved prompts</MenuItem>
          )}
        </Select>
      </FormControl>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={saving ? undefined : () => setSaveDialogOpen(false)}>
        <DialogTitle>Save Prompt</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && newName.trim() && handleSave()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !newName.trim()}
            startIcon={saving ? <CircularProgress size={16}/> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unlink Dialog */}
      <ConfirmDialog
        open={unlinkDialogOpen}
        onClose={(confirmed) => {
          if (!confirmed) {
            setUnlinkDialogOpen(false);
            return;
          }
          handleUnlink(true);
        }}
        title="Unlink from Prompt"
        content="This will re-upload all files in the message contents. Continue?"
        disableBackdropClose={unlinking}
        isLoading={unlinking}
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={renaming ? undefined : () => setRenameDialogOpen(false)}>
        <DialogTitle>Rename Prompt</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && renameValue.trim() && handleRenameConfirm()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)} disabled={renaming}>Cancel</Button>
          <Button
            onClick={handleRenameConfirm}
            variant="contained"
            disabled={renaming || !renameValue.trim()}
            startIcon={renaming ? <CircularProgress size={16}/> : null}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        title="Delete Prompt?"
        content="This will make the prompt unavailable for any conversations using it."
        disableBackdropClose={deleting}
        isLoading={deleting}
      />

      {/* Alert Snackbar */}
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default PromptSelect;
