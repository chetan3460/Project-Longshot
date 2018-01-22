// Initialize Firebase
var config = {
  apiKey: "AIzaSyCOVL51USj4HE7VfyPOI21R3uZT8yTa10c",
  authDomain: "longshotauth.firebaseapp.com",
  databaseURL: "https://longshotauth.firebaseio.com",
  projectId: "longshotauth",
  storageBucket: "",
  messagingSenderId: "783961136211"
};

firebase.initializeApp(config);
var database = firebase.database();
// var defaultAuth = firebase.auth();


var queryURLbase = "https://api.edamam.com/search?&app_id=4a5d81a2&app_key=379308ab9da9a8ee47f63563d2774ac4&from=0&to9&q=";
var userInput;

var imgAPI;
var label;
var recipe;
var sourceLink;
var user = firebase.auth().currentUser;
var name, email, photoUrl, uid, emailVerified;
var userId;

function testAjax(queryURL){
  fetch(queryURL)
  .then((resp) => resp.json())
  .then(function(data){
    // console.log(queryURL);
    for(var i = 0; i < 9; i++){

      var card = $("<div>");
      card.addClass("card");

      var cardImg =$("<div>");
      cardImg.addClass("card-image");

      var img = $("<img>");
      imgAPI = data.hits[i].recipe.image;
      img.attr("src", imgAPI);
      cardImg.append(img);
      card.append(cardImg);

      var cardContent = $("<div>");
      cardContent.addClass("card-content");

      //Variable for the recipe title/label.
      var spanTitle = $("<span>");
      spanTitle.addClass("card-title");
      label = data.hits[i].recipe.label;
      spanTitle.text(label);
      //This appends the recipe title/label to the recipe image.
      cardImg.append(spanTitle);

      var pRecipe = $("<p>");
      recipe =data.hits[i].recipe.ingredients[0].text;
      console.log(recipe);
      pRecipe.text(recipe);
      cardImg.after(cardContent);

      //Use Materialize css card reveal feature to reveal ingredients upon button click.
      //Add the class activator to an element inside the card to allow it to open the card reveal.
      img.addClass("activator");
      //Create span element to hold the button that opens the card reveal.
      activateIngredients = $("<span>");
      //Add the class activator and add "Ingredients" text.
      activateIngredients.addClass("card-title activator").text("Ingredients");
      //Create button that will open the card reveal and show the ingredients.
      revealIngredientsIcon = $("<i>");
      //Add data attributes to display tooltip text. data-position=top shows tooltip text above button.
      //data-tooltip is the tooltip text that appears when user hovers over button.
      revealIngredientsIcon.addClass("material-icons right tooltipped").text("more_vert").attr("data-position", "top").attr("data-tooltip", "Click to view ingredients.");
      //Initialize tooltip for show Ingredients button.
      $('.tooltipped').tooltip({delay: 30});
      activateIngredients.append(revealIngredientsIcon);
      //Append the card reveal button to the card.
      cardContent.append(activateIngredients);
      //Create div for card reveal.
      var cardReveal = $("<div>");
      cardReveal.addClass("card-reveal");
      //Create title for card reveal.
      var cardRevealTitle = $("<span>");
      cardRevealTitle.addClass("card-title").text("Ingredients");
      //Create icon that allows users to close card reveal and return to cardContent.
      var closeRevealIcon = $("<i>");
      closeRevealIcon.addClass("material-icons right").text("close");
      cardRevealTitle.append(closeRevealIcon);
      //Append the title of card reveal to card reveal div.
      cardReveal.append(cardRevealTitle);
      //Append the card reveal div to the card.
      card.append(cardReveal);
      //Append the ingredients to the card reveal.
      cardReveal.append(pRecipe);


      var cardAction = $("<div>");
      cardAction.addClass("card-action");

      //Dynamically create external recipe link and open the link in a new tab.
      var link = $("<a>");
      link.text("More info");
      sourceLink = data.hits[i].recipe.url;
      link.attr("href", sourceLink);
      //Adding attribute to link so that recipe link opens in a new tab window.
      link.attr("target", "_blank");

      //Dynamically create button for saving recipes to recipe box.
      var saveBtn = $("<i>");
      saveBtn.addClass("small fa fa-cutlery tooltipped");
      //Add data attributes to display tooltip text. data-position=top shows tooltip text above button.
      //data-tooltip is the tooltip text that appears when user hovers over button.
      saveBtn.attr("data-name", [i]).attr("data-position", "top").attr("data-tooltip", "Click to save recipe to Recipe box.");
      //Initialize tooltip for save recipe button.
      $('.tooltipped').tooltip({delay: 30});

      cardAction.append(link, saveBtn);
      cardContent.after(cardAction);
      $("#recipe1").append(card);

      var n = $(".card-image").length;
      // console.log(n);
      if(n > 3) {
        $("#recipe2").append(card);
      };

      if(n > 6) {
        $("#recipe3").append(card);
      };

      //When the save recipe button is clicked...
      saveBtn.on("click",function(e){
        console.log("newbtn working");
        //Display toast message that indicates recipe was added to Recipe box successfully.
        Materialize.toast('Recipe successfully added to Recipe box.', 4000, 'rounded'); // 4000 is the duration of the toast
        var name = $(e.target).data("name");
        console.log("name : "+name);
        var newRecipe = {
          name:data.hits[name].recipe.label,
          ingredients: data.hits[name].recipe.ingredients[0].text,
          link: data.hits[name].recipe.url,
          img: data.hits[name].recipe.image
        };
        database.ref('/users/'+uid).push(newRecipe);
        console.log("label : "+ newRecipe.name + " recipe : "+ newRecipe.ingredients + " sourceLink : "+ newRecipe.link);
      })
    };
  });
}

//When the Find button is clicked in search section...
$("#submit").on("click",function(e){
  e.preventDefault();
  //When the user starts a new search, make sure to clear the previous search results so that the results don't keep adding and adding.
  $("#recipe1").empty();
  $("#recipe2").empty();
  $("#recipe3").empty();
  //Grab the user input from the main word search text box.
  userInput = $("#user-input").val().trim().toLowerCase();
  var searchURL = queryURLbase + userInput;
  console.log(userInput);
  testAjax(searchURL);

});
//
//
//function to detect auth state change
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    alert("user signed in");
    // User is signed in.
    $("#logout-btn").show();
    $("#login-btn").hide();
    $("#signup-btn").hide();

    if (user != null){
      var email_id =user.email;
      $("#member-info").text(email_id);
      email = user.email;
      photoUrl = user.photoURL;
      emailVerified = user.emailVerified;
      uid = user.uid;
      console.log("email: "+user.email + " uid : "+ uid);

      database.ref('/users/' + uid).on("child_added", function(childSnapshot) {

        var name = childSnapshot.val().name;
        console.log("name "+ name + " key: "+key);
        var ingredients = childSnapshot.val().ingredients;
        var link = childSnapshot.val().link;
        var img = childSnapshot.val().img;
        var key = childSnapshot.key;
        console.log("link " + link);
      //
        var newList = $("<p>");
        newList.attr("id",key);
        var newSpan = $("<span>");
        var linkA = $("<a>");
        linkA.text(name);
        linkA.attr("href",link);
        linkA.addClass("recipe-box-link");
        //Add attribute to recipe box link to open external recipe link in a new tab window.
        linkA.attr("target", "_blank");
        var trash = $("<i>");
        var pencil = $("<i>");
        //Add data attributes to display tooltip text. data-position=top shows tooltip text above button.
        //data-tooltip is the tooltip text that appears when user hovers over button.
        trash.attr("aria-hidden",true).attr("data-position", "top").attr("data-tooltip","Removes recipe from Recipe box.");
        //Initialize tooltip for trash and pencil buttons.
        $('.tooltipped').tooltip({delay: 30});
        trash.addClass("fa fa-trash remove tooltipped");
        trash.attr("data-key",key);
        //Add data-target with id of the remove recipe modal to trigger confirmation dialog.
        trash.attr("data-target", "removeRecipeModal");
        //Add data attributes to display tooltip text. data-position=top shows tooltip text above button.
        //data-tooltip is the tooltip text that appears when user hovers over button.
        pencil.attr("aria-hidden",true).attr("data-position", "top").attr("data-tooltip", "Click to add notes to recipe.");
        pencil.addClass("fa fa-pencil tooltipped");
        newList.append(newSpan);
        newSpan.append(linkA,trash,pencil);
        $("#recipeBox").append(newList);
      });
    }
  } else {
    // No user is signed in.
    $("#logout-btn").hide();
    $("#login-btn").show();
    $("#signup-btn").show();
  }
});
//click event for sign up
function signUp(){
  var userEmail = $("#email-input").val().trim();
  var userPass = $("#password-input").val().trim();
  firebase.auth().createUserWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    window.alert("Error : " + errorMessage);
  });
}
//click event for logOut
function logOut(){
  firebase.auth().signOut();
  $("#recipeBox").empty();
}
// Click event for sign in.
function login(){
  var userEmail = $("#email-input").val().trim();
  var userPass = $("#password-input").val().trim();
  firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // ...
    window.alert("Error : " + errorMessage);

  });
}

//Trigger bottom sheet to open recipe box.
$(document).ready(function(){
  // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
  $('.modal').modal();
});

//print saved recipe to recipe box modal (this is a bottom sheet).

$(document).on("click",".remove",function(e) {
  //When the user clicks the trash can icon, show a confirmation modal before removing recipe from the recipe box.
  //$('#removeRecipeModal').modal('open');
  //If user confirms that they want to remove the recipe from the recipe box...
  //$('#yes-remove').on("click", function(){
  var key = $(e.target).data("key");
  var list =  document.getElementById(key);
  list.remove();
  console.log(key);
  var updates ={};
  var removeData ={};
  database.ref().on("child_added",function(snapshot) {
    var snap = snapshot.key;
    console.log(snap);
    if (key == snap){
      console.log("working");
      updates[snap]=removeData;
      return database.ref().update(updates);
    };
  })
});

// If user decides that they don't want to remove the recipe from the recipe box...
$('#no-remove').on("click", function(){
  return;
});


// When Help link in the Footer is clicked, open help page.
$("#help-link").on("click", function(){
  $("#help-modal").modal('open');
})

//When About link in the Footer is clicked, open about page.
$("#about-link").on("click", function(){
  $("#about-modal").modal('open');
});
