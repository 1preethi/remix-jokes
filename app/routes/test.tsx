// import { redirect } from "@remix-run/node";
// import { Link, Outlet } from "@remix-run/react";
// import { useState } from "react";

// export const action: ActionFunction = async ({
//     request,
// }) => {

//     const form = await request.formData();
//     const value = form.get("example")

//     return redirect(`/test/value`);

// }

// export default function Test() {
//     const [comments, setComments] = useState([])
//     const [commentText, setCommentText] = useState("")


//     const onChangeInputValue = (event) => {
//         setValue(event.target.value)
//     }

//     const onClickContainer = (event) => {
//         var rect = event.target.getBoundingClientRect();
//         var x = event.clientX - rect.left; //x position within the element.
//         var y = event.clientY - rect.top;  //y position within the element.
//         console.log("Left? : " + x + " ; Top? : " + y + ".");
//         console.log(event.target.id)
//     }


//     return (
//         <>
//             <div id="container" onClick={onClickContainer}>
//                 <h1 id="questionText">questionText</h1>
//                 <p id="tagName">tagName</p>
//                 <p id="cOptions">options</p>
//             </div>
//         </>

//     );
// }

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
                <div className="mb-2 ">
                    <div className="flex font-bold mb-2">
                        <textarea value={eachComment.issue} name="comment" className="border-2 w-[300px] height-[100px]"/>
                        {/* <p>{eachComment.issue}</p> */}
                    </div>
                    <div>
                        <input type="hidden" value={eachComment.commentId} name="commentId" />
                        {/* <><button className="mr-2">Cancel</button><button className="mr-2">Save</button></> */}
                        <button className="mr-2 bg-blue-100 px-1">Edit</button>
                        {/* <button className="mr-2">Unresolve</button> */}
                        <button className="mr-2 bg-blue-100 px-1">Mark as Resolved</button>
                        <button className="mr-2 bg-blue-100 px-1">Delete</button>
                    </div>
                </div>
            ))}
        </>
    );
}