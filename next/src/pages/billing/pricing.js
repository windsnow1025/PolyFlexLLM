import React, {useEffect, useState} from 'react';
import PublicClient from "@/lib/common/public/PublicClient";
import TextContent from '@/components/message/content/text/TextContent';
import {RawEditableState} from '@/lib/common/message/EditableState';
import Head from "next/head";

function Pricing() {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    const fetchMarkdown = async () => {
      const publicService = new PublicClient();
      const markdownContent = await publicService.fetchMarkdown('Pricing.md');
      setMarkdown(markdownContent);
    };

    fetchMarkdown();
  }, []);

  return (
    <div className="local-scroll-container">
      <Head>
        <title>Pricing</title>
      </Head>
      <div className="local-scroll-scrollable">
        <div className="m-2">
          <TextContent
            content={markdown}
            setContent={() => {
            }}
            rawEditableState={RawEditableState.AlwaysFalse}
          />
        </div>
      </div>
    </div>
  );
}

export default Pricing;
