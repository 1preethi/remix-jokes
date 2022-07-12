import { Form } from "@remix-run/react";
import { SocialsProvider } from "remix-auth-socials";
import { authenticator } from "~/utils/auth.server";

export const loader = async ({ request }) => {
    // authenticator.isAuthenticated function returns the user object if found
    // if user is not authenticated then user would be redirected back to homepage ("/" route)
    const user = await authenticator.isAuthenticated(request, {
        successRedirect: "/mcq-review/sheets/",
    });

    return {
        user,
    };
};

export default function Login() {
    return (
        <div className="container">
            <h1>
                MCQ Review
            </h1>
            <Form
                method="post"
                action={`/auth/${SocialsProvider.GOOGLE}`}
            >
                <button>Login with Google</button>
            </Form>
        </div>
    );
}