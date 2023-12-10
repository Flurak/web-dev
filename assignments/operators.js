let allStudents = ["A", "B-", "C-", 1, 4, 5, 2];

let studentsWhoPass = [];
//for loop to go through each element in the array
for (let i = 0; i < allStudents.length; i++) {
  //get the current grade and store it
  let grade = allStudents[i];

  if (
    (typeof grade === "number" && grade >= 3) || //check if the grade is higher than or equal to 3
    (typeof grade === "string" && grade !== "C-") //check if the string does not contain a 'C-' grade
  ) {
    //if the grade passes the checks it will be passed to the studentsWhoPass array
    studentsWhoPass[studentsWhoPass.length] = grade;
  }
}

console.log(studentsWhoPass);
