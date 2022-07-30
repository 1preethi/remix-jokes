import { Form, useTransition } from "@remix-run/react"
import { useState } from "react"


export default function Comment(props) {
    const { commentDetails } = props
    const { commentId, issue, status } = commentDetails

    const [comment, setComment] = useState(issue)

    const [isEditEnabled, setIsEditEnabled] = useState(false)

    const transition = useTransition();

    const editText = transition.submission?.formData.get("_action") === `edit${commentId}` ? "Saving..." : "Save";
    const deleteText = transition.submission?.formData.get("_action") === `delete${commentId}` ? "Deleting..." : "Delete";
    const resolveText = transition.submission?.formData.get("_action") === `resolve${commentId}` ? "Marking as Resolved..." : "Mark as Resolved";
    const unResolveText = transition.submission?.formData.get("_action") === `unresolve${commentId}` ? "Unresolving..." : "Unresolve";

    const onChangeComment = (event) => {
        setComment(event.target.value)
    }
    //Return is not rendering
    const onClickEdit = () => {
        setIsEditEnabled(prevIsEnabled => !prevIsEnabled)
    }

    return (
        <Form method="post" className="border rounded-md mb-2 p-1">
            <div className="flex font-bold mb-2">{isEditEnabled ? <textarea value={comment} name="comment" onChange={onChangeComment} /> : <p>{issue}</p>}</div>
            <div>
                <input type="hidden" value={commentId} name="commentId" />
                {isEditEnabled ? <><button className="mr-2 px-1 border">Cancel</button><button name="_action" value={`edit${commentId}`} className="mr-2 px-1 border">{editText}</button></> : <button className="mr-2 px-1 border" onClick={onClickEdit}>Edit</button>}
                {status === "done" ? <button name="_action" className="mr-2 px-1 border" value={`unresolve${commentId}`}>{unResolveText}</button> : <button name="_action" value={`resolve${commentId}`} className="mr-2 px-1 border">{resolveText}</button>}
                <button name="_action" className="px-1 border" value={`delete${commentId}`}>{deleteText}</button>
            </div>
        </Form>
    )
}