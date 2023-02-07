// File: script.js - noroff Narrative 2023
// Author: itsOiK
// Date: 24/01-23 
console.log('[script:0]: JavaScript loaded');

const getElId = (id) => document.getElementById(id);
const appendHr = (element) => element.appendChild(document.createElement("hr"));

const container = getElId("container");
const textContainer = getElId("text-container");
const itemResponse = getElId("item-response");
const itemsContainer = getElId("items");
const inventoryContainer = getElId("inventory");
const inventoryElm = getElId("inventory");
const navigation = getElId("navigation");


// TODO: WORKAREA for: PLACEHOLDER - START:
getElId("dev_go").onclick = () => { (getElId("lal").value.length > 0 ? main.goToPassage(passages[getElId("lal").value]) : console.warn('[script:20]: No passage text')); };
getElId("dev_x").onclick = () => { inventoryElm.style.display == "none" ? inventoryElm.style.display = "block" : inventoryElm.style.display = "none"; };
function getKeyByValue(object, value) { return Object.keys(object).find(key => object[key] === value); }
function updatePassageIndicator(passage) { getElId("dev_y").innerHTML = getKeyByValue(passages, passage); }
// TODO: WORKAREA for: PLACEHOLDER - END:

class Item {
    constructor(button, inventory) {
        this.inventory = inventory;
        this.button = button;
        this.name = button.name;
        this.buttonText = "Use " + this.name;
        this.text = button.getAttribute("text");
    }
    use(usedButton) {
        itemResponse.innerHTML = "";
        itemResponse.classList.toggle("item-response-hidden");
        var passage = this.inventory.main.currPassage;
        var buttonText = "Close";
        itemResponse.innerHTML = `Using the ${this.name} would not have any effect here!`;
        if (Object.keys(passage).includes("items")) {
            for (const [key, value] of Object.entries(passage.items)) {
                if (value.use) {
                    itemResponse.innerHTML = this.text;
                    buttonText = "Continue";
                    while (navigation.children.length > 1) {
                        navigation.firstChild.remove();
                    }
                }
            }
        }
        itemResponse.innerHTML += `<button onclick="main.closeItemResponseAndGotoPassage(passages['${passage.next}'], ${usedButton.id})">${buttonText}</button>`;
    }
}

class Inventory {
    currentInventory = [];
    constructor(main) {
        this.main = main;
    }
    updateInventory() {
        main.updateItems();
    }
    addToInventory(itemPickupLink) {
        this.currentInventory.push(new Item(itemPickupLink, this));
        var parentDiv = itemPickupLink.parentElement;
        // find index of itemPickupLink to remove it's <hr>
        const index = Array.from(navigation.children).indexOf(parentDiv);
        navigation.children[index + 1].remove();
        parentDiv.remove();
        this.updateInventory();
    }
    removeFromInventory(itemName) {
        var i = this.currentInventory.map((o) => o.name).indexOf(itemName);
        if (i > -1) this.currentInventory.splice(i, 1);
        this.updateInventory();
    }
}

class Main {
    inventory = new Inventory(this);
    passageHistory = [];
    currPassage = passages.intro;
    timeoutJokeTimer = null;
    constructor() {
        null;
    }
    updateNavigation(passage) {
        navigation.innerHTML = "";
        this.passageLinks(passage); // add passage link
        if (Object.keys(passage).includes("items"))
            this.pickupItemLink(passage); // add item pickup link
        // add "#back" button
        navigation.innerHTML += `<div id="back"><a href="#"  onclick="main.goToPrevPassage()">🢀</a></div>`;
        if (this.passageHistory.length == 1) {
            // remove back button if we are on first page
            getElId("back").remove();
        }
    }
    passageLinks({ links }) {
        links.forEach(linkElement => {
            if (!this.inventory.currentInventory.map(invItem => invItem.name).includes(linkElement.firstChild.name)) {
                navigation.appendChild(linkElement);
                appendHr(navigation);
            }
        });
    }
    pickupItemLink(passage) {
        if (Object.keys(passage).includes("items")) {
            for (const [itemName, itemValue] of Object.entries(passage.items)) {
                if (!this.hasItemInInv(itemName) && itemValue.pickup) {
                    navigation.appendChild(itemPickup(items[itemName]));
                    appendHr(navigation);
                }
            }
        }
    }
    updateItems() {
        itemsContainer.innerHTML = "";
        if (this.inventory.currentInventory.length > 0) {
            this.inventory.currentInventory.forEach(item => {
                itemButton(item, itemsContainer);
            });
        }
    }
    clearContainer() { textContainer.innerHTML = ""; }
    goToPassage(passage, goToPrev = false) {
        this.timeoutJoke(passage);
        updatePassageIndicator(passage); //!DEV
        itemResponse.classList.add("item-response-hidden");
        itemResponse.innerHTML = "";
        if (this.currPassage && !goToPrev) {
            this.passageHistory.push(this.currPassage);
        }
        this.currPassage = passage;
        this.currPassage.name = Object.keys(passages).find(key => passages[key] === this.currPassage);
        this.clearContainer();
        this.updateNavigation(passage);
        var hasVisitedPassage = this.hasVisitedPassage(passage);
        textContainer.innerHTML = this.addItemTextToPassage(hasVisitedPassage);
        this.updateItems();
        this.finalEnding();
        this.thankYou();
    }
    thankYou() {
        if (this.currPassage.name == "basement_final") {
            var visitedJokes = this.passageHistory.filter((passage) => {
                const { name } = passage;
                if (name == "joke" || name == "timeout") { return passage; }
            });
            var p = getElId("basement_final_p");
            var jokeCount = (visitedJokes.length < 3 ? visitedJokes.length : 2);
            if (jokeCount > 0) p.innerHTML = `<b>Good Job! </b><br>`;
            p.innerHTML += `You found ${jokeCount} of 2 easter eggs!<br>`;
            switch (jokeCount) {
                case 0:
                    p.innerHTML += `Hint: <i>There was a window</i>`;
                    break;
                case 1:
                    p.innerHTML += `Hint: <i>It takes time to to deep fry chickens.</i>`;
                    break;
                default: null;
            }
        }
    }
    finalEnding() {
        const p = getElId("countDown");
        if (p) {
            p.innerHTML = "30.000";
            var timeLeft = 30;
            this.interval = setInterval(() => {
                p.innerHTML = timeLeft.toFixed(3);
                timeLeft -= 0.001;
                if (timeLeft <= 0) {
                    clearInterval(this.interval);
                    setTimeout(this.goToPassage(passages["basement_fail"]), 250);
                }
            }, 1);
        } else clearInterval(this.interval);
    }
    timeoutJoke(passage) {
        if (Object.keys(passage).includes("timeout") && !this.timeoutJokeTimer) {
            this.timeoutJokeTimer = setTimeout(() => {
                this.goToPassage(passages[passage.timeout.next]);
            }, 1000 * passage.timeout.wait);
        } else {
            clearTimeout(this.timeoutJokeTimer);
        };
        return passage;
    }
    hasVisitedPassage(currPassage) {
        // if we have visited.Text, check if we actually have visited
        const hasVisited = Object.keys(currPassage).includes("visited");
        if (hasVisited && this.passageHistory.includes(currPassage)) {
            //if we have items in passage, check if item is used
            if (Object.keys(currPassage).includes("items")) {
                for (const [key, value] of Object.entries(currPassage.items)) {
                    // if item is not used, return original passage
                    if (!value.used) return currPassage;
                }
            }
            // if we don't have items, and item is used, return visited text
            currPassage.text = currPassage.visited.text;
            if (Object.keys(currPassage.visited).includes("links"))
                this.updateNavigation(currPassage.visited);
        }
        //  if passage don't have visitedText or is not in history, return original
        return currPassage;
    }
    hasItemInInv = (itemName) => this.inventory.currentInventory.map(invItem => invItem.name.toLowerCase()).includes(itemName.toLowerCase());
    addItemTextToPassage(passage) {
        var mod = "";
        if (Object.keys(passage).includes("items")) {
            for (const [key, value] of Object.entries(passage.items)) {
                if (this.hasItemInInv(key)) {
                    if (value.use && !value.used) {
                        mod = items[key].can;
                    }
                }
                else if (value.use && !this.hasItemInInv(key)) {
                    mod = items[key].cant;
                }
                if (value.used) mod = "";
            }
            return `${passage.text}<br>${mod}`;
        } return passage.text;
    }
    goToPrevPassage() {
        if (this.passageHistory.length > 0) {
            var prev = this.passageHistory.pop();
            this.goToPassage(prev, true);
        }
    }
    closeItemResponseAndGotoPassage(nextPassage, usedButton) {
        itemResponse.classList.add("item-response-hidden");
        if (nextPassage) {
            this.inventory.removeFromInventory(usedButton.id);
            this.currPassage.items[usedButton.id.toLowerCase()].used = true;
            this.goToPassage(nextPassage);
        }
    }
    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
}

const dialogue = {
    thoughts: (x) => `<p class="thoughts">"${x}"</p>`,
    speech: (x) => `<p class="playerSpeech">"${x}"</p>`,
    npc: (x) => `<p class="npcSpeech">"${x}"</p>`,
};

const items = {
    extinguisher: {
        name: "Extinguisher",
        text: `
        You spray the fire with the extinguisher, trying to focus on the base of it. 
        The Extinguisher spitters and spatters what few droplets it has left and you eventually defeat the blazing flames
        `,
        can: `${dialogue.thoughts("I have to try to put out this fire!")}`,
        cant: `${dialogue.thoughts("I need something to put out this fire with!")}`,
    },
    flashlight: {
        name: "Flashlight",
        text: `
        Your flashlight illuminates the damp basement and reveals a large room that has several doors.
        <br>
        ${dialogue.thoughts("This is where people used to store potatoes back in the day, now it's mostly used for personal storage by the tenants.")}
        <br>
        There are many thoughts rushing through your mind, amongst them are pleasant memories from a time long past.
        <br>
        You spot the door that had a light shining through the keyhole and approach it.
        `,
        can: `${dialogue.thoughts("I can use my flashlight here so I can see!")}`,
        cant: `${dialogue.thoughts("I can't see shit! I will need something to light up this place with!")}`,
    }
};


const passages = {
    easter: {
        text: `... ${dialogue.thoughts("What came first?")}`,
        links: [
            passageLink("egg", "Chicken?"),
            passageLink(null, "or"),
            passageLink("egg", "Egg?"),
        ],
    },
    egg: {
        text: dialogue.thoughts("Hmm.. It is a difficult question; What came first?"),
        links: [
            passageLink("joke", "🥚?"),
            passageLink(null, "or"),
            passageLink("joke", "🐔?"),
        ],
    },
    joke: {
        text: `
        ${dialogue.thoughts("I don't have time for this! There might be a fire raging and I'm standing here thinking about chickens?")}
        <br>
        <br>
        You can not believe you have just stood there for 5 minutes thinking about chickens, and it was not the good deep fried kind either.
        <br>
        You get your act together after that moment of weakness and blame it on the stress of dealing with the situation!`,
        links: [
            passageLink("foyer_3", "Leave office"),
        ], visited: {
            text: `<h1>Congratulations, you found the ultra secret easter egg joke!</h1>
            ${dialogue.thoughts("I don't have time for this! There might be a fire raging and I'm standing here thinking about chickens?")}
            <br>
            <br>
        You can not believe you have just stood there for 5 minutes thinking about chickens, and it was not the good deep fried kind either.
        <br>
        You get your act together after that moment of weakness and blame it on the stress of dealing with the situation!`,
        },
        timeout: { wait: 3, next: "timeout" },
    },
    intro: {
        text: `
        You abruptly wake up at the darkest hour of the night, rub the sleep from your eyes, before you notice the smell of smoke. 
        <br>
        <br>
        ${dialogue.thoughts("What's going on here?")} ..you think to yourself as you mutter the words; 
        ${dialogue.speech("Is something burning?")}
        <br>
        <br>
        You lurch out of the bed and slow as a sloth on a hot summer's day, you stumble around in the dark, 
        turning on light after light, trying to see if there is something wrong. 
        <br>
        You slowly come to the conclusion that at least your apartment is not on fire.
        <br>
        <br>
        ${dialogue.thoughts("Well that's a relief, but what is this hellish smell of smoke, and where does it come from?")}
        <br>
        <br>
        From the pile of a week's worth of used clothes at the foot of your bed, you equip a few random items.
        `,
        links: [
            passageLink("apartment", "Leave the apartment"),
        ],
    },
    apartment: {
        text: `
        As you exit your apartment, you come to the realization; 
        <br>
        <br>
        ${dialogue.thoughts("Why is there no alarm ringing? With this strong smell of smoke there has to be a fire nearby")}
        <br>
        <br>
        You enter the dark hallway. There are obvious signs that nobody has been here in a while. 
        <br>
        <br>
        ${dialogue.speech("These damn light sensors are so bad!")} ..you squeal out whilst stumping your toe against something in the dark.
        <br>
        <br>
        ${dialogue.speech("FUCK! Wha.. what the fuck!? That hurt!")}
        <br>
        <br>
        You crouch to the floor to avoid any other damages and feel around for whatever exploited your foot.
        <br>
        Suddenly, the lights are turned on and a bright flash of light blinds your unaccustomed eyes.
        <br>
        After recovering from the dazzle, you spot a fire extinguisher pleading innocence laying across the floor, out of its place.`,
        links: [
            passageLink("elevator", "Take the elevator"),
            passageLink("extinguisher_reminder", "Take the stairs"),
        ],
    },
    elevator: {
        text: `
        There is a big red label on the elevator stating: 
        <p style="color:white;background-color: red;text-align: center;width: 50%;">
        IN CASE OF FIRE, <br>DO NOT USE ELEVATOR, <br>USE STAIRS</p>
        ${dialogue.thoughts("I should probably take the stairs instead.<br> I should also grab the fire extinguisher, just in case!")}
        <br>
        <br>
        `,
        links: [
            passageLink("foyer_1", "Take the stairs instead"),
        ],
        items: {
            extinguisher: { use: false, pickup: true, used: false },
        },
    },
    extinguisher_reminder: {
        text: `
        There's a pungent smell of smoke, are you sure you don't want to pick up the extinguisher?
        <br>
        <br>
        ${dialogue.thoughts("It is not a bad idea to have a fire extinguisher ready at hand in case there is a fire.")}
        <br>
        <br>
        `,
        links: [
            passageLink("foyer_1", "Take the stairs"),
        ],
        items: {
            extinguisher: { use: false, pickup: true, used: false },
        },
    },
    foyer_1: {
        text: `
        In a hurry you stumble into the foyer.<br><br>
        ${dialogue.thoughts("These lights are never turned off..")} ..you notice while you get back on your feet.
        <br>
        <br>
        ${dialogue.thoughts(`I should go to the parking lot. One thing I remember from previous fire drills is:  
        'In case of emergency, gather at the parking lot'. They kept hammering this into our heads.`)}
        `,
        links: [
            passageLink("outside_building_1", "Go outside"),
        ],
    },
    foyer_2: {
        text: `
        The person has left and you continue down the foyer alone, trying to figure out why 
        the alarms are not ringing and where the stench is coming from.
        <br>
        You see the janitor's office door at the end of the hallway.
        <br> 
        On the opposite side of the room you see the door to the staircase, next to the elevator.
        There is a fire extinguisher in front of the elevator that seems to have been thrown away in a hurry.
        <br>
        <br>
        ${dialogue.thoughts("Why is it so dark here? Do the lights not work?")}
        <br>
        <br>
        `,
        links: [
            passageLink("janitors_door", `Knock on the janitor's door`),
        ],
    },
    foyer_3: {
        text: `
        You are back in the foyer where you have been hundreds of times before.<br><br>
        ${dialogue.thoughts("What should I do next?")} ..you think.
        <br>
        <br>
        `,
        links: [
            passageLink("staircase", `Go to the staircase`),
        ],
        items: {
            extinguisher: { use: false, pickup: true, used: false },
        },
    },
    outside_building_1: {
        text: `
        You are outside of the building, there is nobody else around. Not a single sound can be heard, 
        it's darker than the center of a black hole and you cannot see further than a few meters away.
        <br>
        <br>
        ${dialogue.thoughts("Hmm.. That's weird.. How come I can't even see the street lights?")}
        <br>
        <br>
        You are curious as to why nothing is illuminated beyond the parking lot.
        <br>
        `,
        links: [
            passageLink("outside_leave", "Investigate the darkness"),
            passageLink("enter_building", "Go back inside"),
        ],
    },
    outside_building_2: {
        text: `
        You come to your senses and turn around to go back inside while thinking; 
        <br>
        <br>
        ${dialogue.thoughts("If anything had happened to someone inside the building, ")}
        ${dialogue.thoughts("I could not have lived with myself if I had left now, and something would have happened to anyone inside!")}
        `,
        links: [
            passageLink("enter_building", "Go back inside"),
        ],
    },
    outside_building_3: {
        text: `
        Nothing has changed out here since last time you were here. 
        <br>
        The street lights are still nowhere to be seen, the area is as if covered in a blanket of darkness.
        `,
        visited: {
            text: `
        Upon reaching outside yet again, you start to feel as if there is a force preventing you from leaving.
        <br>
        <br>
        ${dialogue.thoughts("What the hell is this feeling, I'm not afraid of the dark!")}
        ${dialogue.thoughts("I could just leave, but I am unable to do so!")}
        `},
        links: [
            passageLink("outside_leave", "Leave"),
            passageLink("foyer_3", "Go back inside"),
        ],
    },
    outside_leave: {
        text: `
        As you are walking in the darkness you are struck back with a flood of thoughts; 
        <br>
        <br>
        ${dialogue.thoughts(`Am I really going to leave all those people left inside? The building is potentially 
        on fire and no alarm has been triggered! Nobody knows about the impending danger! I can't leave without alerting 
        someone or doing something about the situation first!`)}`,
        links: [
            passageLink("outside_building_2", "Turn back"),
        ],
    },
    enter_building: {
        text: `
        You go back inside the building and meet someone exiting. They are equipped with a dapper suit and look ready to go to the likes of a fancy party.
        <br>
        You stop the person and ask them; 
        <br> 
        <br>
        ${dialogue.speech("Hey! Are you OK? Do you know where the fire is, or where the smell is coming from?")}
        <br>
        ${dialogue.npc("Yeah, I'm OK thanks! Fire? Smell? What are you talking about?")}
        <br>
        ${dialogue.speech("What!? You can't tell the whole building reeks of smoke?")}
        <br>
        ${dialogue.npc("I don't have time for this bullshit, I'm late for work!")}
        <br>
        <br>
        The person brushes you off and leaves the building.
        <br>
        You shake your head in disbelief that they could not tell something was off.
        <br>
        <br>
        `,
        links: [
            passageLink("foyer_2", `${dialogue.thoughts("Well, that was odd!")}`),
        ],
    },
    staircase: {
        text: `
        As you enter the staircase, you are filled with a plethora of thoughts;
        <br>
        <br>
        ${dialogue.thoughts("I wonder why the office was so dusty?")}
        <br>
        ${dialogue.thoughts("The clothing in those boxes were so old!")}
        <br>
        ${dialogue.thoughts("Why were the boxes still in the office?")}
        <br>
        <br>
        You shake your head, trying to clear free of these thoughts. As you are hit with the smell of smoke again,
        you try to focus on the current situation instead.
        <br>
        <br>
        ${dialogue.thoughts("I seriously have to stop losing track of my thoughts and focus on the task at hand!")}
        <br>
        `,
        visited: {
            text: `
            Everything that is happening is causing you to sweat and your stress level increases.
            <br>
            <br>
            ${dialogue.thoughts("I cannot wait until this day is over!")}
            <br>
            `,
            links: [
                passageLink("floor_select", `Back to the staircase`),
            ],
        },
        links: [
            passageLink("foyer_3", `Go back to the hallway`),
            passageLink("floor_select", `Go to a specific floor`),
        ],
    },
    floor_select: {
        text: `Which floor do you go to?`,
        links: [
            passageLink("basement_1", `Basement`),
            passageLink("foyer_3", `Ground floor`),
            passageLink("dialogue_1", `Floor 02`),
            passageLink("other_floors", `Floor 03`),
            passageLink("floor_04", `Floor 04`),
            passageLink("other_floors", `Floor 05`),
            passageLink("janitors_floor_1", `Floor 06`),
            passageLink("other_floors", `Floor 07`),
        ],
    },
    other_floors: {
        text: `
        You peek your head in to see in the hallway.
        <br>
        There are no visual signs of fire or smoke.
        <br>
        You inhale fiercely with your nose to try and see if there are any smells of smoke.
        <br>
        There is only a hint of smoke emanating from the staircase, this floor does not seem like the source of the fire.
        <br>
        `,
        visisted: {
            text: `
        As you open the door you take a quick look around to see if there are any signs of fire here.
        <br>
        Not able to see any fire, you try to rely on other senses and stop silent for a second to see if you can hear any sounds of fire or people.
        <br>
        It is dead silent and after a quick smell as well you conclude that there is nothing of worry here either.
        `},
        links: [
            passageLink("floor_select", `Back to the staircase`),
        ],
    },
    dialogue_1: {
        text: `
        As you exit the staircase, you hear a door slam shut. A well dressed individual that looks to be 
        fairly stressed approaches the staircase door and bumps your shoulder as they pass you. 
        <br> 
        <br>
        ${dialogue.speech("Hey! You again?")}
        <br>
        ${dialogue.npc("Eh..? What?")}
        <br>
        ${dialogue.speech("I met you earlier in the foyer, remember? You said you were late for work.")}
        <br>
        ${dialogue.npc("What are you talking about? We have never met before!")}
        <br>
        ${dialogue.thoughts("What is this person talking about? I swear it is the same person I met before")}
        <br>
        ${dialogue.speech("I'm sorry, I must have mistook you for someone else then.")}
        <br>
        ${dialogue.npc("That is OK, it happens. I got to go to work. Have a good day, sir!")}
        <br>
        <br>
        You bid them farewell after this confusing interaction and they leave.
        <br>
        <br>
        ${dialogue.thoughts("This day is getting more and more strange by the minute.")}
        <br>
        <br>
        As far as you can tell there is no sign of either smoke or fire here.
        <br>
        `,
        links: [
            passageLink("floor_select", `Back to the staircase`),
        ],
        visited: {
            text: `
            ${dialogue.thoughts("This is the floor where I met that person who was going to work.")}
            <br>
            <br>
            As far as you can tell there is no sign of neither smoke nor fire here.
            <br>
            `,
        },
    },
    basement_1: {
        text: `
        You enter the basement. It is a cold, damp and dark basement with a distinct smell of old potatoes. 
        <br>
        These kinds of basements always bring up fond memories of your past.
        <br>
        It's dark, except for a sliver of light shining from a keyhole at the opposite side of the room.
        <br>
        `,
        visited: {
            text: `
            You are back in the basement with the pungent smell of old potatoes.
            <br>
            It's dark, except for a sliver of light shining from a keyhole at the opposite side of the room.
            <br>
            `,
        },
        links: [
            passageLink("floor_select", `Back to the staircase`),
        ],
        items: {
            flashlight: { use: true, pickup: false, used: false }
        },
        next: "basement_2",
    },
    basement_2: {
        text: `
        You slowly walk up to the door and for each step closer, your breath starts trembling like an autumn leaf.
        <br>
        <br> 
        ${dialogue.thoughts("I'm not cold, why am I shivering like this?")}
        <br>
        <br> 
        The trembling intensifies and your hands are shaking as you reach out to the doorknob.
        Suddenly a warm and soothing sensation emanates from the doorknob straight to the core of your being,
        immediately causing all of your shivering and trembling to stop.
        `,
        links: [
            passageLink("basement_3", "Open the door"),
        ],
    },
    basement_3: {
        text: `
        As you open the door a great, bright light blinds you. 
        <br>
        You cover your eyes with your hands to block the illumination.
        <br>
        The glare starts flickering slightly before it starts to dim. 
        `,
        links: [
            passageLink("basement_4", dialogue.thoughts("Is this the end?")),
        ],
    },
    basement_4: {
        text: `
        You feel yourself floating in a vast void, with no sense of direction you look around to 
        try and understand what is going on.
        <br>
        When you look to one side you can see a bright light in the distance, on the other side an empty void.
        <br>
        <br>
        Time is dwindling: <p style="display: inline;" id="countDown" data="30">xx:xx:xx</p>
        <br>
        <h3>You must hurry up and make a choice before you are pulled out of this void!</h3>
        ${dialogue.thoughts("Is this the end?")}
        <br>
        ${dialogue.thoughts("What do I do?")}
        <br>
        ${dialogue.thoughts("How can I choose?")}
        <br>
        `,
        links: [
            passageLink("basement_light_1", "The Light"),
            passageLink("basement_dark_1", "The Dark"),
        ],
    },
    basement_fail: {
        text: `
        You failed to make a decision, it is understandable, it's not an easy choice to make.
        <br>
        Afterall, you do not have much to base your choices on.
        <br>
        One could even argue that making no decision, is the grandest decision to choose.
        <br>
        <br>
        ${dialogue.thoughts("If only I could try again!")}
        <br>
        <br>
        `,
        links: [
            passageLink("basement_final", "...."),
        ],
    },
    basement_light_1: {
        text: `
        You decide to approach the light and are filled with a feeling of sadness coursing through you entirely.
        <br>
        <br>
        ${dialogue.thoughts("There are so many things left unanswered in life.")}
        <br>
        ${dialogue.thoughts("So many things I wish I had been able to do.")}
        <br>
        ${dialogue.thoughts("So much I could have done differently.")}
        <br>
        `,
        links: [
            passageLink("basement_light_2", "...."),
        ],
    },
    basement_light_2: {
        text: `
        You are floating in this vast space of nothingness, in the light as bright as the core of a sun.  
        <br>
        There appears to be some form of clouds soaring past you. 
        <br>
        You do not feel like you are moving, yet the lumps of mist are traversing this space at magnificent speeds.
        <br>
        When you focus on one of the shadowy shapes, you can spot that there is something inside, and you try to focus on the biggest one. 
        <br>
        As the next cloud approaches, you squeeze every ounce of energy you have left to focus.
        <br>
        <br>
        ${dialogue.thoughts("Is that... A memory?")}
        <br>
        <br>
        As the cloud gets closer, you sense it slowing down, and you are able to look inside.
        <br>
        You see that familiar shape you came upon earlier in the workshop and can hear it speaking to someone;
        <br>
        <br>
        ${dialogue.npc("How could you do this?")}
        <br>
        ${dialogue.npc("I can't imagine what went through your head!")}
        <br>
        ${dialogue.npc("What were you thinking?")}
        <br>
        <br>
        There are no replies. The cloud starts moving again, passing right by you.
        <br>
        <br>
        You try to scream at the cloud; ${dialogue.speech("Father?..")} ..but no sound is made.
        `,
        links: [
            passageLink("basement_light_3", "...."),
        ],
    },
    basement_light_3: {
        text: `
        The cloud is long gone, and there are no more in sight.
        <br>
        The light is becoming so bright that it could crack a diamond.
        <br>
        <br>
        ${dialogue.thoughts("....")}
        <br>
        <br>
        At this point you can not feel, speak, or even think.
        <br>
        <h4>You just exist in this moment.</h4>
        <br>
        `,
        links: [
            passageLink("basement_final", "...."),
        ],
    },
    basement_dark_1: {
        text: `
        You decide to approach the dark void and are filled with a feeling of relief coursing through your every grain.
        <br>
        <br>
        ${dialogue.thoughts("I don't regret the things I have done.")}
        <br>
        ${dialogue.thoughts("All of the experiences and situations I have encountered.")}
        <br>
        ${dialogue.thoughts("So much I have achieved in life.")}
        <br>
        `,
        links: [
            passageLink("basement_dark_2", "...."),
        ],
    },
    basement_dark_2: {
        text: `
        Even though you are surrounded by this darkness you can spot some flickering lights all around you, that are at some distance away from you.
        <br>
        You are unable to move, you try to speak, but no sound escapes your mouth. 
        <br>  
        <br> 
        ${dialogue.thoughts("What is that")}
        <br>
        <br>
        You set your eyes on the brightest spark trying to see what it is.
        <br>
        The more you stare at this strange thing, the brighter and bigger it becomes.
        <br>
        As the flare gets as big as it can get, a voice can be heard from within;
        <br>
        <br>
        ${dialogue.npc("How was your day at school?")}
        <br>
        ${dialogue.npc("Did you learn anything interesting?")}
        <br>
        <br>
        You try to speak, but still, not even a single tone comes out.
        <br>
        The light vanishes in the blink of an eye and you are left alone in the dark.
        <br>        
        <br>
        `,
        links: [
            passageLink("basement_dark_3", "...."),
        ],
    },
    basement_dark_3: {
        text: `
        The flickering lights fade into the dark as if your memories dwindle to nothing.
        <br>
        Not a single thought is running through your mind and you feel the darkness penetrating into your very being. 
        <br>
        This all-encompassing feeling takes over and you are left speechless, motionless and thoughtless.
        <br>
        <h4>You just exist in this moment.</h4>
        <br>
        `,
        links: [
            passageLink("basement_final", "...."),
        ],
    },
    basement_final: {
        text: `
        <h2>Thank you for playing through this interactive story!</h2>
        <br>
        <br>
        <p id="basement_final_p"></p>
        <br>
        <br>
        Made for a school project at Noroff:<br>
        Class: <a href="https://www.noroff.no/en/studies/university-college/interactive-media-games"
            target="_blank">
            <u>Bachelor in Interactive Media - Games</u>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="white"
                    stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round"
                    stroke-linejoin="round"></path>
            </svg>
        </a>
        <br>
        Course: Narrative Design.<br>
        Made by: Leif Hagen <br>
        aka:
        <br>
        <a target="_blank" href="https://github.com/OikoumE">
            <u><h4 style="display: inline;">OikoumE</h4> on GitHub</u>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="white"
                    stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round"
                    stroke-linejoin="round"></path>
            </svg>
        </a>
        <br>
        <a target="_blank" href="https://twitch.tv/itsoik">
            <u><h4 style="display: inline;">ItsOiK</h4> on Twitch</u>
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="white"
                    stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round"
                    stroke-linejoin="round"></path>
            </svg>
        </a>
        <br>
        `,
        links: [
            passageLink(null, ""),
        ],
    },
    floor_04: {
        text: `
        This is the floor you live in. You know this hallway, you have been here hundreds of times before but something is off. 
        Something is different. You can't quite put your finger on what it is.
        <br>
        <br>
        ${dialogue.thoughts("Why does it feel like I've never been here before?")}
        <br>
        `,
        links: [
            passageLink("floor_04_1", dialogue.thoughts("I should investigate further")),
        ],
        visited: {
            text: `
            The memories of yore lies heavily within these walls, you remember;
            <br>
            <br>
            ${dialogue.thoughts(".. This is where I used to live.")}
            <br>
            `,
            links: [
                passageLink("floor_select", `Back to the staircase`),
            ],
        },
    },
    floor_04_1: {
        text: `
        As you walk around the hallway you are taken away by thoughts about the past.
        <br>
        <br>
        ${dialogue.thoughts("I know I've been here, I live here! Why does it feel like I don't know this place?")}
        <br>
        <br>
        You keep walking down the hall but it seems you are gaining no distance.
        <br>
        After walking for a little bit there is a faint rhythmic sound coming from behind. Clang.... Clang... Clang.. 
        <br>
        The clanging sound intensifies in both volume and speed. 
        <br>
        <br>
        ${dialogue.thoughts("This sound, it is familiar, I've heard this somewhere before.")}
        <br> 
        <br>
        `,
        links: [
            passageLink("floor_04_2", `${dialogue.thoughts("What is that sound?")}`),
        ],
    },
    floor_04_2: {
        text: `
        Suddenly the air becomes thick and viscous, almost like glue. The lights get dimmer and dimmer until 
        you are surrounded by nothing but darkness.
        <br>
        <br>
        You hear a gentle, firm and familiar voice: ${dialogue.npc("Are you ready?")}
        <br>
        ${dialogue.speech("I.. I'm afraid.. What is happening?")} ..you reply.
        <br>
        The voice responds slightly irritated; ${dialogue.npc("Stop fooling around, come on let us go!")} 
        <br>
        You utter with a shivering voice; ${dialogue.speech("Wh.. Who are you? W.. What.. is this?")}
        <br>
        <br>
        The lights are getting brighter and brighter again. You realize you are not in the hallway of your apartment anymore and cry out: 
        ${dialogue.speech("Where am I!?")}
        <br>
        The viscous air loses its grip on you and you can feel you are standing on solid ground again, and the light is bright 
        enough that you can see where you are now.
        <br>
        <br>
        You see the shape of a person, crouched on the floor over a toolbox, you shout from the top of your lungs; ${dialogue.speech("DAD!? IS THAT YOU!?")}
        <br>
        You start to recognize where you are.
        `,
        links: [
            passageLink("floor_04_3", dialogue.thoughts("This place.. it is my dad`s workshop")),
        ],
    },
    floor_04_3: {
        text: `
        The figure that is crouched on the floor is impatiently banging a wrench on the toolbox. That rhythm.. You have known this rhythm your whole life,
        <br>
        you hum it in the shower, when driving, all of the time.
        <br>
        You feel warm and at ease by this tune and let out another cry: 
        <br>
        <br>
        ${dialogue.speech("DAD! It's me! Your son!..")}
        <br>
        <br>
        He cannot hear you, he does not respond..
        <br>
        <br>
        ${dialogue.speech("DAAAD!!..")}
        <br>
        <br>
        He looks up, stops banging with the wrench and throws it into the toolbox. 
        <br>
        <br>
        ${dialogue.npc("Ahh, there you are, ready to go now?")}
        <br>
        <br>
        You hear footsteps approaching from behind.
        `,
        links: [
            passageLink("floor_04_4", dialogue.thoughts("Wha.. Who`s there?")),
        ],
    },
    floor_04_4: {
        text: `
        You turn around and are immediately struck by an ambivalent feeling when you see what is approaching.
        <br>
        On one hand you are scared out of your mind, on the other you are relieved.
        <br>
        Another human shape, this time the one of a young boy running into the workshop.
        <br>
        <br>
        ${dialogue.thoughts("Is.. It can't be!.. Is that me!?")}
        <br>
        <br>
        The shape of the small boy runs straight through you as if you were not even there.
        <br>
        As the boy gets closer to the other entity, it stands up from the toolbox and reaches out to accept the boy in embrace.
        `,
        links: [
            passageLink("floor_04_5", 'Suddenly..'),
        ],
    },
    floor_04_5: {
        text: `
        The shapes slowly fade and they whisk out of the workshop leaving you standing there. You try to follow but you can't move. Your feet are stuck.
        <br>
        It is again, like if you were stuck in something thick and slimy. 
        <br>
        <br>
        You shout: ${dialogue.speech("NO! Don't leave!")}, but the air is becoming impossible to breathe.
        <br>
        ${dialogue.thoughts("I can't move, I can't speak.")}
        <br>
        <br>
        You struggle to remain conscious trying to let out another cry: 
        <br>
        <br>
        ${dialogue.speech("Don't leave me here!")} ..but with no effect
        <br>
        <br>
        The darkness surrounds you and embraces you.
        `,
        links: [
            passageLink("floor_04_6", dialogue.thoughts("What.. What is happening?")),
        ],
    },
    floor_04_6: {
        text: `
        This is the floor you live in. You know this hallway, you have been here hundreds of times before but something is off. 
        <br>
        Something is different. You can't quite put your finger on what it is.
        <br>
        <br>
        ${dialogue.thoughts("Why does it feel like I've never been here before?")}
        <br>
        `,
        links: [
            passageLink("floor_04_7", dialogue.thoughts("I should investigate further")),
        ],
    },
    floor_04_7: {
        text: `
        As if struck with the worst case of Déjà vu possible, you begin to wonder;
        <br>
        <br>
        ${dialogue.thoughts("Was my father a janitor?")}
        <br>
        ${dialogue.thoughts("Is this where he worked?")}
        <br>
        `,
        links: [
            passageLink("floor_select", `Back to the staircase`),
        ],
    },
    janitors_door: {
        text: `
        You knock on the janitor's door and get no answer. You feel the doorknob, it is locked. In slight panic you start pounding on the door.
        <br>
        While almost demolishing the door you realize that the office hours are listed there and since it is in the middle of the night, the janitor is obviously not in right now.
        <br>
        <br>
        A gentle feeling surrounds your body when a comforting sound of heavy footsteps approaches from behind.
        <br>
        As you turn around, you are expecting to see the janitor come rushing down the foyer.
        <br>
        <br>
        You feel all the muscles of your face twitch, forcing you to smile. 
        <br>
        At the same time a sense of relief washes over you as you think;
        ${dialogue.thoughts("He must've been called in because of the fire")} 
        <br>
        <br>
        ${dialogue.speech("Eh.. Hello? Is anybody there?")} ..you ask.
        <br>  
        <br>
        But when you look, there is nobody in sight and the sound suddenly stops!
        <br>
        Looking around the foyer in confusion, you notice that the janitor's door is unlocked and slightly open.
        `,
        links: [
            passageLink("janitors_office_1", `Open the door`),
        ],
    },
    janitors_office_1: {
        text: `You peek inside the office, there is nobody there. It looks to be abandoned and has been for quite some time.
        <br>
        A thick blanket of dust covers everything and the air is dry and difficult to breathe.
        <br>
        You flick the light switch on, and the light bulb briefly flashes before quickly dying while emitting a sharp, high pitched pop.
        <br>
        The sound scares you into making a small leap into the air, barely lifting your feet off the ground.
        <br>
        You can't help but to think;
        <br>
        <br>
        ${dialogue.thoughts("That must've been a really old bulb!")} 
        <br>
        <br>
        As you navigate the office, only illuminated by the light from the doorway. You come upon some old cardboard boxes,
        filled past its brim with clothes that look to be several decades old. 
        <br>
        Some of the items seem familiar, yet you have never seen them before in your life!
        <br>
        One of the boxes has a note taped to it...
        `,
        links: [
            passageLink("janitors_office_2", "Pick up the note"),
        ],
    },
    janitors_office_2: {
        text: `On the note there are some squiggles that are not legible. You notice it has some writing on the backside and you flip it over.
        <br>
        <br>
        <b>'Bring boxes to the janitor's new apartment'</b> ..it says
        <br>
        <br>
        As you lift your eyes from the note you notice a window and wonder; 
        <br>
        <br>
        ${dialogue.thoughts("Maybe he is in his apartment?")}.
        `,
        links: [
            passageLink("foyer_3", "Leave the office"),
            passageLink("janitors_office_3", "Look through the window"),
        ],
    },
    janitors_office_3: {
        text: `You stare out the window into the deep darkness of the night and think deep thoughts:`,
        links: [
            passageLink("easter", dialogue.thoughts("I wonder...")),
        ],
    },
    janitors_floor_1: {
        text: `You exit the staircase and are met with a plume of dreadful, suffocating smoke that immediately darkens the room.
        <br>
        The bright light from the fire casts amazing contrasting shadows that dance on the walls instilling bone-chilling fear throughout your body.
        <br>        
        `,
        visited: {
            text: `You dare not set foot in this floor again, after what happened last time you were here.
            <br>
            <br>
            ${dialogue.thoughts("Ugh!.. I really don't like this floor!")}
            <br>
            <br>
            `,
        },
        links: [
            passageLink("floor_select", `Back to the staircase`),
        ],
        items: {
            extinguisher: { use: true, pickup: false, used: false },
        },
        next: "janitors_floor_2",
    },
    janitors_floor_2: {
        text: `After the flames die out you are able to go down the hallway where you notice a door ajar.
        <br>
        <br>
        ${dialogue.thoughts("I hope whoever lives there is OK, I better take a look")}
        <br>
        <br>
        ${dialogue.speech("H..Hello! ?")} ..you stutter. Right before you see the door suddenly slam shut with a loud <b>bang!</b>
        <br>
        <br>
        As a being of curiosity you walk down the hallway, over the charred pieces of hardwood flooring that cracked and splintered from the fire.
        <br>
        Sounds of crumbling charcoal under each step as you get closer and closer to the door. 
        <br>
        `,
        links: [
            passageLink("janitors_floor_3", "Knock on the door"),
        ],
    },
    janitors_floor_3: {
        text: `${dialogue.thoughts("This has been an absolutely surreal experience that I've never heard the likes of before")}
        <br>
        <br>
        ..is the only thing going through your mind as you knock on the door.
        <br>
        <b>Knock, knock!</b> ... 
        <br> 
        Not a single sound, you could hear a needle drop..
        <br> 
        <b>Kno...</b>
        <br>
        ${dialogue.speech("Wha.. the.. !?")} ..you exclaim as the door opens slightly when you tried to knock the second time.
        <br>
        <br>
        You carefully push the door a bit more open with your foot..
        `,
        links: [
            passageLink("janitors_floor_4", "Go inside"),
        ],
    },
    janitors_floor_4: {
        text: `You tread with caution and open the door slowly while peeking inside, carefully querying; 
        <br>
        <br>
        ${dialogue.speech("Anybody home?")}
        <br>
        <br>
        The door is fully open and you step over the threshold into the dimly lit room.
        <br>
        <br> 
        ${dialogue.speech("Hello? There's a fire going on somewhere! We need to...")}
        <br>
        <br> 
        You stop suddenly in your tracks overwhelmed with a feeling unlike anything you've ever experienced, and for a moment, everything turns gray.
        <br>
        It's like the silent black and white movies of yore. As you stand there in confusion and glance around, everything slowly starts to regain color.
        <br>
        <br>
        ${dialogue.thoughts("I shouldn't be here, something is off with this place.")}
        <br>
        <br>
        You notice a flashlight hanging from the old wooden pegs next to the door.
        `,
        links: [
            passageLink("floor_select", "Go back to staircase"),
        ],
        items: {
            flashlight: { use: false, pickup: true, used: false }
        },
    },
    timeout: {
        text: `What are you doing? Did you not already waste enough time thinking about chickens?
        `,
        links: [
            passageLink("joke", "Get back to the story"),
        ],
    },
};


function itemPickup({ name, text }) {
    var aDiv = document.createElement("div");
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("name", name);
    a.classList.add("itemPickup");
    a.setAttribute("text", text);
    a.setAttribute("onclick", `main.inventory.addToInventory(this)`);
    a.appendChild(document.createTextNode("Pick up the " + name));
    aDiv.appendChild(a);
    return aDiv;
};

function passageLink(passage, text) {
    var aDiv = document.createElement("div");
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("id", passage);
    a.classList.add("passageLink");
    if (passage) a.setAttribute("onclick", `main.goToPassage(passages["${passage}"])`);
    a.innerHTML = text;
    aDiv.appendChild(a);
    return aDiv;
};

function itemButton(item, parent) {
    // var aDiv = document.createElement("div");
    var a = document.createElement("button");
    a.setAttribute("id", item.name);
    a.setAttribute("onclick", `main.inventory.currentInventory[${main.inventory.currentInventory.indexOf(item)}]` + ".use(this)");
    a.appendChild(document.createTextNode("Use the " + item.name));
    parent.appendChild(a);
};

class FlowChart {
    canvasDiv = getElId("dev_canvas");
    canvas = getElId("canvas_");
    ctx = this.canvas.getContext("2d");
    rectPassage = {};
    rectWidth = 50;
    rectHeight = 50;
    constructor() {
    }
    init() {
        getElId("dev_z").onclick = () => { this.canvasDiv.classList.toggle("dev_canv_hidden"); };
        this.boxPassages();
        this.passageLinkers();
        this.doText();
    }
    boxPassages() {
        Object.keys(passages).forEach((passage, i) => {
            const posX = i * (this.rectWidth + 15),
                posY = 25,
                color = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(posX, posY, this.rectWidth, this.rectHeight);
            this.rectPassage[passage] = {
                pos: { x: posX, y: posY },
                color: color
            };
        });
    }
    doText() {
        Object.keys(passages).forEach((passage, i) => {
            var posY = 15, mod = 0;
            if (i % 2 === 0) mod = 30;
            passage.split("_").forEach((word, j) => {
                var posX = (this.rectPassage[passage].pos.x + (this.rectWidth / 2)) - (this.ctx.measureText(word).width / 2);
                if (i === 0) { posX = 0; }
                this.ctx.font = "bold 20px Arial";
                this.ctx.fillStyle = "white";
                this.ctx.fillText(word, posX, (posY * j) + posY + mod);
                this.ctx.strokeStyle = "black";
                this.ctx.lineWidth = 1;
                this.ctx.strokeText(word, posX, (posY * j) + posY + mod);
            });
        });
    }
    passageLinkers() {
        Object.keys(passages).forEach((passage, i) => {
            // if (i > 5) return;
            passages[passage].links.map(x => x.firstChild.id).forEach((p, j) => {
                this.drawLine(passage, p);
            });
            if (Object.keys(passages[passage]).includes("next")) {
                this.drawLine(passage, passages[passage].next, "item");
            }
            if (Object.keys(passages[passage]).includes("timeout")) {
                this.drawLine(passage, passages[passage].timeout.next, "timeout");
            }
        });
    }
    drawLine(passage, nextPassage, text = null) {
        if (nextPassage != "null") {
            var { x: x1, y: y1 } = this.rectPassage[passage].pos;
            var { x: x2, y: y2 } = this.rectPassage[nextPassage].pos;
            this.ctx.strokeStyle = this.rectPassage[passage].color, this.ctx.fillStyle = this.rectPassage[passage].color;
            this.ctx.lineWidth = 5;
            x1 += this.rectHeight / 2 + 10;
            y1 += this.rectHeight / 2;
            x2 += 10;//this.rectHeight / 3;
            y2 += this.rectHeight / 2;
            var xToX = 30 + (Math.ceil(Math.abs(x1 - x2) / 62.5)) * (950 / Object.keys(passages).length);
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x1, y1 + xToX);
            this.ctx.lineTo(x2, y2 + xToX - 10);
            this.ctx.lineTo(x2, y2 + this.rectHeight / 2 + 10);
            this.ctx.stroke();
            this.ctx.closePath();
            this.arrow(x2, y2 + this.rectHeight / 2);
            if (text) this.drawLineText(x1, { x: x2, y: y1 + xToX }, text);
        }
    }
    drawLineText(x1, { x: x2, y: y2 }, text) {
        var that = this;
        function lineTo(x, y, y2) {
            that.ctx.beginPath();
            that.ctx.moveTo(x, y);
            that.ctx.lineTo(x, y2);
            that.ctx.stroke();
            that.ctx.closePath();
        };
        var stroke = this.ctx.strokeStyle, fill = this.ctx.fillStyle, lineW = this.ctx.lineWidth;
        var x = (x1 + (Math.abs(x1 - x2) / 2)) - (this.ctx.measureText(text).width / 2), y = y2 - 15;
        this.ctx.font = "bold 15px Arial";
        lineTo(x + (this.ctx.measureText(text).width / 2), y, y2 - 3);
        this.ctx.fillStyle = "white";
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 1;
        this.ctx.fillRect(x - 2, y - 12.5, this.ctx.measureText(text).width + 5, 15);
        this.ctx.strokeRect(x - 2, y - 12.5, this.ctx.measureText(text).width + 5, 15);
        this.ctx.fillText(text, x, y);
        this.ctx.strokeText(text, x, y);
        this.ctx.strokeStyle = stroke;
        this.ctx.fillStyle = fill;
        this.ctx.lineWidth = lineW;
    }
    arrow(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 10, y + 10);
        this.ctx.lineTo(x - 10, y + 10);
        this.ctx.lineTo(x, y);
        this.ctx.closePath();
        this.ctx.fill();
    }
}

const flw = new FlowChart();
flw.init();


const main = new Main();
function printText() {
    var pureText = "";
    for (const passageName of Object.keys(passages)) {
        pureText += " \n" + "___________________" + " \n" + passageName + ": \n" + "^^^^^^^^^^^^^^^^^^^" + " \n";
        if (Object.keys(passages[passageName]).includes("visisted")) {
            pureText += passages[passageName].visisted.text;
        } pureText += passages[passageName].text;
    };
    // pureText = pureText.replaceAll("\n", "");
    pureText = pureText.replaceAll("<h1>", "");
    pureText = pureText.replaceAll("</h1>", "");
    pureText = pureText.replaceAll("<h3>", "");
    pureText = pureText.replaceAll("</h3>", "");
    pureText = pureText.replaceAll("<h4>", "");
    pureText = pureText.replaceAll("</h4>", "");
    pureText = pureText.replaceAll('<p class="thoughts">', "");
    pureText = pureText.replaceAll('<p class="playerSpeech">', "");
    pureText = pureText.replaceAll('<p class="npcSpeech">', "");
    pureText = pureText.replaceAll("</p>", "");
    pureText = pureText.replaceAll('<p id="basement_final_p">', "");
    pureText = pureText.replaceAll("<b>", "");
    pureText = pureText.replaceAll("</b>", "");
    pureText = pureText.replaceAll('<p style="color:white;background-color: red;text-align: center;width: 50%;">', "");
    pureText = pureText.replaceAll("<br>", "");
    console.log('[script:1038]: ', pureText);
}