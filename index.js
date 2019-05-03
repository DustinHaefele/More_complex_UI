'use strict';

const STORE = {
  items: [
    {id: cuid(), name: "apples", checked: false},
    {id: cuid(), name: "oranges", checked: false},
    {id: cuid(), name: "milk", checked: true},
    {id: cuid(), name: "bread", checked: false}
  ],
  hideCompleted: false,
  filterTerm: null
};

function generateItemElement(item) {
  return `
    <li data-item-id="${item.id}">
      <span class="shopping-item js-shopping-item ${item.checked ? "shopping-item__checked" : ''}">${item.name}</span>
      <div class="shopping-item-controls">
        <button class="shopping-item-toggle js-item-toggle">
            <span class="button-label">check</span>
        </button>
        <button class="shopping-item-delete js-item-delete">
            <span class="button-label">delete</span>
        </button>
        <form class="js-edit-name-form">
            <label for="item-edit">Change Item Name: </label>
            <input type="text" name="item-edit" class="js-item-edit" placeholder="New Name">
            <button type='submit' class = "js-edit">Change Name</button>
            </form>
          
      </div>
    </li>`;
}




function generateShoppingItemsString(shoppingList) {
  console.log("Generating shopping list element");

  const items = shoppingList.map((item) => generateItemElement(item));
  
  return items.join("");
}


function renderShoppingList() {
  // render the shopping list in the DOM
  console.log('`renderShoppingList` ran');

  // set up a copy of the store's items in a local variable that we will reassign to a new
  // version if any filtering of the list occurs
  let filteredItems = STORE.items;

  // if the `hideCompleted` property is true, then we want to reassign filteredItems to a version
  // where ONLY items with a "checked" property of false are included
  if (STORE.hideCompleted) {
    filteredItems = filteredItems.filter(item => !item.checked);
  }

  if (STORE.filterTerm){
    console.log('filter term exists');
    filteredItems = filteredItems.filter(item => item.name.includes(STORE.filterTerm));
  }

  // at this point, all filtering work has been done (or not done, if that's the current settings), so
  // we send our `filteredItems` into our HTML generation function 
  const shoppingListItemsString = generateShoppingItemsString(filteredItems);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
}


function addItemToShoppingList(itemName) {
  console.log(`Adding "${itemName}" to shopping list`);
  STORE.items.push({id: cuid(), name: itemName, checked: false});
}

function handleNewItemSubmit() {
  $('#js-shopping-list-form').submit(function(event) {
    event.preventDefault();
    console.log('`handleNewItemSubmit` ran');
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    renderShoppingList();
  });
}

function toggleCheckedForListItem(itemId) {
  console.log("Toggling checked property for item with id " + itemId);
  const item = STORE.items.find(item => item.id === itemId);
  item.checked = !item.checked;
}


function getItemIdFromElement(item) {
  return $(item)
    .closest('li')
    .data('item-id');
}

function handleItemCheckClicked() {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    console.log('`handleItemCheckClicked` ran');
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    renderShoppingList();
  });
}


// name says it all. responsible for deleting a list item.
function deleteListItem(itemId) {
  console.log(`Deleting item with id  ${itemId} from shopping list`)

  // as with `addItemToShoppingLIst`, this function also has the side effect of
  // mutating the global STORE value.
  //
  // First we find the index of the item with the specified id using the native
  // Array.prototype.findIndex() method. Then we call `.splice` at the index of 
  // the list item we want to remove, with a removeCount of 1.
  const itemIndex = STORE.items.findIndex(item => item.id === itemId);
  STORE.items.splice(itemIndex, 1);
}


function handleDeleteItemClicked() {
  // like in `handleItemCheckClicked`, we use event delegation
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // get the index of the item in STORE
    const itemIndex = getItemIdFromElement(event.currentTarget);
    // delete the item
    deleteListItem(itemIndex);
    // render the updated shopping list
    renderShoppingList();
  });
}

// Toggles the STORE.hideCompleted property
function toggleHideFilter() {
  STORE.hideCompleted = !STORE.hideCompleted;
}

// Places an event listener on the checkbox for hiding completed items
function handleToggleHideFilter() {
  $('.js-hide-completed-toggle').on('click', () => {
    toggleHideFilter();
    renderShoppingList();
  });
}

//Edits STORE.items.name property of an item. (Takes in new name)
function editItemName(itemId, newName){
  console.log("Editing name for item with id " + itemId);
  //references one item with the given id in the STORE
  const item = STORE.items.find(item => item.id === itemId);
  //Setting the item name property to the new name.
  item.name = newName;
}

//listens for a submit on a form in our list and takes that input and changes the current input
function handleEditItemName() {
  //Listening for a submit on my new form to change the item name
  $('.js-shopping-list').on('submit','.js-edit-name-form', function(){
    event.preventDefault();
    //get the id to find it in the STORE
    let id = getItemIdFromElement($(this));
    //grabbing the user input from the form
    let userInput = $(this).closest('li').find('input').val();
    $(this).closest('li').find('input').val('');
    //editting the item in STORE
    editItemName(id, userInput);
    //Render the list
    renderShoppingList();   
  });
}

//function that changes the filter term in the STORE 
function filterItems(term){
  //changing the term I filter by in my STORE
  STORE.filterTerm = term;
}

function handleFilterItems() {
  //Listens for the filter form to submit
  $('#js-filter-form').submit(function(event) {
    event.preventDefault();
    //sets my filter term to the term in the filter form
    const filterTerm = $('.js-shopping-list-filter').val();
    $('.js-shopping-list-filter').val('');
    //see function above
    filterItems(filterTerm);
    renderShoppingList();
  });
  //Clears my filter, by litening for clirks on the clear filter button I created
  //and setting my filterTerm in my STORE to an empty string;
  $('#js-filter-form').on('click','.clear',function(event) {
    event.preventDefault();
    const filterTerm = '';
    $('.js-shopping-list-filter').val('');
    //see function above
    filterItems(filterTerm);
    renderShoppingList();
  });

}

// this function will be our callback when the page loads. it's responsible for
// initially rendering the shopping list, and activating our individual functions
// that handle new item submission and user clicks on the "check" and "delete" buttons
// for individual shopping list items.
function handleShoppingList() {
  renderShoppingList();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleHideFilter();
  handleEditItemName();
  handleFilterItems();
}

// when the page loads, call `handleShoppingList`
$(handleShoppingList);

