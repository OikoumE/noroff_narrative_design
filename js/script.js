// File: script.js - noroff Narrative 2023
// Author: itsOiK
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
    use() {
        itemResponse.classList.remove("item-response-hidden");
        var passage = this.inventory.main.currPassage;
        var buttonText = "Close";
        if ("canUseFlashlight" in passage && passage.canUseFlashlight || "canUseExtinguisher" in passage && passage.canUseExtinguisher) {
            itemResponse.innerHTML = this.text;
            buttonText = "Continue";
            while (navigation.children.length > 1) {
                navigation.firstChild.remove();
            }
        } else {
            itemResponse.innerHTML = `Using the ${this.name} would not have any effect here!`;
        }
        itemResponse.innerHTML += `<button onclick="main.closeItemResponseAndGotoPassage(passages[${passage.next}])">${buttonText}</button>`;
        //TODO if last use/correct use remove
        //TODO this.inventory.removeFromInventory(this);
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


        console.log('[script:77]: this.main.hasExtinguisher', this.main.hasExtinguisher);
        console.log('[script:78]: this.main.hasFlashlight', this.main.hasFlashlight);

        this.currentInventory.push(new Item(itemPickupLink, this));
        var parentDiv = itemPickupLink.parentElement;
        // find index of itemPickupLink to remove its <hr>
        const index = Array.from(navigation.children).indexOf(parentDiv);
        navigation.children[index + 1].remove();
        parentDiv.remove();
        this.updateInventory();
    }
    removeFromInventory(item) {
        var i = this.currentInventory.indexOf(item);
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
        passage.links.forEach(linkElement => {
            // check if inventory has this item already
            if (!this.inventory.currentInventory.map(invItem => invItem.name).includes(linkElement.firstChild.name)) {
                // if we dont have item, add link
                navigation.appendChild(linkElement);
                appendHr(navigation);
            }
        });
        // add "#back" button
        navigation.innerHTML += `<div id="back"><a href="#"  onclick="main.goToPrevPassage()">🢀</a></div>`;
        if (this.passageHistory.length == 0) {
            // remove back button if we are on first page
            getElId("back").remove();
        }
    }
    updateItems() {
        itemsContainer.innerHTML = "";
        if (this.inventory.currentInventory.length > 0) {
            this.inventory.currentInventory.forEach(item => {
                itemButton(item, itemsContainer);
                //TODO only when you CAN USE item in the passage
            });
        }
    }
    clearContainer() { textContainer.innerHTML = ""; }
    populateContainer(innerHTML) {
        textContainer.innerHTML = innerHTML;
    }
    goToPassage(passage, goToPrev = false) {
        console.log('[script:120]: main.hasExtinguisher', main.hasExtinguisher);
        updatePassageIndicator(passage);
        itemResponse.classList.add("item-response-hidden");
        itemResponse.innerHTML = "";
        if (this.currPassage && !goToPrev) this.passageHistory.push(this.currPassage);
        this.currPassage = passage;
        this.clearContainer();
        var modifiedText = this.addItemTextToPassage(passage);
        this.populateContainer(modifiedText);
        this.updateItems();
        this.updateNavigation(passage);
    }

    addItemTextToPassage(passage) {
        var mod = "";
        switch (true) {
            case passage.canUseExtinguisher:
                if (main.hasExtinguisher == true)
                    mod = items.extinguisher.can;
                else mod += items.extinguisher.cant;
                break;
            case passage.canUseFlashlight:
                if (main.hasFlashlight == true)
                    mod = items.flashlight.can;
                else mod = items.flashlight.cant;
                break;
        }
        return `${passage.text}<br><i>${mod}</i>`;
    }

    goToPrevPassage() {
        if (this.passageHistory.length > 0) {
            var prev = this.passageHistory.pop();
            this.goToPassage(prev, true);
        }
    }
    closeItemResponseAndGotoPassage(nextPassage) {
        itemResponse.classList.add("item-response-hidden");
        if (nextPassage) {
            this.goToPassage(nextPassage);
            //TODO remove item from navigation
        }
    }
}

const main = new Main();


const items = {
    extinguisher: {
        name: "Extinguisher",
        text: `You spray the fire with the extinguisher, trying to focus on the base of it. 
        The Extinguisher spitters and spatters what few droplets it has left and you eventually defeat the blazing flames`,
        can: `"I have to try to put out this fire!"`,
        cant: `"I need something to put out this fire with"`
    },
    flashlight: {
        name: "Flashlight",
        text: `TODO`,
        can: `"I can use my flashlight here so i can see!"`,
        cant: `"I need something to light up this place with!"`
    }
};

const passages = {
    easter: {
        text: `What came first?`,
        links: [
            passageLink("'egg'", "Chicken?"),
            passageLink(null, "or"),
            passageLink("'egg'", "Egg?"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    egg: {
        text: `What came first?`,
        links: [
            passageLink("'joke'", "🥚?"),
            passageLink(null, "or"),
            passageLink("'joke'", "🐔?"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    joke: {
        text: `Congratulations, you reached a dead end :D`,
        links: [],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    1: {
        text: `You wake up to at the darkest hour of the night, remove the small boulders 
        that has had time to accumulate in your eyes, before you notice the smell of smoke. 
        <br><i>"What's going on here?"</i> you think to yourself as you mutter the words <i>"Is something burning?"</i><br>
        You lurch out of the bed and slow as a sloth on a hot summers day, you stumble around in the dark, 
        turning on light after light, trying to see if there is something wrong. 
        You slowly come to the conclusion that atleast your apartment is not on fire.
        <i>"Well thats a relief, but what is this hellish smell of smoke, and where does it come from?"</i>
        `,
        links: [
            passageLink(2, `Leave apartment`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    2: {
        text: `As you exit your apartment you come to the realisation:<i>"Why is there no alarm ringing? 
        With this strong smell of smoke there has to be a fire nearby"</i>
        You enter the dark hallway that has obvious signs that nobody has been here a while.<br>
        <i>"These damn lightsensors are so bad!"</i> you squeal out whilst stumping your toe against something in the dark.<br>
        <i>"BLOODY HELL! Wha.. what the heck!?"</i><br>
        You feel around in the dark for whatever it is you stumped your toe into, just as the lights finally turn on you notice
        the fire extinguisher laying across the floor, out of its place`,
        links: [
            passageLink(3, "Take the elevator"),
            passageLink(4, "Take the stairs"),
            itemPickup(items.extinguisher.name, items.extinguisher.text),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    3: {
        text: `There is a big red label on the elevator stating: 
        <p style="color:white;background-color: red;text-align: center;width: 50%;">
        IN CASE OF FIRE, <br>DO NOT USE ELEVATOR, <br>USE STAIRS</p>`,
        links: [
            passageLink(4, "Take the stairs instead"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    4: {
        text: `There's a pungent smell of smoke, are you sure you don't want to pick up an extinguisher?`,
        links: [
            itemPickup(items.extinguisher.name, items.extinguisher.text),
            passageLink(5, "Take the stairs"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    5: {
        text: `You are outside the building, [there is a fire extinguisher next to the door][?]`,
        links: [
            passageLink(6, "Leave"),
            passageLink(7, "Go back inside"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    6: {
        text: `Are you really going to leave all those people left inside? the building is potentially 
        on fire and no alarm has triggered. Nobody knows there is a fire`,
        links: [
            passageLink(5, "Turn Back"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    7: {
        text: `You go back inside the building and meet someone exiting. You stop the person and 
        ask them; "are you OK!? do you know where the fire is, or smell is coming from?"`,
        links: [
            passageLink(8, `"Yeah, i'm OK thanks! fire!? smell!? what are you talking about?"`),
            passageLink(9, `"NO! I woke up smelling smoke and I rushed out, I have no idea what's going on"`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    8: {
        text: `"what!? you cant smell that smoke?"`,
        links: [
            passageLink(10, `"i dont have time for this, im late for work!"`),
            passageLink(10, `"i dont know, i recently moved here, maybe ask the janitor?"`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    9: {
        text: `"same here, why are the alarms not ringing?"`,
        links: [
            passageLink(10, `"i dont have time for this, im late for work!"`),
            passageLink(10, `"i dont know, i recently moved here, maybe ask the janitor?"`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    10: {
        text: `The person leaves and you continue down the foyer, trying to figure out why 
        the alarms are not ringing and where the smell is coming from. you see the janitors 
        apartment door at the end of the foyer, a door leading down to the basement where 
        the fire alarm system is located, and the door to the staircase`,
        links: [
            passageLink(16, `Knock on the janitors door`),
            passageLink(15, `Go to basement`),
            passageLink(11, `Go to staircase`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    11: {
        text: `You are in the staircase`,
        links: [
            passageLink(10, `Go back to hallway`),
            passageLink(12, `Go to specific floor`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    12: {
        text: `Which floor do you go to?`,
        links: [
            passageLink(15, `Basement`),
            passageLink(10, `Ground Floor`),
            passageLink(14, `Floor 02`),
            passageLink(14, `Floor 03`),
            passageLink(14, `Floor 04`),
            passageLink(14, `Floor 05`),
            passageLink(13, `Floor 06`),
            passageLink(14, `Floor 07`),
            passageLink(18, `Floor 08`),
            passageLink(14, `Floor 09`),
            passageLink(14, `Floor 10`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    13: {
        text: `You exit the staircase and are met with a plume of dreadful, suffocating smoke that immediately darkens the room.<br>
        The bright light from the fire casts amazing contrasting shadows that dances on the walls instilling bonechilling fear throughout your body.<br>
        `,
        links: [
            passageLink(12, `Back to staircase`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: true,
        next: 19,
    },
    14: {
        text: `other floors TODO`,
        links: [
            passageLink(12, `Back to staircase`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    15: {
        text: `You enter the basement, its a cold, damp and dark basement with a distinc smell of old potatoes. <br>
        These kind of basements always reminded you of when you were a child.<br>
        It's dark, except for a sliver of light shining from a keyhole at the oposite side of the room.<br>
        `,
        links: [
            passageLink(12, `Back to staircase`),
        ],
        canUseFlashlight: true,
        canUseExtinguisher: false,
        next: 20,
    },
    16: {
        text: `You knock on the janitor's door and get no answer, you start pounding it, 
        when you realize that his office hours are listed on the door and he is currently not here`,
        links: [
            passageLink(17, `Back outside TODO`),
            passageLink(15, `Go to basement`),
            passageLink(11, `Go to staircase`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    17: {
        text: `Nothing has changed out here since last time you was here`,
        links: [
            passageLink(6, "Leave"),
            passageLink(10, "Go back inside"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    18: {
        text: `This is the floor you live in. You know this hallway, you have been here houndreds of times before, but something is off.
        Something is different. You cant quite put your finger on what it is.<br>
        <i>"Why does it feel like ive never been here before"</i><br>

        `,
        links: [
            passageLink(12, "Go back to staircase"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    19: {
        text: `After the flames die out you are able to go down the hallway where you notice a door ajar.<br>
        <i>"I hope whoever lives there are OK, i better take a look"</i><br>
        <i>"H...Hello!?"</i> you stutter, right before you see the door suddenly slam shut with a loud <i><b>bam!</b></i><br>

        `,
        links: [
            passageLink(12, "Go back to staircase"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    20: {
        text: `BASEMENT FLASHLIGHT`,
        links: [
            passageLink(12, "Go back to staircase"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
};



function itemPickup(name, data) {
    var aDiv = document.createElement("div");
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("name", name);
    a.classList.add("itemPickup");
    a.setAttribute("text", data);
    a.setAttribute("onclick", `main.inventory.addToInventory(this)`);
    a.appendChild(document.createTextNode("Pick up " + name));
    aDiv.appendChild(a);
    return aDiv;
};

function passageLink(passage, text) {
    var aDiv = document.createElement("div");
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.classList.add("passageLink");
    if (passage) a.setAttribute("onclick", `main.goToPassage(passages[${passage}])`);
    a.appendChild(document.createTextNode(text));
    aDiv.appendChild(a);
    return aDiv;
};

function itemButton(item, parent) {
    // var aDiv = document.createElement("div");
    var a = document.createElement("button");
    a.setAttribute("id", item.name);
    a.setAttribute("onclick", `main.inventory.currentInventory[${main.inventory.currentInventory.indexOf(item)}]` + ".use()");
    a.appendChild(document.createTextNode("Use " + item.name));
    parent.appendChild(a);
};


