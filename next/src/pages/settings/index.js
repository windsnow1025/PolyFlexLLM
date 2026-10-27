import React, {useEffect, useMemo, useState} from "react";
import {Alert, Snackbar, Tab, Tabs} from "@mui/material";
import AuthSettings from "@/components/common/settings/auth/AuthSettings";
import DeveloperSettings from "@/components/common/settings/DeveloperSettings";
import AdminSetting from "@/components/common/settings/AdminSetting";
import UserLogic from "@/lib/common/user/UserLogic";
import StorageSettings from "@/components/common/settings/StorageSettings";
import Head from "next/head";
import {useRouter} from "next/router";

const Settings = () => {
  const userLogic = useMemo(() => new UserLogic(), []);
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);

  // Alert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("info");

  const tab = Number(router.query.tab);
  const activeTab = isNaN(tab) ? 0 : tab;

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await userLogic.isAdmin();
        setIsAdmin(adminStatus);
      } catch (err) {
        setAlertMessage(err.message);
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    };

    checkAdmin();
  }, [userLogic]);

  const handleTabChange = (event, newValue) => {
    router.replace({ query: { ...router.query, tab: newValue } }, undefined, { shallow: true });
  };

  return (
    <div className="local-scroll-container">
      <Head>
        <title>Settings</title>
      </Head>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Auth"/>
        <Tab label="Storage"/>
        <Tab label="Developer"/>
        {isAdmin && <Tab label="Admin"/>}
      </Tabs>
      <div className="local-scroll-scrollable p-4">
        {activeTab === 0 && <AuthSettings/>}
        {activeTab === 1 && <StorageSettings/>}
        {activeTab === 2 && <DeveloperSettings/>}
        {isAdmin && activeTab === 3 && <AdminSetting/>}
      </div>

      <Snackbar
        open={alertOpen}
        autoHideDuration={6000}
        onClose={() => setAlertOpen(false)}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertSeverity} sx={{width: "100%"}}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;