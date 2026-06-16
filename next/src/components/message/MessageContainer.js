import React from 'react';
import {Box} from "@mui/material";
import {MessageRoleEnum} from "@/client/nest";

const getRoleColorKey = (role) => {
  switch (role) {
    case MessageRoleEnum.User:
      return 'primary';
    case MessageRoleEnum.Assistant:
      return 'secondary';
    case MessageRoleEnum.System:
      return 'warning';
    default:
      return null;
  }
};

const getJustifyContent = (role) => {
  switch (role) {
    case MessageRoleEnum.User:
      return 'flex-end';
    case MessageRoleEnum.Assistant:
      return 'flex-start';
    case MessageRoleEnum.System:
      return 'center';
    default:
      return 'flex-start';
  }
};

function MessageContainer({role, children}) {
  return (
    <div style={{display: 'flex', justifyContent: getJustifyContent(role)}}>
      <Box
        className="p-2 rounded-lg"
        sx={(theme) => {
          const colorKey = getRoleColorKey(role);
          const color = colorKey ? theme.vars.palette[colorKey].main : 'transparent';
          return {
            minWidth: "75%",
            maxWidth: "95%",
            border: `1px solid color-mix(in srgb, ${color}, white 50%)`,
            '&:hover': {
              borderColor: color,
              outline: `1px solid ${color}`,
              boxShadow: theme.shadows[3],
            },
          };
        }}
      >
        {children}
      </Box>
    </div>
  );
}

export default MessageContainer;
