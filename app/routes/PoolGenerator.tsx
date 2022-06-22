import { useEffect, useState, useMemo } from "react";

import { FormContainer, TextFieldElement } from 'react-hook-form-mui'
import Select from 'react-select';
import Chance from 'chance';
import { SelectTransform as ST } from 'selecttransform';
import ReactJson from 'react-json-view'
import loadable from '@loadable/component'

import '../styles/pool-generator.css'

import { CopyToClipboard } from 'react-copy-to-clipboard';
import Table from "~/components/table";
import { IoPlayForward } from "react-icons/io5";
import { IconContext } from "react-icons"


import stylesUrl from "~/styles/pool-generator.css";

const ReactJson = loadable(() => new Promise((r, c) => import('react-json-view').then(result => r(result.default), c)))

const st = new ST();

import CodeEditor from "../components/codeEditor.client";
import ResponsiveContainer from "~/components/responsiveContainer";


export const links: LinksFunction = () => {
    return [{ rel: "stylesheet", href: stylesUrl }];
};

const inputTableColumns = [
    {
        Header: "Input Name",
        accessor: "inputName"
    },
    {
        Header: "Input Type",
        accessor: "inputType"
    },
    {
        Header: "Min",
        accessor: "min"
    },
    {
        Header: "Max",
        accessor: "max"
    },
    {
        Header: "Length",
        accessor: "length"
    },
    {
        Header: "Context Type",
        accessor: "contextType"
    },
    {
        Header: "Custom List",
        accessor: "customList"
    }
]

const templateTypesArray = [
    { "value": "QUESTION_AS_TEMPLATE", "label": "Question as Template" },
    { "value": "CODE_AS_TEMPLATE", "label": "Code as Template" },
    { "value": "CORRECT_OPTIONS_AS_TEMPLATE", "label": "Correct Options as Template" },
    { "value": "WRONG_OPTIONS_AS_TEMPLATE", "label": "Wrong Options as Template" },
    { "value": "DYNAMIC_INPUT_VARIABLES_AS_TEMPLATE", "label": "Dynamic Input Variables as Template" },
]

const inputTypes = [
    "integer",
    "string",
    "bool",
    "custom"
]

const inputTypeDetails = {
    'integer': ['min', 'max'],
    "string": ['length'],
    "bool": [],
    "custom": []
}

const contextTypes = [
    { "value": "name", "label": "Person Name" },
    { "value": "animal", "label": "Animal Name" },
    { "value": "company", "label": "Company Name" },
    { "value": "country", "label": "Country Name" },
    { "value": "city", "label": "City Name" },
    { "value": "state", "label": "State Name" },
    { "value": "street", "label": "Street Name" },
    { "value": "month", "label": "Month Name" },
    { "value": "profession", "label": "Profession Name" },
    { "value": "weekDay", "label": "Week Day Name" }
]

const errorMsgs = {
    "pythonEvaluation": "Code Outputs and Correct Options are not same"
}


const formViews = ["QUESTION", "INPUTS"]


const Fallback = () => {
    return <div>Loading Code Editor...</div>;
};

const tabsList = ["OUTPUT JSON", "CONFIGURATION PREVIEWER"]

let index = 0;

export default function McqPoolBuilder() {

    const [outputJson, setOutputJson] = useState([])
    const [pyodideInstance, setPyodideInstance] = useState()
    const [isCopied, setIsCopied] = useState(false)
    const [chanceInstance, setChanceInstance] = useState()
    const [generatedInputs, setGeneratedInputs] = useState([])
    const [errorMsg, setErrorMsg] = useState("")

    const columns = useMemo(
        () => inputTableColumns,
        [outputJson]
    );

    const [questionsData, setQuestionsData] = useState({})
    const [inputs, setInputs] = useState([])
    const [formView, setFormView] = useState(formViews[0])
    const [activeTab, setActiveTab] = useState(tabsList[0])


    useEffect(() => {
        async function createAndReturnPyodideInstance() {
            let pyodide = await loadPyodide();
            return pyodide;
        }
        const instance = createAndReturnPyodideInstance()
        setPyodideInstance(instance)
    }, [])

    useEffect(() => {
        const chance = new Chance()
        setChanceInstance(chance)
    }, [])

    const convertCamelToTitleCase = (text) => {
        const result = text.replace(/([A-Z])/g, " $1");

        const finalResult = result.charAt(0).toUpperCase() + result.slice(1);

        return finalResult
    }

    const getChanceRandomValueBasedOnInputType = (input) => {
        const { inputType, min, max, length, customList, contextType } = input

        let custom = customList?.split(',')

        switch (inputType) {
            case inputTypes[0]:
                return chanceInstance.integer({ min, max })
            case inputTypes[1]:
                switch (contextType) {
                    case contextTypes[0].value:
                        return JSON.stringify(chanceInstance.name({ length }))
                    case contextTypes[1].value:
                        return JSON.stringify(chanceInstance.animal({ length }))
                    case contextTypes[2].value:
                        return JSON.stringify(chanceInstance.company({ length }))
                    case contextTypes[3].value:
                        return JSON.stringify(chanceInstance.country({ full: true, length }))
                    case contextTypes[4].value:
                        return JSON.stringify(chanceInstance.city({ length }))
                    case contextTypes[5].value:
                        return JSON.stringify(chanceInstance.state({ full: true, length }))
                    case contextTypes[6].value:
                        return JSON.stringify(chanceInstance.street({ length }))
                    case contextTypes[7].value:
                        return JSON.stringify(chanceInstance.month({ length }))
                    case contextTypes[8].value:
                        return JSON.stringify(chanceInstance.profession({ length }))
                    case contextTypes[9].value:
                        return JSON.stringify(chanceInstance.weekday({ length }))
                    default:
                        return JSON.stringify(chanceInstance.string({ length }))
                }
            case inputTypes[2]:
                return chanceInstance.bool()
            case inputTypes[3]:
                return chanceInstance.pickone(custom)
        }
    }

    const getGeneratedQuestionsData = () => {
        const { questionText, code, cOptions, wOptions, inputVariables } = questionsData

        const generatedQuestionsData = {
            questionText,
            code,
            inputs: generatedInputs,
            cOptions,
            wOptions,
            inputVariables: inputVariables ? inputVariables : ""
        }
        return generatedQuestionsData
    }

    const getQuestionTextToAddBasedOnTemplateType = (variables) => {

        let variableString = IsStringContainsNewLine(variables) ? variables.replace("\n", ",").replace("\r", ",") : checkIsStringContainCharacter(variables, " ") ? variables.replace(" ", ",") : variables

        if (includesRequiredTemplateType(templateTypesArray[4])) {
            return `\nInputs are ${variableString}${IsStringContainsNewLine(variables) ? ' with line separated' : checkIsStringContainCharacter(variables, " ") ? ' with space separated' : ""}`
        }
        else {
            return ""
        }
    }

    const getCodeTemplate = (question: any) => {
        return ({
            "{{#each inputs}}": {
                questionId: chanceInstance.guid({ version: 4 }),
                questionText: question.questionText + getQuestionTextToAddBasedOnTemplateType(question.inputVariables),
                code: question.code === undefined ? "" : question.code,
                concept: "",
                broadLevelConcept: "",
                variantName: "",
                cOptions: question.cOptions,
                wOptions: question.wOptions,
            }
        })
    }


    const getTransformedData = () => {
        const generatedQuestionsData = getGeneratedQuestionsData()

        let transformedData = st.transformSync(getCodeTemplate(generatedQuestionsData), generatedQuestionsData)
        return transformedData
    }


    const shouldValidatePythonCodeOutputs = (selectedTemplateTypes) => {

        const shouldValidate = selectedTemplateTypes.includes(templateTypesArray[2]) || (selectedTemplateTypes.includes(templateTypesArray[3]))

        return shouldValidate
    }

    const onProceed = (data) => {
        const { cOptions, wOptions } = data // TODO:Add to util to convert into array when given string with , separated

        const cOPtionsArray = cOptions === undefined ? [] : cOptions.split(',')
        const wOPtionsArray = wOptions === undefined ? [] : wOptions.split(',')

        const updatedCOptions = cOPtionsArray.map(eachItem => isNaN(Number(eachItem)) ? eachItem : Number(eachItem))
        const updatedWOptions = wOPtionsArray.map(eachItem => isNaN(Number(eachItem)) ? eachItem : Number(eachItem))

        // TODO: Add to util to convert into integer if integer or string
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, ...data, cOptions: updatedCOptions, wOptions: updatedWOptions }))
        setFormView(formViews[1])
    }

    const extractInputs = (questionData) => {

        const regex = /{{input_\d*}}/g
        const inputVariablesRegex = /{{\d*\w*}}/g
        // Need to change - execute only with template type

        const inputsWithBrackets = questionData.match(regex) || questionData.match(inputVariablesRegex)

        const inputsWithoutBrackets = inputsWithBrackets ? inputsWithBrackets.map(string => string.replace('{{', '').replace('}}', '')) : []
        return inputsWithoutBrackets
    }

    // const extractInputVariables = () => {
    //     const regex = /{{\d*\w*}}/g

    //     const inputsWithBrackets = questionData.match(regex)

    //     const inputsWithoutBrackets = inputsWithBrackets ? inputsWithBrackets.map(string => string.replace('{{', '').replace('}}', '')) : []
    //     return inputsWithoutBrackets
    // }

    const getQuestionDataToExtractInputs = (templateType) => {
        const { questionText, code, cOptions, wOptions, inputVariables } = questionsData;

        switch (templateType) {
            case templateTypesArray[0].value:
                return JSON.stringify(questionText)
            case templateTypesArray[1].value:
                return JSON.stringify(code)
            case templateTypesArray[2].value:
                return JSON.stringify(cOptions)
            case templateTypesArray[3].value:
                return JSON.stringify(wOptions)
            case templateTypesArray[4].value:
                return inputVariables
        }

    }

    const getInputsBasedOnTemplateType = () => {
        const { templateTypes } = questionsData

        const getInputs = (array, templateType) => {
            let data = getQuestionDataToExtractInputs(templateType.value)
            let inputs = extractInputs(data) //TODO: Need to add JSON stringify and parse as utils

            array.push(...inputs)
            return array
        }

        const inputsWithDuplicates = templateTypes.reduce(getInputs, [])
        const inputsWithoutDuplicates = Array.from(new Set(inputsWithDuplicates))

        const inputObjectsWithoutDuplicates = inputsWithoutDuplicates.map(eachInput => ({ inputName: eachInput, inputType: inputTypes[0] }))

        return inputObjectsWithoutDuplicates
    }

    useEffect(() => {
        if (questionsData.templateTypes) {
            setInputs(getInputsBasedOnTemplateType())
        }
    }, [formView]);


    const changeEditor = (value) => {
        let code = value
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, code }))
    }

    const includesRequiredTemplateType = (templateType) => {
        if (questionsData.templateTypes) {
            const templates = questionsData?.templateTypes?.map(eachTemplateObj => eachTemplateObj.value)
            return templates.includes(templateType.value)
        }
        return false
    }

    const onChangeInputVariablesTextarea = (event) => {
        const { value } = event.target
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, inputVariables: value }))
    }

    const onChangeQuestionText = (event) => {
        const { value } = event.target
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, questionText: value }))
    }

    const isFormViewInputs = () => {
        return formView === formViews[1]
    }

    const renderQuestionForm = () => {

        return (<FormContainer
            onSuccess={onProceed}
        >
            <Select
                onChange={onChangeTemplateTypes}
                options={templateTypesArray}
                placeholder="Type of Template"
                isMulti={true}
                isDisabled={isFormViewInputs()}
            />
            {/* <MultiSelectElement menuItems={templateTypesArray} label="Type of Template" name="templateTypes" required /> */}
            <br />
            {typeof document !== "undefined" ? <CodeEditor changeEditor={changeEditor} readOnly={isFormViewInputs()} /> : <Fallback />}
            {/* <br />
            <Editor
                height="100px"
                defaultLanguage="python"
                onChange={onChangeEditor}
            /> */}
            {/* {includesRequiredTemplateType(templateTypesArray[4]) === true ? <TextFieldElement name="inputVariables" label="Input Variables" required className="question-text-field" /> : null} */}
            {includesRequiredTemplateType(templateTypesArray[4]) === true ? <div className="question-text-field"><textarea className="text-area" name="inputVariables" placeholder="Code Input Templates" onChange={onChangeInputVariablesTextarea} required disabled={isFormViewInputs()}></textarea></div> : null}
            <br />
            <div className="question-text-field">
                <textarea className="text-area" name="inputVariables" placeholder="Question Text" onChange={onChangeQuestionText} required disabled={isFormViewInputs()}></textarea>
            </div>
            <br />
            {/* <TextFieldElement name="questionText" label="Question Text" required className="question-text-field" />
            <br /> */}
            <TextFieldElement name="generateCount" label="No.of Variants to generate" required disabled={isFormViewInputs()} />
            <br />
            <TextFieldElement name="cOptions" label="Correct Options" disabled={isFormViewInputs()} />
            <br />
            <TextFieldElement name="wOptions" label="Wrong Options" disabled={isFormViewInputs()} />
            <br />
            <button type="submit" hidden id="proceedBtn">Proceed</button>
        </FormContainer>)
    }


    const renderFormView = () => {
        switch (formView) {
            case formViews[0]:
                return renderQuestionForm()
            case formViews[1]:
                return renderInputsForm()
        }

    }

    const renderPreviewFieldBasedOnQuestionData = (key, keyValue) => {
        switch (key) {
            case "templateTypes":
                return keyValue.map(eachObj => eachObj.label).join(', ')
            case "code":
                return JSON.stringify(keyValue)
            case "cOptions":
                return keyValue.join(', ')
            case "wOptions":
                return keyValue.join(', ')
            default:
                return keyValue
        }
    }

    const renderQuestionDataRow = (key) => {

        const keyValue = questionsData[key]

        return (
            <li className="question-data-row">
                <p className="question-data-key">{convertCamelToTitleCase(key)}</p>
                <p className="question-data-value">{renderPreviewFieldBasedOnQuestionData(key, keyValue)}</p>
            </li>
        )

    }

    const renderInputsTable = (inputsData) => {
        return (inputsData.length > 0 ? <Table columns={columns} data={inputsData} /> : null)

    }

    const renderConfigurationPreviewer = () => {

        let questionsDataKeys = Object.keys(questionsData)

        const questionsKeys = questionsDataKeys
        const inputsList = inputs

        //TODO: can make as util

        return (
            <div className="configuration-previewer">
                <h1 className="configuration-heading">Configuration Previewer</h1>
                <ul>
                    {questionsKeys.map(eachKey => renderQuestionDataRow(eachKey))}
                </ul>
                {renderInputsTable(inputsList)}
            </div>
        )

    }

    const renderIntegerRange = (input) => {
        const { inputName } = input

        return (
            <>
                <input className="input-field" name={`${inputName}Min`} placeholder="Min" onChange={onChangeMin} />
                <input className="input-field" name={`${inputName}Max`} placeholder="Max" onChange={onChangeMax} />
            </>
        )
    }

    const deleteOtherInputTypeKeys = (inputObj) => {
        const { inputType } = inputObj

        const inputTypeDetailsKeys = Object.keys(inputTypeDetails)

        inputTypeDetailsKeys.map(eachInputType => {
            if (eachInputType !== inputType) {
                inputTypeDetails[eachInputType].forEach(eachKey => delete inputObj[eachKey])
            }
        })

    }

    const onChangeMin = (event) => {
        const { value, name } = event.target
        const updatedInputs = [...inputs].map(eachInput => {
            if (name.includes(eachInput.inputName)) {
                eachInput.min = Number(value) //TODO: Need to write as util to convert to num
            }
            return eachInput
        })
        setInputs(updatedInputs)
    }

    const onChangeMax = (event) => {
        const { value, name } = event.target
        const updatedInputs = [...inputs].map(eachInput => {
            if (name.includes(eachInput.inputName)) {
                eachInput.max = Number(value)
            }
            return eachInput
        })
        setInputs(updatedInputs)
    }

    const onChangeLength = (event) => {
        const { value, name } = event.target
        const updatedInputs = [...inputs].map(eachInput => {
            if (name.includes(eachInput.inputName)) {
                eachInput.length = Number(value)
            }
            return eachInput
        })
        setInputs(updatedInputs)
    }

    const onChangeCustomList = (event) => {
        const { value, name } = event.target
        const updatedInputs = [...inputs].map(eachInput => {
            if (name.includes(eachInput.inputName)) {
                eachInput.customList = value
            }
            return eachInput
        })
        setInputs(updatedInputs)
    }

    const onChangeTemplateTypes = (selectedOptions) => {
        const templateTypes = selectedOptions

        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, templateTypes }))
    }

    const onChangeContextType = (selectedOption, event) => {

        const { name } = event

        const updatedInputs = [...inputs].map(eachInput => {

            if (name.includes(eachInput.inputName)) {
                return { ...eachInput, contextType: selectedOption.value }
            }
            return { ...eachInput }
        })

        setInputs(updatedInputs)

    }

    const renderStringRange = (input) => {
        const { inputName } = input

        return (
            <>
                <Select options={contextTypes} onChange={onChangeContextType} name={`${inputName}ContextType`} className="react-select-container" />
                <input className="input-field" name={`${inputName}Length`} placeholder="Length" onChange={onChangeLength} />
            </>
        )
    }

    const renderCustomRange = (input) => {
        const { inputName } = input

        return (
            <input className="input-field" name={`${inputName}Custom`} placeholder="Custom List" onChange={onChangeCustomList} />
        )
    }

    const renderFieldsBasedOnInputType = (input) => {
        const { inputType } = input
        switch (inputType) {
            case inputTypes[0]:
                return renderIntegerRange(input)
            case inputTypes[1]:
                return renderStringRange(input)
            case inputTypes[2]:
                return null
            case inputTypes[3]:
                return renderCustomRange(input)
        }
    }

    const onChangeInputName = (event) => {
        const { value, name } = event.target
        const updatedInputs = [...inputs].map(eachInput => {
            if (name.includes(eachInput.inputName)) {
                eachInput.inputName = value
            }
            return eachInput
        })
        setInputs(updatedInputs)
    }

    const onChangeInputType = (event) => {
        const { value, name } = event.target
        const updatedInputs = [...inputs].map(eachInput => {
            if (name.includes(eachInput.inputName)) {
                eachInput.inputType = value
                deleteOtherInputTypeKeys(eachInput)
            }
            return eachInput
        })
        setInputs(updatedInputs)
    }

    const renderInputRow = (input) => {

        const { inputName, inputType } = input

        return (
            <div key={inputName} className="input-row">
                <input className="input-field" placeholder="Input Name" value={inputName} name={`${inputName}InputName`} onChange={onChangeInputName} />
                <select className="input-field" value={inputType} onChange={onChangeInputType} name={`${inputName}InputType`}>
                    {inputTypes.map(eachInputType => <option value={eachInputType}>{eachInputType}</option>)}
                </select>
                {renderFieldsBasedOnInputType(input)}
            </div>
        )

    }

    const checkIsStringContainCharacter = (string, character) => {
        return string.includes(character)
    }

    const IsStringContainsNewLine = (inputVariables) => {
        if (inputVariables) {
            return (checkIsStringContainCharacter(inputVariables, "\n") || checkIsStringContainCharacter(inputVariables, "\r"))
        }
        return false
    }

    async function getEvaluatedPythonOutputs(json) {
        let pyodide = await pyodideInstance;

        const getPythonOutput = (code, variableValues) => {

            let codeWithSlashNIndents = code.replaceAll("\n", "\n        ")
            let codeWithSlashRIndents = code.replaceAll("\r", "\r        ")


            const getInputsSeparatedByNewLine = () => {
                return variableValues.join("\\n").replaceAll("\"", "")
            }

            const { inputVariables } = questionsData

            const stringifiedVariableValue = variableValues ? variableValues.join(" ").replaceAll("\"", "") : ""

            let pythonCode = `from io import StringIO
import sys
from contextlib import _RedirectStream
class redirect_stdin(_RedirectStream):
    _stream = "stdin"

with redirect_stdin(StringIO(${IsStringContainsNewLine(inputVariables) ? `"${getInputsSeparatedByNewLine()}"` : `"${stringifiedVariableValue}"`})):
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

            let pythonOutput = pyodide.runPython(pythonCode).toJs({ depth: 1 })

            return pythonOutput
        }

        const getInputVariablesValues = () => {
            const { inputVariables } = questionsData
            let inputVariablesArray = extractInputs(inputVariables)
            let inputVariablesValues = generatedInputs.map(eachInputObj => {
                let inputVariableValuesArray = inputVariablesArray.map(eachVariable => eachInputObj[eachVariable])
                return inputVariableValuesArray
            })

            return inputVariablesValues
        }

        const outputJsonWithPythonOutputs = [...json].map((eachObj, index) => {

            const inputVariableValue = questionsData.inputVariables ? getInputVariablesValues()[index] : questionsData.inputVariables

            let codeOutput = getPythonOutput(eachObj.code, inputVariableValue)

            let cOptions = codeOutput.join("\n")

            let object = { ...eachObj, cOptions }

            return object
        })

        return outputJsonWithPythonOutputs
    }

    const generateRandomInputsWithInputsProvided = () => {
        const { generateCount } = questionsData

        const createInputObject = () => {
            let inputObject = {}

            inputs.forEach(eachInputObj => {
                inputObject[eachInputObj.inputName] = getChanceRandomValueBasedOnInputType(eachInputObj)
            })
            return inputObject
        }

        let inputsData = []

        for (let i = 0; i < generateCount; i++) {
            inputsData.push(createInputObject())
        }

        setGeneratedInputs(inputsData)
    }

    useEffect(() => {
        const generateOutputJSON = () => {
            const outputJSON = getTransformedData()

            const updateOutputJsonState = async () => {

                if (questionsData.code && !shouldValidatePythonCodeOutputs(questionsData.templateTypes)) {

                    const outputJSONWithPythonOutputs = await getEvaluatedPythonOutputs(outputJSON)

                    setOutputJson(outputJSONWithPythonOutputs)
                }
                else {
                    setOutputJson(outputJSON)
                }
            }
            updateOutputJsonState()

        }
        if (generatedInputs.length > 0) {
            generateOutputJSON()
        }
    }, [JSON.stringify(generatedInputs)])

    const onGenerateData = async () => {
        generateRandomInputsWithInputsProvided()
    }

    const onClickPlayIcon = () => {
        document.getElementById("proceedBtn")?.click()
    }

    const onValidatePythonCodeOutputs = async () => {

        const stringifiedOutputJson = JSON.stringify(outputJson)

        const stringifiedUpdatedOutputJson = JSON.stringify(await getEvaluatedPythonOutputs(outputJson))

        if (stringifiedOutputJson !== stringifiedUpdatedOutputJson) {
            setErrorMsg(errorMsgs.pythonEvaluation)
            throw new Error("Code Outputs and Correct Options are not same")
        }
        else {
            setErrorMsg("")
        }
    }

    const onCopyCode = () => {
        setIsCopied(true)
    }

    const onClickBack = () => {
        setFormView(formViews[0])
    }

    const renderInputsForm = () => {

        return (
            <div>
                {inputs?.map(eachInput => renderInputRow(eachInput))}
                {/* <div>
                    <button onClick={onGenerateData}>Generate Data</button>
                </div> */}
                {/* <button onClick={onClickBack}>Back</button> */}
            </div>
        )

    }

    const renderOutputJSON = () => {
        return (
            <>
                <CopyToClipboard text={JSON.stringify(outputJson)}
                    onCopy={onCopyCode}>
                    <div className="copy-to-clipboard-container">
                        {isCopied ? <span>Copied</span> : <button className="copy-btn">Copy to clipboard</button>}
                    </div>
                </CopyToClipboard>
                <ReactJson src={outputJson} theme="monokai" style={{ whiteSpace: 'pre' }} />
            </>)
    }

    const onClickTabItem = (event) => {
        const { id } = event.target
        setActiveTab(id)
    }

    console.log(questionsData, 'onClickPlayIcon')
    console.log(inputs, 'inputs')

    return (
        <>
            <p className="app-heading">MCQ Pool Builder</p>
            <ResponsiveContainer>
                <div className="form-containers">
                    <div className="form-container">
                        {renderQuestionForm()}
                    </div>
                    <button className="icon-container" onClick={onClickPlayIcon}>
                        <IoPlayForward size={30} />
                    </button>
                    <div className="form-container">
                        {renderInputsForm()}
                    </div>
                </div>
                <div>
                    <button onClick={onGenerateData} disabled={inputs.length > 0 ? false : true}>Generate Data</button>
                </div>
                {/* <div className="separator"></div> */}
                {/* <div className="tabs-container">
                    <ul className="tabs-list">
                        {tabsList.map(eachTab => (
                            <li className="tab-item">
                                <button
                                    id={eachTab}
                                    type="button"
                                    onClick={onClickTabItem}
                                    className={activeTab === eachTab ? 'tab-button active' : 'tab-button'}
                                >
                                    {eachTab}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {activeTab === tabsList[0] ? <>
                        {outputJson.length > 0 && questionsData.code !== "" && shouldValidatePythonCodeOutputs(questionsData.templateTypes) ? <button onClick={onValidatePythonCodeOutputs}>Validate Python Code Outputs</button> : null}
                        <p>{errorMsg}</p>
                        {renderOutputJSON()}
                    </> : renderConfigurationPreviewer()}
                </div> */}
                {outputJson.length > 0 && <>
                    <p>{errorMsg}</p>
                    {questionsData.code !== "" && shouldValidatePythonCodeOutputs(questionsData.templateTypes) ? <button onClick={onValidatePythonCodeOutputs}>Validate Python Code Outputs</button> : null
                    }
                    {renderOutputJSON()}
                </>}
            </ResponsiveContainer>
        </>
    );
}
