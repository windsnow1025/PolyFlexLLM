import React, {useEffect, useMemo, useState} from 'react';
import {useRouter} from "next/router";
import UserLogic from "@/lib/common/user/UserLogic";
import TextField from "@mui/material/TextField";
import {Alert, Button, Snackbar} from "@mui/material";
import {EmailVerificationReqDtoPurposeEnum} from "@/client/nest";
import {ResendCooldownSeconds} from "@/lib/common/Constants";

function EmailSection() {
  const router = useRouter();
  const verifyingEmail = typeof router.query.email === 'string' ? router.query.email : null;
  const verificationToken = typeof router.query.token === 'string' ? router.query.token : null;

  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [sentEmail, setSentEmail] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');

  const userLogic = useMemo(() => new UserLogic(), []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userLogic.fetchUser();
        if (user) {
          setEmail(user.email);
          setNewEmail(user.email);
        }
      } catch (err) {
        showAlert(err.message, 'error');
      }
    };
    fetchUserData();
  }, [userLogic]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const showAlert = (message, severity) => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };

  const handleSend = async () => {
    if (!userLogic.validateEmail(newEmail)) {
      showAlert("Please enter a valid email address.", 'warning');
      return;
    }

    try {
      setIsSending(true);
      await userLogic.sendEmailVerification(newEmail, EmailVerificationReqDtoPurposeEnum.EmailChange);
      setResendCooldown(ResendCooldownSeconds);
      setSentEmail(newEmail);
    } catch (e) {
      showAlert(e.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      await userLogic.updateEmail(verifyingEmail, verificationToken);
      setEmail(verifyingEmail);
      setNewEmail(verifyingEmail);
      showAlert("Email updated.", 'success');
      router.replace('/settings');
    } catch (e) {
      showAlert(e.message, 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    router.replace('/settings');
  };

  const sendButtonLabel = isSending
    ? "Sending Verification..."
    : resendCooldown > 0
      ? `Resend Available in ${resendCooldown}s`
      : "Update Email";

  return (
    <div className="mt-4 flex-column gap-2">
      {verifyingEmail && verificationToken ? (
        <>
          <Alert severity="info" sx={{ mb: 1 }}>
            Confirm to set <strong>{verifyingEmail}</strong> as the email of this account.
          </Alert>
          <div className="flex-start-center-nowrap gap-2">
            <Button
              variant="outlined"
              onClick={handleCancel}
              fullWidth
              disabled={isConfirming}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              fullWidth
              disabled={isConfirming}
            >
              {isConfirming ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </>
      ) : (
        <>
          {sentEmail && (
            <Alert severity="info" sx={{ mb: 1 }}>
              Verification email sent to <strong>{sentEmail}</strong>. Open the link in it on a device where you are signed in to finish the change.
            </Alert>
          )}
          <TextField
            label="New Email"
            variant="outlined"
            type="email"
            fullWidth
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={isSending}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            fullWidth
            disabled={isSending || resendCooldown > 0 || email === newEmail}
          >
            {sendButtonLabel}
          </Button>
        </>
      )}

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

export default EmailSection;
