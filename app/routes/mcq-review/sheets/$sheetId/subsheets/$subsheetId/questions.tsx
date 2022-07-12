import { Outlet } from "@remix-run/react";
import { useOutletContext } from "@remix-run/react";

export default function Questions() {

    const [templateJson, contentJson] = useOutletContext();

    return <Outlet context={[templateJson, contentJson]} />
}