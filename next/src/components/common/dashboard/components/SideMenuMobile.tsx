import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, {drawerClasses} from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import {useRouter} from 'next/router';
import MenuContent from './MenuContent';
import AnnouncementBell from '@/components/common/components/AnnouncementBell';
import {useAuthentication, useSession} from '@/session/SessionContext';

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const session = useSession();
  const authentication = useAuthentication();
  const router = useRouter();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={session?.user?.name ?? ''}
              src={session?.user?.image ?? undefined}
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h6">
              {session?.user?.name ?? 'Guest'}
            </Typography>
          </Stack>
          <AnnouncementBell />
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <Stack sx={{ p: 2, gap: 1 }}>
          {session?.user ? (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<LogoutRoundedIcon />}
              onClick={() => {
                authentication?.signOut()
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<LoginRoundedIcon />}
                onClick={() => {
                  authentication?.signIn()
                }}
              >
                Sign in
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PersonAddRoundedIcon />}
                onClick={() => {
                  router.push('/auth/signup');
                }}
              >
                Sign up
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}
