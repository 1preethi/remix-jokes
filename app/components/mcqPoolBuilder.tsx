import { useEffect, useState, useMemo } from "react";

import type {
    ActionFunction
} from "@remix-run/node";
import {
    Form,
    Link,
    useActionData,
    useCatch,
    useTransition,
} from "@remix-run/react";

import Select from 'react-select';
import Chance from 'chance';
import { SelectTransform as ST } from 'selecttransform';
import ReactJson from 'react-json-view'
import loadable from '@loadable/component'

import { CopyToClipboard } from 'react-copy-to-clipboard';
import Table from "~/components/table";
import { IoPlayForward } from "react-icons/io5";
import { TiTick } from "react-icons/ti";
import { useForm, Controller } from "react-hook-form";
import { TextField, Checkbox } from "@material-ui/core";

const ReactJson = loadable(() => new Promise((r, c) => import('react-json-view').then(result => r(result.default), c)))

const st = new ST();

import CodeEditor from "./codeEditor.client";
import ResponsiveContainer from "~/components/responsiveContainer";


const initialTemplateIdsArray = Array.from(Array(30).keys()).map(eachNum => ({ "value": `t${eachNum + 1}`, "label": `t${eachNum + 1}` }))

const questionTypes = ["CODE_ANALYSIS_MULTIPLE_CHOICE", "CODE_ANALYSIS_MORE_THAN_ONE_MULTIPLE_CHOICE", "MULTIPLE_CHOICE", "MORE_THAN_ONE_MULTIPLE_CHOICE"]

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
    "float",
    "string",
    "bool",
    "custom"
]

const inputTypeDetails = {
    'integer': ['min', 'max'],
    'float': ['min', 'max', 'decimals'],
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

// const tabsList = ["OUTPUT JSON", "CONFIGURATION PREVIEWER"]

const tabsList = ["CONTENT JSON", "POOL JSON", "TEMPLATE JSON"]

export default function McqPoolBuilder(props) {
    const { pyodideInstance } = props
    const [fileReader, setFileReader] = useState()

    const [prodJson, setProdJson] = useState({})
    const [templateJson, setTemplateJson] = useState([])

    const [templateIdsArray, setTemplateIdsArray] = useState(initialTemplateIdsArray)

    const [templateTypes, setTemplateTypes] = useState([])
    const [templateId, setTemplateId] = useState({})
    const [questionText, setQuestionText] = useState("")
    const [inputVariables, setInputVariables] = useState("")
    const [code, setCode] = useState("")
    const [cOptions, setCOptions] = useState("")
    const [wOptions, setWOptions] = useState("")

    const [questionsData, setQuestionsData] = useState({})
    const [inputs, setInputs] = useState([])

    const [outputJson, setOutputJson] = useState([])
    const [isCopied, setIsCopied] = useState(false)
    const [isContentJsonCopied, setIsContentJsonCopied] = useState(false)
    const [isTemplatesJsonCopied, setIsTemplatesJsonCopied] = useState(false)
    const [chanceInstance, setChanceInstance] = useState()
    const [generatedInputs, setGeneratedInputs] = useState([])
    const [errorMsg, setErrorMsg] = useState("")
    const [genCount, setGenCount] = useState(4)
    const [activeTab, setActiveTab] = useState(tabsList[0])

    const columns = useMemo(
        () => inputTableColumns,
        [outputJson]
    );

    const [formView, setFormView] = useState(formViews[0])
    // const [activeTab, setActiveTab] = useState(tabsList[0])

    const initializeStates = () => {
        setTemplateTypes([])
        setTemplateId({})
        setQuestionText("")
        setCode("")
        setInputVariables("")
        setCOptions("")
        setWOptions("")

        setQuestionsData({})
        setInputs([])
        setFormView(formViews[0])
        setOutputJson([])
        setIsCopied(false)
        setIsContentJsonCopied(false)
        setIsTemplatesJsonCopied(false)
        setGeneratedInputs([])
        setErrorMsg("")
        setActiveTab(tabsList[0])
    }

    useEffect(() => {
        const chance = new Chance()
        const reader = new FileReader()
        setChanceInstance(chance)
        setFileReader(reader)
    }, [])

    const convertCamelToTitleCase = (text) => {
        const result = text.replace(/([A-Z])/g, " $1");

        const finalResult = result.charAt(0).toUpperCase() + result.slice(1);

        return finalResult
    }

    const convertProdToTemplatesJson = (prodJson) => {
        const templatesJson = prodJson.questions.map((eachQuestionObj, index) => {
            const { question, options, code_analysis } = eachQuestionObj
            let questionObj = {}
            questionObj.templateTypes = []
            questionObj.questionText = question.content
            questionObj.templateId = `t${index + 1}`
            questionObj.code = ""
            questionObj.inputVariables = ""
            questionObj.cOptions = []
            questionObj.wOptions = options.map(eachOptionObj => eachOptionObj.content)
            if (code_analysis) {
                questionObj.code = code_analysis.code_details.code
            }
            return questionObj
        })

        return templatesJson
    }

    const getChanceRandomValueBasedOnInputType = (input) => {
        const { inputType, min, max, length, customList, contextType, decimals } = input

        let custom = customList?.split(',').map((char) => char.trim())

        switch (inputType) {
            case inputTypes[0]:
                return chanceInstance.integer({ min, max })
            case inputTypes[1]:
                return chanceInstance.floating({ min, max, fixed: decimals })
            case inputTypes[2]:
                switch (contextType) {
                    case contextTypes[0].value:
                        return chanceInstance.name({ length })
                    case contextTypes[1].value:
                        return chanceInstance.animal({ length })
                    case contextTypes[2].value:
                        return chanceInstance.company({ length })
                    case contextTypes[3].value:
                        return chanceInstance.country({ full: true, length })
                    case contextTypes[4].value:
                        return chanceInstance.city({ length })
                    case contextTypes[5].value:
                        return chanceInstance.state({ full: true, length })
                    case contextTypes[6].value:
                        return chanceInstance.street({ length })
                    case contextTypes[7].value:
                        return chanceInstance.month({ length })
                    case contextTypes[8].value:
                        return chanceInstance.profession({ length })
                    case contextTypes[9].value:
                        return chanceInstance.weekday({ length })
                    default:
                        return chanceInstance.string({ length })
                }
            case inputTypes[3]:
                return chanceInstance.bool()
            case inputTypes[4]:
                return chanceInstance.pickone(custom)
        }
    }

    const getGeneratedQuestionsData = () => {
        const { questionText, code, cOptions, wOptions, inputVariables, templateId } = questionsData

        console.log(templateId, 'template id')

        const generatedQuestionsData = {
            questionText,
            code: code ? code : "",
            templateId: templateId.value,
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
                templateId: question.templateId + "_{{$index+1}}",
                questionText: question.questionText + getQuestionTextToAddBasedOnTemplateType(question.inputVariables),
                code: question.code,
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

    // const isQuestionDataValid = () => {
    //     return questionsData.templateTypes.length && questionsData.templateId.keys().length
    // }

    const onProceed = () => {

        const cOPtionsArray = cOptions === "" ? [] : cOptions.split(',').map((char) => {
            const charWithoutSpaces = char.trim()
            return isNaN(Number(charWithoutSpaces)) ? charWithoutSpaces : Number(charWithoutSpaces)
        })

        const wOPtionsArray = wOptions === "" ? [] : wOptions.split(',').map((char) => {
            const charWithoutSpaces = char.trim()
            return isNaN(Number(charWithoutSpaces)) ? charWithoutSpaces : Number(charWithoutSpaces)
        })

        // TODO: Add to util to convert into integer if integer or string
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, templateTypes, templateId, code, questionText, inputVariables, cOptions: cOPtionsArray, wOptions: wOPtionsArray }))
    }

    const extractInputs = (questionData) => {

        const regex = /{{input_\d*}}/g
        const inputVariablesRegex = /{{\d*\w*}}/g
        // Need to change - execute only with template type

        if (questionData) {
            const inputsWithBrackets = questionData.match(regex) || questionData.match(inputVariablesRegex)

            const inputsWithoutBrackets = inputsWithBrackets ? inputsWithBrackets.map(string => string.replace('{{', '').replace('}}', '')) : []
            return inputsWithoutBrackets
        }
        else {
            return []
        }
    }

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
        if (questionsData?.templateTypes?.length && templateJson.length === 0) {
            setInputs(getInputsBasedOnTemplateType())
        }
    }, [JSON.stringify(questionsData)]);

    const includesRequiredTemplateType = (templateType) => {
        if (templateTypes) {
            const templates = templateTypes?.map(eachTemplateObj => eachTemplateObj.value)
            return templates.includes(templateType.value)
        }
        return false
    }

    const isFormViewInputs = () => {
        return formView === formViews[1]
    }

    // const renderQuestionForm = () => {

    //     return (<FormContainer
    //         onSuccess={onProceed}
    //     >
    //         <Select
    //             onChange={onChangeTemplateTypes}
    //             options={templateTypesArray}
    //             placeholder="Type of Template"
    //             isMulti={true}
    //             isDisabled={isFormViewInputs()}
    //             className="react-select"
    //         />

    //         <br />

    //         <Select
    //             onChange={onChangeTemplateId}
    //             options={templateIdsArray}
    //             placeholder="Template Id"
    //             isMulti={false}
    //             isDisabled={isFormViewInputs()}
    //             className="react-select"
    //         />
    //         {/* <MultiSelectElement menuItems={templateTypesArray} label="Type of Template" name="templateTypes" required /> */}
    //         <br />
    //         {typeof document !== "undefined" ? <CodeEditor changeEditor={changeEditor} readOnly={isFormViewInputs()} /> : <Fallback />}
    //         {/* <br />
    //         <Editor
    //             height="100px"
    //             defaultLanguage="python"
    //             onChange={onChangeEditor}
    //         /> */}
    //         {/* {includesRequiredTemplateType(templateTypesArray[4]) === true ? <TextFieldElement name="inputVariables" label="Input Variables" required className="question-text-field" /> : null} */}
    //         {includesRequiredTemplateType(templateTypesArray[4]) === true ? <div className="question-text-field"><textarea className="text-area" name="inputVariables" placeholder="Code Input Templates" onChange={onChangeInputVariablesTextarea} required disabled={isFormViewInputs()}></textarea></div> : null}
    //         <br />
    //         <div className="question-text-field">
    //             <textarea className="text-area" name="inputVariables" placeholder="Question Text" onChange={onChangeQuestionText} required disabled={isFormViewInputs()}></textarea>
    //         </div>
    //         <br />
    //         {/* <TextFieldElement name="questionText" label="Question Text" required className="question-text-field" />
    //         <br /> */}
    //         {/* <TextFieldElement name="generateCount" label="No.of Variants to generate" required disabled={isFormViewInputs()} />
    //         <br /> */}
    //         <TextFieldElement name="cOptions" label="Correct Options" disabled={isFormViewInputs()} />
    //         <br />
    //         <TextFieldElement name="wOptions" label="Wrong Options" disabled={isFormViewInputs()} />
    //         <br />
    //         <button type="submit" hidden id="proceedBtn">Proceed</button>
    //     </FormContainer>)
    // }

    const onChangeWOptions = (event) => {
        const { value } = event.target
        setWOptions(value)

    }

    const onChangeCOptions = (event) => {
        const { value } = event.target
        setCOptions(value)

    }

    const onChangeInputVariablesTextarea = (event) => {
        const { value } = event.target
        setInputVariables(value)
    }

    const onChangeQuestionText = (event) => {
        const { value } = event.target
        setQuestionText(value)
    }

    const changeEditor = (value) => {
        setCode(value)
    }

    const updateQuestionFormValues = (question) => {
        const { templateTypes, templateId, questionText, inputVariables, code, cOptions, wOptions } = question

        const updatedTemplateTypes = templateTypesArray.filter(eachTemplateType => templateTypes.includes(eachTemplateType.value))
        const updatedTemplateId = templateIdsArray.find(eachTemplateIdObj => eachTemplateIdObj.value === templateId)

        setTemplateTypes(updatedTemplateTypes)
        setQuestionText(questionText)
        setTemplateId(updatedTemplateId)
        setInputVariables(inputVariables)
        setCode(code)
        setCOptions(cOptions.join(", "))
        setWOptions(wOptions.join(","))
    }

    const updateQuestionData = (question) => {
        const { templateTypes, questionText, templateId, inputVariables, code, cOptions, wOptions } = question

        const updatedTemplateTypes = templateTypesArray.filter(eachTemplateType => templateTypes.includes(eachTemplateType.value))
        const updatedTemplateId = templateIdsArray.find(eachTemplateIdObj => eachTemplateIdObj.value === templateId)

        setQuestionsData({ templateTypes: updatedTemplateTypes, templateId: updatedTemplateId, questionText, inputVariables, code, cOptions, wOptions })
    }

    const onChangeTemplateId = (selectedOptions) => {
        if (Object.keys(prodJson).length) {
            const templateJson = convertProdToTemplatesJson(prodJson)
            const template = templateJson.find(eachTemplateObj => eachTemplateObj.templateId === selectedOptions.value)
            updateQuestionFormValues(template)
            updateQuestionData(template)
        }
        if (templateJson.length) {
            const template = templateJson.find(eachTemplateObj => eachTemplateObj.templateId === selectedOptions.value)
            updateQuestionFormValues(template)
            updateQuestionData(template)
            setInputs(template.inputs)
        }

        console.log(selectedOptions, 'selected')
        setTemplateId(selectedOptions)
    }

    const onChangeTemplateTypes = (selectedOptions) => {
        setTemplateTypes(selectedOptions)
    }

    console.log(inputs, 'inputs')

    const renderQuestionForm = () => {

        return (
            <form className="flex-container">
                <div className="form flex-grow">
                    <Select
                        isClearable
                        placeholder="Type of Template"
                        isMulti={true}
                        value={templateTypes}
                        onChange={onChangeTemplateTypes}
                        className="react-select"
                        options={templateTypesArray}
                    />

                    <br />

                    <Select
                        isClearable
                        placeholder="Template Id"
                        isMulti={false}
                        value={templateId}
                        onChange={onChangeTemplateId}
                        className="react-select"
                        options={templateIdsArray}
                    />

                    <br />

                    {typeof document !== "undefined" ? <CodeEditor
                        changeEditor={changeEditor} readOnly={isFormViewInputs()} code={code} /> : <Fallback />}

                    <br />

                    <div className="question-text-field">
                        <textarea className="text-area" placeholder="Question Text" value={questionText} onChange={onChangeQuestionText} required></textarea>
                    </div>

                    {includesRequiredTemplateType(templateTypesArray[4]) === true ? <><br /> <div><input className="question-form-input-field" placeholder="Code Input Templates" value={inputVariables} onChange={onChangeInputVariablesTextarea} /></div></> : null}

                    <br />

                    <div><input className="question-form-input-field" placeholder="Correct Options" value={cOptions} onChange={onChangeCOptions} /></div>
                    <br />
                    <div><input className="question-form-input-field" placeholder="Wrong Options" value={wOptions} onChange={onChangeWOptions} /></div>

                </div>

                <div className="m-auto">
                    <button type="button" className="icon-container" onClick={onProceed}>
                        <IoPlayForward size={30} />
                    </button>
                </div>

            </form>)
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

    const renderFloatRange = (input) => {
        const { inputName, min, max, decimals } = input

        return (
            <>
                <input className="input-field expand" name={`${inputName}FloatMin`} placeholder="Min" onChange={onChangeMin} value={min} />
                <input className="input-field expand" name={`${inputName}FloatMax`} placeholder="Max" onChange={onChangeMax} value={max} />
                <input className="input-field expand" name={`${inputName}decimals`} placeholder="Decimals" onChange={onChangeDecimals} value={decimals} />
            </>
        )
    }

    const renderIntegerRange = (input) => {
        const { inputName, min, max } = input

        return (
            <>
                <input className="input-field expand" name={`${inputName}Min`} placeholder="Min" onChange={onChangeMin} value={min} />
                <input className="input-field expand" name={`${inputName}Max`} placeholder="Max" onChange={onChangeMax} value={max} />
            </>
        )
    }

    // const deleteOtherInputTypeKeys = (inputObj) => {
    //     const { inputType } = inputObj

    //     const inputTypeDetailsKeys = Object.keys(inputTypeDetails)

    //     inputTypeDetailsKeys.map(eachInputType => {
    //         if (eachInputType !== inputType) {
    //             inputTypeDetails[eachInputType].forEach(eachKey => delete inputObj[eachKey])
    //         }
    //     })

    // }

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

    const onChangeDecimals = (event) => {
        const { value, name } = event.target
        const updatedInputs = [...inputs].map(eachInput => {
            if (name.includes(eachInput.inputName)) {
                eachInput.decimals = Number(value)
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
        const { inputName, contextType, length } = input

        return (
            <>
                <Select options={contextTypes} onChange={onChangeContextType} name={`${inputName}ContextType`} className="react-select-container expand" value={contextType} />
                <input className="input-field length-input-field" name={`${inputName}Length`} value={length} placeholder="Length" onChange={onChangeLength} />
            </>
        )
    }

    const renderCustomRange = (input) => {
        const { inputName, customList } = input

        return (
            <input className="input-field expand" name={`${inputName}Custom`} value={customList} placeholder="Custom List" onChange={onChangeCustomList} />
        )
    }

    const renderFieldsBasedOnInputType = (input) => {
        const { inputType } = input
        switch (inputType) {
            case inputTypes[0]:
                return renderIntegerRange(input)
            case inputTypes[1]:
                return renderFloatRange(input)
            case inputTypes[2]:
                return renderStringRange(input)
            case inputTypes[3]:
                return null
            case inputTypes[4]:
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
                // deleteOtherInputTypeKeys(eachInput)
            }
            return eachInput
        })
        setInputs(updatedInputs)
    }

    const renderInputRow = (input) => {

        const { inputName, inputType } = input

        return (
            <div key={inputName} className="input-row">
                <input className="input-field input-name-field" placeholder="Input Name" value={inputName} name={`${inputName}InputName`} onChange={onChangeInputName} />
                <select className="input-field select-field" value={inputType} onChange={onChangeInputType} name={`${inputName}InputType`}>
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

    const convertTitleToSnakeCase = (string) => {
        const stringArr = string.split(' ');
        const snakeArr = stringArr.reduce((acc, val) => {
            return acc.concat(val.toLowerCase());
        }, []);
        return snakeArr.join('_');
    }

    async function getEvaluatedPythonOutputs(json) {
        let pyodide = await pyodideInstance;

        const getPythonOutput = (code, variableValues) => {

            let codeWithSlashNIndents = code.replaceAll("\n", "\n        ")
            let codeWithSlashRIndents = code.replaceAll("\r", "\r        ")


            const getInputsSeparatedByNewLine = () => {
                // return variableValues.join("\\n").replaceAll("\"", "")
                return variableValues.join("\\n")
            }

            const { inputVariables } = questionsData

            const stringifiedVariableValue = variableValues ? variableValues.join(" ") : ""

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

        const createInputObject = () => {
            let inputObject = {}

            inputs.forEach(eachInputObj => {
                inputObject[eachInputObj.inputName] = getChanceRandomValueBasedOnInputType(eachInputObj)
            })
            return inputObject
        }

        let inputsData = []

        for (let i = 0; i < genCount; i++) {
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

    const onCopyContentJsonCode = () => {
        setIsContentJsonCopied(true)
    }

    const onCopyTemplatesJsonCode = () => {
        setIsTemplatesJsonCopied(true)
    }

    // const onClickBack = () => {
    //     setFormView(formViews[0])
    // }

    const onChangeGenCount = (event) => {
        setGenCount(parseInt(event.target.value))
    }

    const renderInputsForm = () => {

        return (
            <div>
                {inputs?.map(eachInput => renderInputRow(eachInput))}
                {inputs.length > 0 ? <div className="generate-count-field">
                    <label>Generate Count: </label>
                    <input type="text" placeholder="Generate Count" className="input-field" value={genCount} onChange={onChangeGenCount} />
                </div> : null}

                {/* <div>
                    <button onClick={onGenerateData}>Generate Data</button>
                </div> */}
                {/* <button onClick={onClickBack}>Back</button> */}
            </div>
        )

    }

    const renderPoolJSON = () => {
        return (
            <>
                <CopyToClipboard text={JSON.stringify(outputJson)}
                    onCopy={onCopyCode}>
                    <div className="copy-to-clipboard-container">
                        {isCopied ? <div className="copied-container"> <TiTick size="20px" /><span>Copied</span></div> : <button className="copy-btn">Copy to clipboard</button>}
                    </div>
                </CopyToClipboard>
                <ReactJson src={outputJson} theme="monokai" style={{ whiteSpace: 'pre', "height": "400px", "overflow": "scroll" }} enableClipboard={false} />
            </>)
    }

    const renderContentJSON = () => {

        const contentJson = convertToContentJson(outputJson)

        return (
            <>
                <CopyToClipboard text={JSON.stringify(contentJson)}
                    onCopy={onCopyContentJsonCode}>
                    <div className="copy-to-clipboard-container">
                        {isContentJsonCopied ? <div className="copied-container"> <TiTick size="20px" /><span>Copied</span></div> : <button className="copy-btn">Copy to clipboard</button>}
                    </div>
                </CopyToClipboard>
                <ReactJson src={contentJson} theme="monokai" style={{ whiteSpace: 'pre', "height": "400px", "overflow": "scroll" }} enableClipboard={false} />
            </>)
    }

    const renderTemplateJson = () => {

        const templateJson = { ...questionsData, genCount, inputs }

        return (
            <>
                {/* <CopyToClipboard text={JSON.stringify(getGeneratedQuestionsData())} */}
                <CopyToClipboard text={JSON.stringify(templateJson)}
                    onCopy={onCopyTemplatesJsonCode}>
                    <div className="copy-to-clipboard-container">
                        {isTemplatesJsonCopied ? <div className="copied-container"> <TiTick size="20px" /><span>Copied</span></div> : <button className="copy-btn">Copy to clipboard</button>}
                    </div>
                </CopyToClipboard>
                <ReactJson src={templateJson} theme="monokai" style={{ whiteSpace: 'pre', "height": "400px", "overflow": "scroll" }} enableClipboard={false} />
            </>)
    }

    const formatToContentQuestion = (question) => {
        const { questionText, templateId } = question

        return ({
            "question_id": templateId,
            "question_text": questionText,
            "content_type": "HTML",
            "question_multimedia": [],
            "skills": [],
            "toughness": "EASY",
            "tag_names": [],
        })

    }

    const formatToCodeAnalysisQuestion = (code, cOptions, wOptions) => {
        const questionType = cOptions.length > 1 ? questionTypes[1] : questionTypes[0]

        return ({
            "question_type": questionType,
            "input_output_sets": [
                { "wrong_outputs": wOptions, "output": cOptions }
            ],
            "code_metadata": [
                {
                    "is_editable": false,
                    "language": "PYTHON",
                    "code_data": code,
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

    const convertToContentJson = (output) => {
        return output.map(eachQuestion => {
            const { cOptions, wOptions, code } = eachQuestion

            let questionObj

            if (eachQuestion.code === "") {
                questionObj = formatToMultipleChoiceQuestion(cOptions, wOptions)
            }
            else {
                questionObj = formatToCodeAnalysisQuestion(code, cOptions, wOptions)
            }

            return ({ ...formatToContentQuestion(eachQuestion), ...questionObj })
        })
    }

    const onClickTabItem = (event) => {
        const { id } = event.target
        setActiveTab(id)
    }

    const onResetData = () => {
        initializeStates()
    }

    const renderJson = () => {
        switch (activeTab) {
            case tabsList[0]:
                return renderContentJSON()
            case tabsList[1]:
                return renderPoolJSON()
            case tabsList[2]:
                return renderTemplateJson()
        }
    }

    const getJSONFileContent = async (file) => {
        return new Promise(resolve => {
            const blob = new Blob([file], { type: "application/json" });

            fileReader.addEventListener('load', ((jsonFile) => {
                return function (event) {
                    resolve(JSON.parse(event.target.result))
                };

            })(blob));

            fileReader.readAsText(blob);
        });
    }

    const getTemplateIdsArrayFromTemplateJson = (templateJson) => {
        const templateIds = templateJson.map(eachTemplateObj => {
            const templateId = eachTemplateObj.templateId
            return { value: templateId, label: templateId }
        })
        return templateIds
    }

    useEffect(() => {
        if (Object.keys(prodJson).length) {
            const templateJson = convertProdToTemplatesJson(prodJson)
            const templateIds = getTemplateIdsArrayFromTemplateJson(templateJson)

            console.log(templateIds, 'templateIds')

            setTemplateIdsArray(templateIds)
        }

    }, [JSON.stringify(prodJson)])

    useEffect(() => {
        if (templateJson.length) {
            const templateIds = getTemplateIdsArrayFromTemplateJson(templateJson)

            setTemplateIdsArray(templateIds)
        }
    }, [JSON.stringify(templateJson)])

    const onChangeProdJsonFile = async (event) => {
        const { files } = event.target
        const file = files[0]
        let jsonContent = await getJSONFileContent(file)
        setProdJson(jsonContent)
    }

    const onChangeTemplateJsonFile = async (event) => {
        const { files } = event.target
        const file = files[0]

        let jsonContent = await getJSONFileContent(file)
        setTemplateJson(jsonContent)
    }

    const renderJSONTabs = () => {
        return (
            <>
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
                {renderJson()}
            </>)
    }

    return (
        <>
            <p className="app-sub-heading">MCQ Pool Builder</p>
            <ResponsiveContainer>
                <form encType="multipart/form-data">
                    <div>
                        <label>Upload Prod JSON</label>
                        <input id="prodUpload" type="file" name="prodJson" size="30" onChange={onChangeProdJsonFile} />
                    </div>
                    <div>
                        <label>Upload Templates JSON</label>
                        <input id="templateUpload" type="file" name="templateJson" size="30" onChange={onChangeTemplateJsonFile} />
                    </div>
                </form>
                <div className="form-containers">
                    <div className="form-major-container">
                        {renderQuestionForm()}
                    </div>
                    <div className="form-container">
                        {renderInputsForm()}
                    </div>
                </div>
                <div>
                    <button onClick={onResetData}>Reset</button>
                    {/* disabled={inputs.length > 0} */}
                    {/* <button onClick={onGenerateData} disabled={inputs.length > 0 ? false : true}>Generate Data</button> */}
                    <button onClick={onGenerateData}>Generate Data</button>
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
                    {renderJSONTabs()}
                </>}
            </ResponsiveContainer>
        </>
    );
}


