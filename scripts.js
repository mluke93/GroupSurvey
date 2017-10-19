setup();

// - - - Variables - - -

var players = 0;
var count = 1;
var results = [];
var finalResults = [];
var questionCount = 0;

// - - - Functions - - -

function setup () {
    $.getJSON('survey.json', function(data) {
        $("#header").text(data.surveyName);
        $("#description").text(data.description);
    });
}

function begin () {
    var playerCount = $("#playerCount").val() * 1;
    if (/^[0-9]*$/.test(players)) {
        players = playerCount;
        firstSurvey();
    }
    else {
        alert("Please enter a number.");
    }
}

function firstSurvey () {
    $("#title").css("display", "none");
    $.getJSON('survey.json', function(data) {
        console.log(data);
        setResults(data.results);
        buildForm(data.questions);
    });
}

function nextSurvey () {
    $("#form").remove();
    $.getJSON('survey.json', function(data) {
        setResults(data.results);
        buildForm(data.questions);
    });
}

function setResults (data) {
    for (var i = 0; i < data.length; i++) {
        results[i] = {
            "id": data[i].id,
            "name": data[i].name,
            "description": data[i].description,
            "image": data[i].image,
            "val": 0
        }
    }
}

function buildForm (data) {
    questionCount = data.length;
    var form = "";
    form += "<div id=\"form\"><h2>Player " + count + "'s Turn</h2><form id=\"questions\">";
    for (var i = 0; i < data.length; i++) {
        form += "<p>" + data[i].number + ". " + data[i].question + "</p>";
        for (var j = 0; j < data[i].answers.length; j++) {
            form += "<input type=\"radio\" name=\"q" + data[i].number +"\" value=\"" + data[i].answers[j].value + "\"> " + data[i].answers[j].text + " <br>";
        }
    }
    form += "</form><div id=\"submitButton\"><button onclick=\"submit()\">Submit</button></div></div>"
    $("#survey").append(form);
}

function submit() {
    resetResults();
    var checked = 0;
    var choices = document.getElementsByTagName('input');
    for (var i = 0; i < choices.length; i++) {
        if (choices[i].checked) {
            checked++;
            for (var j = 0; j < results.length; j++) {
                if (choices[i].value == results[j].id) {
                    results[j].val++;
                }
            }
        }
    }
    if (checked >= questionCount) {
        results.sort(function (a, b) {
            return  a.val > b.val ? -1 : a.val < b.val ? 1 : 0;
        })
        finalResults.push(results.slice(0));
        if (count < players) {
            count++;
            nextSurvey();
        }
        else {
            showResults();
        }
    }
    else {
        alert("Please answer all of the questions before continuing.");
    }
}

function resetResults () {
    for (var i = 0; i < results.length; i++) {
        results[i].val = 0;
    }
}

function showResults () {
    $("#form").remove();
    console.log(finalResults);
    finalResults = calculateTopResults();
    $("#results").append("<div id=\"res\"></div>");
    for (var i = 0; i < finalResults.length; i++) {
        var thisResult = "";
        thisResult += "<h3>Player " + (i+1) + "'s Result:</h3><h4>"+ finalResults[i].name +"</h4><p>" + finalResults[i].description + "</p><img src=\""+ finalResults[i].image +"\">";

        $("#res").append(thisResult);
    }
    $("#res").append("<br><button onclick='reset()'>Reset</button>");
}

function calculateTopResults () {
    var final = [];
    var counter = [];
    for (var i = 0; i < finalResults.length; i++) {
        counter.push(0);
        final.push(finalResults[i][counter[i]]);
    }
    while (resultsNotUnique(final)) {
        for (i = 0; i < final.length; i++) {
            for (var j = 0; j < final.length; j++) {
                if (i != j && final[i].id == final[j].id) {
                    if (final[i].val < final[j].val) {
                        counter[i]++;
                        final[i] = finalResults[i][counter[i]];
                        j = final.length;
                        i = final.length;
                    }
                    else if (final[i].val == final[j].val) {
                        nextBest(i, j, counter[i], counter[j], final, counter);
                        j = final.length;
                        i = final.length;
                    }
                }
            }
        }
    }
    return final;
}

function resultsNotUnique (final) {
    for (var i = 0; i < final.length; i++) {
        for (var j = 0; j < final.length; j++) {
            if (i != j && final[i].id == final[j].id) {
                return true;
            }
        }
    }
    return false;
}

function nextBest (first, second, firstCount, secondCount, final, counter) {
    if (finalResults[first][firstCount + 1].val < finalResults[second][secondCount + 1].val) {
        final[second] = finalResults[second][secondCount + 1];
        counter[second] = secondCount + 1;
    }
    else if (finalResults[first][firstCount + 1].val > finalResults[second][secondCount + 1].val) {
        final[first] = finalResults[first][firstCount + 1];
        counter[first] = firstCount + 1;
    }
    else {
        nextBest(first, second, firstCount + 1, secondCount + 1, final);
    }
}

function reset () {
    $("#res").remove();
    $("#playerCount").val("");
    $("#title").css("display", "");
    players = 0;
    count = 1;
    results = [];
    finalResults = [];
    questionCount = 0;
}