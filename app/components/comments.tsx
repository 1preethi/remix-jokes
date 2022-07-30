import { Form, useActionData, useLoaderData, useOutletContext, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import { GoogleSpreadsheet } from '~/utils/spreadsheet.server';
import Comment from "./comment";

export default function Comments(props) {
    const { comments, reportedTo } = props
    const transition = useTransition();
    const [newComment, setNewComment] = useState("")

    const onChangeNewComment = (event) => {
        setNewComment(event.target.value)
    }

    const isCommentEmpty = () => {
        return newComment === ""
    }

    const addText = transition.submission?.formData.get("_action") === "add" ? "Adding..." : "Add Comment";

    return (<div>
        <Form method="post">
            <textarea name="comment" value={newComment} onChange={onChangeNewComment} placeholder="Comment" className="w-full" />
            <input type="hidden" value={reportedTo} name="reportedTo" />
            <div className="text-right">
                <button type="submit" name="_action" value="add" disabled={isCommentEmpty()} className="px-1 border-1">{addText}</button>
            </div>
        </Form>
        {comments.map((eachComment, index) => {
            return (<Comment key={eachComment.commentId} commentDetails={eachComment} commentIndex={index} reportedTo={reportedTo} />)
        })}
    </div>)
}