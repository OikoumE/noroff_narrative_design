// File: script.js - noroff Narrative 2023
// Author: itsOiK
// Date: 24/01-23
console.log('[script:0]: test');



const getElId = (id) => document.getElementById(id);
const appendHr = (element) => element.appendChild(document.createElement("hr"));

container = getElId("container");
textContainer = getElId("text-container");
itemResponse = getElId("item-response");
itemsContainer = getElId("items");
inventoryContainer = getElId("inventory");
inventoryElm = getElId("inventory");
navigation = getElId("navigation");


console.log('[script:19]: 1 > false', 0 == false);


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
        console.log('[script:33]: passage', passage);
        if ("canUseFlashlight" in passage && passage.canUseFlashlight ||
            "canUseExtinguisher" in passage && passage.canUseExtinguisher) {
            itemResponse.innerHTML = this.text;
            buttonText = "Continue";
            console.log('[script:39]: navigation.children.length', navigation.children.length);

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
        itemResponse.classList.add("item-response-hidden");
        itemResponse.innerHTML = "";
        if (this.currPassage && !goToPrev) this.passageHistory.push(this.currPassage);
        this.currPassage = passage;
        this.clearContainer();
        this.populateContainer(passage.text);
        this.updateItems();
        this.updateNavigation(passage);

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
            //TODO clear options in nav
        }
    }
}

const main = new Main();
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
        text: `Congratuilations, you reached a dead end :D`,
        links: [],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    1: {
        text: `You wake up to the smell of smoke, there is no alarm ringing. you quickly get out of the bed and rush out of the apartment.`,
        links: [
            passageLink(2, "Leave apartment"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    2: {
        text: `You are in the hallway. You notice a fire extinguisher next to the elevator`,
        links: [
            passageLink(3, "Take the elevator"),
            passageLink(4, "Take the stairs"),
            itemPickup("Extinguisher", "pssht pssht, fire gone"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    3: {
        text: `There is a big red label on the elevator stating: <p style="color:red;">IN CASE OF FIRE, DO NOT USE ELEVATOR, USE STAIRS</p>`,
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
            itemPickup("Extinguisher", "pssht pssht, fire gone"),
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
        text: `Are you really going to leave all those people left inside? the building is potentially on fire and no alarm has triggered. Nobody knows there is a fire`,
        links: [
            passageLink(5, "Turn Back"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    7: {
        text: `You go back inside the building and meet someone exiting. You stop the person and ask them; "are you OK!? do you know where the fire is, or smell is coming from?"`,
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
        text: `The person leaves and you continue down the foyer, trying to figure out why the alarms are not ringing and where the smell is coming from. you see the janitors apartment door at the end of the foyer, a door leading down to the basement where the fire alarm system is located, and the door to the staircase`,
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
        text: `you go to floor 6 and smell smoke in the hallway`,
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
        text: `basement TODO`,
        links: [
            passageLink(12, `Back to staircase`),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    16: {
        text: `You knock on the janitor's door and get no answer, you start pounding it, when you realize that his office hours are listed on the door and he is currently not here`,
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
        text: `This is the floor you live in`,
        links: [
            passageLink(12, "Go back to staircase"),
        ],
        canUseFlashlight: false,
        canUseExtinguisher: false,
        next: null,
    },
    19: {
        text: `You extinguish the fire and you are able to continue down the hall.`,
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


