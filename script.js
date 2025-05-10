document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sourceText = document.getElementById('source-text');
    const startScrollerBtn = document.getElementById('start-scroller-btn');
    const wordContainer = document.getElementById('word-scroller-container');
    const wordLineElements = Array.from(document.querySelectorAll('.word-line'));
    const wordSpans = Array.from(document.querySelectorAll('.word-line span'));
    
    // State Variables
    let wordsList = [];
    let currentIndex = 0;
    let lineHeight = 0;
    let isPressed = false;
    let pressTimer = null;
    let scrollInterval = null;
    let isScrolling = false;
    
    // Sample text to start with
    const sampleText = "Breathing In I Enjoy My In-Breath Breathing Out I Enjoy My Out-Breath";
    sourceText.value = sampleText;
    
    // Initialize the application
    function init() {
        // Calculate line height
        lineHeight = wordLineElements[0].offsetHeight;
        
        // Initial position of container (top buffer hidden)
        wordContainer.style.top = `-${lineHeight}px`;
        
        // Load initial text
        loadText(sampleText);
        
        // Add event listeners for interactions
        document.body.addEventListener('mousedown', onPressStart);
        document.body.addEventListener('mouseup', onPressEnd);
        document.body.addEventListener('mouseleave', onPressEnd);
        document.body.addEventListener('touchstart', onPressStart, { passive: true });
        document.body.addEventListener('touchend', onPressEnd);
        
        // Button event listener
        startScrollerBtn.addEventListener('click', function() {
            loadText(sourceText.value);
        });
        
        // Keyboard support
        document.body.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && !isPressed) {
                e.preventDefault();
                onPressStart();
            }
        });
        
        document.body.addEventListener('keyup', function(e) {
            if (e.code === 'Space') {
                e.preventDefault();
                onPressEnd();
            }
        });
    }
    
    // Load and process text
    function loadText(text) {
        // Properly split text into individual words
        const textContent = text.trim();
        // Split by whitespace and filter out empty strings
        wordsList = textContent.split(/\s+/).filter(word => word.length > 0);
        
        // If no words, use a placeholder
        if (wordsList.length === 0) {
            wordsList = ['No', 'text', 'provided'];
        }
        
        console.log('Processed words:', wordsList);
        
        // Reset index and update display
        currentIndex = 0;
        updateDisplay();
    }
    
    // Update the display with current words
    function updateDisplay() {
        // Fill the word slots - each slot gets exactly one word
        for (let i = 0; i < wordLineElements.length; i++) {
            const span = wordLineElements[i].querySelector('span');
            
            // Calculate which word to show in this slot with proper wrapping
            const wordIndex = (currentIndex + i - 1 + wordsList.length) % wordsList.length;
            
            // Set word content (just one word per slot)
            span.textContent = wordsList[wordIndex];
            
            // Handle aria attributes for screen readers
            if (i === 0 || i === 7) { // Buffer slots
                wordLineElements[i].setAttribute('aria-hidden', 'true');
            } else {
                wordLineElements[i].removeAttribute('aria-hidden');
            }
            
            // Add underline to the newest visible word (6th visible slot)
            if (i === 6) {
                wordLineElements[i].classList.add('newest-visible');
            } else {
                wordLineElements[i].classList.remove('newest-visible');
            }
        }
    }
    
    // Handle press start (mouse down or touch start)
    function onPressStart(event) {
        if (event) event.preventDefault();
        
        clearTimeout(pressTimer);
        
        // 250ms delay before activating scroll
        pressTimer = setTimeout(() => {
            isPressed = true;
            document.body.classList.add('scrolling-active');
            startScrolling();
        }, 250);
    }
    
    // Handle press end (mouse up or touch end)
    function onPressEnd(event) {
        if (event) event.preventDefault();
        
        clearTimeout(pressTimer);
        isPressed = false;
        document.body.classList.remove('scrolling-active');
        stopScrolling();
    }
    
    // Start the scrolling animation
    function startScrolling() {
        if (!isScrolling && wordsList.length > 0) {
            isScrolling = true;
            scrollInterval = setInterval(scrollStep, 700); // 700ms per step (was 400ms) - slower scrolling
        }
    }
    
    // Stop the scrolling animation
    function stopScrolling() {
        clearInterval(scrollInterval);
        isScrolling = false;
    }
    
    // Handle a single scroll step
    function scrollStep() {
        // First, ensure the transition is enabled with the same timing as in CSS
        wordContainer.style.transition = 'transform 0.65s cubic-bezier(0.25, 0.1, 0.25, 1)';
        
        // Animate container moving up one line
        wordContainer.style.transform = `translateY(-${lineHeight}px)`;
        
        // Handle transition end
        setTimeout(() => {
            // Stop if no longer pressed
            if (!isPressed) {
                stopScrolling();
                return;
            }
            
            // Increment current index with wrapping
            currentIndex = (currentIndex + 1) % wordsList.length;
            
            // Update display with new word positions
            updateDisplay();
            
            // Reset container position without animation
            wordContainer.style.transition = 'none';
            wordContainer.style.transform = 'translateY(0)';
            
            // Force reflow to apply style immediately
            void wordContainer.offsetHeight;
            
            // The next animation will happen on the next scrollStep call
        }, 630); // Slightly less than the transition duration (0.65s = 650ms) to avoid jerky motion
    }
    
    // Initialize the application
    init();
});
