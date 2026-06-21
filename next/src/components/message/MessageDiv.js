import React, {memo, useState} from 'react';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {IconButton, Tooltip} from "@mui/material";
import RoleSelect from '@/components/message/role/RoleSelect';
import DisplayDiv from "@/components/message/content/display/DisplayDiv";
import ThoughtDiv from "@/components/message/content/thought/ThoughtDiv";
import SortableContents from './content/SortableContents';
import MessageContainer from './MessageContainer';
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
    selectedConversationId,
    isThoughtLoading,
    setUploadingCount,
  } = props;

  // import usePropsChangeLogger from "../../hooks/usePropsChangeLogger";
  // usePropsChangeLogger(`MessageDiv: ${message.id}`, props);

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

  const handleCopyMessage = () => {
    const textToCopy = message.contents
      .filter(content => content.type !== 'File')
      .map(content => content.data)
      .join('\n');

    navigator.clipboard.writeText(textToCopy);
  };

  const rawEditableState = showPreview ? RawEditableState.AlwaysFalse : RawEditableState.AlwaysTrue;

  return (
    <MessageContainer role={message.role}>
      <div className="flex items-center">
        <RoleSelect role={message.role} setRole={handleRoleChange}/>
        {(message.role === MessageRoleEnum.System || message.role === MessageRoleEnum.User) && selectedConversationId !== null && (
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
        selectedConversationId={selectedConversationId}
      />

      <DisplayDiv
        display={message.display}
        setDisplay={handleDisplayChange}
        isPreview={showPreview}
      />

      {rawEditableState !== RawEditableState.AlwaysFalse && selectedConversationId !== null && (
        <AddContentArea
          setContents={handleContentsChange}
          setUploadingCount={setUploadingCount}
        />
      )}
    </MessageContainer>
  );
}

export default memo(MessageDiv);
