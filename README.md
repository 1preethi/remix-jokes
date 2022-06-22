## Components

1. MCQ concept mapper
    - Problem: Improving better UX for MCQ concept mapper instead of uploading jsons
2. MCQ Builder
3. MCQ session builder
4. MCQ pool session builder
5. MCQ previewer

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


