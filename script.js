// Timer State
let timerState = {
    currentMode: 'work',
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60, // in seconds
    totalTime: 25 * 60,
    sessionCount: 1,
    completedSessions: 0,
    totalFocusTime: 0, // in minutes
    intervalId: null
};

// Settings
let settings = {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    soundEnabled: true,
    musicEnabled: false,
    musicTrack: 'lofi',
    volume: 50
};

// DOM Elements
const timeDisplay = document.getElementById('time');
const sessionCountDisplay = document.getElementById('sessionCount');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const settingsToggle = document.getElementById('settingsToggle');
const settingsContent = document.getElementById('settingsContent');
const saveSettingsBtn = document.getElementById('saveSettings');
const completedSessionsDisplay = document.getElementById('completedSessions');
const totalFocusTimeDisplay = document.getElementById('totalFocusTime');
const progressRing = document.querySelector('.progress-ring-circle');
const notificationSound = document.getElementById('notificationSound');

// Progress Ring Setup
const progressRingRadius = 160;
const progressRingCircumference = 2 * Math.PI * progressRingRadius;
progressRing.style.strokeDasharray = `${progressRingCircumference} ${progressRingCircumference}`;
progressRing.style.strokeDashoffset = 0;

// Music Player (using YouTube embedded audio or local files)
let musicPlayer = null;
let musicTracks = {
    lofi: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1&playlist=jfKfPfyJRdk',
    nature: 'https://www.youtube.com/embed/eKFTSSKCzWA?autoplay=1&loop=1&playlist=eKFTSSKCzWA',
    ambient: 'https://www.youtube.com/embed/l7TxwBhtNEU?autoplay=1&loop=1&playlist=l7TxwBhtNEU',
    piano: 'https://www.youtube.com/embed/3jWRrafhO7M?autoplay=1&loop=1&playlist=3jWRrafhO7M'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    updateDisplay();
    updateProgressRing();
    setupEventListeners();
    loadStats();
});

// Event Listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    settingsToggle.addEventListener('click', toggleSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Settings inputs
    document.getElementById('musicEnabled').addEventListener('change', (e) => {
        document.getElementById('musicControls').style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked && timerState.isRunning) {
            playMusic();
        } else {
            stopMusic();
        }
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('volumeValue').textContent = e.target.value + '%';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (timerState.isRunning) {
                pauseTimer();
            } else {
                startTimer();
            }
        }
    });
}

// Timer Functions
function startTimer() {
    if (timerState.isRunning) return;

    timerState.isRunning = true;
    timerState.isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    timeDisplay.classList.add('pulsing');

    if (settings.musicEnabled) {
        playMusic();
    }

    timerState.intervalId = setInterval(() => {
        timerState.timeRemaining--;
        
        if (timerState.timeRemaining <= 0) {
            completeSession();
        }
        
        updateDisplay();
        updateProgressRing();
    }, 1000);
}

function pauseTimer() {
    if (!timerState.isRunning) return;

    timerState.isRunning = false;
    timerState.isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    timeDisplay.classList.remove('pulsing');

    clearInterval(timerState.intervalId);
    
    stopMusic();
}

function resetTimer() {
    pauseTimer();
    
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.timeRemaining = timerState.totalTime;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    updateDisplay();
    updateProgressRing();
}

function completeSession() {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    
    timeDisplay.classList.remove('pulsing');

    if (timerState.currentMode === 'work') {
        timerState.completedSessions++;
        timerState.totalFocusTime += settings.workDuration;
        saveStats();
        
        // Auto-switch to break
        if (timerState.completedSessions % settings.sessionsBeforeLongBreak === 0) {
            switchMode('long-break');
        } else {
            switchMode('break');
        }
    } else {
        // After break, switch back to work
        timerState.sessionCount++;
        switchMode('work');
    }

    if (settings.soundEnabled) {
        playNotificationSound();
    }

    showNotification(
        timerState.currentMode === 'work' 
            ? 'Work session complete! Time for a break.' 
            : 'Break over! Ready to focus again?'
    );

    stopMusic();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function switchMode(mode) {
    if (timerState.isRunning) {
        resetTimer();
    }

    timerState.currentMode = mode;
    
    // Update active button
    modeBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

    // Set time based on mode
    switch (mode) {
        case 'work':
            timerState.timeRemaining = settings.workDuration * 60;
            timerState.totalTime = settings.workDuration * 60;
            progressRing.style.stroke = '#e74c3c';
            break;
        case 'break':
            timerState.timeRemaining = settings.breakDuration * 60;
            timerState.totalTime = settings.breakDuration * 60;
            progressRing.style.stroke = '#3498db';
            break;
        case 'long-break':
            timerState.timeRemaining = settings.longBreakDuration * 60;
            timerState.totalTime = settings.longBreakDuration * 60;
            progressRing.style.stroke = '#27ae60';
            break;
    }

    updateDisplay();
    updateProgressRing();
}

// Display Functions
function updateDisplay() {
    const minutes = Math.floor(timerState.timeRemaining / 60);
    const seconds = timerState.timeRemaining % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    sessionCountDisplay.textContent = timerState.sessionCount;
    
    // Update document title
    document.title = `${timeDisplay.textContent} - Pomodoro Timer`;
}

function updateProgressRing() {
    const progress = timerState.timeRemaining / timerState.totalTime;
    const offset = progressRingCircumference - (progress * progressRingCircumference);
    progressRing.style.strokeDashoffset = offset;
}

// Settings Functions
function toggleSettings() {
    settingsContent.classList.toggle('active');
}

function saveSettings() {
    settings.workDuration = parseInt(document.getElementById('workDuration').value);
    settings.breakDuration = parseInt(document.getElementById('breakDuration').value);
    settings.longBreakDuration = parseInt(document.getElementById('longBreakDuration').value);
    settings.sessionsBeforeLongBreak = parseInt(document.getElementById('sessionsBeforeLongBreak').value);
    settings.soundEnabled = document.getElementById('soundEnabled').checked;
    settings.musicEnabled = document.getElementById('musicEnabled').checked;
    settings.musicTrack = document.getElementById('musicSelect').value;
    settings.volume = parseInt(document.getElementById('volumeSlider').value);

    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));

    // Update current timer if in work mode and not running
    if (timerState.currentMode === 'work' && !timerState.isRunning) {
        timerState.timeRemaining = settings.workDuration * 60;
        timerState.totalTime = settings.workDuration * 60;
        updateDisplay();
        updateProgressRing();
    }

    showNotification('Settings saved successfully!');
    toggleSettings();
}

function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }

    // Apply settings to UI
    document.getElementById('workDuration').value = settings.workDuration;
    document.getElementById('breakDuration').value = settings.breakDuration;
    document.getElementById('longBreakDuration').value = settings.longBreakDuration;
    document.getElementById('sessionsBeforeLongBreak').value = settings.sessionsBeforeLongBreak;
    document.getElementById('soundEnabled').checked = settings.soundEnabled;
    document.getElementById('musicEnabled').checked = settings.musicEnabled;
    document.getElementById('musicSelect').value = settings.musicTrack;
    document.getElementById('volumeSlider').value = settings.volume;
    document.getElementById('volumeValue').textContent = settings.volume + '%';
    document.getElementById('musicControls').style.display = settings.musicEnabled ? 'block' : 'none';

    // Set initial time
    timerState.timeRemaining = settings.workDuration * 60;
    timerState.totalTime = settings.workDuration * 60;
}

// Stats Functions
function saveStats() {
    const stats = {
        completedSessions: timerState.completedSessions,
        totalFocusTime: timerState.totalFocusTime
    };
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    updateStatsDisplay();
}

function loadStats() {
    const saved = localStorage.getItem('pomodoroStats');
    if (saved) {
        const stats = JSON.parse(saved);
        timerState.completedSessions = stats.completedSessions || 0;
        timerState.totalFocusTime = stats.totalFocusTime || 0;
    }
    updateStatsDisplay();
}

function updateStatsDisplay() {
    completedSessionsDisplay.textContent = timerState.completedSessions;
    
    const hours = Math.floor(timerState.totalFocusTime / 60);
    const minutes = timerState.totalFocusTime % 60;
    totalFocusTimeDisplay.textContent = `${hours}h ${minutes}m`;
}

// Audio Functions
function playNotificationSound() {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(e => console.log('Could not play notification sound:', e));
}

function playMusic() {
    if (!settings.musicEnabled) return;

    // Remove existing music player if any
    stopMusic();

    // Create music indicator
    const indicator = document.createElement('div');
    indicator.className = 'music-indicator';
    indicator.id = 'musicIndicator';
    indicator.innerHTML = `<span>Playing: ${settings.musicTrack}</span>`;
    document.body.appendChild(indicator);

    // Note: For a real implementation, you would need to use the YouTube IFrame API
    // or integrate with a music streaming service. This is a placeholder.
    console.log(`Playing ${settings.musicTrack} music at ${settings.volume}% volume`);
}

function stopMusic() {
    const indicator = document.getElementById('musicIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Notification Functions
function showNotification(message) {
    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
            body: message,
            icon: '🍅'
        });
    }

    // Show in-app notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Service Worker for offline support (optional enhancement)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker not available, continue without it
    });
}
