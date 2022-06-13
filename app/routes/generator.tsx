// import type {
//     ActionFunction,
// } from "@remix-run/node";

// import { useActionData } from "@remix-run/react";
// import { Form } from 'remix';
// import { useFetcher } from "@remix-run/react";
// import React, { useState } from 'react';


// let dataTypes = [
//     'string', 'number'
// ]



// export const action: ActionFunction = async ({
//     request,
// }) => {

//     const formData = await request.formData();
//     const { _action, ...values } = Object.fromEntries(formData)

//     const { code, tagName, questionText, variantsCount } = values


//     if (_action === "generate") {

//         console.log(code, 'generate code')

//         return {
//             code,
//             tagName,
//             questionText,
//             variantsCount,
//             matchedElements: getMatchedElements(code)
//         }
//     }

//     if (_action === "generateData") {
//         console.log(code, 'generateData code')

//         let updatedMatchedElements = getMatchedElements(code).map(eachElement => {
//             if (eachElement.dataType === 'string') {
//                 return ({
//                     variable: values[`${eachElement.variable}variable`],
//                     dataType: values[`${eachElement.variable}dataType`],
//                     length: values[`${eachElement.variable}length`]
//                 })
//             }
//             else {
//                 return ({
//                     variable: values[`${eachElement.variable}variable`],
//                     dataType: values[`${eachElement.variable}dataType`],
//                     length: values[`${eachElement.variable}length`],
//                     minNumber: values[`${eachElement.variable}minNumber`],
//                     maxNumber: values[`${eachElement.variable}maxNumber`],
//                 })
//             }
//         })

//         console.log(updatedMatchedElements, 'updated')
//         return null
//     }
// }



// const renderRange = (element) => {

//     const dataType = element?.dataType

//     switch (dataType) {
//         case 'string':
//             return (
//                 <input name={`${element.variable}length`} />
//             )

//         case 'number':
//             return (
//                 <>
//                     <input name={`${element.variable}min`} />
//                     <input name={`${element.variable}max`} />
//                 </>
//             )

//     }
// }





// export default function Generator() {
//     const actionData = useActionData<ActionData>();
//     const [code, setCode] = useState("")
//     const [tagName, setTagName] = useState("")
//     const [questionText, setQuestionText] = useState("")
//     const [variantsCount, setVariantsCount] = useState(0)
//     const [isGenerated, setIsGenerated] = useState(false)
//     const [variables, setVariables] = useState([])

//     const onChangeCode = (event) => { setCode(event.target.value) }
//     const onChangeTagName = (event) => { setTagName(event.target.value) }
//     const onChangeQuestionText = (event) => { setQuestionText(event.target.value) }
//     const onChangevariantsCount = (event) => { setVariantsCount(event.target.value) }

//     const getVariableNames = () => {
//         const regexp = /\{{.*?\}}/g;

//         let variableNames = code.match(regexp).map(eachElem => {
//             let string = eachElem.replace("{{", "");
//             string = string.replace("}}", "");
//             return string.trim()
//         });

//         return variableNames
//     }

//     const onGenerateTemplateVariables = () => {
//         setIsGenerated(prevIsGenerated => !prevIsGenerated)

//         const updatedVariables = getVariableNames.map(eachVariableName => ({
//             variableName: eachVariableName,
//             dataType: 'string'
//         }))
//         setVariables(updatedVariables)
//     }

//     return (
//         <form method="POST">
//             <textarea name="code" onChange={onChangeCode} />
//             <input name="tagName" onChange={onChangeTagName} />
//             <input name="questionText" onChange={onChangeQuestionText} />
//             <input name="variantsCount" type="number" onChange={onChangevariantsCount} />
//             <button type="button" onClick={onGenerateTemplateVariables}>Generate Template Variables</button>

//             {
//                isGenerated && {
//                    variables.map(eachVariableObj => )
//                }
//             }
//                 {actionData?.matchedElements.map((eachElem, index) => {
//                     return (
//                         <>
//                             <input name={`${eachElem.variable}variable`} />
//                             <select name={`${eachElem.variable}dataType`}>
//                                 {dataTypes.map(eachDataType => <option value={eachDataType}>{eachDataType}</option>)}
//                             </select>
//                             {renderRange(eachElem)}
//                         </>
//                     )
//                 })}
//                 <button type="submit" name="_action" value="generateData">Generate Data</button>
//             </form>
//         </form>

//     );
// }




export default function Generator(){
    

}