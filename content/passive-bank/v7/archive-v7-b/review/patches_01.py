# Claude review, B01–B03. ops: add{i:[..]}, rm{i:[..]}, ans{i:'..'}, rep[(old,new)] in prompt/cues, opt{i:'..'}, reject
P = {
"B01-03": {"add": {1: ["have been locked"]}},
"B01-05": {"opt": {3: "had ordered"}},
"B01-19": {"add": {0: ["had been booked"]}},
"B01-24": {"rep": [("his laptop pass", "his security pass")]},
"B01-30": {"rm": {0: ["shaved"]}},
"B01-31": {"add": {0: ["would tap"]}},
"B02-17": {"add": {0: ["had been built"]}},
"B02-27": {"rm": {1: ["did not lie", "didn't lie"]}},
"B02-29": {"rep": [("(to give out)", "(to hire out)")], "ans": {0: "had been hired out"}, "acc": {0: ["had been hired out", "were hired out"]}},
"B03-19": {"add": {1: ["has been rejected"]}},
"B03-26": {"add": {0: ["has run"]}},
}
