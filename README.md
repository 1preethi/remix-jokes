## Components

1. MCQ concept mapper
   - Problem: Improving better UX for MCQ concept mapper instead of uploading jsons
2. MCQ Builder
3. MCQ session builder
4. MCQ pool session builder
5. MCQ previewer
6. MCQ Review
7. MCQ Dashboard
8. MCQ Analyze

How to integrate checklists, procedure docs in dashboard

- Question format support in mcq builder

## MCQ Pool Builder

### Features

### Other Todos in MCQ Pool Builder:

1. Pool by format
2. Live editing
3. Giving suggestions for question text -> write snippets as folder and files based on language type. e.g. python.json
4. User defined ordered data - especially for boolean questions
5. Add support for giving code in multiple languages - generate code editor for each language
6. Add metadata as input
7. File as Input

### Versions

#### Pseudo code - Version 1

```
// user inputs

// code string
// input variables and their types
  // Number with range
  // letter with range
// tag_name string
// question_text string
// Total number of question variants

// Step - 1: Data generation
var data = {
  inputs: [
    {
      input_a: 1,
      input_b: 5,
      input_c: 10
    },
    {
      input_a: 2,
      input_b: 5,
      input_c: 11
    }
  ],
  tag_name: "topic",
};

// Step - 2: Template generation

var template = {
  "{{#each inputs}}": {
    question_text: {
      content: "The given Python Code snippet will print {{this.input_c}} as output",
    },
    code: "print ({{this.input_a}}*{{this.input_b}})",
    tag_name: data.tag_name,
    c_options: ["1. Run using python shell"],
      w_options: [],
  }
}

// Step 3: Populate Correct option
// Step 4: JSON output viewer
```

#### Version 2

- Add other templates - coptions, woptions
- Add support for custom list as input type
- Add support for giving code in multiple languages - generate code editor for each language
- Add topic name and broad level topic name as optional keys
- Add the above points in readme.md

#### Version 3

- Add context for string type
- Remove quotes for string - done
- Configuration previewer always should be at right
- ace code editor
- Add validating python o/p for coptions and woptions as template
- Remove Evaluate python button
- Add question id - generate at last step (output json)
- Add concept and broad level concept and variant names as inputs.
- Validation rule: variant name should always be concept_1,2..

#### Version 4

- evaluate only - > code non-empty
- After validate, error message should be shown in ui
- Dynamic Input Variables
- UI change - paddings
- Publishing a package with name @nw/content-utils
- Using vite as bundler

#### Version 5

- UI Changes
- Float as Context type with decimal input
- Updating content jsons in the given format (based on the MCQ Type)
- Adding MCQ Builder - For default questions - with content JSON as output
- Template JSON also be given to copy

#### Version 6

- While previewing questions, add keyup and keydown support with click
- Convert prod to template JSON
- When given template id, it should be prefilled with the question fields (MCQ Pool Builder with prefilled inputs)
- MCQ Review - For adding comments

**Tasks:**

Task: Add keyup and keydown support in tf-python-courseware

<!-- Task: Write script to convert prod json to template json in tf-python-courseware -->

Task: MCQ Templates Editor
Sub tasks:

- Uploading templates json
- Show template ids by filtering in the select element
- Prefill the question data in MCQ pool builder from templates json uploaded
- Can update the question data and click proceed - show inputs prefilled from templates json
- When clicked generate, show updated content json, templates json, and pool json

Build:

- Upload templates json, prod json in two file uploads respectively
- Not disabling proceed
- Add form validations - didn't do (I think not needed - ask RP)

Task: MCQ Review

Sub tasks:

- Form
  - File upload (templates json / content json)
  - Sheet Name (Google Sheets)
  - Sub sheet name
  - To person
- MCQ previewer with keyup and keydown support
- Each Question should have comments
- Should have 2 buttons - Add Comment, Save
- By clicking Add comment, Reviewer can add comments on a specific question
- By clicking Save, comments are stored in google sheets
- When opened specific question,
  - Get Comments of the particular question
  - Each comment should have Mark as Resolved button
- When clicked Mark as Resolved, comments should be removed in UI, Status should be changed to done

Build:

Third-party packages:

- MCQ Previewer : components - mcq preview playground
- Comments
- MCQ Auth (Support Google Auth, username and password)

- Integrate both third-party packages and use it in mcq preview playground
- Auth utils

Explore:

```
 private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDQRXXbVaYsPHDP\nQuSpqpIVvjalNR6n/aQkupBf+IPbSDRz6ZST21ulu9kSonH6y9vWUlXc1zw+01uw\njcyeboe7yDrVE9K57rTcgw52GDNheHucj5NPaVHNaCCtD/mtvKFtZtA2N8Kd/vSZ\noC8ZKC3wLMTKffANOtuWQoEir47lxOmEtoekhhe+9ElI6e77AqtbH6bUi0YWY4La\nXYuzTSkOXolpKUb7dzZDUqGojPG3WasmhrsMP4isDm0VY3ltnNkJydwY9WGkl/yo\n5fn5v2k4wMqvgzZ2ngesy0yB4YrNQ2I2hYUfjceoSk4KjOCOR3vr4xYFPI8ZHnkD\nuXCLNrUNAgMBAAECggEAUiCB2ArPKzRuO5yiNLF5R6+pNr5ap13ig0U6N031GNxB\nKtAZ8bAXVKRddfauwXnv53SyPRJ2xENuLZHM9VCan5bWdD2L5BvYH/hiFHl4kWAE\nRnlrWm4qfrgn4nahOzxd35kiU67rRIhMBeRfjikE7GeK9lpw9ZaXDoqNB5N44uts\nFz4EuHypScqr0c3XnoIi9aS7FtzoFIQjykH5/9cB2l3gJ+yYrWDGqOYT5SAb8iXG\n0gQ82kXrNSMVm4Rtch6VJ3iGMSPJHBqQlxc2YxKW42KB7aGmtEK+tDjgh7mF1icp\noe+1zLdyVdpdKJ7I+GeYZKJ+pHFPnJTkCbmjvlNctQKBgQDprnvBXEBMiZTuVSQB\nyG9/xH/baqU55O7NL/dCmM4XdVCmaSVZLk9DbJv2LFWozZA7n13JsNbTyzbG8wFL\n+4XvYzM/cdBxmxWdGLtc27ZcjxjrzD5pOtKdwRH/KBlhsoCgNaAIELsr8jtAbwPf\n86uAm/1P0fsHUj+Lh6m5uZUnOwKBgQDkKbI7I1biQVRS6e4SPg7uSttDRSCxCMUX\n8t+671DwjsjRLmM8+uW3hmYHA64YqKDNOwgvX4/XHMarkdownNIjGpKyoZrOAq08nSSM/qM+JzV7BSx3Ak0urJk4EMJqyAdQajLAwTAA9sE0ZjC\nYKVo4SUn68eL1jnY5SDjDOW26l4UAWGAGjMDs+sCgYEA6U/CfBhaKmb8msq8egsn\n61xmjpo0DvNbNDGNXBnyMARvnnPcSZB3RRvjELrXCnIRF5jnjaKtKUnWoA9hW4Qg\nAA3djGf+ArG3DoWWZqOyo9aHuM3OpFJWkXEwjBT4vshbsnEebWCZXnGRlA269v+M\niP/M74zvpY2riB2uch/pqLE=\n-----END PRIVATE KEY-----\n",
client_email: "mcqbot@mcq-comments-db.iam.gserviceaccount.com",
clientID: "833628123842-i3tpceems3gjqa7gd65i6csn65dq547m.apps.googleusercontent.com",
clientSecret: "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",
```

Using Spreadsheet as db:

- https://github.com/theoephraim/node-google-spreadsheet
- https://devtools.tech/blog/add-social-authentication-to-remix-run-project-or-remix-server---rid---GEN4IbgWorJNeQL7Gkm8

Doubts:

- Sheet/ sub sheet will be created if the given names are not found in google sheets
- What if the sheet is filled with few rows/ columns - Do we need to add comments after filled rows
- When updating in sheets,
  - can we have mcq question key as one row and the the comments on question will be on the next rows?
  - or create columns as question key
- Sheet has only 3 / 4 columns
  - Issue, Status, Issue Reported by, Issue Reported to

Roles:

L1: Interns
L2: Beta -1 Reviewers - Taking care of Interns
L3: Gamma Reviewers

#### Version 7

- Support for Markdown, HTML, code, comments (text editor) - Using third-party package (Lexical)

Others by me:

- Markdown support
- Images in Question Text

**Structure:**

Core:

Format of the data taking from user and validating the user data.

- Maintaining fields and validation utils as properties and methods in javascript/typescript classes

Our case:

- Template Options: Pass all the input fields value to class
- Template Creation: creating a template

Returns an object.

Remix/UX:

UI:

Struckups:

- How to use one form data in another form data - action
- Form post submission does not retain search parameters

Insights:

- Write Server Files
- Structuring Nested Routes

<!--
**MCQ Review Features**:

- Can authorize
- Show the list of review input sheets
- Show the list of subsheets to the selected sheet
- Can Upload Portal JSON / templates JSON
- Can add the reported to for review input
- When submitted, view the mcq previewer

MCQ Previewer:

- See the list of question_ids in the set
- When the question_id link is clicked, can see the question details
  - Can see question_key, tag names, correct options, wrong option, question text

Comments:

- Can view the comments of a particular clicked question
- Can add comment to a particular question and can view the newly added comment
- Can Edit the comment of a particular clicked question
-  Can delete the comment of a particular clicked question
- Can click the mark as resolved to a particular question -->

### User Stories of MCQ Review:

- As a reviewer, I want to login with the Google so that the system can authenticate me and I can trust it.

  - Given that I am reviewer and not logged in, When I go to MCQ Review Page, then I should be redirected to login page
  - Given that I am reviewer and not logged in, When I go to MCQ Review Page, then I should see the option to login with Google
  - Given that I am reviewer and not logged in, When I click the Login with Google button, then I should see the gmail addresses and can also add another account to login
  - Given that I am reviewer and not logged in, When I click the valid gmail address to sign in with Google, then I should go to sheets page
  - Given that I am reviewer and not logged in, When I click the valid gmail address to sign in with Google, then I should see the list of review input sheets

- As a reviewer, I want to see the list of review input sheets so that I can write the review inputs in particular sheet
  - Given that I am reviewer and logged in, when I click one of the review input sheets, I should go to corresponding sheet subsheets page
  - Given that I am reviewer and logged in, when I click one of the review input sheets, I should see the list of subsheets of a particular clicked sheet

- As a reviewer, I want to see the list of subsheets of the selected review input sheet so that I can write the review inputs in particular sheet at particular subsheet
  - Given that I am reviewer and logged in, when clicked one of the subsheets, I should see the form to fill the json or review details

- As a reviewer, I want to upload the portal json so that I can review the questions and options in portal json
- As a reviewer, I want to add the reported to person name so that the respective person can see their review inputs

  - Given that I am reviewer and logged in, when filled the invalid json, review details and submitted, I should see the error message that "Please upload the valid json file"
  - Given that I am reviewer and logged in, when filled both the portal json, template json and review details and submitted, I should see the error message that "Please upload only one file"
  - Given that I am reviewer and logged in, when filled the json, review details and submitted, I should go to submitted json's page (with type of json in url - either template or portal)
  - Given that I am reviewer and logged in, when filled the json, review details and submitted, I should see the list of question ids in uploaded json
  - Given that I am reviewer and logged in, when filled the json, review details and submitted, I should see the number of unresolved comments beside question ids of uploaded json

- As a reviewer, I want to see the list of question ids so that I can select the particular question to preview

  - Given that I am reviewer and filled all the details to review, when clicked one of the question ids, I should go to particluar question page
  - Given that I am reviewer and filled all the details to review, when clicked one of the question ids, I should see the question id higlighted
  - Given that I am reviewer and filled all the details to review, when clicked one of the question ids, I should see the question id higlighted
  - Given that I am reviewer and filled all the details to review, when clicked one of the question ids, I should see the details of a particular clicked question

- As a reviewer, I want to see the question details of a question so that I can see question text, tag names, options (correct and wrong options)
  - Given that I am reviewer, when clicked a question id, I should see the question key, id and tag names with comma separated
  - Given that I am reviewer, when clicked a question id, I should see the question text in readable format (without HTML and markdown syntax)
  - Given that I am reviewer, when clicked a question id, I should see the options (correct and wrong options) in readable format (without HTML and markdown syntax)
  - Given that I am reviewer, when clicked a question id, I should see the options (correct and wrong options) in table
  - Given that I am reviewer, when clicked a question id, I should see the explanation in readable format (without HTML and markdown syntax)
  - Given that I am reviewer, when clicked a question id, I should see the list of comments of a particular question
  - Given that I am reviewer, when clicked a question id and uploaded another json file, I should be redirected to uploaded jsons page //TODO: check

- As a reviewer, I want to see the list of comments added to the question so that I can see the list of comments added
  - Given that I am reviewer, when clicked the question id, I should see the two tabs for showing only question comments and All comments
  - Given that I am reviewer, when clicked the question id, I should see the comments of a particular clicked question by default
  - Given that I am reviewer, when clicked the question id, I should see the checkbox with "Show Unresolved only" for showing only unresolved comments (in All comments and question specific comments)
  - Given that I am reviewer, when clicked the question id, I should see the each comment with Edit, Delete, Mark as resolved buttons

- As a reviewer, I want to see the comments of all questions so that I can see the all comments consolidated without clicking on each question to view comments
  - Given that I am reviewer, when clicked the question id and "All" Tab button, I should see the list of comments of all questions

- As a reviewer, I want to see only unresolved comments of all questions so that I can see only the comments which the developers have to resolve
  - Given that I am reviewer, when clicked the question id, "All" Tab button and checked the "Show Unresolved only", I should see the unresolved comments from all questions
  - Given that I am reviewer, when clicked the question id, "All" Tab button and checked the "Show Unresolved only" and unchecked the "Show Unresolved only", I should see all the resolved and unresolved comments

- As a reviewer, I want to add a comment to the question so that I can add comment if there is any mistake/ improvement in content
  - Given that I am reviewer, when clicked the Add Comment button, I should see the error message that "Comment shouldn't be empty"
  - Given that I am reviewer, when clicked the Add Comment button, I shouldn't see the empty comment in list of comments
  - Given that I am reviewer, when filled the comment and clicked Add Comment button, I should see the new comment in the list of comments

- As a reviewer, I want to edit the comment so that I can edit the comment if there is any change should be made to the comment
  - Given that I am reviewer, when clicked the edit button, I should see the text area with the prefilled comment, save and cancel buttons
  - Given that I am reviewer, when clicked the edit and updated the comment in text area and clicked Save button, I should see the updated comment
  - Given that I am reviewer, when clicked the edit and cancel buttons, I should see the previous comment
  - Given that I am reviewer, when clicked the edit and save/cancel buttons, I should see only the edit button, save and cancel buttons shouldn't be displayed


- As a reviewer, I want to delete the comment so that I can delete the comment if the comment is not needed anymore
  - Given that I am reviewer, when clicked the delete button, I shouldn't see the deleted comment in the list of comments

- As a developer, I want to resolve the comment so that I can mark the comment as complete
  - Given that I am reviewer, when clicked the Mark as resolved button, Mark as Resolved should be changed to Unresolve button


