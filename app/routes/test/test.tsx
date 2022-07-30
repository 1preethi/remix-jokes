import { Form, Link, useActionData } from "@remix-run/react";
import { redirect } from "@remix-run/node";
import { useState } from "react";


// export const action: ActionFunction = async ({
//     request,
// }) => {

//     const form = await request.formData();
//     const value = form.get("example")

//     return redirect(`/test/value`);

// }

const comments = [
    {
        commentId: "1",
        "issue": "issue1",
        "status": "done"
    },
    {
        commentId: "2",
        "issue": "issue2",
        "status": "done"
    },
    {
        commentId: "3",
        "issue": "issue3",
        "status": "done"
    }
]

export default function Comp() {

    return (
        <>
            {comments.map(eachComment => (
                <>
                    <div className="flex font-bold">
                        <textarea value={eachComment.issue} name="comment" />
                        {/* <p>{eachComment.issue}</p> */}
                    </div>
                    <div>
                        <input type="hidden" value={eachComment.commentId} name="commentId" />
                        <><button className="mr-2">Cancel</button><button className="mr-2">Edit</button></>
                        {/* <button className="mr-2" onClick={onClickEdit}>Edit</button> */}
                        <button className="mr-2">Unresolve</button>
                        <button className="mr-2">Mark as Resolved</button>
                        <button>Delete</button>
                    </div>
                </>
            ))}
        </>
    );
}