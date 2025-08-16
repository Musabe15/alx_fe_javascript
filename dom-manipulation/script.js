// Initial quotes database
const quotes = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "work"
  },
  {
    text: "Life is what happens when you're busy making other plans.",
    author: "John Lennon",
    category: "life"
  }
];

// DOM elements cache
const elements = {
  quoteDisplay: document.getElementById('quoteDisplay'),
  newQuoteBtn: document.getElementById('newQuote'),
  categoryFilter: document.getElementById('categoryFilter')
};

// Initialize application
function init() {
  showRandomQuote();
  updateCategoryFilter();
  createAddQuoteForm(); // Creates the form dynamically
  setupEventListeners();
}

// Create the "Add Quote" form dynamically
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.className = 'add-quote-form';
  
  const formTitle = document.createElement('h2');
  formTitle.textContent = 'Add New Quote';
  
  // Create form groups
  const textGroup = createInputGroup('newQuoteText', 'Enter quote text', true);
  const authorGroup = createInputGroup('newQuoteAuthor', 'Enter author (optional)');
  const categoryGroup = createInputGroup('newQuoteCategory', 'Enter category', true);
  
  // Create submit button
  const submitBtn = document.createElement('button');
  submitBtn.id = 'addQuoteBtn';
  submitBtn.textContent = 'Add Quote';
  
  // Append all elements
  formContainer.append(
    formTitle,
    textGroup,
    authorGroup,
    categoryGroup,
    submitBtn
  );
  
  // Add to DOM
  document.querySelector('.container').appendChild(formContainer);
  
  // Cache the new elements
  elements.newQuoteText = document.getElementById('newQuoteText');
  elements.newQuoteAuthor = document.getElementById('newQuoteAuthor');
  elements.newQuoteCategory = document.getElementById('newQuoteCategory');
  elements.addQuoteBtn = document.getElementById('addQuoteBtn');
}

// Helper function to create input groups
function createInputGroup(id, placeholder, required = false) {
  const group = document.createElement('div');
  group.className = 'form-group';
  
  const input = document.createElement('input');
  input.id = id;
  input.type = 'text';
  input.placeholder = placeholder;
  if (required) input.required = true;
  
  group.appendChild(input);
  return group;
}

// Set up event listeners
function setupEventListeners() {
  elements.newQuoteBtn.addEventListener('click', showRandomQuote);
  elements.categoryFilter.addEventListener('change', showRandomQuote);
  elements.addQuoteBtn.addEventListener('click', addQuote);
}

// Display random quote
function showRandomQuote() {
  const selectedCategory = elements.categoryFilter.value;
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    elements.quoteDisplay.innerHTML = '<p>No quotes in this category</p>';
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  displayQuote(filteredQuotes[randomIndex]);
}

// Display specific quote
function displayQuote(quote) {
  elements.quoteDisplay.innerHTML = `
    <p class="quote-text">"${quote.text}"</p>
    ${quote.author ? `<p class="quote-author">— ${quote.author}</p>` : ''}
    <span class="quote-category">${quote.category}</span>
  `;
}

// Update category filter dropdown
function updateCategoryFilter() {
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
  elements.categoryFilter.innerHTML = categories.map(category => 
    `<option value="${category}">${
      category === 'all' ? 'All Categories' : category
    }</option>`
  ).join('');
}

// Add new quote to collection
function addQuote() {
  const text = elements.newQuoteText.value.trim();
  const author = elements.newQuoteAuthor.value.trim();
  const category = elements.newQuoteCategory.value.trim().toLowerCase();

  if (!text || !category) {
    alert('Please enter both quote text and category');
    return;
  }

  const newQuote = { text, category, ...(author && { author }) };
  quotes.push(newQuote);
  
  updateCategoryFilter();
  displayQuote(newQuote);
  clearForm();
  
  alert('Quote added successfully!');
}

// Clear form inputs
function clearForm() {
  elements.newQuoteText.value = '';
  elements.newQuoteAuthor.value = '';
  elements.newQuoteCategory.value = '';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);