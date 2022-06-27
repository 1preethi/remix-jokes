import { useEffect, useState, useMemo } from "react";

import { FormContainer, TextFieldElement } from 'react-hook-form-mui'
import Select from 'react-select';
import Chance from 'chance';
import { SelectTransform as ST } from 'selecttransform';
import ReactJson from 'react-json-view'
import loadable from '@loadable/component'

import { CopyToClipboard } from 'react-copy-to-clipboard';
import Table from "~/components/table";
import { IoPlayForward } from "react-icons/io5";
import { TiTick } from "react-icons/ti";

const ReactJson = loadable(() => new Promise((r, c) => import('react-json-view').then(result => r(result.default), c)))

const st = new ST();

import CodeEditor from "../components/codeEditor.client";
import ResponsiveContainer from "~/components/responsiveContainer";


export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: stylesUrl }];
};



const Fallback = () => {
    return <div>Loading Code Editor...</div>;
};

const templateIdsArray = Array.from(Array(30).keys()).map(eachNum => ({ "value": `t${eachNum + 1}`, "label": `t${eachNum + 1}` }))

const questionTypes = ["CODE_ANALYSIS_MULTIPLE_CHOICE", "CODE_ANALYSIS_MORE_THAN_ONE_MULTIPLE_CHOICE", "MULTIPLE_CHOICE", "MORE_THAN_ONE_MULTIPLE_CHOICE"]

export default function McqNonPoolBuilder(props) {
    const { pyodideInstance } = props

    const [isCopied, setIsCopied] = useState(false)
    const [isDataGenerated, setIsDataGenerated] = useState(false)
    const [outputJson, setOutputJson] = useState([])

    const [questionsData, setQuestionsData] = useState({})

    const formatToContentQuestion = (question) => {
        const { questionText } = question

        return ({
            "question_id": "",
            "question_text": questionText,
            "content_type": "HTML",
            "question_multimedia": [],
            "skills": [],
            "toughness": "EASY",
            "tag_names": [],
        })

    }

    useEffect(() => {
        const generateOutputJSON = async () => {
            const contentJson = await convertToContentJson(questionsData)
            setOutputJson([contentJson])
        }
        if (isDataGenerated) {
            generateOutputJSON()
        }
    }, [isDataGenerated])

    const formatToCodeAnalysisQuestion = async (code, cOptions, wOptions) => {
        const questionType = cOptions.length > 1 ? questionTypes[1] : questionTypes[0]

        const output = cOptions.length > 0 ? cOptions : [(await getPythonOutput(code)).join("\n")]

        return ({
            "question_type": questionType,
            "input_output_sets": [
                { "wrong_outputs": wOptions, "output": output }
            ],
            "code_metadata": [
                {
                    "is_editable": false,
                    "language": "PYTHON",
                    "code_data": code ? code : "",
                    "default_code": true
                }
            ]
        })
    }

    const formatToMultipleChoiceQuestion = (cOptions, wOptions) => {
        const questionType = cOptions.length > 1 ? questionTypes[3] : questionTypes[2]

        const correctOptions = [cOptions].map(eachOption => ({
            "content": eachOption,
            "content_type": "TEXT",
            "is_correct": true,
            "multimedia": []
        }))

        const wrongOptions = [wOptions].map(eachOption => ({
            "content": eachOption,
            "content_type": "TEXT",
            "is_correct": false,
            "multimedia": []
        }))

        return ({
            "question_type": questionType,
            "options": [...correctOptions, ...wrongOptions],
            "reference": ""
        })
    }

    const convertToContentJson = async (question) => {
        const { cOptions, wOptions, code } = question

        let questionObj

        questionObj = formatToMultipleChoiceQuestion(cOptions, wOptions)

        if (question.code) {
            questionObj = await formatToCodeAnalysisQuestion(code, cOptions, wOptions)
        }
        else {
            questionObj = formatToMultipleChoiceQuestion(cOptions, wOptions)
        }

        return ({ ...formatToContentQuestion(question), ...questionObj })
    }

    const getPythonOutput = async (code) => {

        let pyodide = await pyodideInstance;

        let codeWithSlashNIndents = code.replaceAll("\n", "\n    ")
        let codeWithSlashRIndents = code.replaceAll("\r", "\r    ")

        let pythonCode = `from io import StringIO
import sys
class Capturing(list):
    def __enter__(self):
        self._stdout = sys.stdout
        sys.stdout = self._stringio = StringIO()
        return self
    def __exit__(self, *args):
        self.extend(self._stringio.getvalue().splitlines())
        del self._stringio    # free up some memory
        sys.stdout = self._stdout
with Capturing() as output:
    ${code === codeWithSlashNIndents ? codeWithSlashRIndents : codeWithSlashNIndents}
list(output)`

        console.log(pythonCode, 'pcode')

        let pythonOutput = pyodide.runPython(pythonCode).toJs({ depth: 1 })

        return pythonOutput
    }

    const changeEditor = (value) => {
        let code = value
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, code }))
    }

    const onChangeQuestionText = (event) => {
        const { value } = event.target
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, questionText: value }))
    }

    const renderQuestionForm = () => {

        return (<FormContainer
            onSuccess={onProceed}
        >
            {typeof document !== "undefined" ? <CodeEditor changeEditor={changeEditor} /> : <Fallback />}
            <br />
            <div className="question-text-field">
                <textarea className="text-area" name="inputVariables" placeholder="Question Text" onChange={onChangeQuestionText} required></textarea>
            </div>
            <br />
            <TextFieldElement name="cOptions" label="Correct Options" />
            <br />
            <TextFieldElement name="wOptions" label="Wrong Options" />
            <br />
            <button type="submit" hidden id="proceedBtn">Proceed</button>
        </FormContainer>)
    }

    const onProceed = (data) => {
        const { cOptions, wOptions } = data // TODO:Add to util to convert into array when given string with , separated

        const cOPtionsArray = cOptions === undefined ? [] : cOptions.split(',').map((char) => char.trim())
        const wOPtionsArray = wOptions === undefined ? [] : wOptions.split(',').map((char) => char.trim())

        const updatedCOptions = cOPtionsArray.map(eachItem => isNaN(Number(eachItem)) ? eachItem : Number(eachItem))
        const updatedWOptions = wOPtionsArray.map(eachItem => isNaN(Number(eachItem)) ? eachItem : Number(eachItem))

        // TODO: Add to util to convert into integer if integer or string
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, ...data, cOptions: updatedCOptions, wOptions: updatedWOptions }))
        setIsDataGenerated(true)
    }

    const onGenerateData = async () => {
        document.getElementById("proceedBtn")?.click()
    }

    const onCopyCode = () => {
        setIsCopied(true)
    }

    const renderOutputJSON = () => {

        return (
            <>
                <CopyToClipboard text={JSON.stringify(outputJson)}
                    onCopy={onCopyCode}>
                    <div className="copy-to-clipboard-container">
                        {isCopied ? <div className="copied-container"> <TiTick size="20px" /><span>Copied</span></div> : <button className="copy-btn">Copy to clipboard</button>}
                    </div>
                </CopyToClipboard>
                <ReactJson src={outputJson} theme="monokai" style={{ whiteSpace: 'pre' }} enableClipboard={false} style={{ "height": "300px", "overflow": "scroll" }} />
            </>)
    }

    return (
        <ResponsiveContainer>
            <div className="form-containers">
                <div className="form-container">
                    {renderQuestionForm()}
                </div>
            </div>
            <div>
                <button onClick={onGenerateData}>Generate Data</button>
            </div>
            {outputJson.length > 0 ? renderOutputJSON() : null}
        </ResponsiveContainer>
    );
}

