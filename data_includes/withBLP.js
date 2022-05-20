PennController.ResetPrefix(null); // Shorten command names (keep this line here))
PennController.DebugOff();

var shuffleSequence = seq("consent", "IDentry", "intro",
                        "startpractice",
                        sepWith("sep", seq("practice")),
 // putting counter after practice so it won't increment all at the same time when participants show up, as that messes up lists
                        "setcounter",
                        "starter",
 // trials named _dummy_ will be excluded by following:
                        sepWith("sep", rshuffle(startsWith("break"), startsWith("hit"), startsWith("filler"))),
 // bilingual language profile survey
                        "blpintro", 
                        "bio",
                        "history_text",
                        "history", 
                        "use_text",
                        "use", 
                        "profic_attit_text",
                        "profic_attit", 
                        "closing",
 						"sendresults",
                        "completion"
                );

newTrial("IDentry",
    newVar("partID").global()
    ,
    newText("instr", "请输入10位数字代码，此匿名代码将作为您的资料代码:").print()
    ,
    newHtml("partpage", "<input type='text' id='partID' name='participant ID' min='1' max='120'>").print()
    ,
    newButton("点此继续").print().wait( 
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

	["sep", "MazeSeparator", {normalMessage: "正确! 请按任意键继续", errorMessage: "错误！请按任意键继续"}],

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
		   ["p", "您可以先做三组练习"]
		  ]}],

//
//  practice items
//

[["practice", 801], "Maze", {s:"老板的 手机 在会议中 响了", a:"x-x-x 咱们 氢氧化钠 狐狸"}],
[["practice", 802], "Maze", {s:"爸爸 边看 电视 边讲 电话", a:"x-x-x 气孔 避免 腐朽 抓住"}],
[["practice", 803], "Maze", {s:"运动员 在健身房 做了 重量 训练", a:"x-x-x 莎士比亚 螳螂 愤怒 爸爸"}],


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

//// 
/// Instructions:

// Subject info
newTrial("blpintro",
    newText("InstructionText", "We would like to ask you to help us by answering the following questions concerning your language history, use, attitudes, and proficiency. This survey was created with support from the Center for Open Educational Resources and Language Learning at the University of Texas at Austin to better understand the profiles of bilingual speakers in diverse settings with diverse backgrounds. The survey consists of 19 questions and will take less than 10 minutes to complete. This is not a test, so there are no right or wrong answers. Please answer every question and give your answers sincerely. Thank you very much for your help.")
        .print()
    ,
    newButton("Next").print().wait()
)

// -------------------------------------------------------------------
// Biographical Information
  
newTrial("bio",
    newHtml("bio_html", "demographics.html")
        .center()
        .log()
        .checkboxWarning("You must give your consent to continue.")
        .radioWarning("You must choose an option.")
        .inputWarning("This field must be filled in.")
        .print()
    ,
    newButton("continue", "Continue")
        .css("font-size","medium")
        .center()
        .print()
        .wait(    
            getHtml("bio_html").test.complete()
            .failure( getHtml("bio_html").warn())
            ,
            newTimer("waitDemo", 500)
                .start()
                .wait()
            )
)


// -------------------------------------------------------------------
// Language History
newTrial("intro_history",
    newText("history_text", "<b>Language history:</b> In this section, we would like you to answer some factual questions about your language history by placing a check in the appropriate box.")
        .print()
    ,
    newButton("Next").print().wait()
)
    Template(GetTable( "blp.csv")
        .filter( row => row.category == "history")  // filter where row.category value equals 'history'
    , row => 
    newTrial("history",
            newText("quest_hist", row.question)
 //              .settings.css("font-size", "60px")
                .settings.css("font-family", "avenir")
                .print()
            ,
            newText("pad1", " ")  // adds padding between lines
                .css('font-size','2em')
                .print()
            ,
            newText("lang1", row.L1)  // adds padding between lines
                .css('font-size','1em')
                .print()
            ,
            newText("pad5", " ")  // adds padding between lines
                .css('font-size','1em')
                .print()
            ,
            defaultText
                .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
            ,
            newText("span1", '<span>'+row.leftlabel+'</span><span>'+row.rightlabel+'</span>')
                .color("blue")
                .print()
            ,
            defaultText
                .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
            ,   
            defaultScale
                .css({width: "700px", 'max-width':'unset', 'margin-bottom':'0.5em'})
                .cssContainer("margin-bottom", "0.2em")
                .log()
            ,         
            newScale("lang1-scale",  parseInt(row.scalevalues))
                .labelsPosition("top")
                .label(0, row.firstlabel)
                .label(row.lastnum, row.lastlabel)
                .keys()
                .print()
            ,
            newText("pad2", " ")  // adds padding between lines
                .css('font-size','2em')
                .print()
            ,
 // language 2
        newText("lang2", row.L2)  // adds padding between lines
            .css('font-size','1em')
            .print()
        ,
        newText("pad4", " ")  // adds padding between lines
           .css('font-size','1em')
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,   
        defaultScale
            .css({width: "700px", 'max-width':'unset', 'margin-bottom':'0.5em'})
            .cssContainer("margin-bottom", "0.2em")
            .log()
        ,         
        defaultText
        .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,
// button labels
// "<span>left label</span><span>right label</span>"
        newText("span2", '<span>'+row.leftlabel+'</span><span>'+row.rightlabel+'</span>')
            .color("blue")
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,   
        newScale("lang2-scale",  parseInt(row.scalevalues))
            .labelsPosition("top")
            .label(0, row.firstlabel)
            .label(row.lastnum, row.lastlabel)
            .keys()
            .print()
        ,
        getScale("lang1-scale")
        .wait("first")
        ,
        getScale("lang2-scale")
        .wait("first")
        ,    
        newText("pad3", " ")  // adds padding between lines
        .css('font-size','2em')
        .print()
        ,
        newButton("continue")
            .before(newCanvas("canv-continue",290,20))
            .print()
            .wait()
        )
    .log( "quest_hist", row.question)
    .log("blp_item", row.blp_item)
    .log( "category", row.category)
    .log( "Subject", getVar("partID")) 
    )


// -------------------------------------------------------------------
// Language Use
newTrial("intro_use",
    newText("use_text", "<b>Language Use:</b> In this section, we would like you to answer some questions about your language use by selecting the appropriate level. <b>Total use for all languages in a given question should equal 100%.</b>")
        .print()
    ,
    newButton("Next").print().wait()
)

    Template(GetTable( "blp.csv")
        .filter( row => row.category == "use")  // filter where row.category value equals 'history'
        , row => 
        newTrial("use",
            newText("quest_use", row.question)
        //              .settings.css("font-size", "60px")
                .settings.css("font-family", "avenir")
                .print()
            ,
            newText("pad1", " ")  // adds padding between lines
                .css('font-size','2em')
                .print()
            ,
            newText("lang1", row.L1)  // adds padding between lines
                .css('font-size','1em')
                .print()
            ,
            newText("pad5", " ")  // adds padding between lines
                .css('font-size','1em')
                .print()
            ,
            defaultText
                .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
            ,
            newText("span1", '<span>'+row.leftlabel+'</span><span>'+row.rightlabel+'</span>')
                .color("blue")
                .print()
            ,
            defaultText
                .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
            ,   
            defaultScale
                .css({width: "700px", 'max-width':'unset', 'margin-bottom':'0.5em'})
                .cssContainer("margin-bottom", "0.2em")
                .log()
            ,         
       newScale("lang1-scale",  ...row.scalevalues.split("."))
            .labelsPosition("top")
   //             .label(0, row.firstlabel)
   //             .label(row.lastnum, row.lastlabel)
                .keys()
                .print()
            ,
            newText("pad2", " ")  // adds padding between lines
                .css('font-size','2em')
                .print()
            ,
        // language 2
        newText("lang2", row.L2)  // adds padding between lines
            .css('font-size','1em')
            .print()
        ,
        newText("pad4", " ")  // adds padding between lines
            .css('font-size','1em')
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,   
        defaultScale
            .css({width: "700px", 'max-width':'unset', 'margin-bottom':'0.5em'})
            .cssContainer("margin-bottom", "0.2em")
            .log()
        ,         
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,
        // button labels
        // "<span>left label</span><span>right label</span>"
        newText("span2", '<span>'+row.leftlabel+'</span><span>'+row.rightlabel+'</span>')
            .color("blue")
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,   
        newScale("lang2-scale",  ...row.scalevalues.split("."))
            .labelsPosition("top")
            .label(0, row.firstlabel)
            .label(row.lastnum, row.lastlabel)
            .keys()
            .print()
        ,
        newText("pad7", " ")  // adds padding between lines
        .css('font-size','2em')
        .print()
    ,
// other languages
        newText("langoth", "Other Languages")  // adds padding between lines
            .css('font-size','1em')
            .print()
        ,
        newText("pad6", " ")  // adds padding between lines
            .css('font-size','1em')
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,   
        defaultScale
            .css({width: "700px", 'max-width':'unset', 'margin-bottom':'0.5em'})
            .cssContainer("margin-bottom", "0.2em")
            .log()
        ,         
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,
        // button labels
        // "<span>left label</span><span>right label</span>"
        newText("span3", '<span>'+row.leftlabel+'</span><span>'+row.rightlabel+'</span>')
            .color("blue")
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,   
        newScale("langoth-scale",  ...row.scalevalues.split("."))
   //         .slider()
   //         .default(0)
            .labelsPosition("top")
            .label(0, row.firstlabel)
            .label(row.lastnum, row.lastlabel)
            .keys()
            .print()
        ,
        getScale("lang1-scale")
        .wait("first")
        ,
        getScale("lang2-scale")
        .wait("first")
        ,    
        getScale("langoth-scale")
        .wait("first")
        ,    
        newText("pad3", " ")  // adds padding between lines
        .css('font-size','2em')
        .print()
        ,
        newButton("continue")
            .before(newCanvas("canv-continue",290,20))
            .print()
            .wait()
        )
        .log( "quest_use", row.question)
        .log("blp_item", row.blp_item)
        .log( "category", row.category)
        .log( "Subject", getVar("partID")) 
        )


// -------------------------------------------------------------------
// Proficiency
newTrial("intro_profic_attit",
    newText("profic_attit_text", "<b>Language Proficiency and Attitudes:</b> In this section, we would like you to rate your language proficiency and attitudes by giving marks from 1 to 7.")
        .print()
    ,
    newButton("Next").print().wait()
)

Template(GetTable( "blp.csv")
    .filter( row => row.category == "proficiency" || row.category == "attitudes")  // filter where row.category value equals 'history'
    , row => 
    newTrial("profic_attit",
        newText("quest_prof", row.question)
//              .settings.css("font-size", "60px")
            .settings.css("font-family", "avenir")
            .print()
        ,
        newText("pad10", " ")  // adds padding between lines
            .css('font-size','1em')
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,
        newText("span1", '<span>'+row.leftlabel+'</span><span>'+row.rightlabel+'</span>')
            .color("blue")
            .print()
        ,
        defaultScale
            .css({width: "700px", 'max-width':'unset', 'margin-bottom':'0.5em'})
            .cssContainer("margin-bottom", "0.2em")
            .log()
        ,         
        newScale("lang1-scale",  parseInt(row.scalevalues))
            .labelsPosition("top")
            .label(0, row.firstlabel)
            .label(row.lastnum, row.lastlabel)
            .keys()
            .print()
        ,
        newText("pad12", " ")  // adds padding between lines
            .css('font-size','2em')
            .print()
        ,
// language 2
        newText("quest_prof2", row.question_L2)
        //              .settings.css("font-size", "60px")
                .settings.css("font-family", "avenir")
                .print()
            ,
        newText("pad13", " ")  // adds padding between lines
        .css('font-size','1em')
            .print()
        ,
        defaultText
            .css({display: 'flex', width: '700px', 'justify-content': 'space-between'})
        ,   
        // button labels
        // "<span>left label</span><span>right label</span>"
        newText("span2", '<span>'+row.leftlabel+'</span><span>'+row.rightlabel+'</span>')
            .color("blue")
            .print()
        ,
        defaultScale
            .css({width: "700px", 'max-width':'unset', 'margin-bottom':'0.5em'})
            .cssContainer("margin-bottom", "0.2em")
            .log()
        ,         
        newScale("lang2-scale",  parseInt(row.scalevalues))
            .labelsPosition("top")
            .label(0, row.firstlabel)
            .label(row.lastnum, row.lastlabel)
            .keys()
            .print()
        ,
        getScale("lang1-scale")
        .wait("first")
        ,
        getScale("lang2-scale")
        .wait("first")
        ,    
        newText("pad14", " ")  // adds padding between lines
        .css('font-size','2em')
        .print()
        ,
        newButton("continue")
            .before(newCanvas("canv-continue",290,20))
            .print()
            .wait()
        )
        .log( "quest_prof", row.question)
        .log("quest_prof2", row.question_L2)
        .log("blp_item", row.blp_item)
        .log( "category", row.category)
        .log( "Subject", getVar("partID")) 
        )


// prolific page URL: https://app.prolific.co/submissions/complete?cc=1F43E610
