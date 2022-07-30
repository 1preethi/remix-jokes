import type {
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
} from "@remix-run/react";

// import globalStylesUrl from "./styles/global.css";
// import globalMediumStylesUrl from "./styles/global-medium.css";
// import globalLargeStylesUrl from "./styles/global-large.css";
// import McqPoolBuilder from './components/mcqPoolBuilder'
// import { Children } from "react";

// export const links: LinksFunction = () => {
//   return [
//     { rel: "stylesheet", href: globalStylesUrl },
//     {
//       rel: "stylesheet",
//       href: globalMediumStylesUrl,
//       media: "print, (min-width: 640px)",
//     },
//     {
//       rel: "stylesheet",
//       href: globalLargeStylesUrl,
//       media: "screen and (min-width: 1024px)",
//     },
//   ];
// };

import styles from "./tailwind.css"
import appStyles from "./styles/app.css"


export function links() {
  return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: appStyles }]
}

export const meta: MetaFunction = () => {
  const description = `Learn Remix and laugh at the same time!`;
  return {
    charset: "utf-8",
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description,
  };
};

function Document({
  children,
  title = `Remix: So great, it's funny!`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en" className="font-[roboto]">
      <head>
        <Meta />
        {/* <script defer src="https://pyscript.net/alpha/pyscript.js"></script> */}
        {/* <script src="/pyodide_script.js"></script>https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js */}
        <link href="/dist/output.css" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js"></script>
        <script src="http://chancejs.com/chance.min.js"></script>
        <Links />
        <title>{title}</title>
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document
      title={`${caught.status} ${caught.statusText}`}
    >
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}