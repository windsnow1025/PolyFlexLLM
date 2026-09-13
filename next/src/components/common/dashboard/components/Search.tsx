import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {useRouter} from 'next/router';
import {usePathname} from 'next/navigation';

export default function Search() {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = React.useState('');
  const [alertOpen, setAlertOpen] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;

    if (pathname !== '/ai') {
      setAlertOpen(true);
      return;
    }

    router.replace({ pathname: '/ai', query: value ? { search: value } : {} }, undefined, { shallow: true });
  };

  React.useEffect(() => {
    if (pathname !== '/ai') {
      setValue('');
    }
  }, [pathname]);

  return (
    <>
      <FormControl sx={{ width: { xs: '100%', md: '25ch' } }} variant="outlined">
        <OutlinedInput
          size="small"
          placeholder="Search…"
          sx={{ flexGrow: 1 }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          startAdornment={
            <InputAdornment position="start" sx={{ color: 'text.primary' }}>
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          }
          inputProps={{
            'aria-label': 'search',
          }}
        />
      </FormControl>
      <Snackbar
        open={alertOpen}
        autoHideDuration={3000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity="info" sx={{ width: '100%' }}>
          Search is only available in AI Studio
        </Alert>
      </Snackbar>
    </>
  );
}
