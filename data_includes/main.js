PennController.ResetPrefix(null); // Shorten command names (keep this line here))
PennController.DebugOff();

var shuffleSequence = seq("consent", "demo", "IDentry", "intro",
                        "startpractice",
                        sepWith("sep", seq("practice")),
 // putting counter after practice so it won't increment all at the same time when participants show up, as that messes up lists
                        "setcounter",
                        "starter",
 // trials named _dummy_ will be excluded by following:
                        sepWith("sep", rshuffle(startsWith("break"), startsWith("hit"), startsWith("filler"))),
 						"sendresults",
                        "completion"
                );

newTrial("IDentry",
    newVar("partID").global()
    ,
    newText("instr", "Please enter your Prolific ID:").print()
    ,
    newHtml("partpage", "<input type='text' id='partID' name='participant ID' min='1' max='120'>").print()
    ,
    newButton("Next").print().wait( 
        getVar("partID").set( v=>$("#partID").val() ).testNot.is('')
    )
)
.log("partID", getVar("partID"))

// This is run at the beginning of each trial
Header(
    // Declare a global Var element "ID" in which we will store the participant's ID
    newVar("partID").global()    
)
.log( "partid" , getVar("partID") ) // Add the ID to all trials' results lines

var showProgressBar =false;

var practiceItemTypes = ["practice"];

var manualSendResults = true;

var defaults = [
   // "Maze", {redo: true}, //uncomment to try "redo" mode
];

// The following example inserts a "pause" Message at every nth item (where i % n)
// The % operator returns the remainder of two numbers, so will be 0 when a multiple of n

//function modifyRunningOrder(ro) {
// for (var i = 1; i < ro.length; ++i) {
//     if (i % 50 == 0) {
//              // Passing 'true' as the third argument casues the results from this controller
//            // to be omitted from the results file. (Though in fact, the Message controller
//          // does not add any results in any case.)
//           ro[i].push(new DynamicElement(
//                 "Message",
//               //    { html: "<p>Pause</p>", transfer: 1000 },
//                     { html: "<p>You can take a short break (1 minute or less) here if needed. Press any key to continue.</p>", transfer: "keypress" },
//  						true
//               ));
//           }
//        }
//       return ro;
//    }

// following is from the A-maze site to make breaks every 15 maze sentences
// you have to set the write number of total items and number of blocks to start with, and the right condition names, etc.
// calculate the following numbers to fill in the values below (not including practice trials-
// total maze sentences a participant will be presented: 85
// sentences per block: 15
// number of blocks: 6 (last incomplete)

function modifyRunningOrder(ro) {

  var new_ro = [];
  item_count=0;
  for (var i in ro) {
    var item = ro[i];
    // fill in the relevant experimental condition names on the next line
    if (item[0].type.startsWith("psych")|| item[0].type.startsWith("mklo") || item[0].type.startsWith("gp")) {
        item_count++;
        new_ro.push(item);
      // first number after item count is how many items between breaks. second is total-items - 1
        if (item_count%15===0 & item_count<84){
       // value here should be total_items - items_per_block (to trigger message that last block is coming up)
            if (item_count===75){
                text="End of block. Only 1 block left!";
                }
            else {
      // first number is the total number of blocks. second number is number of items per block
                text="End of block. "+(6-(Math.floor(item_count/15)))+" blocks left.";
            }ro[i].push(new DynamicElement("Message", 
                              { html: "<p>30-second break - stretch and look away from the screen briefly if needed.</p>", transfer: 30000 }));
        }
      } else {
      new_ro.push(item);
      }
  }
  return new_ro;
}

// template items will be pushed into native items = [] with fake PC trial _dummy_ output

// [["practice", 802], "Maze", {s:"Why was the boss smiling during the meeting?",
// a:"x-x-x card plan chaired filters allow push considerably?"}]


Template("stimuli.csv", row => {
    items.push(
        [[row.label, row.item] , "PennController", newTrial(
            newController("Maze", {s: row.sentence, a: row.alternative})
              .print()
              .log()
              .wait()
        )
        .log("counter", __counter_value_from_server__)
        .log("label", row.label)
        .log("latinitem", row.item)
        ]
    );
    return newTrial('_dummy_',null);
})

var items = [

	["setcounter", "__SetCounter__", { }],

	["sendresults", "__SendResults__", { }],

	["sep", "MazeSeparator", {normalMessage: "Correct! Press any key to continue", errorMessage: "Incorrect! Press any key to continue."}],

["consent", "Form", { html: { include: "consent.html" } } ],

["demo", "Form", {
	html: { include: "demo.html" },
	validators: {
		age: function (s) { if (s.match(/^\d+$/)) return true; else return "Bad value for \u2018age\u2019"; }
	}
} ],

["intro", "Form", { html: { include: "intro1.html" } } ],

// ["begin", "PennController",
//         newTrial(
//             newVar("partID").global()
//             ,
//             newText("Please enter your Prolific ID:")
//             ,
//             newHtml("partpage", "<p>blah</p><input type='text' id='partID' name='participant ID' min='1' max='120'>").print()
//             ,
//             newButton("Next").print().wait( 
//                 getVar("partID").set( v=>$("#partID").val() ).testNot.is('')
//             )
//         )
//         .log("partID", getVar("partID"))
// ],

["startpractice", Message, {consentRequired: false,
	html: ["div",
		   ["p", "您可以先开始做三组练习"]
		  ]}],

//
//  practice items
//

[["practice", 801], "Maze", {s:"The teacher perplexed the first class.", a:"x-x-x tends bisects done continues holy"}],
[["practice", 802], "Maze", {s:"The boss understandably smiled during the meeting.", a:"x-x-x about obligatoriness filters allow push considerably."}],
[["practice", 803], "Maze", {s:"The father chuckled while he cleaned.", a:"x-x-x slid quadratic goals add analyst."}],


//		["instructions2", "Message", {html:'End of sample Maze experiment.'}],
//	["intro-gram", "Message", {html: "<p>For this experiment, please place your left index finger on the 'e' key and your right index finger on the 'i' key.</p><p> You will read sentences word by word. On each screen you will see two options: one will be the next word in the sentence, and one will not. Select the word that continues the sentence by pressing 'e' (left-hand) for the word on the left or pressing 'i' (right-hand) for the word on the right.</p><p>Select the best word as quickly as you can, but without making too many errors.</p>"}],
//	["intro-practice", "Message", {html: "The following items are for practice." }],
//	["end-practice", "Message", {html: "End of practice. The experiment will begin next."}],
//	["done", "Message", {html: "All done!"}],

   // message that the experiment is beginning


   ["starter", Message, {consentRequired: false,
	html: ["div",
		   ["p", "点此开始主实验"]
		  ]}],



// experimental stimuli:

//    [Template("stimuli.csv", row =>
//        newTrial(
//            [row.label, row.item], "PennController", 
//            newController("Maze", 
//                {s:row.sentence, 
//                a:row.alternative}
//                )
//                .log()
//                .print()
//                .wait()
//            )
//            .log("logthis", "blah")
//            .log("counter", __counter_value_from_server__)
//            .log("itemlog", row.item)
//            )
//        ],
// completion: 

["completion", "Form", {continueMessage: null, html: { include: "completion.html" } } ]

// leave this bracket - it closes the items section
];

// prolific page URL: https://app.prolific.co/submissions/complete?cc=1F43E610
