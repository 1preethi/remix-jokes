import { ActionFunction, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/node";
import { Form, Link, Outlet, useActionData, useLoaderData, useLocation } from "@remix-run/react";
import { useEffect, useState } from "react";
import Comments from "~/components/comments";
import McqPreviewer from "~/components/mcqPreviewer";
import ResponsiveContainer from "~/components/responsiveContainer";
import { authenticator } from "~/utils/auth.server";
import { SocialsProvider } from "remix-auth-socials";
import { GoogleSpreadsheet } from '~/utils/spreadsheet.server';
//import "dotenv/config";

const sheetId = "15qGC0V9rb3o5MuPlfdgkfZ3UU49HxR2WBVmpdIOZM6w"
const subsheetName = "Index"

class McqReviewContent {
    constructor(templateJson, contentJson, sheetId, subsheetName, reportedTo) {
        this.templateJson = templateJson;
        this.contentJson = contentJson;
        this.sheetId = sheetId;
        this.subsheetName = subsheetName
        this.reportedTo = reportedTo
    }
}


export const loader = async ({ params }) => {

    const { sheetId, subsheetId } = params

    return { sheetId, subsheetId }
};

// export const action: ActionFunction = async ({
//     request,
// }) => {

//     const uploadHandler = unstable_createMemoryUploadHandler({
//         maxPartSize: 500_000,
//     });
//     const formData = await unstable_parseMultipartFormData(
//         request,
//         uploadHandler // <-- we'll look at this deeper next
//     );

// }


export default function Questions() {

    const { sheetId, subsheetId } = useLoaderData();

    // const [activeQuestionKey, setActiveQuestionKey] = useState("")

    const [fileReader, setFileReader] = useState()

    const [contentJson, setContentJson] = useState([])
    const [templateJson, setTemplateJson] = useState([])
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

    // const updateQuestionKey = (key) => {
    //     setActiveQuestionKey(key)
    // }

    const onSubmitReviewContent = (event) => {
        const mcqReviewContent = createMcqReviewContentTemplate(templateJson, contentJson, sheetId, subsheetName, reportedTo)
        setMcqReviewContent(mcqReviewContent)
    }

    // const onChangeSheetId = (event) => {
    //     setSheetId(event.target.value)
    // }
    // const onChangeSubsheetName = (event) => {
    //     setSubsheetName(event.target.value)
    // }

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
                <div>
                    <div>
                        <label>Upload Content JSON</label>
                        <input id="contentUpload" type="file" name="contentJsonFile" size="30" onChange={onChangeContentJsonFile} />
                    </div>
                    <div>
                        <label>Upload Templates JSON</label>
                        <input id="templateUpload" type="file" name="templateJsonFile" size="30" onChange={onChangeTemplateJsonFile} />
                    </div>
                    <input name="reportedTo" value={reportedTo} onChange={onChangeReportedTo} />
                    <button type="button" onClick={onSubmitReviewContent}>Submit</button>
                </div>
                <div>
                    <McqPreviewer sheetId={sheetId} subsheetId={subsheetId} templateJson={mcqReviewContent?.templateJson} contentJson={mcqReviewContent?.contentJson} />
                </div>
            </ResponsiveContainer>
            {/* <Form
                    method="post"
                    action={`/auth/${SocialsProvider.GOOGLE}`}
                >
                    <button>Login with Google</button>
                </Form> */}
        </>

    )

}