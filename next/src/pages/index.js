import React from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/Email";
import PolicyIcon from '@mui/icons-material/Policy';
import GavelIcon from '@mui/icons-material/Gavel';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CodeIcon from '@mui/icons-material/Code';
import StreamIcon from '@mui/icons-material/Stream';
import TuneIcon from '@mui/icons-material/Tune';
import ImageIcon from '@mui/icons-material/Image';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Head from "next/head";
import {useRouter} from "next/router";
import {AuthorEmail} from "@/lib/common/Constants";
import Copyright from "@/components/common/dashboard/internals/components/Copyright";

function FeatureCard({title, description, icon}) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4],
        }
      }}
    >
      <CardContent className="text-center">
        {React.cloneElement(icon, {sx: {fontSize: 40, color: theme.vars.palette.primary.main}})}
        <Typography gutterBottom variant="h6" component="h2">
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

const features = [
  {
    title: "Multi-Model Support",
    description: "Unified interface to access OpenAI, Gemini, Claude, and Grok through a single platform.",
    icon: <SmartToyIcon/>,
  },
  {
    title: "Markdown + LaTeX Rendering",
    description: "Native rendering of rich text, code blocks, and mathematical formulas in AI responses.",
    icon: <CodeIcon/>,
  },
  {
    title: "Stream Output",
    description: "Real-time streaming of AI responses for a smooth, interactive experience.",
    icon: <StreamIcon/>,
  },
  {
    title: "Full Context Control",
    description: "Manage conversation context with system, user, and assistant messages for precise interactions.",
    icon: <TuneIcon/>,
  },
  {
    title: "Multimodal I/O",
    description: "Support for images and other media types as both input and output.",
    icon: <ImageIcon/>,
  },
  {
    title: "File Processing",
    description: "Upload, process, and download files directly within your conversations.",
    icon: <UploadFileIcon/>,
  },
];

const providers = ["OpenAI", "Gemini", "Claude", "Grok"];

function Index() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <div className="local-scroll-container">
      <Head>
        <title>PolyFlexLLM</title>
        <meta
          name="description"
          content="PolyFlexLLM, A full-stack web platform for interacting with various LLMs (OpenAI, Gemini, Claude), featuring full conversation context control, and Markdown + LaTeX rendering."
        />
      </Head>
      <div className="local-scroll-scrollable flex-column gap-y-8 p-4">
        {/* Hero Section */}
        <div className="text-center">
          <Typography variant="h2" color="primary" gutterBottom>
            PolyFlexLLM
          </Typography>
          <Container maxWidth="md" sx={{mb: 3}}>
            <Typography variant="h5" color="textSecondary">
              A full-stack web platform for interacting with various LLMs, featuring full conversation context control and Markdown + LaTeX rendering.
            </Typography>
          </Container>
          <Box sx={{display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 3}}>
            {providers.map((provider) => (
              <Chip key={provider} label={provider} variant="outlined" size="small"/>
            ))}
          </Box>
          <div className="flex-center gap-4 mt-6">
            <Button variant="contained" onClick={() => router.push('/auth/signin')}>
              Sign in
            </Button>
            <Button variant="outlined" onClick={() => router.push('/auth/signup')}>
              Sign up
            </Button>
          </div>
        </div>

        <Divider/>

        {/* Features Section */}
        <div>
          <Typography variant="h4" align="center" gutterBottom>
            Features
          </Typography>
          <Container maxWidth="md" sx={{mb: 4}}>
            <Typography variant="body1" color="textSecondary" align="center">
              Everything you need to interact with the leading AI models in one place.
            </Typography>
          </Container>
          <Grid container spacing={3} justifyContent="center">
            {features.map((feature) => (
              <Grid key={feature.title} size={{xs: 12, sm: 6, md: 4}}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </div>

        <Divider/>

        {/* Pricing CTA Section */}
        <div className="text-center">
          <LocalOfferIcon sx={{fontSize: 48, color: theme.vars.palette.primary.main, mb: 1}}/>
          <Typography variant="h4" gutterBottom>
            Simple, Transparent Pricing
          </Typography>
          <Container maxWidth="md" sx={{mb: 3}}>
            <Typography variant="body1" color="textSecondary">
              Pay only for what you use. Check out our pricing details to find the plan that works for you.
            </Typography>
          </Container>
          <Button variant="contained" size="large" onClick={() => router.push('/pricing/pricing')}>
            View Pricing
          </Button>
        </div>

        <Divider/>

        <div className="flex-column-center">
          {/* AI Wrapper Disclaimer and Disclosure */}
          <Container maxWidth="md">
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                <strong>Disclaimer:</strong> This platform is an independent product and is not affiliated with OpenAI, Google, Anthropic,
                xAI or any other AI model providers. We provide access to the various models through our custom interface.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <strong>Disclosure:</strong> Our platform offers a user-friendly interface built on top of models like Gemini to enhance
                usability and provide additional features. We are an independent service and not affiliated with the model
                providers.
              </Typography>
            </Stack>
          </Container>

          <Typography variant="caption" align="center" sx={{color: 'text.secondary', pt: 2}}>
            Support: {AuthorEmail}
          </Typography>
          <Copyright variant="caption"/>
        </div>

      </div>
      <BottomNavigation showLabels>
        <BottomNavigationAction
          label="Email"
          icon={<EmailIcon/>}
          onClick={() => window.location.href = `mailto:${AuthorEmail}`}
        />
        <BottomNavigationAction
          label="GitHub"
          icon={<GitHubIcon/>}
          onClick={() => window.open('https://github.com/windsnow1025/PolyFlexLLM', '_blank')}
        />
        <BottomNavigationAction
          component="a"
          href="/legal/privacy"
          label="Privacy"
          icon={<PolicyIcon/>}
        />
        <BottomNavigationAction
          component="a"
          href="/legal/terms"
          label="Terms"
          icon={<GavelIcon/>}
        />
      </BottomNavigation>
    </div>
  );
}

export default Index;
