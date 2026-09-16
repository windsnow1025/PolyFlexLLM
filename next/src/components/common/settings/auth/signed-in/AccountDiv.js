import React, {useState} from 'react';
import {Divider, Link, Tab, Tabs, Typography} from "@mui/material";
import {TabContext, TabPanel} from "@mui/lab";
import CreditSection from "./CreditSection";
import UsernameSection from "./UsernameSection";
import EmailSection from "./EmailSection";
import PasswordSection from "./PasswordSection";
import AvatarSection from "./AvatarSection";

function AccountDiv() {
  const [tabValue, setTabValue] = useState('0');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <div>
      <h2>Account Settings</h2>

      {/* Credit and Pricing Row */}
      <div className="flex-normal gap-4 mb-2">
        <CreditSection/>
        <Link href="/billing/pricing" target="_blank">
          Pricing
        </Link>
        <Link href="/billing/purchase" target="_blank">
          Purchase Credit
        </Link>
      </div>

      <TabContext value={tabValue}>
        {/* Horizontal Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Avatar" value="0"/>
          <Tab label="Email" value="1"/>
          <Tab label="Username" value="2"/>
          <Tab label="Password" value="3"/>
        </Tabs>
        <Divider/>

        {/* Tab Panels */}
        <TabPanel value="0">
          <Typography variant="h6" gutterBottom>
            Update Avatar
          </Typography>
          <AvatarSection/>
        </TabPanel>
        <TabPanel value="1">
          <Typography variant="h6" gutterBottom>
            Email Settings
          </Typography>
          <EmailSection/>
        </TabPanel>
        <TabPanel value="2">
          <Typography variant="h6" gutterBottom>
            Update Username
          </Typography>
          <UsernameSection/>
        </TabPanel>
        <TabPanel value="3">
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <PasswordSection/>
        </TabPanel>
      </TabContext>
    </div>
  );
}

export default AccountDiv;
