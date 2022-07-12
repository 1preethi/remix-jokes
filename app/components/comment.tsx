import { Form } from "@remix-run/react"
import { useState } from "react"

export default function Comment(props) {
    const { commentDetails, changeCommentsList } = props
    const { commentId, issue, status } = commentDetails
    const [comment, setComment] = useState(issue)

    const [isEditEnabled, setIsEditEnabled] = useState(false)

    const onChangeComment = (event) => {
        setComment(event.target.value)
    }
    //Return is not rendering
    const onClickEdit = () => {
        setIsEditEnabled(prevIsEnabled => !prevIsEnabled)
    }

    return (
        <Form method="post">
            {isEditEnabled ? <textarea value={comment} name="comment" onChange={onChangeComment} /> : <p>{issue}</p>}
            <input type="hidden" value={commentId} name="commentId" />
            {isEditEnabled ? <><button onClick={onClickEdit}>Cancel</button><button name="_action" value="edit">Save</button></> : <button onClick={onClickEdit}>Edit</button>}
            {status === "done" ? "Resolved" : <button name="_action" value="resolve">Mark as Resolved</button>}
            <button name="_action" value="delete">Delete</button>
        </Form>
    )
}