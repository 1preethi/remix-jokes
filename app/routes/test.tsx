import { redirect } from "@remix-run/node";
import { Link, Outlet } from "@remix-run/react";
import { useState } from "react";

export const action: ActionFunction = async ({
    request,
}) => {

    const form = await request.formData();
    const value = form.get("example")

    return redirect(`/test/value`);

}

export default function Test() {
    const [value, setValue] = useState("")
    const [value2, setValue2] = useState("")


    const onChangeInputValue = (event) => {
        setValue(event.target.value)
    }

    const onChangeInputValue2 = (event) => {
        setValue2(event.target.value)
    }


    return (
        <>
            <input value={value} onChange={onChangeInputValue} />
            <input value={value2} onChange={onChangeInputValue2} />
            <form method="post">
                <input name="example" />
            </form>
            <Link to={`/test/${value}`}>Value</Link>
            <br />
            <Link to={`/test/${value}/testValue`}>Test Value</Link>
            <Outlet context={[value, value2]} />
        </>

    );
}