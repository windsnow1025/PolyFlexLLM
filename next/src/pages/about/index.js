import React from "react";
import {Container, Link, Stack, Typography} from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import {AuthorEmail} from "@/lib/common/Constants";
import Copyright from "@/components/common/dashboard/internals/components/Copyright";

const legalLinks = [
  {label: "Privacy Policy", href: "/about/privacy"},
  {label: "Terms & Conditions", href: "/about/terms"},
  {label: "Acceptable Use Policy", href: "/about/policy"},
];

function About() {
  return (
    <div className="local-scroll-container">
      <Head>
        <title>About</title>
      </Head>
      <div className="local-scroll-scrollable p-4">
        <Container maxWidth="md">
          <Stack spacing={4}>
            <div>
              <Typography variant="h4" gutterBottom>
                About
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Disclaimer:</strong> This platform is an independent product and is not affiliated with OpenAI, Google, Anthropic,
                  xAI or any other AI model providers. We provide access to the various models through our custom interface.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Disclosure:</strong> Our platform offers a user-friendly interface built on top of models like Gemini to enhance
                  usability and provide additional features. We are an independent service and not affiliated with the model
                  providers.
                </Typography>
              </Stack>
            </div>

            <div>
              <Typography variant="h6" gutterBottom>
                Legal
              </Typography>
              <Stack spacing={1}>
                {legalLinks.map((link) => (
                  <Link key={link.href} component={NextLink} href={link.href}>
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </div>

            <div>
              <Typography variant="h6" gutterBottom>
                Support
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  Email: <Link href={`mailto:${AuthorEmail}`}>{AuthorEmail}</Link>
                </Typography>
                <Typography variant="body2">
                  GitHub: <Link href="https://github.com/windsnow1025/PolyFlexLLM" target="_blank" rel="noopener noreferrer">windsnow1025/PolyFlexLLM</Link>
                </Typography>
              </Stack>
            </div>

            <Copyright/>
          </Stack>
        </Container>
      </div>
    </div>
  );
}

export default About;
