import { authenticator } from "../utils/auth.server";
import { SocialsProvider } from "remix-auth-socials";

export const action = async ({ request }) => {
    // initiating authentication using Google Strategy
    // on success --> redirect to dasboard
    // on failure --> back to homepage/login
    return await authenticator.authenticate(SocialsProvider.GOOGLE, request, {
        successRedirect: "/mcq-review/sheets/",
        failureRedirect: "/mcq-review/login/",

       // failureRedirect: "/mcq-review/login",
    });
};