import {Button} from "@mui/material";
import React from "react";
import {useRouter} from "next/router";

function SignDiv() {
  const router = useRouter();

  const redirect = encodeURIComponent(router.asPath);

  const handleSignInRouter = () => {
    router.push(`/auth/signin?redirect=${redirect}`);
  };

  const handleSignUpRouter = () => {
    router.push(`/auth/signup?redirect=${redirect}`);
  };

  return (
    <div className="flex-start-center">
      <div className="m-1">
        <Button
          color="secondary"
          variant="contained"
          onClick={handleSignInRouter}
        >
          Sign In
        </Button>
      </div>
      <div className="m-1">
        <Button
          color="secondary"
          variant="contained"
          onClick={handleSignUpRouter}
        >
          Sign Up
        </Button>
      </div>
    </div>
  )
}

export default SignDiv;
