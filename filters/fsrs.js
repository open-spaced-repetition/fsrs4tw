/*\
Use Free Spaced Repetition Scheduler: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler
\*/

/*
Export our filter function
*/
(function () {

    /*jslint node: true, browser: true */
    /*global $tw: false */
    "use strict";

    var fsrsJs = require("$:/plugins/tidme/fsrs4tw/files/fsrs/fsrs.js");

    /*
    Export our filter function
    */
    exports.fsrs = function (source, operator, options) {
        var Fsrs = new fsrsJs.FSRS();
        var Rating = fsrsJs.Rating;
        var State = fsrsJs.State;
        var results = [];
        source(function (tiddler, title) {

            if (operator.operand) {
                let p = operator.operand;
                try {
                    p = JSON.parse(p);
                    if (typeof p == 'object' && p) {
                        if (Object.keys(Fsrs.p).every(key => Object.keys(p).includes(key)) && p.w.length == Fsrs.p.w.length) {
                            Fsrs.p = p;
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            var Card = new fsrsJs.Card();

            try {
                let tw_card = tiddler.fields;

                function tw2fsrsDate(obj) {
                    for (let key in obj) {
                        if (key === "due" || key === "last_review" || key === "review") {
                            obj[key] = $tw.utils.parseDate(String(obj[key]));
                        } else if (typeof obj[key] === "object") {
                            tw2fsrsDate(obj[key]);
                        }
                    }
                    return obj;
                }

                if (Object.keys(Card).every(key => Object.keys(tw_card).includes(key))) {
                    let result = {};
                    for (let key of Object.keys(Card)) {
                        result[key] = Number(tw_card[key]);
                    }
                    Card = tw2fsrsDate(result);
                }
            } catch (e) {
                console.log(e);
            }

            var cards = Fsrs.repeat(Card, new Date());

            function fsrs2twDate(obj) {
                for (let key in obj) {
                    if (key === "due" || key === "last_review" || key === "review") {
                        obj[key] = $tw.utils.stringifyDate(obj[key]);
                    } else if (typeof obj[key] === "object") {
                        fsrs2twDate(obj[key]);
                    }
                }
                return obj;
            }

            var result = {
                Rating: Rating,
                State: State,
                P: Fsrs.p,
                Cards: fsrs2twDate(cards)
            }

            results.push(JSON.stringify(result));
        });
        return results;
    };
})();