let user_details = document.getElementById("details");
let loginbtn = document.getElementById("loginbtn");
let user_name = document.getElementById("name");
let user_email = document.getElementById("email");
let Errormsgname = document.getElementById("errorname");
let Errormsgemail = document.getElementById("erroremail");
let logincontainer = document.getElementById("logincontainer");
let displayname = document.getElementById("displayname");
let score = document.getElementById("score");
let customselection = document.getElementById("customselection");
let quizcontainer = document.getElementById("quizcontainer");
let taketest = document.getElementById("taketest");
let numberofquestions = document.getElementById("numberofquestions");
let difficulty = document.getElementById("difficulty");
let subject = document.getElementById("subject")
let nextBtn = document.getElementById("nxtbtn");
let questionscontainer = document.getElementById("questionscontainer");
let optionscontainer = document.getElementById("optionscontainer");

let question_no = 0
let userscore = 0
let answering_questions = []

function nextquestion() {
    if (question_no < answering_questions.length - 1) {
        question_no++;
        displayquestion();
    } else {
        questionscontainer.innerHTML = `<h2 class="text-center text-[24px] font-bold text-green-600">Quiz Completed!</h2>
            <p class="text-center text-[20px]">Your Score: ${userscore} / ${answering_questions.length}</p>`;

    }
}


function displayquestion() {
    console.log(answering_questions)
    optionscontainer.textContent = "";
    questionscontainer.textContent = "";

    quizcontainer.classList.remove("hidden");
    customselection.classList.add("hidden");
    logincontainer.classList.add("hidden");
    let questionssubcontainer = document.createElement("div");
    questionssubcontainer.classList.add("bg-white", "rounded-[10px]")
    let question_display = document.createElement("p");
    question_display.textContent = answering_questions[question_no].question;
    console.log(answering_questions[question_no].question);
    question_display.classList.add("text-black", "text-[20px]", "font-[breeserif]", "mb-3");
    questionssubcontainer.classList.add("p-2")
    questionssubcontainer.appendChild(question_display);
    questionscontainer.appendChild(questionssubcontainer);
    let wrong_options = answering_questions[question_no].incorrect_answers;
    let correct_answers = answering_questions[question_no].correct_answer;
    let options = wrong_options.concat(correct_answers);
    let nextBtn = document.getElementById("nxtbtn");
    for (let i of options) {
        let btncontainer = document.createElement("div");
        btncontainer.classList.add("w-full", "flex", "justify-center");

        let optionbtn = document.createElement("button");
        optionbtn.textContent = i;
        optionbtn.classList.add(
            "bg-gray-200", "text-black", "font-semibold", "px-4", "py-2", "rounded-lg",
            "hover:bg-blue-500", "hover:text-white", "transition-all", "duration-300",
            "w-full", "max-w-[300px]", "shadow-md", "mb-3"
        );


        // Add click effect (highlight selected button)
        optionbtn.addEventListener("click", function() {
            // Remove highlight from other options

            optionscontainer.querySelectorAll("button").forEach(btn => btn.disabled = true);
            if (optionbtn.textContent === answering_questions[question_no].correct_answer) {
                optionbtn.classList.add("bg-green-500", "text-white");
                optionbtn.classList.remove("bg-gray-200", "text-black");
                userscore++;

            } else {
                optionbtn.classList.add("bg-red-500", "text-white");
                optionbtn.classList.remove("bg-gray-200", "text-black");
            }
            score.textContent = "Score: " + userscore;


        });
        // Highlight selected option




        btncontainer.appendChild(optionbtn);
        optionscontainer.appendChild(btncontainer);
        questionssubcontainer.appendChild(optionscontainer);
    }




}








function getquestions(questions) {

    let questions_index = [];
    for (let i = 0; i < parseInt(numberofquestions.value); i++) {
        let random_number = Math.ceil(Math.random() * (parseInt(numberofquestions.value)));
        if (!(questions_index.includes(random_number))) {
            questions_index.push(random_number);
            answering_questions.push(questions[random_number]);
        }
    }
    displayquestion(answering_questions);

}



function fetchquestions() {
    let url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyArEUNEuoe_eGJ2WqW_No-UJB2VJN7oIO4";
    let prompt = `Generate a JSON array containing ${numberofquestions.value} multiple-choice quiz questions with ${difficulty.value} difficulty on the subject of ${subject.value}.

Each question should have:
- A "question" field with the question text.
- An "incorrect_answers" field with an array of 3 wrong answers.
- A "correct_answer" field with the correct answer.

### **STRICT REQUIREMENTS:**
1️⃣ Every question **MUST** be related to "${subject}".  
2️⃣ Do **NOT** include general knowledge questions unrelated to "${subject}".  
3️⃣ The response **MUST** be **valid JSON** (no extra text, no explanations).  
Format:
[
  {
    "question": "What is the capital of France?",
    "incorrect_answers": ["Berlin", "Madrid", "Rome"],
    "correct_answer": "Paris"
  },
  ...
]

Ensure that:
- Incorrect answers are plausible but wrong.
- The output is **valid JSON**.`
    let options = {
        method: "POST",
        headers: {
            'Content-Type': "application/json",
        },
        body: JSON.stringify({
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        })
    };
    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.candidates && data.candidates.length > 0) {
                getquestions(data.candidates[0].content.parts[0].text);
            } else {
                console.log("No response received.");
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
}

taketest.addEventListener("click", function() {
    let noofquestions = parseInt(document.getElementById("numberofquestions").value);
    let difficulty = document.getElementById("difficulty").value;

    if (!noofquestions || noofquestions <= 0 || noofquestions > 23) {
        alert("Please enter a valid number of questions (max 23)!");
        return;
    }
    if (!difficulty) {
        alert("Please select a difficulty level!");
        return;
    }

    fetchquestions();
});


user_details.addEventListener("submit", function() {
    event.preventDefault();

})




function typeoftest()

{
    customselection.classList.remove("hidden"); // Show difficulty selection
    logincontainer.classList.add("hidden");
    quizcontainer.classList.add("hidden");


}
loginbtn.addEventListener("click", function() {
    if (user_name.value !== "" && user_email.value !== "") {
        localStorage.removeItem("userdetails");
        let user_details = {
            name: user_name.value,
            email: user_email.value
        }
        localStorage.setItem("userdetails", JSON.stringify(user_details));
        let user_data = JSON.parse(localStorage.getItem("userdetails"));
        displayname.textContent = "Name: " + user_data.name
        typeoftest(user_details);
    }
})

user_name.addEventListener("blur", function() {
    if (user_name.value === "") {
        Errormsgname.textContent = "*required"
    } else {
        Errormsgname.textContent = "";
    }
})
user_email.addEventListener("blur", function() {
    if (user_email.value === "") {
        Errormsgemail.textContent = "*required"
    } else {
        Errormsgemail.textContent = "";
    }
})