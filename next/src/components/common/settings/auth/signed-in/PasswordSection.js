import React, {useEffect, useMemo, useState} from 'react';
import UserLogic from "@/lib/common/user/UserLogic";
import TextField from "@mui/material/TextField";
import {Alert, Button, Snackbar} from "@mui/material";

function PasswordSection() {
  const [hasPassword, setHasPassword] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const userLogic = useMemo(() => new UserLogic(), []);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userLogic.fetchUser();
        if (user) {
          setHasPassword(user.hasPassword);
        }
      } catch (err) {
        showAlert(err.message, 'error');
      }
    };
    fetchUserData();
  }, [userLogic]);

  useEffect(() => {
    if (confirmNewPassword === '' || newPassword === '') {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(newPassword === confirmNewPassword);
    }
  }, [newPassword, confirmNewPassword]);

  const handleUpdatePassword = async () => {
    if (!userLogic.validateUsernameOrPassword(newPassword)) {
      showAlert("Password invalid. Must be 4-32 ASCII characters.", 'warning');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showAlert("Passwords do not match.", 'warning');
      return;
    }

    try {
      setIsProcessing(true);
      await userLogic.updatePassword(newPassword);
      showAlert(hasPassword ? "Password updated successfully" : "Password set successfully", 'success');
      setHasPassword(true);
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (e) {
      showAlert(e.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-4 flex-column gap-2">
      <Alert severity="info" sx={{ mb: 1 }}>
        {hasPassword
          ? "Changing your password will sign out all signed-in devices."
          : "Setting a password will sign out all signed-in devices."}
      </Alert>
      <TextField
        label="New Password"
        variant="outlined"
        type="password"
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isProcessing}
      />
      <TextField
        label="Confirm Password"
        variant="outlined"
        type="password"
        fullWidth
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
        error={!passwordsMatch}
        helperText={!passwordsMatch ? "Passwords don't match" : ""}
        disabled={isProcessing}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpdatePassword}
        fullWidth
        disabled={!passwordsMatch || isProcessing}
      >
        {hasPassword ? "Update Password" : "Set Password"}
      </Button>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: '100%'}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default PasswordSection;