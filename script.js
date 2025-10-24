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
const musicBtn = document.getElementById('musicBtn');
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

// Ambient sound URLs - using local files
const musicTracks = {
    lofi: {
        url: './songs/close-study-relax-chillhop-calm-study-lofi-123089.mp3',
        description: 'Lo-fi Study',
    },
    nature: {
        url: './songs/nature-walk-124997.mp3',
        description: 'Nature Walk',
    },
    ambient: {
        url: './songs/perfect-beauty-191271.mp3',
        description: 'Ambient Beauty',
    },
    study: {
        url: './songs/study-110111.mp3',
        description: 'Study Focus',
    },
    rain: {
        url: './songs/rain-sounds.mp3',
        description: 'Rain Sounds',
    },
    sleepyRain: {
        url: './songs/sleepy-rain-116521.mp3',
        description: 'Sleepy Rain',
    },
    forestLullaby: {
        url: './songs/forest-lullaby-110624.mp3',
        description: 'Forest Lullaby',
    },
    midnightForest: {
        url: './songs/midnight-forest-184304.mp3',
        description: 'Midnight Forest',
    },
    himalayan: {
        url: './songs/himalayan-village-flute-251427.mp3',
        description: 'Himalayan Flute',
    },
    lofiInstrumental: {
        url: './songs/lofi-instrumental-409202.mp3',
        description: 'Lo-fi Instrumental',
    },
    lofiChill: {
        url: './songs/lofi-study-calm-peaceful-chill-hop-112191.mp3',
        description: 'Lo-fi Chill Hop',
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
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
    if (skipBtn) skipBtn.addEventListener('click', skipSession);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    if (musicBtn) musicBtn.addEventListener('click', toggleMusicButton);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    if (settingsToggle) settingsToggle.addEventListener('click', toggleSettings);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    if (timerPresetSelect) timerPresetSelect.addEventListener('change', applyPreset);

    // Settings inputs
    document.getElementById('musicEnabled').addEventListener('change', (e) => {
        document.getElementById('musicControls').style.display = e.target.checked ? 'block' : 'none';
        
        // Update the settings object
        settings.musicEnabled = e.target.checked;
        
        // Update the top music button visual state
        updateMusicButtonState();
        
        // Handle music playback based on new state
        if (e.target.checked) {
            // Only start music if timer is running or if user explicitly wants it
            if (timerState.isRunning) {
                playMusic();
            }
        } else {
            // Always stop music when disabled
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
        // Update the settings immediately
        settings.musicTrack = document.getElementById('musicSelect').value;
        
        // If music is enabled and we have an audio player, switch tracks
        if (settings.musicEnabled && audioPlayer) {
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

    // Update music button state to reflect saved settings
    updateMusicButtonState();

    showNotification('✅ Settings saved successfully!');
    toggleSettings();
}

function loadSettings() {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }

    // Apply settings to UI - with null checks
    const elem = (id) => document.getElementById(id);
    
    if (elem('workDuration')) elem('workDuration').value = settings.workDuration;
    if (elem('breakDuration')) elem('breakDuration').value = settings.breakDuration;
    if (elem('longBreakDuration')) elem('longBreakDuration').value = settings.longBreakDuration;
    if (elem('sessionsBeforeLongBreak')) elem('sessionsBeforeLongBreak').value = settings.sessionsBeforeLongBreak;
    if (elem('soundEnabled')) elem('soundEnabled').checked = settings.soundEnabled;
    if (elem('musicEnabled')) elem('musicEnabled').checked = settings.musicEnabled;
    if (elem('musicSelect')) elem('musicSelect').value = settings.musicTrack;
    if (elem('volumeSlider')) elem('volumeSlider').value = settings.volume;
    if (elem('volumeValue')) elem('volumeValue').textContent = settings.volume + '%';
    if (elem('musicControls')) elem('musicControls').style.display = settings.musicEnabled ? 'block' : 'none';
    if (elem('autoStartBreaks')) elem('autoStartBreaks').checked = settings.autoStartBreaks;
    if (elem('autoStartWork')) elem('autoStartWork').checked = settings.autoStartWork;

    // Set initial time
    timerState.timeRemaining = settings.workDuration * 60;
    timerState.totalTime = settings.workDuration * 60;
    
    // Update music button state after all settings are loaded
    updateMusicButtonState();
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
        if (!trackConfig) {
            console.log('Track not found:', settings.musicTrack);
            return;
        }
        
        console.log(`Playing ${trackConfig.description} at ${settings.volume}% volume from: ${trackConfig.url}`);
        
        // Create audio player
        audioPlayer = new Audio();
        audioPlayer.src = trackConfig.url;
        audioPlayer.volume = (settings.volume / 100) * 0.5; // Keep it subtle
        audioPlayer.loop = true;
        audioPlayer.crossOrigin = 'anonymous';
        
        // Add error handler
        audioPlayer.addEventListener('error', (e) => {
            console.log('Audio error:', e);
            console.log('Could not load:', trackConfig.url);
            
            // If this is a fallback track that doesn't exist, show a helpful message
            if (trackConfig.fallback) {
                showNotification(`🎵 ${trackConfig.description} not available yet. Try another track!`);
                isPlayingMusic = false;
                
                // Remove the indicator since the track failed to load
                const indicator = document.getElementById('musicIndicator');
                if (indicator) {
                    indicator.remove();
                }
            }
        });
        
        // Try to play
        const playPromise = audioPlayer.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Music started playing successfully');
                isPlayingMusic = true;
            }).catch(error => {
                console.log('Could not play music:', error);
                isPlayingMusic = false;
            });
        } else {
            isPlayingMusic = true;
        }

        // Remove any existing music indicator first
        const existingIndicator = document.getElementById('musicIndicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Show new music indicator
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
            audioPlayer.src = ''; // Clear the source to free memory
        } catch (e) {
            // Already stopped
        }
        audioPlayer = null;
    }
    
    isPlayingMusic = false;
    
    // Remove any existing music indicator
    const indicator = document.getElementById('musicIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function playCompletionAlert() {
    // Play notification sound once with gentle reminder
    if (notificationSound) {
        notificationSound.volume = 0.3; // Set to 30% volume for gentle reminder
        notificationSound.currentTime = 0;
        notificationSound.play().catch(e => console.log('Could not play sound:', e));
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

function toggleMusicButton() {
    const musicEnabled = document.getElementById('musicEnabled');
    if (!musicEnabled) return;
    
    // Toggle the checkbox state
    musicEnabled.checked = !musicEnabled.checked;
    
    // Update settings object
    settings.musicEnabled = musicEnabled.checked;
    
    // Trigger change event to update controls and handle music playback
    musicEnabled.dispatchEvent(new Event('change'));
    
    // Show feedback to user
    const status = musicEnabled.checked ? 'enabled' : 'disabled';
    showNotification(`🎵 Background music ${status}`);
}

function updateMusicButtonState() {
    const musicEnabledEl = document.getElementById('musicEnabled');
    if (!musicEnabledEl || !musicBtn) return;
    
    const musicEnabled = musicEnabledEl.checked;
    if (musicEnabled) {
        musicBtn.classList.add('active');
    } else {
        musicBtn.classList.remove('active');
    }
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
