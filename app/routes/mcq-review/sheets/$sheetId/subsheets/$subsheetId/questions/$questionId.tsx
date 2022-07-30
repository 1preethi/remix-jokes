import { useOutletContext } from "@remix-run/react";
import { useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import Comments from "~/components/comments";
import { GoogleSpreadsheet } from '~/utils/spreadsheet.server';
import Chance from 'chance';
import parse from 'html-react-parser';
import CodeEditor from "~/components/codeEditor.client";
import { MarkdownContent } from "@ib/markdown-content";

import githubMarkdownStyles from "github-markdown-css/github-markdown.css"
import markdownStyles from "@ib/markdown-styles/MarkdownStyles.css"
import commentStyles from "~/styles/comments.css"


export function links() {
    return [{ rel: "stylesheet", href: markdownStyles }, { rel: "stylesheet", href: commentStyles }, { rel: "stylesheet", href: githubMarkdownStyles }]
}

const contentTypes = {
    "text": "TEXT",
    "html": "HTML",
    "markdown": "MARKDOWN"
}

const initialTabsList = [{ "id": "question", "name": "Question", "showUnresolved": false, "isActive": true }, { "id": "all", "name": "All", "showUnresolved": false, "isActive": false }]

const jsonTypes = ["TEMPLATE", "CONTENT"]
const inputTypes = [
    "integer",
    "float",
    "string",
    "bool",
    "custom"
] //TODO: Move to constants - common

const Fallback = () => {
    return <div>Loading Code Editor...</div>;
};

export async function loader({ params }) {

    const { sheetId, subsheetId, questionId } = params

    const doc = new GoogleSpreadsheet(sheetId);

    await doc.useServiceAccountAuth({
        // env var values are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        //TODO:Need to change
        client_email: "mcqbot@mcq-comments-db.iam.gserviceaccount.com",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQRXXbVaYsPHDP\nQuSpqpIVvjalNR6n/aQkupBf+IPbSDRz6ZST21ulu9kSonH6y9vWUlXc1zw+01uw\njcyeboe7yDrVE9K57rTcgw52GDNheHucj5NPaVHNaCCtD/mtvKFtZtA2N8Kd/vSZ\noC8ZKC3wLMTKffANOtuWQoEir47lxOmEtoekhhe+9ElI6e77AqtbH6bUi0YWY4La\nXYuzTSkOXolpKUb7dzZDUqGojPG3WasmhrsMP4isDm0VY3ltnNkJydwY9WGkl/yo\n5fn5v2k4wMqvgzZ2ngesy0yB4YrNQ2I2hYUfjceoSk4KjOCOR3vr4xYFPI8ZHnkD\nuXCLNrUNAgMBAAECggEAUiCB2ArPKzRuO5yiNLF5R6+pNr5ap13ig0U6N031GNxB\nKtAZ8bAXVKRddfauwXnv53SyPRJ2xENuLZHM9VCan5bWdD2L5BvYH/hiFHl4kWAE\nRnlrWm4qfrgn4nahOzxd35kiU67rRIhMBeRfjikE7GeK9lpw9ZaXDoqNB5N44uts\nFz4EuHypScqr0c3XnoIi9aS7FtzoFIQjykH5/9cB2l3gJ+yYrWDGqOYT5SAb8iXG\n0gQ82kXrNSMVm4Rtch6VJ3iGMSPJHBqQlxc2YxKW42KB7aGmtEK+tDjgh7mF1icp\noe+1zLdyVdpdKJ7I+GeYZKJ+pHFPnJTkCbmjvlNctQKBgQDprnvBXEBMiZTuVSQB\nyG9/xH/baqU55O7NL/dCmM4XdVCmaSVZLk9DbJv2LFWozZA7n13JsNbTyzbG8wFL\n+4XvYzM/cdBxmxWdGLtc27ZcjxjrzD5pOtKdwRH/KBlhsoCgNaAIELsr8jtAbwPf\n86uAm/1P0fsHUj+Lh6m5uZUnOwKBgQDkKbI7I1biQVRS6e4SPg7uSttDRSCxCMUX\n8t+671DwjsjRLmM8+uW3hmYHA64YqKDNOwgvX4/XHN6inJpf3JQSacxvNSgQwfYv\n4RSUAEIbtcvqVnMb2SV/vnUr3NFJzq7UQlySH6kP5TRMq0vOrQxyOJmOEE7km1Q/\nc07FWe0gVwKBgEYjyCOOpAIVHa23wnoChm0MNvBN/0/0RjUyW34SzXE/FjkMwFgX\nTVVIiTuHrSJgqRUsTYNXX/PsQAHROKds1JO46830RIOE8CTaIorJq9/2V52XDXia\nXlNZeyRiDdRENtVfoywokXWsXFqHt9sFkYmlyI+n0DgvWMFxs+D6Mim3AoGAfuNN\ncqQZqqSIX8AnHVAT/6PzwrqMDsiAy+vPTufOzKmrtuGkYQJrhKAi153NUXteSiSd\nTbNIjGpKyoZrOAq08nSSM/qM+JzV7BSx3Ak0urJk4EMJqyAdQajLAwTAA9sE0ZjC\nYKVo4SUn68eL1jnY5SDjDOW26l4UAWGAGjMDs+sCgYEA6U/CfBhaKmb8msq8egsn\n61xmjpo0DvNbNDGNXBnyMARvnnPcSZB3RRvjELrXCnIRF5jnjaKtKUnWoA9hW4Qg\nAA3djGf+ArG3DoWWZqOyo9aHuM3OpFJWkXEwjBT4vshbsnEebWCZXnGRlA269v+M\niP/M74zvpY2riB2uch/pqLE=\n-----END PRIVATE KEY-----\n".replace(/\\n/gm, '\n')
    });

    await doc.loadInfo();

    const commentsSheet = doc.sheetsById[subsheetId]

    const commentRows = await commentsSheet.getRows();

    const commentRowsData = commentRows.map(eachObj => {
        const commentsObj = {}
        const headerValues = eachObj["_sheet"].headerValues
        headerValues.forEach(eachHeaderValue => {
            commentsObj[eachHeaderValue] = eachObj[eachHeaderValue]
        })
        return commentsObj
    })

    return ({ sheetId, subsheetId, questionKey: questionId, comments: commentRowsData })
}

class CommentObj {
    constructor(props) {
        this.commentId = props.commentId;
        this.questionId = props.questionId;
        this.issue = props.issue;
        this.issueReportedTo = props.reportedTo;
        this.status = props.status;
    }
}

export const action: ActionFunction = async ({
    request, params
}) => {

    const { sheetId, subsheetId, questionId } = params
    const chanceInstance = new Chance()

    const formData = await request.formData();

    const action = await formData.get("_action");

    const createAuth = async (doc) => {
        await doc.useServiceAccountAuth({
            // env var values are copied from service account credentials generated by google
            // see "Authentication" section in docs for more info
            //TODO:Need to change
            client_email: "mcqbot@mcq-comments-db.iam.gserviceaccount.com",
            private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQRXXbVaYsPHDP\nQuSpqpIVvjalNR6n/aQkupBf+IPbSDRz6ZST21ulu9kSonH6y9vWUlXc1zw+01uw\njcyeboe7yDrVE9K57rTcgw52GDNheHucj5NPaVHNaCCtD/mtvKFtZtA2N8Kd/vSZ\noC8ZKC3wLMTKffANOtuWQoEir47lxOmEtoekhhe+9ElI6e77AqtbH6bUi0YWY4La\nXYuzTSkOXolpKUb7dzZDUqGojPG3WasmhrsMP4isDm0VY3ltnNkJydwY9WGkl/yo\n5fn5v2k4wMqvgzZ2ngesy0yB4YrNQ2I2hYUfjceoSk4KjOCOR3vr4xYFPI8ZHnkD\nuXCLNrUNAgMBAAECggEAUiCB2ArPKzRuO5yiNLF5R6+pNr5ap13ig0U6N031GNxB\nKtAZ8bAXVKRddfauwXnv53SyPRJ2xENuLZHM9VCan5bWdD2L5BvYH/hiFHl4kWAE\nRnlrWm4qfrgn4nahOzxd35kiU67rRIhMBeRfjikE7GeK9lpw9ZaXDoqNB5N44uts\nFz4EuHypScqr0c3XnoIi9aS7FtzoFIQjykH5/9cB2l3gJ+yYrWDGqOYT5SAb8iXG\n0gQ82kXrNSMVm4Rtch6VJ3iGMSPJHBqQlxc2YxKW42KB7aGmtEK+tDjgh7mF1icp\noe+1zLdyVdpdKJ7I+GeYZKJ+pHFPnJTkCbmjvlNctQKBgQDprnvBXEBMiZTuVSQB\nyG9/xH/baqU55O7NL/dCmM4XdVCmaSVZLk9DbJv2LFWozZA7n13JsNbTyzbG8wFL\n+4XvYzM/cdBxmxWdGLtc27ZcjxjrzD5pOtKdwRH/KBlhsoCgNaAIELsr8jtAbwPf\n86uAm/1P0fsHUj+Lh6m5uZUnOwKBgQDkKbI7I1biQVRS6e4SPg7uSttDRSCxCMUX\n8t+671DwjsjRLmM8+uW3hmYHA64YqKDNOwgvX4/XHN6inJpf3JQSacxvNSgQwfYv\n4RSUAEIbtcvqVnMb2SV/vnUr3NFJzq7UQlySH6kP5TRMq0vOrQxyOJmOEE7km1Q/\nc07FWe0gVwKBgEYjyCOOpAIVHa23wnoChm0MNvBN/0/0RjUyW34SzXE/FjkMwFgX\nTVVIiTuHrSJgqRUsTYNXX/PsQAHROKds1JO46830RIOE8CTaIorJq9/2V52XDXia\nXlNZeyRiDdRENtVfoywokXWsXFqHt9sFkYmlyI+n0DgvWMFxs+D6Mim3AoGAfuNN\ncqQZqqSIX8AnHVAT/6PzwrqMDsiAy+vPTufOzKmrtuGkYQJrhKAi153NUXteSiSd\nTbNIjGpKyoZrOAq08nSSM/qM+JzV7BSx3Ak0urJk4EMJqyAdQajLAwTAA9sE0ZjC\nYKVo4SUn68eL1jnY5SDjDOW26l4UAWGAGjMDs+sCgYEA6U/CfBhaKmb8msq8egsn\n61xmjpo0DvNbNDGNXBnyMARvnnPcSZB3RRvjELrXCnIRF5jnjaKtKUnWoA9hW4Qg\nAA3djGf+ArG3DoWWZqOyo9aHuM3OpFJWkXEwjBT4vshbsnEebWCZXnGRlA269v+M\niP/M74zvpY2riB2uch/pqLE=\n-----END PRIVATE KEY-----\n".replace(/\\n/gm, '\n')
        });
    }

    const createAndReturnDoc = (sheetId) => {
        const doc = new GoogleSpreadsheet(sheetId);
        return doc
    }

    const loadDoc = async (doc) => {
        await doc.loadInfo();
    }

    const doc = await createAndReturnDoc(sheetId)
    await createAuth(doc)
    await loadDoc(doc)

    const sheet = doc.sheetsById[subsheetId]

    await sheet.loadCells();

    const rows = await sheet.getRows()


    const createCommentTemplate = (commentId, questionId, issue, reportedTo, status) => {
        const commentObj = new CommentObj({ commentId, questionId, issue, reportedTo, status })
        return commentObj
    }

    const getComments = async () => {
        const commentRows = await sheet.getRows();

        const commentRowsData = commentRows.map(eachObj => {
            const commentsObj = {}
            const headerValues = eachObj["_sheet"].headerValues
            headerValues.forEach(eachHeaderValue => {
                commentsObj[eachHeaderValue] = eachObj[eachHeaderValue]
            })
            return commentsObj
        })
        return commentRowsData
    }


    const getRowIndexByCommentId = async (commentId) => {
        const rows = await sheet.getRows();

        const requiredRowIndex = rows.findIndex(eachRowObj => eachRowObj.commentId === commentId)

        return requiredRowIndex + 1
    }


    if (action.includes("add")) {
        const issue = formData.get("comment")
        const reportedTo = formData.get("reportedTo")

        const commentId = chanceInstance.guid({ version: 4 })
        const commentObj = createCommentTemplate(commentId, questionId, issue, reportedTo, "")

        await sheet.addRow(commentObj);
    }

    if (action.includes("edit")) {
        const issue = formData.get("comment")
        const commentId = formData.get("commentId")

        const rowIndex = await getRowIndexByCommentId(commentId)
        const columnIndex = 2

        let cell = sheet.getCell(rowIndex, columnIndex)
        cell.value = issue

        await sheet.saveUpdatedCells();

    }

    if (action.includes("delete")) {
        const commentId = formData.get("commentId")

        const rowIndex = await getRowIndexByCommentId(commentId)

        await rows[rowIndex - 1].delete()

    }

    if (action.includes("resolve")) {

        const commentId = formData.get("commentId")

        const rowIndex = await getRowIndexByCommentId(commentId)
        const columnIndex = 4

        let cell = sheet.getCell(rowIndex, columnIndex)
        cell.value = "done"

        await sheet.saveUpdatedCells();
    }

    if (action.includes("unresolve")) {

        const commentId = formData.get("commentId")

        const rowIndex = await getRowIndexByCommentId(commentId)
        const columnIndex = 4

        let cell = sheet.getCell(rowIndex, columnIndex)
        cell.value = ""

        await sheet.saveUpdatedCells();
    }

    return ({ newComments: await getComments() })

}

export default function QuestionId() {
    const [templateJson, contentJson, reportedTo] = useOutletContext();
    const loaderData = useLoaderData();
    const [chanceInstance, setChanceInstance] = useState()
    const [tabsList, setTabsList] = useState(initialTabsList)
    const [showComments, setShowComments] = useState(false)
    // const [activeTab, setActiveTab] = useState(tabsList[0])

    useEffect(() => {
        const chance = new Chance()
        setChanceInstance(chance)
    }, [])


    const getJsonTypeToRender = () => {
        if (templateJson && templateJson.length > 0) {
            return jsonTypes[0]
        }
        else if (contentJson && contentJson.length > 0) {
            return jsonTypes[1] //TODO: change array to object
        }
    }

    const getCommentsByQuestionId = () => {
        return loaderData?.comments.filter(eachComment => eachComment.questionId === loaderData?.questionKey)
    }

    const getActiveQuestion = () => {
        if (getJsonTypeToRender() === jsonTypes[0]) {
            return templateJson.find(eachTemplate => eachTemplate.templateId === loaderData?.questionKey)
        }
        else {
            return contentJson.find(eachContentQuestion => eachContentQuestion.question_key === loaderData?.questionKey)
        }
    }

    const renderInput = (input) => {
        const { inputName, inputType } = input
        switch (inputType) {
            case inputTypes[0]:
                return (
                    <div>
                        <p><span>Input Name:</span>{inputName}</p>
                        <p><span>Input Type:</span>{inputType}</p>
                        <p><span>Min:</span>{input.min}</p>
                        <p><span>Max:</span>{input.max}</p>
                    </div>
                )
            case inputTypes[1]:
                return (
                    <div>
                        <p><span>Input Name:</span>{inputName}</p>
                        <p><span>Input Type:</span>{inputType}</p>
                        <p><span>Min:</span>{input.min}</p>
                        <p><span>Max:</span>{input.max}</p>
                        <p><span>Decimals:</span>{input.decimals}</p>
                    </div>
                )
            case inputTypes[2]:
                return (
                    <div>
                        <p><span>Input Name:</span>{inputName}</p>
                        <p><span>Input Type:</span>{inputType}</p>
                        <p><span>Context Type:</span>{input.contextType}</p>
                        {/* <p><span>Length:</span>{input.length}</p> */}
                    </div>
                )
            case inputTypes[3]:
                return (
                    <div>
                        <p><span>Input Name:</span>{inputName}</p>
                        <p><span>Input Type:</span>{inputType}</p>
                    </div>
                )
            case inputTypes[4]:
                return (
                    <div>
                        <p><span>Input Name:</span>{inputName}</p>
                        <p><span>Input Type:</span>{inputType}</p>
                        <p><span>Custom List:</span>{input.customList}</p>
                    </div>
                )
            default:
                return null
        }

    }

    const renderTemplateQuestion = (activeQuestion) => {
        const { templateTypes, questionText, code, templateId, cOptions, wOptions, inputs, inputVariables } = activeQuestion

        return (
            <div>
                <div><span>QuestionText:</span><>{questionText}</></div>
                <div><span>Template Id:</span>{templateId}</div>
                <div><span>Code:</span> <div>{code}</div></div>
                <div><span>Inputs:</span><div>{inputs.map(eachInput => renderInput(eachInput))}</div></div>
                <div><span>Input Variables:</span> {inputVariables}</div>
                <div><span>Correct Options:</span> {cOptions.join(", ")}</div>
                <div><span>Wrong Options:</span> {wOptions.join(", ")}</div>
                <div><span>Template Types:</span>{templateTypes.join(", ")}</div>
            </div>
        )
    }

    const renderContentBasedOnContentType = (content, contentType = "text") => {
        switch (contentType) {
            case contentTypes.html:
                return parse(content)
            case contentTypes.markdown:
                return <MarkdownContent content={content} />
            default:
                return content
        }
    }

    const renderCodeAnalysisQuestion = (activeQuestion) => {
        const { question_key, question_text, tag_names, input_output, code_metadata, explanation, content_type } = activeQuestion
        const { output, wrong_answers } = input_output[0]

        const outputElement = output.map(eachOutput => <>{renderContentBasedOnContentType(eachOutput)}<br /><hr /></>)
        const wrongAnswersElement = wrong_answers.map(eachWrongAnswer => <>{renderContentBasedOnContentType(eachWrongAnswer)}<br /><hr /></>)

        return (
            <div className="grow">
                <h3 className="tracking-wide">{question_key}</h3>
                <h4>Tag Names: {tag_names.join(", ")} </h4>
                <br />
                <h4>
                    {renderContentBasedOnContentType(question_text, content_type)}
                </h4>
                {code_metadata.map(eachCode =>
                    typeof document !== "undefined" ? <CodeEditor
                        readOnly={!eachCode.is_editable} code={eachCode.code_data} /> : <Fallback />
                )}
                <table className="options-table">
                    <th className="flex justify-between">
                        <td className="flex-1 font-extrabold p-15">Correct Output(s)</td>
                        <td className="flex-1 font-extrabold p-15">Wrong Outputs(s)</td>
                    </th>
                    <tr className="flex">
                        <td className="flex-1 p-2">{outputElement}</td>
                        <td className="flex-1 p-2">{wrongAnswersElement}</td>
                    </tr>
                </table>
                {explanation && <h4>Explanation: {renderContentBasedOnContentType(explanation.content, explanation.content_type)}</h4>}
            </div>)

    }

    const renderMultipleChoiceQuestion = (activeQuestion) => {
        const { question_key, question, options, explanation } = activeQuestion
        const { content, tag_names, content_type } = question

        const correctOptions = options.filter(eachOption => eachOption.is_correct).map(eachOption => eachOption.content)
        const wrongOptions = options.filter(eachOption => !eachOption.is_correct).map(eachOption => eachOption.content)

        const correctOptionsElement = correctOptions.map(eachCorrectOption => <>{renderContentBasedOnContentType(eachCorrectOption)}<br /><hr /></>)
        const wrongOptionsElement = wrongOptions.map(eachWrongOption => <>{renderContentBasedOnContentType(eachWrongOption)}<br /><hr /></>)

        return (
            <div className="grow">
                <h3 className="tracking-wide">{question_key}</h3>
                <h4>Tag Names: {tag_names.join(", ")} </h4>
                <br />
                <h4>
                    {renderContentBasedOnContentType(content, content_type)}
                </h4>
                <table className="options-table">
                    <th className="flex justify-between">
                        <td className="flex-1 font-extrabold p-15">Correct Output(s)</td>
                        <td className="flex-1 font-extrabold p-15">Wrong Outputs(s)</td>
                    </th>
                    <tr className="flex">
                        <td className="flex-1 p-2">{correctOptionsElement}</td>
                        <td className="flex-1 p-2">{wrongOptionsElement}</td>
                    </tr>
                </table>
                {explanation && <h4>Explanation: {renderContentBasedOnContentType(explanation.content, explanation.content_type)}</h4>}
            </div>)
    }

    const renderContentQuestion = (activeQuestion) => {
        const { question_type } = activeQuestion

        if (question_type.includes("CODE")) {
            return renderCodeAnalysisQuestion(activeQuestion)
        }

        else {
            return renderMultipleChoiceQuestion(activeQuestion)
        }

    }

    const renderActiveContentQuestion = () => {
        const activeQuestion = getActiveQuestion()

        return renderContentQuestion(activeQuestion)

    }

    const renderActiveTemplateQuestion = () => {
        const activeQuestion = getActiveQuestion()

        return renderTemplateQuestion(activeQuestion)
    }


    const renderActiveQuestion = () => {
        if (getJsonTypeToRender() === jsonTypes[0]) {
            return renderActiveTemplateQuestion()
        }
        else if (getJsonTypeToRender() === jsonTypes[1]) {
            return renderActiveContentQuestion()
        }
    }

    const getActiveTabById = (id) => {
        return tabsList.find(tab => tab.id === id)
    }

    const onClickTabItem = (event) => {
        const { id } = event.target

        const updatedTabsList = [...tabsList].map(eachTab => {
            if (eachTab.id === id) {
                return { ...eachTab, isActive: true }
            }
            return { ...eachTab, isActive: false }
        })

        setTabsList(updatedTabsList)
    }

    const onChangeShowUnresolvedCheckbox = (event) => {
        const { checked } = event.target

        const updatedTabsList = [...tabsList].map(eachTab => {
            if (eachTab.id === getActiveTab().id) {
                return { ...eachTab, showUnresolved: checked }
            }
            return { ...eachTab }
        })

        setTabsList(updatedTabsList)
    }

    const getActiveTab = () => {
        return tabsList.find(eachTab => eachTab.isActive === true)
    }

    const getUnresolvedComments = (comments) => {
        return comments.filter(eachComment => eachComment.status === undefined)
    }

    const getFilteredComments = () => {
        const activeTab = getActiveTab()

        if (activeTab.id === initialTabsList[0].id) {
            const questionComments = getCommentsByQuestionId()
            if (activeTab.showUnresolved) {
                return getUnresolvedComments(questionComments)
            }
            else {
                return questionComments
            }
        }
        else {
            if (activeTab.showUnresolved) {
                return getUnresolvedComments(loaderData?.comments) //TODO: change to function to get comments from loader data
            }
            else {
                return loaderData?.comments
            }
        }
    }

    const onClickShowComments = () => {
        setShowComments(prevShowComments => !prevShowComments)
    }

    //TODO: need to remove key
    //Issue: HTML is not rendering, Route is reloading multiple times

    return (<div className="flex grow items-start">
        {renderActiveQuestion()}
        <div>
            <button className="bg-blue-300 p-2 rounded-md" onClick={onClickShowComments}>{showComments ? "Hide Comments" : "Show Comments"}</button>
            {showComments && <div className="tabs-container h-[60vh] w-[300px] overflow-y-auto">
                <ul className="flex items-end bg-black p-2">
                    {tabsList.map(eachTab => (
                        <li className="tab-item">
                            <button
                                id={eachTab.id}
                                type="button"
                                onClick={onClickTabItem}
                                className={eachTab.isActive ? 'tab-button active' : 'tab-button'}
                            >
                                {eachTab.name}
                            </button>
                        </li>
                    ))}
                </ul>
                <div>
                    <input type="checkbox" checked={getActiveTab().showUnresolved} onChange={onChangeShowUnresolvedCheckbox} /><label>Show unresolved only</label>
                </div>
                <Comments key={chanceInstance ? chanceInstance.guid({ version: 4 }) : ""} reportedTo={reportedTo} comments={getFilteredComments()} />
            </div>}
        </div>

    </div>)
}
