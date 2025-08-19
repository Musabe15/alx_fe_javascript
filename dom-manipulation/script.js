// Initial quotes data
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteContainer = document.getElementById('addQuoteContainer');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

// Storage keys
const STORAGE_KEYS = {
    QUOTES: 'quotes',
    LAST_VIEWED: 'lastViewedQuote'
};

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
}

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none in storage
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "In the middle of difficulty lies opportunity.", category: "Opportunity" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
            { text: "Be the change that you wish to see in the world.", category: "Change" }
        ];
        saveQuotes();
    }
}

// Save last viewed quote to session storage
function saveLastViewedQuote(quote) {
    sessionStorage.setItem(STORAGE_KEYS.LAST_VIEWED, JSON.stringify(quote));
}

// Get last viewed quote from session storage
function getLastViewedQuote() {
    const lastQuote = sessionStorage.getItem(STORAGE_KEYS.LAST_VIEWED);
    return lastQuote ? JSON.parse(lastQuote) : null;
}

// Initialize categories dropdown
function initializeCategories() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
    }
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Display a random quote
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = quotes;
    
    // Filter quotes by category if not "all"
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Check if there are quotes to display
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p class="placeholder">No quotes available for this category</p>';
        return;
    }
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Display the quote
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${randomQuote.text}"</p>
        <span class="quote-category">${randomQuote.category}</span>
    `;
    
    // Save to session storage
    saveLastViewedQuote(randomQuote);
}

// Create the form to add new quotes
function createAddQuoteForm() {
    const addQuoteSection = document.createElement('div');
    addQuoteSection.className = 'add-quote-section';
    addQuoteSection.innerHTML = `
        <h2>Add a New Quote</h2>
        <div class="form-group">
            <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        </div>
        <div class="form-group">
            <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        </div>
        <button id="addQuoteBtn" class="add-quote-btn">Add Quote</button>
    `;
    
    addQuoteContainer.appendChild(addQuoteSection);
    
    // Add event listener to the button
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// Add a new quote
function addQuote() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');
    
    const text = textInput.value.trim();
    const category = categoryInput.value.trim();
    
    // Validate inputs
    if (!text || !category) {
        alert('Please enter both quote text and category');
        return;
    }
    
    // Create new quote object
    const newQuote = { text, category };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Save to local storage
    saveQuotes();
    
    // Update categories dropdown
    initializeCategories();
    
    // Clear input fields
    textInput.value = '';
    categoryInput.value = '';
    
    // Show success message
    alert('Quote added successfully!');
}

// Export quotes to JSON file using Blob
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    
    // Create a Blob with the JSON data
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotes.json';
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            
            // Validate the imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Imported data is not an array');
            }
            
            // Check if each item has the required properties
            for (const quote of importedQuotes) {
                if (!quote.text || !quote.category) {
                    throw new Error('Invalid quote format in imported file');
                }
            }
            
            // Add imported quotes to our array
            quotes.push(...importedQuotes);
            
            // Save to local storage
            saveQuotes();
            
            // Update categories dropdown
            initializeCategories();
            
            // Reset file input
            event.target.value = '';
            
            alert('Quotes imported successfully!');
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
            console.error('Import error:', error);
        }
    };
    fileReader.readAsText(file);
}

// Display last viewed quote if available
function displayLastViewedQuote() {
    const lastQuote = getLastViewedQuote();
    if (lastQuote) {
        quoteDisplay.innerHTML = `
            <p class="quote-text">"${lastQuote.text}"</p>
            <span class="quote-category">${lastQuote.category}</span>
            <p class="last-viewed-note">(Last viewed quote)</p>
        `;
    }
}

// Initialize the application
function init() {
    // Load quotes from local storage
    loadQuotes();
    
    // Initialize categories dropdown
    initializeCategories();
    
    // Create the add quote form
    createAddQuoteForm();
    
    // Display last viewed quote if available
    displayLastViewedQuote();
    
    // Set up event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', showRandomQuote);
    exportBtn.addEventListener('click', exportToJson);
    importFile.addEventListener('change', importFromJsonFile);
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);