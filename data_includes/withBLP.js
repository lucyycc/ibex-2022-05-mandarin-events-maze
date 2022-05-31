PennController.ResetPrefix(null); // Shorten command names (keep this line here))
PennController.DebugOff();

var shuffleSequence = seq("consent", "IDentry", "intro", "tech",
                        "startpractice",
                        sepWith("sep", seq("practice")),
 // putting counter after practice so it won't increment all at the same time when participants show up, as that messes up lists
                        "setcounter",
                        "starter",
 // trials named _dummy_ will be excluded by following:
            //            sepWith("sep", rshuffle(startsWith("break"), startsWith("hit"), startsWith("filler"))),
                        followEachWith("sep",randomize(anyOf(startsWith("break"),startsWith("hit"), startsWith("filler")))),
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
 //                       "closing",
 						"sendresults",
                        "completion"
                );

newTrial("IDentry",
    newVar("partID").global()
    ,
    newText("instr", "请输入10位数字代码，此匿名代码将作为您的资料代码：").print()
    ,
    newHtml("partpage", "<input type='text' id='partID' name='participant ID' min='1' max='120'>").print()
    ,
    newButton("clickcontinue", "点此继续").print().wait( 
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

// following is from the A-maze site to make breaks every 15(ish) maze sentences
// you have to set the write number of total items and number of blocks to start with, and the right condition names, etc.
// calculate the following numbers to fill in the values below (not including practice trials-
// for Mandarin hit/break study:
// total maze sentences a participant will be presented: 64 (25 experiment, 39 filler)
// sentences per block: 16
// number of blocks: 4

function modifyRunningOrder(ro) {

    var new_ro = [];
    item_count=0;
    for (var i in ro) {
      var item = ro[i];
      // fill in the relevant stimuli condition names on the next line including fillers (all that should be counted for break purposes)
      if (item[0].type.startsWith("break")|| item[0].type.startsWith("hit") || item[0].type.startsWith("filler")) {
          item_count++;
          new_ro.push(item);
        // number after percent (remainder) after item_count is how many items between breaks. last number is total-items - 1
          if (item_count%16===0 & item_count<63){
         // value for item_count=== should be total_items - items_per_block (to trigger message that last block is coming up)
         // text says "only 1 set of sentences left"
              if (item_count===48){
                    ro[i].push(new DynamicElement("Message", 
                        { html: "<p>只剩下一组句子了！</p>", transfer: 3000 }));
                } else {
                // first number is the total number of blocks. second number is number of items per block
                // message says "end of block. n blocks left."
                    ro[i].push(new DynamicElement("Message", 
                        { html: "<p>本组句子结束，还剩"+(4-(Math.floor(item_count/16)))+" 组句子</p>", transfer: 3000 }));
                }
                // next message is added for all breaks after the count message
                ro[i].push(new DynamicElement("Message", 
                    { html: "<p>您有30秒时间休息, 如果您需要的话, 可以短暂的看向屏幕以外的地方或者拉伸身体来放松</p>", transfer: 30000 }));
          }
        } else {
    // if it's not an experimental trial, such as separator or other item, just show the item
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

["intro", "Form", { html: { include: "intro1.html" } } ],

["tech", "Form", { html: { include: "tech.html" } } ],

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

// -------------------------------------------------------------------

//// BLP Section 
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
    newText("history_text", "<b>语言使用历史:</b> 这个部份的问题，我们想请您回答一些关于您本身语言使用历史的问题，请在相符的框框中勾选您的答案。")
        .print()
    ,
    newButton("continue", "继续").print().wait()
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
    newText("use_text", "<b>语言使用状况:</b> 在这个部分中，我们想请您回答一些关于您本身语言使用比例的问题，请在相符的框框中勾选您的答案。每一题的整体语言使用比例的总和必须为100%。")
        .print()
    ,
    newButton("continue", "继续").print().wait()
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
        newText("langoth", "其他语言")  // adds padding between lines
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
    newButton("continue", "继续").print().wait()
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
newButton("continue", "继续").print().wait()
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
