// A function that returns something

// creating a function with 2 parameters: 'a and b'
function sum(a, b) {
  // calculating the sum of a + b and returning the result
  return a + b;
}

//calling the function with 3 and 10 as arguments and storing it in the 'result' variable
let result = sum(3, 10);
console.log(result); // outputting the result

// A function that doesn't return anything

// creating a function with the parameter 'name'
function welcome(name) {
  //printing a welcome message using template literals ${name} without returning a value
  console.log(`Welcome, ${name}!`);
}
// call the function with the argument "Joel"
welcome("Joel");

// A function with a mix of parameters and parameters with default values

function mediaType(title, media, genre = "Unknown") {
  // Check if 'title' and 'media' are provided
  if (!title || !media) {
    console.log(
      "Please provide both a title and media type (Movie, TV Show, etc)."
    );
    return;
  }

  // Print information using provided or default values
  console.log(`Title: ${title}, Media: ${media}, Genre: ${genre}`);
}

mediaType("Breaking Bad", "TV Show", "Drama"); // All 3 parameters were provided so it will print them
mediaType("The Shawshank Redemption", "Movie"); // Missing genre parameter so it will return the default value "unknown"
mediaType("The Godfather"); // No media type was provided so it will print the default value provided by the 'if' statement
