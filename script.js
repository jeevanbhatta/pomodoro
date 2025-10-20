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
    musicTrack: 'rain',
    volume: 50,
    autoStartBreaks: false,
    autoStartWork: false
};

// DOM Elements
const timeDisplay = document.getElementById('time');
const sessionCountDisplay = document.getElementById('sessionCount');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const skipBtn = document.getElementById('skipBtn');
const modeBtns = document.querySelectorAll('.mode-btn');
const timerPresetSelect = document.getElementById('timerPreset');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const themeBtn = document.getElementById('themeBtn');
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

// Audio Context for background music
let audioPlayer = null;
let isPlayingMusic = false;

// Ambient sound URLs (free, royalty-free sources)
const musicTracks = {
    rain: {
        url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_1084ffd567.mp3',
        description: 'Rain Sounds',
        fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    },
    forest: {
        url: 'https://cdn.pixabay.com/download/audio/2022/04/13/audio_f47b2a7e96.mp3',
        description: 'Forest Ambience',
        fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    },
    ocean: {
        url: 'https://cdn.pixabay.com/download/audio/2022/05/18/audio_2c5af78f34.mp3',
        description: 'Ocean Waves',
        fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    },
    cafe: {
        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_10db0e5a0f.mp3',
        description: 'Coffee Shop',
        fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    },
    whitenoise: {
        url: 'https://cdn.pixabay.com/download/audio/2022/02/15/audio_e52f1d0f35.mp3',
        description: 'White Noise',
        fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
    },
    fire: {
        url: 'https://cdn.pixabay.com/download/audio/2022/06/21/audio_de4a2e674f.mp3',
        description: 'Fireplace',
        fallback: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
    }
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
    skipBtn.addEventListener('click', skipSession);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    themeBtn.addEventListener('click', toggleTheme);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    settingsToggle.addEventListener('click', toggleSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    timerPresetSelect.addEventListener('change', applyPreset);

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
        const volume = e.target.value;
        document.getElementById('volumeValue').textContent = volume + '%';
        if (audioPlayer) {
            audioPlayer.volume = (volume / 100) * 0.5;
        }
    });

    document.getElementById('musicSelect').addEventListener('change', () => {
        if (isPlayingMusic && timerState.isRunning) {
            stopMusic();
            setTimeout(() => playMusic(), 100);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            if (e.code === 'Space') {
                e.preventDefault();
                if (timerState.isRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                resetTimer();
            } else if (e.code === 'KeyS') {
                e.preventDefault();
                skipSession();
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

function skipSession() {
    if (timerState.isRunning) {
        pauseTimer();
    }
    completeSession();
}

function completeSession() {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    
    timeDisplay.classList.remove('pulsing');

    const wasWorkSession = timerState.currentMode === 'work';

    // Play completion sound multiple times for emphasis
    if (settings.soundEnabled) {
        playCompletionAlert();
    }

    // Flash the screen
    flashScreen();

    if (wasWorkSession) {
        timerState.completedSessions++;
        timerState.totalFocusTime += settings.workDuration;
        saveStats();
        
        // Auto-switch to break
        if (timerState.completedSessions % settings.sessionsBeforeLongBreak === 0) {
            switchMode('long-break');
        } else {
            switchMode('break');
        }

        showNotification('🎉 Work session complete! Time for a break.');

        if (settings.autoStartBreaks) {
            showNotification('⏰ Break starting in 3 seconds...');
            setTimeout(() => startTimer(), 3000);
        }
    } else {
        // After break, switch back to work
        timerState.sessionCount++;
        switchMode('work');

        showNotification('💪 Break over! Ready to focus again?');

        if (settings.autoStartWork) {
            showNotification('⏰ Work session starting in 3 seconds...');
            setTimeout(() => startTimer(), 3000);
        }
    }

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

function applyPreset() {
    const preset = timerPresetSelect.value;
    if (!preset) return;

    const [work, shortBreak, longBreak] = preset.split('-').map(Number);
    
    document.getElementById('workDuration').value = work;
    document.getElementById('breakDuration').value = shortBreak;
    document.getElementById('longBreakDuration').value = longBreak;

    showNotification(`✅ Preset applied: ${work}/${shortBreak}/${longBreak} minutes`);
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
    settings.autoStartBreaks = document.getElementById('autoStartBreaks').checked;
    settings.autoStartWork = document.getElementById('autoStartWork').checked;

    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));

    // Update current timer if in work mode and not running
    if (timerState.currentMode === 'work' && !timerState.isRunning) {
        timerState.timeRemaining = settings.workDuration * 60;
        timerState.totalTime = settings.workDuration * 60;
        updateDisplay();
        updateProgressRing();
    }

    showNotification('✅ Settings saved successfully!');
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
    document.getElementById('autoStartBreaks').checked = settings.autoStartBreaks;
    document.getElementById('autoStartWork').checked = settings.autoStartWork;

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

    stopMusic();

    try {
        const trackConfig = musicTracks[settings.musicTrack];
        
        // Create audio player
        audioPlayer = new Audio();
        audioPlayer.src = trackConfig.url;
        audioPlayer.volume = (settings.volume / 100) * 0.5; // Keep it subtle
        audioPlayer.loop = true;
        audioPlayer.crossOrigin = 'anonymous';
        
        // Try to play
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Could not play music:', error);
                // Try fallback URL
                audioPlayer.src = trackConfig.fallback;
                audioPlayer.play().catch(e => console.log('Fallback also failed:', e));
            });
        }
        
        isPlayingMusic = true;

        // Show music indicator
        const indicator = document.createElement('div');
        indicator.className = 'music-indicator';
        indicator.id = 'musicIndicator';
        indicator.innerHTML = `<span>${trackConfig.description}</span>`;
        document.body.appendChild(indicator);
    } catch (e) {
        console.log('Could not initialize music player:', e);
    }
}

function stopMusic() {
    if (audioPlayer) {
        try {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        } catch (e) {
            // Already stopped
        }
        audioPlayer = null;
    }
    
    isPlayingMusic = false;
    
    const indicator = document.getElementById('musicIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function playCompletionAlert() {
    // Play notification sound 3 times
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            notificationSound.currentTime = 0;
            notificationSound.play().catch(e => console.log('Could not play sound:', e));
        }, i * 400);
    }
}

function flashScreen() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(231, 76, 60, 0.3);
        z-index: 9999;
        pointer-events: none;
        animation: flash 0.5s ease-in-out 3;
    `;
    document.body.appendChild(flash);
    
    // Add flash animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes flash {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        flash.remove();
        style.remove();
    }, 1500);
}

function toggleFullscreen() {
    document.body.classList.toggle('fullscreen');
    
    if (document.body.classList.contains('fullscreen')) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('pomodoroTheme', isLight ? 'light' : 'dark');
}

// Load theme preference
const savedTheme = localStorage.getItem('pomodoroTheme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
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
