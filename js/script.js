// pane elements
const rightPane = document.getElementById('right-pane')
const leftPane = document.getElementById('left-pane')
// const questionForm = document.getElementById('right-pane').getElementsByTagName('form').item(0)
// TODO: add other panes here

// button and input elements
// TODO: add button/input element selectors here

/* Returns the questions stored in localStorage. */
function getStoredQuestions() {
  if (!localStorage.questions) {
    // default to empty array
    localStorage.questions = JSON.stringify([])
  }

  return JSON.parse(localStorage.questions)
}

/* Store the given questions array in localStorage.
 *
 * Arguments:
 * questions -- the questions array to store in localStorage
 */
function storeQuestions(questions) {
  localStorage.questions = JSON.stringify(questions)
}

// display question form initially
let qForm = renderQuestionForm()
addQuestionSubmitListener(qForm)
rightPane.appendChild(qForm)

// add event listener for clicking new question form
document.querySelector("#interactors .btn").addEventListener('click', function(){
  while (rightPane.firstChild) {
    rightPane.removeChild(rightPane.firstChild);
  }
  let result = renderQuestionForm()
  addQuestionSubmitListener(result)
  rightPane.appendChild(result)
});


// submit button event listener, creates a new question from form 
// then adds it to the list of stored questions in local storage, adds click listeners
// and re-renders
function addQuestionSubmitListener(qForm){
  qForm.addEventListener('submit', event =>{
    event.preventDefault()

    let subject = qForm.querySelector("input[name='subject']").value;
    let question = qForm.getElementsByTagName("textarea").item(0).value;
    let newQuestion = {
      subject: subject,
      question: question,
    };
    newQuestion.id = Math.floor(Math.random() * 101);
    newQuestion.responses = [];

    let questionsArray = getStoredQuestions();
    questionsArray.push(newQuestion);
    
    let element = renderQuestions(questionsArray);

    while (leftPane.firstChild) {
      leftPane.removeChild(leftPane.firstChild);
    }

    addListeners(element);

    leftPane.appendChild(element);

    document.getElementById("question-form").reset();
    storeQuestions(questionsArray)
    
  });
}
  
// On load we want to render the questions in storage and add search bar event listener
this.window.onload = function() {
  let questions = getStoredQuestions();
  let elements = renderQuestions(questions);
  addListeners(elements)
  leftPane.appendChild(elements);

  const searchBar = document.querySelector('#search')
  // if the search term is empty display all, else rerender questions 
  // containing substring
  searchBar.addEventListener("keyup", event => {
    if (searchBar.value !== ""){
      let questions = getStoredQuestions();
      
      questions = questions.filter(q => {
        if (q.question.toLowerCase().includes(searchBar.value) || q.subject.toLowerCase().includes(searchBar.value)){
          return true
        }
      });

      let elements = renderQuestions(questions);
      while (leftPane.firstChild) {
        leftPane.removeChild(leftPane.firstChild);
      }
      addListeners(elements)
      leftPane.appendChild(elements);
    } else{
      let questions = getStoredQuestions();
      let elements = renderQuestions(questions);
      while (leftPane.firstChild) {
        leftPane.removeChild(leftPane.firstChild);
      }
      addListeners(elements)
      leftPane.appendChild(elements);
    }

  })
};
// listeners for each left pane question to be clickable,
// rendering expanded view if clicked
const addListeners = function(elements){
  qInfos = elements.getElementsByClassName('list-question question-info')
  for (let i = 0; i < qInfos.length; i ++){
    qInfos[i].addEventListener('click', function(){
      let id = qInfos[i].id;
      let storedQ = getStoredQuestions();
      let selectedQuestion = getByID(storedQ,id);
      expandedViewElem = renderExpandedQuestion(selectedQuestion);
      expandedViewElem.id = id
      while (rightPane.firstChild) {
        rightPane.removeChild(rightPane.firstChild);
      }
      addResponseListener(expandedViewElem);
      addResolveListener(expandedViewElem);
      rightPane.appendChild(expandedViewElem);
    });
  }
}
// function for getting question by id
const getByID = function(storedQ, id){
  for (let i = 0; i < storedQ.length;i++){
    if (storedQ[i].id == id){
      return storedQ[i]
    }
  }
}
// This is the listener for clicking on the resolve, it deletes
// active question from storage and rerenders left pane
const addResolveListener = function(expandedViewElem){
  let resolveButton = expandedViewElem.querySelector(".resolve")
  let id = expandedViewElem.id
  resolveButton.addEventListener('click', function(){
    // delete the element from storage
    let questions = getStoredQuestions();
    for (let i = 0; i < questions.length; i++){
      if (questions[i].id == id){
        questions.splice(i, 1);
      }  
    }
    storeQuestions(questions)
    // rerender element
    let elements = renderQuestions(questions);
    addListeners(elements)
    while (leftPane.firstChild) {
      leftPane.removeChild(leftPane.firstChild);
    }
    leftPane.appendChild(elements);

    // render new question form
    while (rightPane.firstChild) {
      rightPane.removeChild(rightPane.firstChild);
    }
    let result = renderQuestionForm()
    addQuestionSubmitListener(result)
    rightPane.appendChild(result)

  });
}
// Add listener for response button, on submit, it will create a new 
// response object which then gets added to storage, 
// rerendered in right pane
const addResponseListener = function(expandedViewElem){
  let rForm = expandedViewElem.querySelector("#response-form");
  let id = expandedViewElem.id;

  rForm.addEventListener('submit', event => {
    event.preventDefault();

    let name = rForm.querySelector("input[name='name']").value;
    let response = rForm.getElementsByTagName("textarea").item(0).value;
  
    let responseObj = {
      name: name,
      response: response
    }

    let storedQ = getStoredQuestions()
    let selectedQuestion = getByID(storedQ,id);
    let index = storedQ.indexOf(selectedQuestion)

    selectedQuestion.responses.push(responseObj);
    storedQ[index] = selectedQuestion
    storeQuestions(storedQ)
    addExpandedToDOM(selectedQuestion,id);
    rForm.reset()
  });
}
// function to add expanded view to the dom, reattaching 
// listeners to resolve and response buttons, this is to 
// address the issue of deleting listeners when rerendering
function addExpandedToDOM(selectedQuestion,id){
  expandedViewElem = renderExpandedQuestion(selectedQuestion);
  expandedViewElem.id = id
  while (rightPane.firstChild) {
    rightPane.removeChild(rightPane.firstChild);
  }
  addResponseListener(expandedViewElem);
  addResolveListener(expandedViewElem);
  rightPane.appendChild(expandedViewElem);
}
