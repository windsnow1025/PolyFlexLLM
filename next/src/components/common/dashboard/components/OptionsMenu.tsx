import * as React from 'react';
import {styled} from '@mui/material/styles';
import Divider, {dividerClasses} from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import {paperClasses} from '@mui/material/Paper';
import {listClasses} from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, {listItemIconClasses} from '@mui/material/ListItemIcon';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import {useRouter} from 'next/router';
import {useAuthentication, useSession} from '@/session/SessionContext';
import MenuButton from './MenuButton';

const MenuItem = styled(MuiMenuItem)({
  margin: '2px 0',
});

export default function OptionsMenu({ trigger }: { trigger?: React.ReactElement<{ onClick?: (e: React.MouseEvent<HTMLElement>) => void }> }) {
  const session = useSession();
  const authentication = useAuthentication();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <React.Fragment>
      {trigger ? (
        React.cloneElement(trigger, { onClick: handleClick })
      ) : (
        <MenuButton
          aria-label="Open menu"
          onClick={handleClick}
          sx={{ borderColor: 'transparent' }}
        >
          <MoreVertRoundedIcon />
        </MenuButton>
      )}
      <Menu
        anchorEl={anchorEl}
        id="menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${listClasses.root}`]: {
            padding: '4px',
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .${dividerClasses.root}`]: {
            margin: '4px -4px',
          },
        }}
      >
        {session?.user ? [
          <MenuItem key="account" onClick={() => { handleClose(); router.push('/settings?tab=0'); }}>My account</MenuItem>,
          <Divider key="divider" />,
          <MenuItem
            key="logout"
            onClick={() => { handleClose(); authentication?.signOut(); }}
            sx={{
              [`& .${listItemIconClasses.root}`]: {
                ml: 'auto',
                minWidth: 0,
              },
            }}
          >
            <ListItemText>Logout</ListItemText>
            <ListItemIcon>
              <LogoutRoundedIcon fontSize="small" />
            </ListItemIcon>
          </MenuItem>,
        ] : [
          <MenuItem key="signin" onClick={() => { handleClose(); authentication?.signIn(); }}>
            <ListItemIcon>
              <LoginRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sign in</ListItemText>
          </MenuItem>,
          <MenuItem key="signup" onClick={() => { handleClose(); router.push('/auth/signup'); }}>
            <ListItemIcon>
              <PersonAddRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sign up</ListItemText>
          </MenuItem>,
        ]}
      </Menu>
    </React.Fragment>
  );
}
