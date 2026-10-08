import { Head, Html, Main, NextScript } from "next/document";

const themeBootstrap = `try {
  const savedTheme = localStorage.getItem("ezykwelez-theme");
  document.documentElement.dataset.theme = savedTheme === "light" ? "light" : "dark";
} catch {
  document.documentElement.dataset.theme = "dark";
}`;

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}