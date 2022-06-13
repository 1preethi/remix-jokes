import type { User } from "@prisma/client";
import type {
  LinksFunction,
  LoaderFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  Form
} from "@remix-run/react";

import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import stylesUrl from "~/styles/jokes.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

type ActionData = {
  data?: any
};

export const action: ActionFunction = async ({
  request,
}) => {

  const form = await request.formData();

  const input = form.get("input")
  return { data: `form submitted with ${input}` }

}

// type LoaderData = {
//   user: Awaited<ReturnType<typeof getUser>>;
//   jokeListItems: Array<{ id: string; name: string }>;
// };

// export const loader: LoaderFunction = async ({
//   request,
// }) => {
//   const jokeListItems = await db.joke.findMany({
//     take: 5,
//     orderBy: { createdAt: "desc" },
//     select: { id: true, name: true },
//   });
//   const user = await getUser(request);

//   const data: LoaderData = {
//     jokeListItems,
//     user,
//   };
//   return json(data);
// };

const data = [
  {
    name: "Road worker",
    content: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
  },
  {
    name: "Frisbee",
    content: `I was wondering why the frisbee was getting bigger, then it hit me.`,
  },
  {
    name: "Trees",
    content: `Why do trees seem suspicious on sunny days? Dunno, they're just a bit shady.`,
  },
  {
    name: "Skeletons",
    content: `Why don't skeletons ride roller coasters? They don't have the stomach for it.`,
  },
  {
    name: "Hippos",
    content: `Why don't you find hippopotamuses hiding in trees? They're really good at it.`,
  },
  {
    name: "Dinner",
    content: `What did one plate say to the other plate? Dinner is on me!`,
  },
  {
    name: "Elevator",
    content: `My first time using an elevator was an uplifting experience. The second time let me down.`,
  },
]

export default function JokesRoute() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {/* {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )} */}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.map((joke) => (
                <li key={joke.name}>
                  <Link to={joke.name}>{joke.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
        <hr/>
        <Form method="post">
          <input name="input"/>
          <button type="submit">Test Action Function</button>
        </Form>
        {actionData?.data && <p>{actionData?.data}</p>}
      </main>
    </div>
  );
}