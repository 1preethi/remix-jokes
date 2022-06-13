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

import { SelectTransform as ST } from 'selecttransform';
import ReactJson from 'react-json-view'
import loadable from '@loadable/component'

import { CopyToClipboard } from 'react-copy-to-clipboard';


const ReactJson = loadable(() => new Promise((r, c) => import('react-json-view').then(result => r(result.default), c)))

const st = new ST();

import { useEffect, useState } from "react";


const initialData = [
    { //CHANGE: change to array
        "q_id": "q1",
        "q_text": "What will be the output for the given Python code?",
        "code": "print({A} {operand} {B})",
        "inputs": [
            { "A": 5, "B": 10, "operand": "+" },
            { "A": 25, "B": 15, "operand": "*" },
            { "A": 10, "B": 5, "operand": "-" }
        ],
        "c_options": [],
        "w_options": []
    }
]

type ActionData = {
    outputJSON?: any
};

export const action: ActionFunction = async ({
    request,
}) => {

    const form = await request.formData();

    const data = JSON.parse(form.get("input"))

    const getRandomIndex = (array) => {
        const arrayLength = array.length;
        return Math.floor(Math.random() * arrayLength);
    }

    const getUpdatedInputs = (dataObj) => {
        let { inputs, data, gen_count } = dataObj

        const dataEntries = Object.entries(data)

        if (inputs === undefined) {
            inputs = new Array(gen_count);
            for (let i = 0; i < inputs.length; i++) {
                inputs[i] = {};
            }
        }

        let updatedInputs = [...inputs].map(eachInputObj => {
            dataEntries.forEach((eachEntry, index) => {
                const [key, value] = eachEntry;
                eachInputObj[key] = value[getRandomIndex(value)]
            })
            return eachInputObj
        })

        return updatedInputs
    }

    const dataWithUpdatedInputs = [...data].map(eachObj => {
        if (eachObj.data) {
            eachObj.inputs = getUpdatedInputs(eachObj)
        }
        return eachObj
    })

    const getInputKeys = () => dataWithUpdatedInputs.map(eachObj => Object.keys(eachObj.inputs[0]))

    const getUpdatedData = () => {
        return [...dataWithUpdatedInputs].map(eachObj => {

            const inputKeys = getInputKeys();

            inputKeys.forEach(eachInputKeys => {
                eachInputKeys.forEach(eachKey => {

                    eachObj.q_text = eachObj.q_text.split(`{${eachKey}}`).join(`{{${eachKey}}}`)
                    eachObj.code = eachObj.code.split(`{${eachKey}}`).join(`{{${eachKey}}}`)

                    eachObj.c_options = eachObj.c_options ? JSON.parse((JSON.stringify(eachObj.c_options)).split(`{${eachKey}}`).join(`{{${eachKey}}}`)) : []
                    eachObj.w_options = eachObj.w_options ? JSON.parse((JSON.stringify(eachObj.w_options)).split(`{${eachKey}}`).join(`{{${eachKey}}}`)) : []
                })
            })
            return eachObj
        })
    }

    const getCodeTemplate = (question: any) => {
        return ({
            "{{#each inputs}}": {
                question_text: question.q_text,
                code: question.code,
                tag_name: `${question.q_id}_{{$index+1}}`,
                c_options: question.c_options,
                w_options: question.w_options,
            }
        })
    }

    const getTransformedData = () => {
        let transformedData = getUpdatedData().map(eachObj => {
            let updatedData = st.transformSync(getCodeTemplate(eachObj), eachObj)
            return updatedData
        })

        return transformedData[0]
    }

    const outputJSON = getTransformedData()

    return { outputJSON }
}

export default function VariantsGenerator() {

    const actionData = useActionData<ActionData>();

    const [outputJson, setOutputJson] = useState([])
    const [pyodideInstance, setPyodideInstance] = useState()
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        async function createAndReturnPyodideInstance() {
            let pyodide = await loadPyodide();
            return pyodide;
        }
        const instance = createAndReturnPyodideInstance()
        setPyodideInstance(instance)
    }, [])


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


            let pythonOutput = pyodide.runPython(pythonCode).toJs({ depth: 1 })

            return pythonOutput
        }

        const updatedOutputJSON = [...outputJSON].map((eachObj, index) => {
            if (eachObj.c_options.length === 0) {
                let codeOutput = getPythonOutput(eachObj.code)
                eachObj.c_options = isNaN(Number(codeOutput)) ? codeOutput : Number(codeOutput)
            }
            return eachObj
        })

        setOutputJson(updatedOutputJSON)
    }

    const onCopyCode = () => {
        setIsCopied(true)
    }

    return (
        <>
            <form id="form" method="post">
                <textarea name="input" rows="20" cols="80" defaultValue={JSON.stringify(initialData)} />
                <br />
                <button type="submit">Generate</button>
            </form>
            {actionData?.outputJSON &&
                <>
                    <button type="button" onClick={() => evaluatePython(actionData?.outputJSON)}>Evaluate Python Outputs</button>
                    {outputJson.length > 0 && <>
                        <ReactJson src={outputJson} />
                        <CopyToClipboard text={JSON.stringify(outputJson)}
                            onCopy={onCopyCode}>
                            {isCopied ? <span>Copied</span> : <button>Copy to clipboard</button>}
                        </CopyToClipboard>
                    </>}

                </>}
        </>
    )
}

