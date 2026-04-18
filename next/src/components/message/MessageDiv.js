import React, {memo, useState} from 'react';
import {useTheme} from '@mui/material/styles';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {Box, IconButton, Tooltip} from "@mui/material";
import RoleSelect from '@/components/message/role/RoleSelect';
import DisplayDiv from "@/components/message/content/display/DisplayDiv";
import ThoughtDiv from "@/components/message/content/thought/ThoughtDiv";
import SortableContents from './content/SortableContents';
import AddContentArea from "@/components/message/content/create/AddContentArea";
import PromptSelect from "@/components/message/prompt/PromptSelect";
import {MessageRoleEnum} from "@/client/nest";
import {RawEditableState} from "@/lib/common/message/EditableState";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditSquareIcon from '@mui/icons-material/EditSquare';

function MessageDiv(props) {
  const {
    message,
    setMessage,
    onMessageDelete,
    setConversationUpdateKey,
    promptsReloadKey,
    setPromptsReloadKey,
    isTemporaryChat,
    isThoughtLoading,
    setUploadingCount,
  } = props;

  // import usePropsChangeLogger from "../../hooks/usePropsChangeLogger";
  // usePropsChangeLogger(`MessageDiv: ${message.id}`, props);

  const theme = useTheme();
  const [showPreview, setShowPreview] = useState(message.role !== MessageRoleEnum.User);

  const handleRoleChange = (newRole) => {
    setMessage(message.id, {...message, role: newRole});
    setShowPreview(newRole !== MessageRoleEnum.User);

    setConversationUpdateKey(prev => prev + 1);
  };

  const handleContentsChange = (newContents) => {
    setMessage(message.id, prevMessage => {
      const updatedContents = typeof newContents === 'function'
        ? newContents(prevMessage.contents)
        : newContents;

      return {
        ...prevMessage,
        contents: updatedContents
      };
    });

    setConversationUpdateKey(prev => prev + 1);
  };

  const handleDisplayChange = (newDisplay) => {
    setMessage(message.id, {...message, display: newDisplay});
  };

  const handleThoughtChange = (newThought) => {
    setMessage(message.id, {...message, thought: newThought});
  };

  const getRoleBorderColor = (role) => {
    switch (role) {
      case MessageRoleEnum.User:
        return theme.vars.palette.primary.main;
      case MessageRoleEnum.Assistant:
        return theme.vars.palette.secondary.main;
      case MessageRoleEnum.System:
        return theme.vars.palette.warning.main;
      default:
        return 'transparent';
    }
  };

  const getRoleBorderStyles = (role) => {
    const color = getRoleBorderColor(role);
    return {
      border: `1px solid color-mix(in srgb, ${color}, white 50%)`
    };
  };

  const getMessageContainerStyles = (role) => {
    switch (role) {
      case MessageRoleEnum.User:
        return {justifyContent: 'flex-end'};
      case MessageRoleEnum.Assistant:
        return {justifyContent: 'flex-start'};
      case MessageRoleEnum.System:
        return {justifyContent: 'center'};
      default:
        return {};
    }
  };

  const handleCopyMessage = () => {
    const textToCopy = message.contents
      .filter(content => content.type !== 'File')
      .map(content => content.data)
      .join('\n');

    navigator.clipboard.writeText(textToCopy);
  };

  const rawEditableState = showPreview ? RawEditableState.AlwaysFalse : RawEditableState.AlwaysTrue;

  return (
    <div style={{...getMessageContainerStyles(message.role), display: 'flex'}}>
      <Box
        className="p-2 rounded-lg"
        sx={{
          ...getRoleBorderStyles(message.role),
          minWidth: "75%",
          maxWidth: "95%",
          '&:hover': {
            borderColor: getRoleBorderColor(message.role),
            outline: `1px solid ${getRoleBorderColor(message.role)}`,
            boxShadow: theme.shadows[3],
          },
        }}
      >
        <div className="flex items-center">
          <RoleSelect role={message.role} setRole={handleRoleChange} disabled={!!message.promptId}/>
          {(message.role === MessageRoleEnum.System || message.role === MessageRoleEnum.User) && !isTemporaryChat && (
            <PromptSelect
              message={message}
              setMessage={setMessage}
              setConversationUpdateKey={setConversationUpdateKey}
              promptsReloadKey={promptsReloadKey}
              setPromptsReloadKey={setPromptsReloadKey}
            />
          )}
          <div className="inflex-fill"></div>

          <Tooltip title={showPreview ? "Edit Mode" : "Preview Mode"}>
            <IconButton size="small" onClick={() => {
              setShowPreview(!showPreview)
            }}>
              {showPreview ? <EditSquareIcon fontSize="small"/> : <VisibilityIcon fontSize="small"/>}
            </IconButton>
          </Tooltip>

          {rawEditableState === RawEditableState.AlwaysFalse && (
            <Tooltip title="Copy Message">
              <IconButton size="small" onClick={handleCopyMessage}>
                <ContentCopyIcon fontSize="small"/>
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete Message">
            <IconButton size="small" color="error" onClick={() => onMessageDelete(message.id)}>
              <RemoveCircleOutlineIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
        </div>

        <div className="mt-2"></div>
        <ThoughtDiv
          thought={message.thought}
          setThought={handleThoughtChange}
          isPreview={showPreview}
          isLoading={isThoughtLoading}
        />

        <SortableContents
          contents={message.contents}
          setContents={handleContentsChange}
          rawEditableState={rawEditableState}
          setConversationUpdateKey={setConversationUpdateKey}
          isTemporaryChat={isTemporaryChat}
        />

        <DisplayDiv
          display={message.display}
          setDisplay={handleDisplayChange}
          isPreview={showPreview}
        />

        {rawEditableState !== RawEditableState.AlwaysFalse && !isTemporaryChat && (
          <AddContentArea
            setContents={handleContentsChange}
            setUploadingCount={setUploadingCount}
          />
        )}
      </Box>
    </div>
  );
}

export default memo(MessageDiv);
