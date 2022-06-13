import React, { useEffect, useState, useMemo } from "react";

import Editor from "@monaco-editor/react";
import { FormContainer, TextFieldElement, MultiSelectElement, SelectElement } from 'react-hook-form-mui'
import Select from 'react-select';
import { useActionData } from "@remix-run/react";
import Chance from 'chance';
import { SelectTransform as ST } from 'selecttransform';
import ReactJson from 'react-json-view'
import loadable from '@loadable/component'
import { st } from "stjs_dev"

import '../styles/pool-generator.css'

import { CopyToClipboard } from 'react-copy-to-clipboard';
import Table from "~/components/table";

import stylesUrl from "~/styles/pool-generator.css";

const ReactJson = loadable(() => new Promise((r, c) => import('react-json-view').then(result => r(result.default), c)))

const st = new ST();

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
        Header: "Custom List",
        accessor: "customList"
    }
]

const templateTypes = [
    { "value": "QUESTION_AS_TEMPLATE", "label": "Question as Template" },
    { "value": "CODE_AS_TEMPLATE", "label": "Code as Template" },
    { "value": "CORRECT_OPTIONS_AS_TEMPLATE", "label": "Correct Options as Template" },
    { "value": "WRONG_OPTIONS_AS_TEMPLATE", "label": "Wrong Options as Template" },
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

const formViews = ["QUESTION", "INPUTS"]

type ActionData = {
    outputJSON?: any
    questionsData?: any,
    inputs?: any
};

export const action: ActionFunction = async ({
    request,
}) => {
    const chance = new Chance()
    const form = await request.formData();

    const questionsData = JSON.parse(form.get("questionsData"))
    const inputs = JSON.parse(form.get("inputs")) // TODO: Need to write as util


    const getChanceRandomValueBasedOnInputType = (input) => {
        const { inputType, min, max, length, customList } = input

        let custom = customList?.split(',')

        switch (inputType) {
            case inputTypes[0]:
                return chance.integer({ min, max })
            case inputTypes[1]:
                return JSON.stringify(chance.word({ length }))
            case inputTypes[2]:
                return chance.bool()
            case inputTypes[3]:
                return chance.pickone(custom)
        }
    }

    const getGeneratedQuestionsData = () => {
        const { questionText, code, tagName, generateCount, cOptions, wOptions } = questionsData

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


        const generatedQuestionsData = {
            questionText,
            code,
            tagName,
            inputs: inputsData,
            cOptions,
            wOptions
        }
        return generatedQuestionsData
    }

    const getCodeTemplate = (question: any) => {
        return ({
            "{{#each inputs}}": {
                questionText: question.questionText,
                code: question.code,
                tagName: `${question.tagName}_{{$index+1}}`,
                cOptions: question.cOptions,
                wOptions: question.wOptions,
            }
        })
    }

    const getTransformedData = () => {
        let transformedData = st.transformSync(getCodeTemplate(getGeneratedQuestionsData()), getGeneratedQuestionsData())

        return transformedData
    }

    const outputJSON = getTransformedData()

    return { outputJSON, questionsData, inputs }
}


export default function PoolGenerator() {

    const actionData = useActionData<ActionData>();

    const [outputJson, setOutputJson] = useState([])
    const [pyodideInstance, setPyodideInstance] = useState()
    const [isCopied, setIsCopied] = useState(false)
    const [chanceInstance, setChanceInstance] = useState()

    const columns = useMemo(
        () => inputTableColumns,
        [outputJson]
    );

    const [questionsData, setQuestionsData] = useState({})
    const [inputs, setInputs] = useState()
    const [formView, setFormView] = useState(formViews[0])

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

    const onProceed = (data) => {
        const { cOptions, wOptions } = data // TODO:Add to util to convert into array when given string with , separated

        const updatedCOPtions = cOptions === "" ? [] : cOptions.split(',')
        const updatedWOPtions = wOptions === "" ? [] : wOptions.split(',')

        // TODO: Add to util to convert into integer if integer or string
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, ...data, cOptions: updatedCOPtions, wOptions: updatedWOPtions }))
        setFormView(formViews[1])

    }

    useEffect(() => {
        const extractInputs = (questionData) => {

            const regex = /{{input_\d*}}/g
            const inputsWithBrackets = questionData.match(regex)
            const inputsWithoutBrackets = inputsWithBrackets ? inputsWithBrackets.map(string => string.replace('{{', '').replace('}}', '')) : []
            return inputsWithoutBrackets
        }

        const getQuestionDataToExtractInputs = (templateType) => {
            const { questionText, code, cOptions, wOptions } = questionsData;

            switch (templateType) {
                case templateTypes[0].value:
                    return JSON.stringify(questionText)
                case templateTypes[1].value:
                    return JSON.stringify(code)
                case templateTypes[2].value:
                    return JSON.stringify(cOptions)
                case templateTypes[3].value:
                    return JSON.stringify(wOptions)
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

        if (questionsData.templateTypes) {
            setInputs(getInputsBasedOnTemplateType())
        }
    }, [formView]);

    const onChangeTemplateTypes = (selectedOptions) => {
        const templateTypes = selectedOptions

        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, templateTypes }))
    }


    const onChangeEditor = (value, event) => {
        let code = value
        setQuestionsData(prevQuestionData => ({ ...prevQuestionData, code }))
    }

    const renderQuestionForm = () => {
        return (<FormContainer
            onSuccess={onProceed}
        // defaultValues={{ "templateTypes": templateTypesArray[0], "questionText": 'print({input_1}, {input_2})', "generateCount": 3, "tagName": 'q_1' }}
        >
            <Select
                onChange={onChangeTemplateTypes}
                options={templateTypes}
                placeholder="Type of Template"
                isMulti={true}
            />
            {/* <MultiSelectElement menuItems={templateTypesArray} label="Type of Template" name="templateTypes" required /> */}
            <br />
            <Editor
                height="100px"
                defaultLanguage="python"
                onChange={onChangeEditor}
            />
            <TextFieldElement name="questionText" label="Question Text" required />
            <br />
            <TextFieldElement name="generateCount" label="No.of Variants to generate" required />
            <br />
            <TextFieldElement name="tagName" label="Tag Name" required />
            <br />
            <TextFieldElement name="cOptions" label="Correct Options" />
            <br />
            <TextFieldElement name="wOptions" label="Wrong Options" />
            <br />
            <button type="submit">Proceed</button>
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

    const renderQuestionDataRow = (key) => {

        const keyValue = Object.keys(questionsData).length > 0 ? JSON.stringify(questionsData[key]) : JSON.stringify(actionData?.questionsData[key])
        return (
            <li className="question-data-row">
                <p>{key}</p>
                <p>{keyValue}</p>
            </li>
        )

    }

    const renderInputsTable = (inputsData) => {

        return (
            <div className="input-table">
                <Table columns={columns} data={inputsData} />
            </div>
        )

    }

    const renderConfigurationPreviewer = () => {

        let questionsDataKeys = Object.keys(questionsData)

        const questionsKeys = questionsDataKeys.length > 0 ? questionsDataKeys : Object.keys(actionData?.questionsData)
        const inputsList = inputs === undefined ? actionData?.inputs : inputs
        //TODO: can make as util

        return (
            <>
                <ul>
                    {questionsKeys.map(eachKey => renderQuestionDataRow(eachKey))}
                </ul>
                {renderInputsTable(inputsList)}
            </>
        )

    }

    const renderIntegerRange = (input) => {
        const { inputName } = input
        // return (
        //     <>
        //         <TextFieldElement name={`${inputName}Min`} />
        //         <TextFieldElement name={`${inputName}Max`} />
        //     </>
        // )

        return (
            <>
                <input name={`${inputName}Min`} placeholder="Min" onChange={onChangeMin} />
                <input name={`${inputName}Max`} placeholder="Max" onChange={onChangeMax} />
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

    const renderStringRange = (input) => {
        const { inputName } = input
        // return (
        //     <TextFieldElement name={`${inputName}Length`} />
        // )

        return (
            <input name={`${inputName}Length`} placeholder="Length" onChange={onChangeLength} />
        )
    }

    const renderCustomRange = (input) => {
        const { inputName } = input

        return (
            <input name={`${inputName}Custom`} placeholder="Custom List" onChange={onChangeCustomList} />
        )
        // return (
        //     <TextFieldElement name={`${inputName}Custom`} />
        // )
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
            <div key={inputName}>
                <input placeholder="Input Name" value={inputName} name={`${inputName}InputName`} onChange={onChangeInputName} />
                <select value={inputType} onChange={onChangeInputType} name={`${inputName}InputType`}>
                    {inputTypes.map(eachInputType => <option value={eachInputType}>{eachInputType}</option>)}
                </select>
                {renderFieldsBasedOnInputType(input)}
            </div>
        )

        // return (
        //     <FormContainer key={inputName} defaultValues={{'input_1inputName': 'input_1', 'input_1inputType': 'integer'}}>
        //         <TextFieldElement name={`${inputName}inputName`} label="Input Name" />
        //         <SelectElement options={inputTypes} label="Input Type" name={`${inputName}inputType`} value={inputType} onChange={onChangeInputType} />
        //         {renderFieldsBasedOnInputType(input)}
        //     </FormContainer>
        // )

    }

    async function evaluatePython(outputJSON) {
        let pyodide = await pyodideInstance;

        const getPythonOutput = (code) => {

            let pythonCode = `
            from io import StringIO 
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
               ${code}
        
            list(output)`


            let pythonOutput = pyodide.runPython(pythonCode).toJs({ depth: 1 })[0]

            return pythonOutput
        }

        const updatedOutputJSON = [...outputJSON].map((eachObj, index) => {
    
            if (eachObj.cOptions === undefined || eachObj.cOptions.length === 0) {
                console.log('pre')
                let codeOutput = getPythonOutput(eachObj.code)
                eachObj.cOptions.push(isNaN(Number(codeOutput)) ? codeOutput : Number(codeOutput))
            }
            return eachObj
        })


        setOutputJson(updatedOutputJSON)
    }

    const onCopyCode = () => {
        setIsCopied(true)
    }

    const renderInputsForm = () => {

        return (
            <>
                {inputs?.map(eachInput => renderInputRow(eachInput))}
            </>
        )

    }

    return (
        <>
            {renderFormView()}
            {questionsData && inputs &&
                <>
                    {renderConfigurationPreviewer()}
                    <form id="form" method="post">
                        <input value={JSON.stringify(questionsData)} hidden name="questionsData" />
                        <input value={JSON.stringify(inputs)} hidden name="inputs" />
                        <button type="submit">Generate Data</button>
                    </form>
                </>
            }
            {actionData?.outputJSON &&
                <>
                    <button type="button" onClick={() => evaluatePython(actionData?.outputJSON)}>Evaluate Python Outputs</button>
                    {outputJson.length > 0 && <>
                        {renderConfigurationPreviewer()}
                        <CopyToClipboard text={JSON.stringify(outputJson)}
                            onCopy={onCopyCode}>
                            {isCopied ? <span>Copied</span> : <button>Copy to clipboard</button>}
                        </CopyToClipboard>
                        <ReactJson src={outputJson} />
                    </>}

                </>}
        </>
    );
}


