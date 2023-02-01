// File: script.js - noroff Narrative 2023
// Author: it'sOiK
// Date: 24/01-23
console.log('[script:0]: test');



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
getElId("dev_go").onclick = () => { main.goToPassage(passages[getElId("lal").value]); };
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
        itemResponse.classList.remove("item-response-hidden");
        var passage = this.inventory.main.currPassage;
        var buttonText = "Close";

        const { extinguisher, flashlight } = passage.items;
        if (extinguisher.use || flashlight.use) {
            itemResponse.innerHTML = this.text;
            buttonText = "Continue";
            while (navigation.children.length > 1) {
                navigation.firstChild.remove();
            }
        } else {
            itemResponse.innerHTML = `Using the ${this.name} would not have any effect here!`;
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
        switch (itemPickupLink.name) {
            case "Extinguisher":
                this.main.hasExtinguisher = true;
                break;
            case "Flashlight":
                this.main.hasFlashlight = true;
                break;
            default:
                console.error('[script:73]: no case for itemPickupLink.name:', itemPickupLink.name);
        }
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
    currPassage = null;
    hasExtinguisher = false;
    hasFlashlight = false;
    constructor() {
        null;
    }
    updateNavigation(passage) {
        navigation.innerHTML = "";
        this.passageLinks(passage); // add passage link
        this.pickupItemLink(passage.items); // add item picku link
        // add "#back" button
        navigation.innerHTML += `<div id="back"><a href="#"  onclick="main.goToPrevPassage()">🢀</a></div>`;
        if (this.passageHistory.length == 0) {
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
    pickupItemLink({ extinguisher, flashlight }) {
        var notInInv = (itemName) => !this.inventory.currentInventory.map(invItem => invItem.name).includes(itemName);
        var add = (item) => {
            navigation.appendChild(itemPickup(item));
            appendHr(navigation);
        };
        if (notInInv("Extinguisher") && extinguisher.pickup) add(items.extinguisher);
        if (notInInv("Flashlight") && flashlight.pickup) add(items.flashlight);
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
    populateContainer(innerHTML) {
        textContainer.innerHTML = innerHTML;
    }
    goToPassage(passage, goToPrev = false) {
        updatePassageIndicator(passage); //!DEV
        itemResponse.classList.add("item-response-hidden");
        itemResponse.innerHTML = "";

        //TODO get name of passage

        if (this.currPassage && !goToPrev) {
            this.currPassage.name = Object.keys(passages).find(key => passages[key] === this.currPassage);
            this.passageHistory.push(this.currPassage);
        }
        this.currPassage = passage;
        this.clearContainer();
        var modifiedText = this.addItemTextToPassage(passage);
        this.populateContainer(modifiedText);
        this.updateItems();
        this.updateNavigation(passage);
    }

    addItemTextToPassage(passage) {
        var mod = "";
        const { extinguisher, flashlight } = passage.items;

        if (extinguisher.use) mod = items.extinguisher.can;
        if (flashlight.use) mod = items.flashlight.can;
        if (this.inventory.currentInventory.length == 0) {
            if (extinguisher.use) mod = items.extinguisher.cant;
            if (flashlight.use) mod = items.flashlight.cant;
        }
        return `${passage.text}<br>${mod}`;
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
            this.goToPassage(nextPassage);
        }
    }
}

const main = new Main();
const dialogue = {
    thoughts: (x) => `<p class="thoughts">"${x}"</p>`,
    speech: (x) => `<p class="playerSpeech">"${x}"</p>`,
    npc: (x) => `<p class="npcSpeech">"${x}"</p>`,
};

const items = {
    extinguisher: {
        name: "Extinguisher",
        text: `You spray the fire with the extinguisher, trying to focus on the base of it. 
        The Extinguisher spitters and spatters what few droplets it has left and you eventually defeat the blazing flames`,
        can: `${dialogue.thoughts("I have to try to put out this fire!")}`,
        cant: `${dialogue.thoughts("I need something to put out this fire with!")}`
    },
    flashlight: {
        name: "Flashlight",
        text: `Your flashlight illuminates the damp basement and reveals a large room that has several doors.<br>
        ${dialogue.thoughts("This is where people used to store potatoes back in the day, now it's mostly used for personal storage by the tenants.")}<br>
        There are many thoughts rushing through your mind, amongst them are pleasent memories from a time long past.<br>
        You spot the door that had light shining through the keyhole and approach it.`,
        can: `${dialogue.thoughts("I can use my flashlight here so I can see!")}`,
        cant: `${dialogue.thoughts("I can't see shit! I will need something to light up this place with!")}`
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
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    egg: {
        text: dialogue.thoughts("Hmm.. It is a difficult question; What did come first?"),
        links: [
            passageLink("joke", "🥚?"),
            passageLink(null, "or"),
            passageLink("joke", "🐔?"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    joke: {
        text: `${dialogue.thoughts("I dont have time for this! There might be a fire raging and I'm standing here thinking about chickens?")}<br><br>
        You can not believe you have just stood there for 5 minutes thinking about chickens, and it was not the good deep fried kind either.<br>
        You get your act together after that moment of weakness and blame it on the stress of dealing with the situation!`,
        links: [
            passageLink("foyer_3", "Leave office"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    intro: {
        text: `You abruptly wake up at the darkest hour of the night, remove the small boulders 
        that have had time to accumulate in your eyes, before you notice the smell of smoke. <br><br>
        ${dialogue.thoughts("What's going on here?")} ..you think to yourself as you mutter the words; 
        ${dialogue.speech("Is something burning?")}<br><br>
        You lurch out of the bed and slow as a sloth on a hot summers day, you stumble around in the dark, 
        turning on light after light, trying to see if there is something wrong. <br>
        You slowly come to the conclusion that at least your apartment is not on fire.<br><br>
        ${dialogue.thoughts("Well thats a relief, but what is this hellish smell of smoke, and where does it come from?")}<br><br>
        From the pile of a weeks worth of used clothes at the foot of your bed you equip a few random items.

        `,
        links: [
            passageLink("apartment", "Leave apartment"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    apartment: {
        text: `As you exit your apartment you come to the realization; <br><br>
        ${dialogue.thoughts("Why is there no alarm ringing? With this strong smell of smoke there has to be a fire nearby")}<br><br>
        You enter the dark hallway that has obvious signs that nobody has been here in a while. <br><br>
        ${dialogue.speech("These damn light sensors are so bad!")} ..you squeal out whilst stumping your toe against something in the dark.<br><br>
        ${dialogue.speech("BLOODY HELL! Wha.. what the heck!?")}<br><br>
        You crouch to the floor to avoid any other damages, and feel around for whatever exploited your foot in the darkness.
        When suddenly a bright flash of light blinds your unaccustomed eyes as the lights turn on.
        After recovering from the dazzle, you spot a fire extinguisher pleading innocence laying across the floor, out of it's place.`,
        links: [
            passageLink("elevator", "Take the elevator"),
            passageLink("foyer_1", "Take the stairs"),
        ],
        items: {
            extinguisher: { use: false, pickup: true, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    elevator: {
        text: `There is a big red label on the elevator stating: 
        <p style="color:white;background-color: red;text-align: center;width: 50%;">
        IN CASE OF FIRE, <br>DO NOT USE ELEVATOR, <br>USE STAIRS</p>
        ${dialogue.thoughts("I should probably take the stairs")}<br><br>
        
        `,
        links: [
            passageLink("foyer_1", "Take the stairs instead"),
        ],
        items: {
            extinguisher: { use: false, pickup: true, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    extinguisher_reminder: {
        text: `There's a pungent smell of smoke, are you sure you don't want to pick up the extinguisher?`, //TODO
        links: [
            passageLink("foyer_1", "Take the stairs"),
        ],
        items: {
            extinguisher: { use: false, pickup: true, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    foyer_1: {
        text: `In a hurry you stumble into the foyer.<br><br>
        ${dialogue.thoughts("These lights are never turned off..")} ..you notice while you get back on your feet.<br><br>
        ${dialogue.thoughts("I should go to the parking lot, thats the one thing I remember from previous fire drills, 'In case of emergency, gather at the parking lot' they kept hammering into our heads'")}`,
        links: [
            passageLink("outside_building_1", "Go outside."),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    foyer_2: {//TODO
        text: `The person has left and you continue down the foyer alone, trying to figure out why 
        the alarms are not ringing and where the stench is coming from.You see the janitor's 
        office door at the end of the hallway, on the opposite side of the room you see the door to the staircase next to the elevator.
        There is a fire extinguisher infront of the elevator, that seems to have been thrown away in a hurry.
        `,
        links: [
            passageLink("janitors_door", `Knock on the janitor's door`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    foyer_3: {
        text: `You are back in the foyer where you have been houndreds of times before.<br><br>
        ${dialogue.thoughts("What should I do next?")} ..you think to yourself.<br><br>
        `,
        links: [
            passageLink("staircase", `Go to staircase`),
        ],
        items: {
            extinguisher: { use: false, pickup: true, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    // dialogue_1: {
    //     text: `""`,//TODO
    //     links: [
    //         passageLink("foyer_2", `""`),//TODO
    //         passageLink("foyer_2", `"I don't know, I recently moved here, maybe ask the janitor?"`),//TODO
    //     ],
    //     items: {
    //         extinguisher: { use: false, pickup: false, },
    //         flashlight: { use: false, pickup: false }
    //     },
    //     next: null,
    // },
    dialogue_2: {
        text: `"same here, why are the alarms not ringing?"`,//TODO
        links: [
            passageLink("foyer_2", `"I don't have time for this, I'm late for work!"`),//TODO
            passageLink("foyer_2", `"I don't know, I recently moved here, maybe ask the janitor?"`),//TODO
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    outside_building_1: {
        text: `You are outside the building, there is nobody else around. Not a single sound can be heard, 
        it's darker than the center of a black hole, and you cannot see further than a few meters away.<br><br>
        ${dialogue.thoughts("Hmm.. That's weird.. How come I can't even see the streetlights?")}<br><br>
        You are curious as to why nothing is illuminated beyond the parking lot.
        <br>
        `,
        links: [
            passageLink("outside_leave", "Investigate the darkness"),
            passageLink("enter_building", "Go back inside"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    outside_building_2: {
        text: `You come to your senses and turn around to go back inside while thinking; <br><br>
        ${dialogue.thoughts("I could not have lived with myself if I had left now, and something would have happened to anyone inside!")}`,
        links: [
            passageLink("enter_building", "Go back inside"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    outside_building_3: {
        text: `Nothing has changed out here since last time you was here`,
        links: [
            passageLink("outside_leave", "Leave"),
            passageLink("foyer_3", "Go back inside"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    outside_leave: {
        text: `As you are nearing the darkness you are struck back with a flood of thoughts; <br><br>
        ${dialogue.thoughts(`Am I really going to leave all those people left inside? The building is potentially 
        on fire and no alarm has triggered! Nobody knows about the impending danger! I can't leave without alerting 
        someone or doing something about the situation first!`)}`,
        links: [
            passageLink("outside_building_2", "Turn Back"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    enter_building: {//TODO
        text: `You go back inside the building and meet someone exiting.They are equipped with a dapper suit and look ready to go to the likes of a fancy party.<br>
            You stop the person and ask them; <br> <br>
            ${dialogue.speech("Hey! Are you OK? Do you know where the fire is, or where the smell is coming from?")}<br>
            ${dialogue.npc("Yeah, I'm OK thanks! Fire? Smell? What are you talking about?")}<br>
            ${dialogue.speech("What!? You can't tell the whole building reeks of smoke?")}<br>
            ${dialogue.npc("I don't have time for this, I'm late for work!")}<br><br>
            The person brushes you off and leaves the building.<br>
            You shake your head in disbelief that they could not tell something was off.<br><br>
                                    `,
        links: [
            passageLink("foyer_2", `${dialogue.thoughts("Well, that was odd!")}`),
            // passageLink("dialogue_2", `TODO: "NO! I woke up smelling smoke and I rushed out, I have no idea what's going on"`),//TODO
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    staircase: {
        text: `You are in the staircase`,
        links: [
            passageLink("foyer_3", `Go back to hallway`),
            passageLink("floor_select", `Go to specific floor`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_select: {
        text: `Which floor do you go to?`,
        links: [
            passageLink("basement_1", `Basement`),
            passageLink("foyer_3", `Ground Floor`),
            passageLink("other_floors", `Floor 02`),
            passageLink("other_floors", `Floor 03`),
            passageLink("floor_04", `Floor 04`),
            passageLink("other_floors", `Floor 05`),
            passageLink("janitors_floor_1", `Floor 06`),
            passageLink("other_floors", `Floor 07`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    other_floors: {
        text: `Everything seems to be in order here.`,
        links: [
            passageLink("floor_select", `Back to staircase`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    basement_1: {
        text: `You enter the basement, it is a cold, damp and dark basement with a distinct smell of old potatoes. <br>
        These kind of basements always reminded you of when you were a child.<br>
        It's dark, except for a sliver of light shining from a keyhole at the opposite side of the room.<br>
        `,
        links: [
            passageLink("floor_select", `Back to staircase`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: true, pickup: false }
        },
        next: "basement_2",
    },
    basement_2: {
        text: `You slowly walk up to the door and for each step closer, your breath starts trembling like an autum leaf.<br>
        ${dialogue.thoughts("I'm not cold, why am I shivering like this?")}<br> The trembling intensifies and your hands are shaking as you reach out to the doorknob.
        Suddenly a warm and soothing sensation emanates from the doorknob straight to the core of your being
        immediately causing all your shivering and trembling to stop.
        `,
        links: [
            passageLink("basement_3", "Open the door"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    basement_3: {
        text: `As you open the door a great, bright light blinds you. You cover your eyes with your hands to block the light.<br>
        The light starts flickering slightly before it starts to dim. When you lower your hand you are staring into an abyss of darkness
        with a bed floating in mid air. You get pulled inside.
        `,
        links: [
            passageLink("intro", "'The end?'"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_04: {
        text: `This is the floor you live in. You know this hallway, you have been here houndreds of times before, but something is off. //TODO change "you have been here houndreds of times before" reused
        Something is different. You can't quite put your finger on what it is.<br>
        ${dialogue.thoughts("Why does it feel like ive never been here before?")}<br>

        `,
        links: [
            passageLink("floor_04_1", "Investigate Further"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_04_1: {
        text: `As you walk around the hallways you are taken away by thoughts about the past<br>
        ${dialogue.thoughts("I know I've been here, I live here! Why does it feel like I've never been here before?")}<br> //TODO repetion "I've"
        You keep walking down the hall but it seems you are gaining no distance.<br>
        After walking for a little bit there is a faint rythmic sound coming from behind. Clang.... Clang... Clang.. <br>
        The clanging sound intensifies in both volume and speed. <br>
        "This sound, it is familiar, I've heard this before somewhere before."<br> 
        `,//TODO repetion "I've"        ^
        links: [
            passageLink("floor_04_2", `${dialogue.thoughts("What is that sound?")}`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_04_2: {
        text: `Suddenly the air becomes thick and viscous, almost glue like. The lights get dimmer and dimmer until you are surrounded by nothing but darkness.<br><br>
        You hear a gentle, firm and familiar voice: ${dialogue.npc("Are you ready?")}<br>
        ${dialogue.speech("I.. I'm afraid.. What is happening?")}<br>
        The voice responds slightly irritated; ${dialogue.npc("Stop fooling around, come on let us go!")} <br>
        You utter with a shivering voice; ${dialogue.speech("Wh.. Who are you? W.. What.. is this?")}<br><br>
        The lights are getting brighter and brighter again. You realize you are not in your apartment building anymore and cry out: ${dialogue.speech("Where am I!?")}<br>
        The viscous air loses it's grip on you and you can feel you are standing on solid ground and the light is bright enough that you can see where you are now.<br><br>
        You see the shape of a person, crouched on the floor over a toolbox, you shout from the top of your lungs; ${dialogue.speech("DAD!? IS THAT YOU!?")}<br>
        You start to recognize where you are.
        `,
        links: [
            passageLink("floor_04_3", '"This place.. it is my dad`s garage"'),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_04_3: {//TODO "rhythm" repetative
        text: `The figure crouched on the floor is impatiently banging a wrench on the toolbox. That rhythm.. You have known this rhythm your whole life,
        you hum it in the shower, when driving, all of the time you hum this rhythm.<br>
        You feel warm and at ease by this rhythm and let out another cry: "DAD! It's me! Your son!"..<br>
        He cannot hear you, he does not respond.. "DAAAD!!".. <br>
        He looks up, stops banging the toolbox, and throws the wrench into the toolbox. "Ahh there you are, ready to go now?".<br>
        You hear footsteps approaching from behind.
        `,
        links: [
            passageLink("floor_04_4", '"Wha.. Who`s there?"'),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_04_4: {
        text: `You turn around and are immediatly struck by an ambivalent feeling when you see what is approaching.<br>
        On one hand you are scared out of your mind, on the other you are relieved.<br>
        Another human shape, this time the one of a young boy running into the garage. ${dialogue.thoughts("Is.. It can't be!.. Is that me!?")}<br>
        The shape of the small boy runs straight through you like as if you were not even there.<br>
        As the boy gets close to the other shape, he stands up from the toolbox and reaches out to accept the boy in embrace.
        `,
        links: [
            passageLink("floor_04_5", 'Suddenly..'),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_04_5: {
        text: `The shapes slowly fade and they whisk out of the garage leaving you standing there. You try to follow but you can't move. Your feet are stuck.<br>
        It is like if you were stuck in something sticky and viscous. You shout: "NO! Don't leave!", but the air is becoming impossible to breathe.<br>
        ${dialogue.thoughts("I can't move, I can't speak.")} You struggle to remain conscious trying to let out another cry: "Don't leave me here!" but with no effect<br>
        `,
        links: [
            passageLink("floor_04_6", '"Wha.. Who is this?"'),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    floor_04_6: {
        text: `This is the floor you live in. You know this hallway, you have been here houndreds of times before, but something is off.
        Something is different. You can't quite put your finger on what it is.<br>
        ${dialogue.thoughts("Why does it feel like ive never been here before?")}<br>
        `,
        links: [
            passageLink("floor_select", `Back to staircase`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    janitors_door: {
        text: `You knock on the janitor's door and get no answer, you feel the doorknob, it's locked, in slight panic you start pounding it.
        While almost demolishing the door you realize that his office hours are listed there and since it is the middle of the night,
        he is obviously not in right now.<br>
        A gentle feeling surrounds your body when a comforting sound of heavy footsteps approaches from behind.<br>
        As you turn around, you are expecting to see the janitor come rushing down the foyer.<br>
        You feel all the muscles of your face twitch, forcing you to smile, at the same time a sense of relief washes over you as you think;<br><br>
        ${dialogue.thoughts("He must've been called in because of the fire")} <br><br>
        ${dialogue.speech("Eh.. Hello? Is anybody there?")} ..you ask, but when you look,
        there is nobody in sight and the sound suddenly stops!<br> <br>
        Looking around the foyer in confusion, you notice that the janitor's door is unlocked and slightly open.
        `,
        links: [
            passageLink("janitors_office_1", `Open the door`),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    janitors_office_1: {
        text: `You peek inside the office, there is nobody there. It looks to be abandoned, and has been for quite some time.<br>
        A thick blanket of dust covers everything and the air is dry and difficult to breathe.<br>
        You flick the light switch on, and the light bulb briefly flashes before quickly dying while emitting a sharp, high pitched pop.<br>
        The sound makes you jump, barely lifting your feet of the ground, you can't help but to think;<br><br>
        ${dialogue.thoughts("That must've been a really old bulb!")} <br><br>
        As you navigate the office only illuminated by the light from the doorway you come upon some old cardboard boxes
        with clothes that looks to be several decades old. <br>
        Some of the items seem familiar, yet you have never seen them before in your life!<br>
        One of the boxes has a note taped to it...
        `,
        links: [
            passageLink("janitors_office_2", "Pick up the note"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    janitors_office_2: {
        text: `On the note there are some squiggles that are not legible. You notice it has some writing on the backside and you flip it over.<br><br>
        <b>'Bring boxes to the janitor's new apartment'</b> ..it says<br><br>
        As you lift your eyes from the note you notice a window and wonder; <br><br>
        ${dialogue.thoughts("Maybe he is in his appartment?")}.
        `,
        links: [
            passageLink("foyer_3", "Leave office"),
            passageLink("janitors_office_3", "Look through the window"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    janitors_office_3: {
        text: `You stare out the window into the deep darkness of the night and think deep thoughts:`,
        links: [
            passageLink("easter", '"I wonder..."'),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    janitors_floor_1: {
        text: `You exit the staircase and are met with a plume of dreadful, suffocating smoke that immediately darkens the room.<br>
        The bright light from the fire casts amazing contrasting shadows that dance on the walls instilling bone-chilling fear throughout your body.<br>
        ${hasVisitedPassage("janitors_floor_1", "test")}
        
        `,
        links: [
            passageLink("floor_select", `Back to staircase`),
        ],
        items: {
            extinguisher: { use: true, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: "janitors_floor_2",
    },
    janitors_floor_2: {
        text: `After the flames die out you are able to go down the hallway where you notice a door ajar.<br>
        ${dialogue.thoughts("I hope whoever lives there is OK, I better take a look")}<br>
        "H.. Hello!?" you stutter, right before you see the door suddenly slam shut with a loud <b>bam!</b><br>
        As a being of curiosity you walk down the hallway, over the charred pieces of hardwood flooring that cracked and splintered from the fire.<br>
        Sounds of crumbling charcoal under each step as you get closer and closer to the door. <br>
        `,
        links: [
            passageLink("janitors_floor_3", "Knock on the door"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    janitors_floor_3: {
        text: `${dialogue.thoughts("This has been an absolutely surreal experience ive never heard the likes of before")}
        ..is the only thing going through your mind as you knock on the door.<br>
        <b>Knock, knock!</b> ... <br> not a single sound, you could hear a needle drop..<br> <b>Kno...</b><br>
        Wha.. the.. !? you exclaim as the door opens slightly when you tried to knock the second time<br>
        You carefully push the door a bit more open with your foot..
        `,
        links: [
            passageLink("janitors_floor_4", "Go inside"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: false }
        },
        next: null,
    },
    janitors_floor_4: {
        text: `You tread with caution and open the door slowly while peeking inside, carefully querying <br><br>
        ${dialogue.speech("Anybody home?")}<br><br>
        The door is fully open and you step over the threshold into the dimly lit room.<br><br> 
        ${dialogue.speech("Hello? There's a fire going on somewhere! We need to...")}<br><br> 
        You stop suddenly in your tracks overwhelmed with a feeling unlike anything you've ever experienced, and for a moment, everything turns grey.<br>
        It's like the silent black and white movies of yore. As you stand there in confusion everything slowly starts to regain color.<br><br>
        ${dialogue.thoughts("I shouldn't be here, something is off with this place.")}<br><br>
        You notice a flashlight hanging from the old wooden pegs next to the door.
        `,
        links: [
            passageLink("floor_select", "Go back to staircase"),
        ],
        items: {
            extinguisher: { use: false, pickup: false, },
            flashlight: { use: false, pickup: true }
        },
        next: null,
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
    a.appendChild(document.createTextNode("Pick up " + name));
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
    a.appendChild(document.createTextNode("Use " + item.name));
    parent.appendChild(a);
};
function hasVisitedPassage(passageName, text) {
    console.log('[script:830]: passageName', main.passageHistory.map(passage => passage.name == passageName));
    if (main.passageHistory.map(passage => passage.name == passageName).includes(passageName)) {
        return text;
    }
    return "asdasd";
}

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
            passages[passage].links.map(x => x.firstChild.id).forEach((p, j) => {
                if (p != "null") {
                    var { x: x1, y: y1 } = this.rectPassage[passage].pos;
                    var { x: x2, y: y2 } = this.rectPassage[p].pos;
                    var mod = 10;
                    this.ctx.strokeStyle = this.rectPassage[passage].color;
                    this.ctx.lineWidth = 5;
                    x1 += this.rectHeight / 2;
                    y1 += this.rectHeight / 2;
                    x2 += 10;//this.rectHeight / 3;
                    y2 += this.rectHeight / 2;


                    var xToX = this.rectHeight + (Math.ceil(Math.abs(x1 - x2) / 62.5) * 25);
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x1, y1 + xToX);
                    if (x1 < x2) mod = -10;
                    this.ctx.lineTo(x2 + mod, y2 + xToX - 15);
                    this.ctx.lineTo(x2, y2 + this.rectHeight / 2);
                    this.arrow(x2, y2 + this.rectHeight / 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            });
        });
    }

    arrow(x, y) {
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 5, y + 10);
        this.ctx.lineTo(x - 5, y + 10);
        this.ctx.lineTo(x, y);
    }

}

const flw = new FlowChart();
flw.init();
