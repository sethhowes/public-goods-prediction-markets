import React from "react";
import { AuthProvider } from "util/auth";
import { ThemeProvider } from "util/theme";
import { QueryClientProvider } from "util/db";
import Navbar2 from "components/Navbar2";
import Footer from "components/Footer";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { goerli, mainnet, polygon, sepolia } from "wagmi/chains";
import { scroll, mantle } from "../util/customChains"
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";


const { chains, provider } = configureChains(
  [goerli, mainnet, sepolia, polygon, scroll, mantle],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});



function MyApp({ Component, serverEmotionCache, pageProps }) {
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://public.cypherd.io/js/onboardingsdk.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);
 
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <QueryClientProvider>
          <ThemeProvider serverEmotionCache={serverEmotionCache}>
            <AuthProvider>
              <Navbar2
                color="primary"
                logo="logo.svg"
                logoInverted="logo.svg"
              />
              <Component {...pageProps} />
              <Footer
                bgColor="primary"
                size="medium"
                bgImage=""
                bgImageOpacity={1}
                copyright={`© ${new Date().getFullYear()} The League of Oxford Buidlers`}
                logo="logo.svg"
                logoInverted="logo.svg"
                sticky={false}
              />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
