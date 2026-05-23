import React, {useEffect, useMemo, useState} from 'react';
import {CircularProgress, Link, Typography} from "@mui/material";
import UserLogic from "@/lib/common/user/UserLogic";
import {StorageKeys} from "@/lib/common/Constants";
import {useAuthentication} from "@/session/SessionContext";

function CreditSection({refreshKey = 0, decimalPlaces = null}) {
  const userLogic = useMemo(() => new UserLogic(), []);
  const authentication = useAuthentication();

  const [credit, setCredit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const fetchCredit = async () => {
      const token = localStorage.getItem(StorageKeys.Token);
      setSignedIn(!!token);
      if (token) {
        try {
          const credit = await userLogic.fetchCredit();
          setCredit(credit);
        } catch (error) {
          setCredit("error");
        }
      }
      setLoading(false);
    };

    fetchCredit();
  }, [refreshKey, userLogic]);

  const formatCredit = (value) => {
    if (value === null || value === "error") return value;
    if (decimalPlaces === null) return value;
    return Number(value).toFixed(decimalPlaces);
  };

  if (loading) {
    return <CircularProgress/>;
  }

  if (!signedIn) {
    return (
      <Typography>
        <Link component="button" type="button" onClick={() => authentication?.signIn()}>
          Sign in
        </Link>
        {' to view credits'}
      </Typography>
    );
  }

  return <Typography>Credit: {formatCredit(credit)}</Typography>;
}

export default CreditSection;
