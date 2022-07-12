import { ActionFunction, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import Comments from "~/components/comments";
import McqPreviewer from "~/components/mcqPreviewer";
import ResponsiveContainer from "~/components/responsiveContainer";
import { authenticator } from "~/utils/auth.server";

class McqReviewContent {
    constructor(templateJson, contentJson, sheetId, subsheetName, reportedTo) {
        this.templateJson = templateJson;
        this.contentJson = contentJson;
        this.sheetId = sheetId;
        this.subsheetName = subsheetName
        this.reportedTo = reportedTo
    }
}

export const loader = async ({ request }) => {
    // authenticator.isAuthenticated function returns the user object if found
    // if user is not authenticated then user would be redirected back to homepage ("/" route)
    const user = await authenticator.isAuthenticated(request, {
        failureRedirect: "/mcq-review/login",
    });

    return {
        user,
    };
};

export const action: ActionFunction = async ({
    request,
}) => {

    const uploadHandler = unstable_createMemoryUploadHandler({
        maxPartSize: 500_000,
    });
    const formData = await unstable_parseMultipartFormData(
        request,
        uploadHandler // <-- we'll look at this deeper next
    );


    return ("preethi")

}

export default function McqReviewPlayground() {
    const { user } = useLoaderData();

    console.log(user, 'user')

    const [activeQuestionKey, setActiveQuestionKey] = useState("")

    const [fileReader, setFileReader] = useState()

    const [contentJson, setContentJson] = useState([])
    const [templateJson, setTemplateJson] = useState([])
    const [sheetId, setSheetId] = useState("1WpZhSD9_bXm1whI6ooc23wAqYumEaGiS7WwwDzlScZ8");
    const [subsheetName, setSubsheetName] = useState("Patterns")
    const [reportedTo, setReportedTo] = useState("preethi")
    const [mcqReviewContent, setMcqReviewContent] = useState({})

    const createMcqReviewContentTemplate = (templateJson, contentJson, sheetId, subsheetName, reportedTo) => {
        const mcqReviewContent = new McqReviewContent(templateJson, contentJson, sheetId, subsheetName, reportedTo)
        return mcqReviewContent
    }

    useEffect(() => {
        const reader = new FileReader()
        setFileReader(reader)
    }, [])

    const updateQuestionKey = (key) => {
        setActiveQuestionKey(key)
    }

    const onSubmitReviewContent = (event) => {
        event.preventDefault()
        const mcqReviewContent = createMcqReviewContentTemplate(templateJson, contentJson, sheetId, subsheetName, reportedTo)
        setMcqReviewContent(mcqReviewContent)
    }

    const onChangeSheetId = (event) => {
        setSheetId(event.target.value)
    }
    const onChangeSubsheetName = (event) => {
        setSubsheetName(event.target.value)
    }
    const onChangeReportedTo = (event) => {
        setReportedTo(event.target.value)
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

    const onChangeContentJsonFile = async (event) => {
        const { files } = event.target
        const file = files[0]
        let jsonContent = await getJSONFileContent(file)
        setContentJson(jsonContent)
    }

    const onChangeTemplateJsonFile = async (event) => {
        const { files } = event.target
        const file = files[0]

        let jsonContent = await getJSONFileContent(file)
        setTemplateJson(jsonContent)
    }

    return (
        <>
            <p className="app-sub-heading">MCQ Review</p>
            <ResponsiveContainer>
                <form encType="multipart/form-data" onSubmit={onSubmitReviewContent}>
                    <div>
                        <label>Upload Content JSON</label>
                        <input id="contentUpload" type="file" name="contentJsonFile" size="30" onChange={onChangeContentJsonFile} />
                    </div>
                    <div>
                        <label>Upload Templates JSON</label>
                        <input id="templateUpload" type="file" name="templateJsonFile" size="30" onChange={onChangeTemplateJsonFile} />
                    </div>
                    <input name="sheetId" value={sheetId} onChange={onChangeSheetId} />
                    <input name="subsheetName" value={subsheetName} onChange={onChangeSubsheetName} />
                    <input name="reportedTo" value={reportedTo} onChange={onChangeReportedTo} />
                    <button>Submit</button>
                </form>
                <div>
                    <McqPreviewer templateJson={mcqReviewContent?.templateJson} contentJson={mcqReviewContent?.contentJson} activeQuestionKey={activeQuestionKey} updateQuestionKey={updateQuestionKey} />
                    <Comments activeQuestionKey={activeQuestionKey} sheetId={sheetId} subsheetName={subsheetName} reportedTo={reportedTo} />
                </div>
            </ResponsiveContainer>
        </>

    )

}


// export default function McqReviewPlayground() {

//     const actionData = useActionData<ActionData>();

//     console.log(actionData, 'action data')


//     return (
//         <>
//             <p className="app-sub-heading">MCQ Review</p>
//             <ResponsiveContainer>
//                 <form encType="multipart/form-data" method="GET">
//                     <div>
//                         <label>Upload Content JSON</label>
//                         <input id="contentUpload" type="file" name="contentJsonFile" size="30" />
//                     </div>
//                     <div>
//                         <label>Upload Templates JSON</label>
//                         <input id="templateUpload" type="file" name="templateJsonFile" size="30" />
//                     </div>
//                     <input name="sheetId" value="sheetId" />
//                     <input name="subsheetName" value="subSheetName" />
//                     <input name="reportedTo" value="reportedTo" />
//                     <button>Submit</button>
//                 </form>
//                 {JSON.stringify(actionData)}
//             </ResponsiveContainer>
//         </>

//     )

// }