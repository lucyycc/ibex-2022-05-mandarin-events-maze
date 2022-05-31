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
                        "intro_history",
                        "history", 
                        "intro_use",
                        "use", 
                        "intro_profic",
                        "profic", 
                        "intro_attit",
                        "attit", 
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
    if (item[0].type.startsWith("break")|| item[0].type.startsWith("hit") || item[0].type.startsWith("filler")) {
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
                              { html: "<p>您有30秒时间休息, 如果您需要的话, 可以短暂的看向屏幕以外的地方或者拉伸身体来放松</p>", transfer: 30000 }));
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
    newText("InstructionText", "我们想请您回答一些关于您语言使用的问题，以下的问题包含您的语言使用历史，使用状况，语言态度以及语言程度。此问卷是由德州大学奥斯丁分校的开放教育资源及语言学习中心所研发，目的在于帮助我们了解双语者在多元的环境跟背景之下的个人资料。此份问卷有19个问题，作答时间约为10分钟。此份问卷不是能力测验，所以并没有标准答案，请您根据您本身的状况据实回答即可，感谢您的回答。")
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
        .checkboxWarning("您同意后才能继续。")
        .radioWarning("您需要选择一个选项。")
        .inputWarning("这个部分需要填写。")
        .print()
    ,
    newButton("continue", "继续")
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
    newText("history_text", "<b>语言使用历史:</b> 这个部份的问题，我们想请您回答一些关于您本身语言使用历史的问题，请在相符的框框中勾选您的答案")
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
        newButton("continue", "继续")
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
    newText("use_text", "<b>语言使用状况:</b> 在这个部分中，我们想请您回答一些关于您本身语言使用比例的问题，请在相符的框框中勾选您的答案。每一题的整体语言使用比例的总和必须为100%")
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
        newText("langoth", "其他語言")  // adds padding between lines
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
        newButton("continue", "继续")
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
newTrial("intro_profic",
    newText("profic_text", "<b>语言程度 </b> 在这个部分中，请您从1到7中自评您的语言程度。")
        .print()
    ,
    newButton("Next").print().wait()
)

Template(GetTable( "blp.csv")
    .filter( row => row.category == "proficiency")  // filter where row.category value equals 'proficiency'
    , row => 
    newTrial("profic",
        newText("quest_prof", row.question)
//              .settings.css("font-size", "60px")
            .settings.css("font-family", "avenir")
            .print()
        ,
        newText("pad17", " ")  // adds padding between lines
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
        newText("pad16", " ")  // adds padding between lines
            .css('font-size','2em')
            .print()
        ,
// language 2
        newText("quest_prof2", row.question_L2)
        //              .settings.css("font-size", "60px")
                .settings.css("font-family", "avenir")
                .print()
            ,
        newText("pad19", " ")  // adds padding between lines
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
        newText("pad18", " ")  // adds padding between lines
        .css('font-size','2em')
        .print()
        ,
        newButton("continue", "继续")
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

        // -------------------------------------------------------------------
// Attitudes
newTrial("intro_attit",
newText("attit_text", "<b>语言态度 </b>在这个部分中， 阅读完关于语言态度的题目叙述之后，从1到7中，选出你对叙述的同意程度。")
    .print()
,
newButton("Next").print().wait()
)

Template(GetTable( "blp.csv")
.filter( row => row.category == "attitudes")  // filter where row.category value equals 'attitudes'
, row => 
newTrial("attit",
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
    newButton("continue", "继续")
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
