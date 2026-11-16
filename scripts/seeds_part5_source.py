#!/usr/bin/env python3
"""Seeds part 5 (written by Claude): history/archaeology, family/home, friends/celebrations,
city life/local news, environment/farming/space/aviation. Writes content/passive-bank/v7/seeds/seeds-5.jsonl.
Format per line: place | who | situation | hooks | tone | register
hooks: A agent unknown, F focus on affected person, R report/rumour, S service by someone else,
I happened by itself, O rule/obligation, P process/steps, D deduction about the past, T state vs action,
G two objects, V phrasal/prepositional verb.  tones: fu an al to ne gn bn ir
"""
import json
from pathlib import Path

HOOK = dict(A="agent unknown/unimportant", F="focus on affected person", R="report/rumour", S="service by someone else",
            I="something happened by itself", O="rule/obligation", P="process/steps", D="deduction about the past",
            T="state vs action", G="two objects (give/offer/send)", V="phrasal/prepositional verb")
TONE = dict(fu="funny", an="annoying", al="alarming", to="touching", ne="neutral", gn="good news", bn="bad news", ir="ironic")

DATA = {
"history and archaeology": """
a ploughed field near Colchester | a metal detectorist on his first outing | He found a Roman coin in the first hour and has not found anything since, in eleven years of weekends. | I,F | ir | chat
a university storeroom in Uppsala | a PhD student sorting boxes | A Viking comb nobody had catalogued turned up in a shoebox labelled 'misc. bones'. | A,D | fu | news
a bog in County Offaly | peat cutters | A lump of butter about 3,000 years old came out of the peat, still smelling faintly of cheese. | I,R | fu | news
a Lisbon archive | a historian reading ship logs | A captain's diary from 1755 mentions a parrot that had learned to swear in three languages. | R | fu | history
a lake in Switzerland | divers in a drought summer | The water level fell so low that the posts of a prehistoric village appeared above the surface. | I | gn | news
a school library in Dundee | a librarian | A letter written by a pupil in 1912 was found inside a returned atlas. | A,F | to | news
an excavation in Pompeii | a team of archaeologists | A fresco of a snack bar menu shows what locals ate on the go nearly 2,000 years ago. | P,R | ne | process
a castle kitchen in Wales | a volunteer guide | Visitors are told that the giant fireplace once roasted a whole ox, though no record proves it. | R,F | ir | dialogue
a medieval town in Estonia | a historian | Town rules from 1450 fined anyone caught throwing rubbish into the market well. | O | fu | history
the Tower of London | a Yeoman Warder | Legend says the kingdom will fall if the ravens ever leave, so their wings are carefully trimmed. | R,O | ir | history
a farmhouse attic in Norfolk | a new owner | A box of wartime ration books and love letters lay under the floorboards for eighty years. | D,T | to | chat
a cave in southern France | a group of teenagers in 1940 | Their dog fell into a hole, and they discovered walls covered with ancient animal paintings. | I,A | gn | history
a museum in Cairo | a curator | A tiny wooden boat model was found to contain a grain of barley stuck in its paint. | P | ne | report
an Edinburgh close | a ghost-tour guide | The tour claims that a piper vanished in a tunnel under the Royal Mile, and his music can still be heard. | R,I | fu | dialogue
a beach in Norfolk | a winter walker | Storms washed away sand and revealed human footprints over 800,000 years old. | I | gn | news
an auction in York | a family | A teapot used for decades as a doorstop turned out to be from a royal porcelain factory. | D,F | fu | news
a town hall in Bruges | a clerk | Medieval contracts were sealed with wax, and a broken seal meant the deal was off. | O,P | ne | history
a shipwreck off Sweden | marine scientists | Cold, low-salt water kept a 17th-century warship almost whole on the seabed. | T,I | ne | report
a village in Kent | a local historian | Every house on the high street once had a different trade, and the shop signs record them. | T | ne | history
a printing museum in Mainz | a schoolboy | He was allowed to print his own name on a replica of Gutenberg's press. | F,O | to | chat
an Oxford college | a student tour guide | The college still has a rule that students may ask for a free pint of beer during exams, though nobody gets it. | O,R | fu | dialogue
a desert in Peru | a pilot in the 1930s | Giant lines drawn in the sand were only understood when people first saw them from the air. | D,A | ne | history
a Roman fort on Hadrian's Wall | archaeologists | Wooden writing tablets reveal a birthday party invitation sent by an officer's wife. | G,D | to | history
a Kraków market square | a trumpeter | Every hour a tune is played from the church tower and stops suddenly in the middle. | O,P | ne | process
a London sewer | engineers in the 1850s | After the summer of the 'Great Stink', a new sewer system was ordered by Parliament. | O,A | ir | history
a library in Dublin | a reader | A medieval manuscript has a monk's note in the margin complaining that the ink is thin and the room is cold. | D,F | fu | chat
a cathedral in Spain | builders over centuries | The cathedral took so long to finish that its style changed three times along the way. | P | ir | history
a Japanese temple | monks | The temple is taken apart and rebuilt in identical form every twenty years as tradition demands. | O,P | ne | process
a field in Wiltshire | a farmer | A crop circle appeared overnight, and two pensioners later admitted they had made it with a plank. | D,R | fu | news
a museum in Athens | visitors | An ancient bronze gear device is thought to have predicted eclipses. | R,D | ne | report
a Victorian school in Leeds | pupils of the time | Children were made to write with their right hand even if they were left-handed. | O,F | bn | history
a lighthouse museum in Cornwall | a keeper's granddaughter | Her grandfather's logbook records a seal that visited the steps every evening for a year. | T,R | to | chat
a coffee house in 1680s London | merchants | Ships were insured over coffee in a shop that later gave its name to a famous company. | P,G | ne | history
a hill fort in Wales | a drone pilot | A dry summer revealed the outline of a lost fort as patterns in the brown grass. | I,D | gn | news
a Paris street | a sewer tour group | Visitors are shown how lost keys and rings are fished out of the water. | P,S | fu | dialogue
an archive in Moscow | a researcher | Old telephone directories help families trace where their great-grandparents once lived. | F,P | to | report
a ferry museum in Istanbul | a retired captain | He was given his old ship's bell when the boat was taken out of service. | G,F | to | chat
an exhibition in Berlin | visitors | A coat made entirely of fish skin was lent by a museum in Siberia. | G,A | ne | review
a monastery in Ireland | monks in the 9th century | Valuable books were kept in tall round towers whose doors were high above the ground. | T,O | ne | history
a 1960s time capsule in Ohio | a class reunion | A school opened its time capsule and found the letters had been eaten by damp. | D,I | bn | news
""",
"family and home": """
a flat in Manchester | a teenager | Her younger brother read her diary out loud at dinner, and nobody stopped laughing for ten minutes. | F | fu | chat
a kitchen in Lagos | a grandmother | Her jollof rice recipe is never written down; it is passed on by watching her cook. | P,O | to | dialogue
a family WhatsApp group | an aunt | Every photo she sends is shared twice by mistake, and the chat fills up within a week. | I,F | an | chat
a semi-detached house in Leicester | twins | They were given identical bikes for their birthday and argue about whose is whose. | G,F | fu | chat
a dining room in Warsaw | a family at Christmas Eve | An empty chair is left at the table for an unexpected guest, as tradition says. | O,T | to | dialogue
a garden in Devon | a toddler | The tomatoes disappeared one by one, and the culprit was found with red juice on his shirt. | D,I | fu | chat
a laundry room | a student back from university | He brought home a suitcase of washing and was immediately sent to the launderette. | F,V | fu | dialogue
a living room in Seoul | grandparents | They were taught to use video calls by their grandchildren and now call every morning at six. | F,G | to | chat
a front door in Bristol | a family | A parcel addressed to them contained twenty kilos of dog food, and they don't have a dog. | A,D | fu | chat
a nursery in Glasgow | new parents | The baby was finally put to sleep at 3 a.m. by playing the sound of a hairdryer. | P,F | fu | chat
a bedroom in Madrid | a nine-year-old | His wobbly tooth came out in an apple, and a coin appeared under his pillow the next morning. | I,A | to | chat
a family car | a father | The satnav was set to Spanish by his daughter, and he drove for an hour without being able to change it back. | F,A | fu | dialogue
a house in the suburbs of Toronto | a family | The family cat was declared missing until it was found asleep in the airing cupboard. | D,T | fu | chat
a kitchen in Bordeaux | a family | The fridge is covered with drawings, and a new one is added every Sunday. | T,P | to | home
a bathroom | a teenager | The hot water ran out because his sister had a forty-minute shower. | I,D | an | chat
a flat in Hong Kong | a cousin | She was asked to look after her cousin's goldfish and came back to find three more in the tank. | F,V | fu | chat
a spare room | a mother | The room has turned into a storage space where everything 'temporary' stays for years. | T,I | ir | home
a dining table in Mumbai | a large family | Every Sunday the family is called to lunch by a brass bell that once belonged to a great-grandfather. | O,G | to | home
a hallway | a father | The family's shoes are thrown in a pile by the door, so every morning starts with a search. | T,A | an | home
a house in Galway | a family | Their old radio was handed down through four generations and still picks up only one station. | G,T | to | chat
a balcony in Athens | a grandfather | His basil plants are watered by a neighbour whenever he visits his daughter in London. | S,G | to | chat
a teenager's room in Oslo | a mother | Her son's room is tidied only when friends are coming over. | T,O | ir | chat
a home office | a parent | During an important video call, the parent's camera was switched on by a curious toddler. | A,F | fu | chat
a family's first flat in Birmingham | a young couple | Their sofa didn't fit through the door and had to be taken back to the shop. | I,O | an | chat
a farmhouse in Iowa | a family | The children are woken at five every morning to feed the calves before school. | O,F | ne | dialogue
a terraced house | a family | The new washing machine arrived without a door, and a second one was promised for the next week. | G,A | an | email
a flat in Vienna | a grandmother | She has her piano tuned twice a year, even though nobody has played it since the 1990s. | S,T | to | chat
a kitchen drawer | a father | The drawer is full of keys, and nobody knows which doors they open. | T,D | fu | home
a bungalow in Australia | a family | A snake was found in the laundry basket and carefully removed by a local catcher. | A,S | al | chat
a house in Krakow | a family | Grandma's handwritten cookbook was scanned and sent to every cousin as a present. | G,S | to | email
a flat in Cape Town | a teenager | She was grounded for a week after the family's phone bill arrived. | F,D | an | chat
an allotment shed | a grandfather | The shed key is hidden under a particular stone, and only he and the robins know which one. | T,R | to | chat
a kids' bedroom | parents | The bunk beds came with 200 screws and instructions written only in pictures. | P,O | an | instructions
a living room in Prague | a family | The Christmas tree fell over twice before it was tied to the curtain rail. | I,P | fu | chat
a house in Brighton | a family | Their smart speaker keeps ordering toilet paper whenever someone on TV says the word 'roll'. | I,A | fu | chat
a flat in Riga | an elderly couple | Their groceries are delivered every Thursday by a volunteer from the church. | S,G | to | dialogue
a house move | a family | Three boxes labelled 'kitchen' turned out to contain only books. | D,A | fu | chat
a family dinner in Tbilisi | a guest | The guest is expected to make a toast, and every refusal is answered with another glass. | O,F | fu | dialogue
a front garden in Cardiff | a family | The hedge was cut into the shape of a dinosaur by a neighbour who used to be a sculptor. | S,G | fu | chat
a child's birthday at home | parents | The cake was dropped on the way from the car, so the party had a 'cake crumble' instead. | I,F | fu | chat
""",
"friends and celebrations": """
a surprise party in Leeds | a group of friends | They hid in the dark for half an hour, and the birthday girl went straight to bed without turning on the lights. | F,I | fu | chat
a wedding in Kerala | a guest from Norway | She was given a sari to wear by the bride's aunt and was dressed by three cousins at once. | G,S | to | chat
a graduation in Edinburgh | a student | His name was mispronounced on stage, and the whole row cheered anyway. | F,A | fu | chat
a Diwali party in Leicester | neighbours | Hundreds of small lamps were lit along the street, and the power cut didn't even matter. | P,I | to | news
a hen party in Dublin | friends | The bride-to-be was made to wear a crown of plastic flowers for the whole weekend. | O,F | fu | chat
a stag do in Prague | a groom | He was left on a tram by his friends and found his way back using only a paper map. | F,V | fu | chat
a New Year's Eve party in Sydney | a group of backpackers | Their spot by the harbour was taken by six in the morning, so they watched the fireworks from a tree. | A,F | an | chat
a book club in Bath | members | Nobody had finished the book, so the meeting turned into a cheese tasting. | I,T | fu | chat
a Christmas jumper day at a school | a teacher | She was voted 'most hideous jumper' and was given a chocolate trophy. | F,G | fu | chat
a farewell party in an office | a colleague | A card was secretly passed round and signed by everyone, including the person leaving. | A,D | fu | chat
a festival in Edinburgh | a street performer | His hat was filled with coins and one theatre ticket that someone could not use. | A,G | to | chat
Holi in Jaipur | a tourist | His white T-shirt was turned pink and green within thirty seconds of leaving the hotel. | F,A | fu | chat
a 50th birthday in Lisbon | a mother | Her children had a video made with messages from friends she hadn't seen for thirty years. | S,G | to | chat
a reunion in Cork | old classmates | They were recognised only by their name tags, apart from one man who hadn't changed at all. | F,T | fu | dialogue
a barbecue in Texas | a group of exchange students | They were offered so much meat that they were sent home with containers of leftovers. | G,F | fu | chat
Chinese New Year in London | a family | Red envelopes with money are handed to children, and the amount must never contain the number four. | G,O | ne | instructions
a pub quiz in York | a team of friends | They won the quiz but were accused of using phones, and the prize was taken away until they proved otherwise. | F,R | an | chat
Bonfire Night in Lewes | spectators | Huge figures are carried through the town and burned at the end of the night. | P,O | ne | news
a karaoke night in Tokyo | colleagues | The shy new intern was persuaded to sing and was asked for an encore. | F,G | fu | chat
a baby shower | friends | The parents were given four identical baby monitors and no nappies. | G,F | fu | chat
a game night | a group of friends | The board game was banned from the house after a three-hour argument about the rules. | O,F | fu | chat
a wedding in a village in Italy | guests | Sugared almonds are given to every guest, always an odd number. | G,O | ne | instructions
a flash mob at a station | commuters | Commuters stopped to watch as a proposal was performed as a dance number. | P,F | to | news
a friend's housewarming | a guest | The host's new sofa was christened with red wine within the first hour. | I,A | an | chat
a camping weekend | a group of old friends | The tent was put up in the dark and found in the morning to be upside down. | P,D | fu | chat
a school prom in Manchester | a teenager | His date's corsage was delivered to the wrong house, so his mother made one from garden flowers. | G,S | to | chat
Eid in Birmingham | a family | New clothes are bought for the children, and the whole street smells of baking by morning. | P,T | to | chat
a 100th birthday in Yorkshire | a great-grandmother | She was sent a card from the King and asked whether he would come for tea. | G,F | fu | news
a friend's birthday in Moscow | a group of students | They had the birthday cake decorated with his worst school photo. | S,G | fu | chat
a wedding in Scotland | a bagpiper | The piper was booked for the ceremony but turned up at a different church. | F,D | an | dialogue
Thanksgiving in Boston | a British guest | She was asked to bring a dessert and brought trifle, which caused a national debate at the table. | G,F | fu | chat
a fancy-dress party | a guest | He came as a banana and found that two other guests had had the same idea. | D,I | fu | chat
Midsummer in Sweden | a visitor | Everyone was made to dance around a pole pretending to be little frogs. | O,F | fu | chat
a friend's art show | friends | Every painting was sold except the one the artist liked most. | A,I | ir | chat
a bar mitzvah in London | a 13-year-old | He was lifted on a chair during the dance and was sure he would be dropped. | F,A | fu | chat
a birthday dinner in Paris | a group of friends | The restaurant brought out a cake with sparklers and the wrong name on it. | A,F | fu | chat
a leaving party at a school | a caretaker | After forty years he was presented with a golden mop by the pupils. | G,F | to | news
a carnival in Notting Hill | a volunteer | Thousands of costumes are made by hand in community workshops for months before the event. | P,A | ne | process
a picnic in Hyde Park | friends | Their sandwiches were stolen by a very confident squirrel. | A,F | fu | chat
a friend's engagement | a best friend | She was told the news before the parents and had to keep it secret for a week. | F,O | to | chat
""",
"city life and local news": """
a bus stop in Sheffield | commuters | A small library has appeared inside the old bus shelter, and books are taken and returned without any rules. | A,I | gn | news
a park in Bristol | dog owners | A sign says dogs must be kept on a lead, but the ducks clearly don't know. | O,T | fu | notice
a market in Leeds | a fishmonger | His prices are written in chalk every morning and change as the day goes on. | P,T | ne | dialogue
a high street in Swindon | shopkeepers | The Christmas lights were switched on by a local girl who had raised money for the hospital. | F,A | to | news
a London Underground station | passengers | An announcement asked commuters to stop feeding the station mouse. | O,R | fu | notice
a roundabout in Milton Keynes | drivers | A giant inflatable duck appeared on the roundabout overnight, and nobody has claimed it. | I,A | fu | news
a café in Brighton | a barista | Customers who bring their own cup are given a discount and a free biscuit. | G,O | ne | notice
a city council in Glasgow | residents | Residents were asked to vote on the name of a new snowplough, and 'Sir Andy Plowray' won. | F,A | fu | news
a car park in Reading | drivers | Cars were blocked in for three hours because a film crew needed the space for a chase scene. | F,A | an | news
a bakery in Kraków | a baker | The bakery is so popular that the queue starts forming an hour before it opens. | T,I | ne | review
a canal in Amsterdam | a council worker | About fifteen thousand bicycles are fished out of the canals every year. | A,P | ne | news
a library in Liverpool | readers | An overdue book was returned with a 60-year-old apology note inside. | F,D | to | news
a city square in Vilnius | tourists | A secret tile that is said to grant wishes is hidden among thousands of others. | R,T | fu | travel
a pedestrian crossing in Manchester | a schoolgirl | Her drawing was chosen to decorate the crossing outside her school. | F,A | gn | news
a block of flats in Berlin | residents | A note in the lift asks whoever is learning the trumpet to practise before ten. | O,R | an | notice
a city park in Madrid | joggers | The fountains are switched off at night to save water during the summer. | O,P | ne | notice
a fire station in Leeds | firefighters | A cat that kept visiting was officially given the job of station mascot. | G,F | fu | news
a city zoo in Chester | keepers | A penguin was given a tiny pair of boots to protect a sore foot. | G,F | to | news
a parking zone in Edinburgh | a resident | He was fined for parking outside his own house because the permit had expired at midnight. | F,O | an | chat
a hospital car park in Hull | visitors | Free parking was promised to visitors and staff, and the machines were finally turned off. | G,O | gn | news
a corner shop in Belfast | a shopkeeper | The shop has been run by the same family for three generations and has never closed on Christmas Day. | T,P | to | news
a city tram in Lisbon | passengers | The old yellow tram was stuck on a hill because a tourist had parked a hire car on the rails. | F,D | an | news
a high-rise in Singapore | residents | Rubbish is collected by an underground vacuum system, so no bin lorries enter the estate. | P,A | ne | process
a bus in Oxford | passengers | A driver stopped the bus to help a duck and her ducklings cross the road. | F,I | to | news
a city hall in Barcelona | a couple | Their wedding was performed by the mayor in Catalan, Spanish and English. | F,A | to | chat
a street in Nottingham | residents | A mysterious knitted hat appeared on every postbox in the area over one weekend. | A,I | fu | news
a museum night in Paris | visitors | Museums are opened for free one night a year, and queues go round the block. | O,P | ne | news
a city pool in Helsinki | swimmers | The pool is heated by waste energy from a nearby data centre. | P,A | ne | process
a train station in Zurich | travellers | A train that left 40 seconds late was reported in the local paper. | R,F | ir | news
a pothole in Bradford | locals | Someone planted flowers in a pothole to make the council notice it. | A,D | ir | news
a city marathon in Dublin | runners | Bananas and water were handed out by schoolchildren along the route. | G,A | to | news
a smart bench in Seoul | pedestrians | The bench charges phones and is powered by sunlight. | P,T | ne | tech
a cinema in Leeds | a projectionist | The last film on 35 mm was shown before the old projector was retired. | F,A | to | news
a city street in Rome | a resident | Coins thrown into the Trevi Fountain are collected every week and given to charity. | A,G | ne | travel
a lost property office in Tokyo | travellers | Millions of yen in cash are handed in every year and mostly returned to their owners. | G,A | gn | news
a city noticeboard in Cambridge | students | A lost cat poster was answered by twelve people claiming to have seen a different cat. | F,R | fu | chat
a traffic jam in Mexico City | drivers | Street vendors sell everything from snacks to phone chargers between the lines of cars. | P,T | ne | travel
an e-scooter scheme in Bristol | riders | Scooters left on pavements are taken away and kept until a fine is paid. | O,A | an | notice
a bridge in Paris | tourists | So many love locks were attached to the railings that panels had to be removed. | A,O | ir | news
a city square in Kraków | pigeons and tourists | Feeding pigeons is banned, but a man in a hat is fined almost every day. | O,F | fu | news
""",
"environment, farming, space and aviation": """
a beekeeper's garden in Somerset | a beekeeper | Half her hives swarmed on the same afternoon and settled on a neighbour's trampoline. | I,F | fu | chat
a sheep farm in Wales | a farmer | His sheep are counted by a drone, and the drone is chased by his dog. | P,A | fu | chat
an orchard in Kent | pickers | Apples that fall to the ground are sent to make cider rather than being sold. | P,G | ne | process
a dairy farm in Holland | cows | The cows are milked by robots whenever they choose to walk into the machine. | P,S | ne | process
a rice terrace in Bali | farmers | Water is shared between farms by a system that is a thousand years old. | O,P | ne | process
a forest in Scotland | rangers | Beavers were brought back to the area and started building dams within weeks. | A,I | gn | news
a beach in Cornwall | volunteers | Two tonnes of plastic were collected in one morning, including a fridge door. | A,P | bn | news
a vineyard in Champagne | workers | The grapes are picked by hand because machines would crush them. | P,O | ne | process
a glacier in Iceland | scientists | A plaque was put up for the first glacier lost to warming. | A,T | bn | news
a lavender farm in Provence | tourists | Visitors are asked not to walk between the rows for photos. | O,F | an | notice
a mushroom farm in Poland | workers | The mushrooms are grown in total darkness and picked every few hours. | P,T | ne | process
a wind farm in the North Sea | engineers | Each turbine is checked by a technician who is lowered from a helicopter. | P,S | al | report
a field in Norfolk | a farmer | A rare orchid appeared in a field that had been left unploughed for ten years. | I,T | gn | news
a seed vault in Svalbard | scientists | Seeds from almost every country are stored inside a frozen mountain. | T,P | ne | report
a pig farm in Denmark | piglets | The piglets are given toys so that they don't get bored. | G,F | fu | news
a community garden in Detroit | volunteers | An empty car park was turned into a garden that feeds a hundred families. | P,V | gn | news
a coral reef in Australia | divers | Baby corals are grown in underwater nurseries and planted on the reef. | P,A | gn | process
a city rooftop in London | beekeepers | Honey from the bees on the roof of a bank is sold to the bank's staff. | G,P | fu | news
a tea plantation in Assam | pickers | Only the top two leaves and a bud are picked from each shoot. | P,O | ne | process
a farm in New Zealand | a sheepdog | The dog was retired and given his own armchair by the fire. | G,F | to | chat
a river in Yorkshire | residents | Salmon were spotted in the river for the first time in a century. | I,A | gn | news
a launch site in Florida | engineers | The launch was delayed because a pelican landed on the rocket. | I,F | fu | news
the International Space Station | astronauts | Water from the crew's sweat and washing is recycled into drinking water. | P,T | ne | process
a planetarium in Manchester | schoolchildren | Their names were sent into space on a microchip aboard a Mars rover. | G,F | to | news
an observatory in Chile | astronomers | The telescope is closed whenever the wind is too strong. | O,T | ne | report
a meteorite field in Morocco | local hunters | Pieces of a meteorite are sold to collectors after they are checked under a microscope. | P,G | ne | report
a space agency in Paris | applicants | Thousands of people applied, and one woman was selected despite never having flown a plane. | F,R | gn | news
a Mars rover team in California | scientists | The rover sang 'Happy Birthday' to itself on Mars a year after landing. | I,F | fu | news
a farm in Japan | strawberry growers | Strawberries are pollinated by bees inside greenhouses, and each fruit is sold separately. | P,G | ne | process
a flight from Glasgow | passengers | The plane was turned back because a passenger's dog had escaped into the hold. | F,D | an | news
an airport in Heathrow | travellers | All liquids must be placed in a clear bag before passengers go through security. | O,F | an | notice
an airfield in Kitty Hawk | the Wright brothers | The first powered flight lasted twelve seconds and was watched by only five people. | T,A | ne | history
a hot-air balloon festival in Albuquerque | a balloon pilot | His balloon was blown off course and landed in someone's back garden during a family breakfast. | I,F | fu | chat
a private jet hangar in Geneva | mechanics | Every plane is inspected after a set number of flying hours, whatever its condition. | O,P | ne | process
a small airline in Scotland | passengers | The flight between two islands is so short that drinks are never served. | O,T | fu | travel
an air show in Fairford | spectators | A display team drew a giant heart in the sky with coloured smoke. | P,F | to | news
a solar farm in Spain | sheep | Sheep are let in to keep the grass short between the solar panels. | S,O | ne | process
a forest fire lookout in Canada | a ranger | She was given a satellite phone after her old radio stopped working. | G,F | ne | chat
a weather station in Antarctica | researchers | The station is buried in snow every winter and has to be dug out by the summer team. | I,P | al | report
a crop field in Kansas | farmers | Fields are watered by giant circles of sprinklers that are visible from planes. | P,T | ne | process
""",
}

out = Path(__file__).resolve().parents[1] / "content/passive-bank/v7/seeds/seeds-5.jsonl"
rows, n = [], 0
for dom, block in DATA.items():
    lines = [l for l in block.strip().splitlines() if l.strip()]
    assert len(lines) == 40, (dom, len(lines))
    for l in lines:
        place, who, sit, hooks, tone, reg = [x.strip() for x in l.split("|")]
        n += 1
        rows.append({"seed_id": f"S5-{n:03d}", "domain": dom, "place": place, "who": who, "situation": sit,
                     "hooks": [HOOK[h] for h in hooks.split(",")], "tone": TONE[tone], "register": reg})
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in rows) + "\n")
print(len(rows), "seeds →", out)
