import { authenticator } from "../utils/auth.server";
import { SocialsProvider } from "remix-auth-socials";

export const loader = ({ request }) => {
    return authenticator.authenticate(SocialsProvider.GOOGLE, request, {
        successRedirect: "/mcq-review/sheets/",
        failureRedirect: "/mcq-review/login/",
        // failureRedirect: "/mcq-review",
    });
};