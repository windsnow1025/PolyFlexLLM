import * as React from 'react';
import {styled} from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MuiToolbar from '@mui/material/Toolbar';
import {tabsClasses} from '@mui/material/Tabs';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Brand from '@/components/common/components/Brand';
import SideMenuMobile from './SideMenuMobile';
import MenuButton from './MenuButton';
import Search from './Search';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';

const Toolbar = styled(MuiToolbar)({
  width: '100%',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'center',
  gap: '12px',
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: '8px',
    p: '8px',
    pb: 0,
  },
});

export default function AppNavbar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const [searchOpen, setSearchOpen] = React.useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  const openSearch = () => {
    searchRef.current!.querySelector('input')!.focus();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    searchRef.current!.querySelector('input')!.blur();
  };

  const handleSearchFocus = () => {
    setSearchOpen(true);
  };

  const handleSearchBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setSearchOpen(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== 'Escape') return;
    closeSearch();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'auto', md: 'none' },
        boxShadow: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: 'var(--template-frame-height, 0px)',
      }}
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            flexGrow: 1,
            width: '100%',
            gap: 1,
          }}
        >
          {!searchOpen && (
            <>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'center', alignItems: 'center', mr: 'auto' }}
              >
                <Brand variant="h4" />
              </Stack>
              <ColorModeIconDropdown />
            </>
          )}
          <Box
            ref={searchRef}
            onBlur={handleSearchBlur}
            onKeyDown={handleSearchKeyDown}
            sx={{ display: 'flex', alignItems: 'center', flexGrow: searchOpen ? 1 : 0 }}
          >
            {!searchOpen && (
              <MenuButton aria-label="Open search" onClick={openSearch}>
                <SearchRoundedIcon />
              </MenuButton>
            )}
            <Box
              onFocus={handleSearchFocus}
              sx={{ flexGrow: searchOpen ? 1 : 0, width: searchOpen ? 'auto' : 0, overflow: searchOpen ? 'visible' : 'hidden' }}
            >
              <Search />
            </Box>
            {searchOpen && (
              <MenuButton aria-label="Close search" onClick={closeSearch} sx={{ ml: 1 }}>
                <CloseRoundedIcon />
              </MenuButton>
            )}
          </Box>
          {!searchOpen && (
            <MenuButton aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuRoundedIcon />
            </MenuButton>
          )}
          <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export function CustomIcon() {
  return (
    <Box
      sx={{
        width: '1.5rem',
        height: '1.5rem',
        bgcolor: 'black',
        borderRadius: '999px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundImage:
          'linear-gradient(135deg, hsl(210, 98%, 60%) 0%, hsl(210, 100%, 35%) 100%)',
        color: 'hsla(210, 100%, 95%, 0.9)',
        border: '1px solid',
        borderColor: 'hsl(210, 100%, 55%)',
        boxShadow: 'inset 0 2px 5px rgba(255, 255, 255, 0.3)',
      }}
    >
      <DashboardRoundedIcon color="inherit" sx={{ fontSize: '1rem' }} />
    </Box>
  );
}
