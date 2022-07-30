import { json } from "@remix-run/node"
import { Link, Outlet } from "@remix-run/react"
import { useState } from "react"
import { render } from "react-dom"

const jsonTypes = ["TEMPLATE", "CONTENT"]
const inputTypes = [
    "integer",
    "float",
    "string",
    "bool",
    "custom"
] //TODO: Move to constants - common

export default function McqPreviewer(props) {
    const { templateJson, contentJson, updateQuestionKey, sheetId, subsheetId, reportedTo } = props

    const getJsonTypeToRender = () => {
        if (templateJson && templateJson.length > 0) {
            return jsonTypes[0]
        }
        else if (contentJson && contentJson.length > 0) {
            return jsonTypes[1] //TODO: change array to object
        }
    }

    const onClickQuestionKey = (event) => {
        const { id } = event.target
        updateQuestionKey(id)
    }


    const getTemplateJsonKeys = () => {
        if (templateJson) {
            return templateJson.map(eachTemplateObj => eachTemplateObj.templateId)
        }
        return []
    }

    const getContentJsonKeys = () => {
        if (contentJson) {
            return contentJson.map(eachContentObj => eachContentObj.question_key)
        }
        return []
    }

    const renderQuestionKeys = (keys) => {
        return (
            <ul>
                {/* {keys.map(eachKey => <li key={eachKey} id={eachKey} onClick={onClickQuestionKey}>{eachKey}</li>)} */}
                {keys.map(eachKey => <li><Link key={eachKey} to={`/mcq-review/sheets/${sheetId}/subsheets/${subsheetId}/questions/${eachKey}`}>{eachKey}</Link><br /></li>)}
            </ul>
        )
    }


    const renderQuestionsPreview = () => {

        switch (getJsonTypeToRender()) {
            case jsonTypes[0]:
                return (
                    <div className="flex flex-row">
                        <div className="h-[65vh] overflow-y-auto">{renderQuestionKeys(getTemplateJsonKeys())}</div>
                        <Outlet context={[templateJson, contentJson, reportedTo]} />
                    </div>
                )
            case jsonTypes[1]:
                return (
                    <div className="flex flex-row">
                        <div className="h-[65vh] overflow-y-auto">{renderQuestionKeys(getContentJsonKeys())}</div>
                        <Outlet context={[templateJson, contentJson, reportedTo]} />
                    </div>
                )
        }
    }

    return (
        <>
            {renderQuestionsPreview()}
        </>
    )
}