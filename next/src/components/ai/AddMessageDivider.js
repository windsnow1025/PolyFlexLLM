import {Divider, IconButton, Tooltip} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, {useState} from "react";
import ChatLogic from "@/lib/chat/ChatLogic";

const FlexDivider = ({isHovered}) => (
  <Divider
    sx={{
      flexGrow: 1,
      opacity: isHovered ? 1 : 0.5,
      transition: 'opacity 0.2s ease-in-out'
    }}
  />
);

function AddMessageDivider({
                             messages,
                             setMessages,
                             index,
                             abortGenerateRef,
                             setConversationUpdateKey,
                             setScrollToIndex,
                           }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMessageAdd = (index) => {
    if (index === messages.length - 1) {
      abortGenerateRef.current();
    }

    const newMessages = [...messages];
    newMessages.splice(index + 1, 0, ChatLogic.getEmptyUserMessage());
    setMessages(newMessages);

    setConversationUpdateKey(prev => prev + 1);

    setScrollToIndex();
  };

  return (
    <div
      className="flex-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FlexDivider isHovered={isHovered}/>
      <Tooltip title="Add Message">
        <IconButton
          size="small"
          onClick={() => handleMessageAdd(index)}
          sx={{
            py: 0,
            width: 'auto',
            height: 'auto',
            opacity: isHovered ? 1 : 0.2,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          <AddCircleIcon fontSize="small"/>
        </IconButton>
      </Tooltip>
      <FlexDivider isHovered={isHovered}/>
    </div>
  );
}

export default AddMessageDivider;