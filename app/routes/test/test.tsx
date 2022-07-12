import { Form, Link, useActionData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { useState } from "react";


export const action: ActionFunction = async ({
    request,
}) => {

    const form = await request.formData();
    const value = form.get("example")

    return redirect(`/test/value`);

}

export default function Comp() {
    const [value, setValue] = useState("")

    const onChangeInputValue = (event) => {
        setValue(event.target.value)
    }

    return (
        <>
            <input value={value} onChange={onChangeInputValue} />
            <form method="post">
                <input name="example" />
            </form>
            <Link to={`/test/${value}`} />
            <Link to={`/test/${value}/testValue`} />
        </>

    );
}