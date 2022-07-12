import { Form, useActionData, useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { GoogleSpreadsheet } from '~/utils/spreadsheet.server';
import Comment from "./comment";

export default function Comments(props) {

    const { comments } = props

    return (<>
        <Form method="post">
            <textarea name="comment" />
            <button type="submit" name="_action" value="add">Add Comment</button>
        </Form>

        {comments.map((eachComment, index) => {
            return (<Comment key={eachComment.commentId} commentDetails={eachComment} commentIndex={index} />)
        })}
    </>)
}