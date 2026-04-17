import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, href: '/' },
  { text: 'AI Studio', icon: <AutoAwesomeIcon />, href: '/ai' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, href: '/settings' },
];

export default function MenuContent({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const isSelected = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={collapsed ? item.text : ''} placement="right">
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isSelected(item.href)}
                sx={{ gap: 1, overflow: 'hidden', whiteSpace: 'nowrap', ...(collapsed ? { justifyContent: 'center', minHeight: 36 } : {}) }}
              >
                <ListItemIcon sx={collapsed ? { minWidth: 0 } : {}}>{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={collapsed ? item.text : ''} placement="right">
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isSelected(item.href)}
                sx={{ gap: 1, overflow: 'hidden', whiteSpace: 'nowrap', ...(collapsed ? { justifyContent: 'center', minHeight: 36 } : {}) }}
              >
                <ListItemIcon sx={collapsed ? { minWidth: 0 } : {}}>{item.icon}</ListItemIcon>
                {!collapsed && <ListItemText primary={item.text} />}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
