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
    autoStartWork: false,
    taskManagementEnabled: false,
    eyeRestReminders: true,
    postureReminders: true,
    hydrationReminders: true,
    wellnessFrequency: 2,
    wellnessReminderMode: 'random',
    wellnessReminderCycleIndex: 0
};

// Task Management State
let taskState = {
    currentTask: '',
    taskHistory: [],
    sessionStartTime: null
};

// Custom Music State
let customMusicState = {
    tracks: new Map(), // Map of trackId -> { name, blob, size }
    currentCustomTrack: null
};

// YouTube Music State
let youtubeState = {
    currentUrl: '',
    videoId: '',
    title: '',
    isPlayerVisible: true,
    player: null,
    isReady: false
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

// Task Management DOM Elements
const taskContainer = document.getElementById('taskContainer');
const taskInputSection = document.getElementById('taskInputSection');
const currentTaskInput = document.getElementById('currentTask');
const setTaskBtn = document.getElementById('setTaskBtn');
const currentTaskDisplay = document.getElementById('currentTaskDisplay');
const currentTaskText = document.getElementById('currentTaskText');
const editTaskBtn = document.getElementById('editTaskBtn');
const taskHistoryContainer = document.getElementById('taskHistoryContainer');
const taskHistoryList = document.getElementById('taskHistoryList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Custom Music DOM Elements
const musicUpload = document.getElementById('musicUpload');
const customMusicList = document.getElementById('customMusicList');
const customMusicGroup = document.getElementById('customMusicGroup');

// YouTube Music DOM Elements
const youtubeUrl = document.getElementById('youtubeUrl');
const addYoutubeBtn = document.getElementById('addYoutubeBtn');
const youtubePlayerContainer = document.getElementById('youtubePlayerContainer');
const youtubeTitle = document.getElementById('youtubeTitle');
const toggleYoutubeBtn = document.getElementById('toggleYoutubeBtn');
const removeYoutubeBtn = document.getElementById('removeYoutubeBtn');
const youtubePlayerWrapper = document.getElementById('youtubePlayerWrapper');
const youtubePlayer = document.getElementById('youtubePlayer');
const youtubeMusicGroup = document.getElementById('youtubeMusicGroup');

// Wellness DOM Elements
const wellnessModal = document.getElementById('wellnessModal');
const wellnessModalTitle = document.getElementById('wellnessModalTitle');
const wellnessIcon = document.getElementById('wellnessIcon');
const wellnessMessage = document.getElementById('wellnessMessage');
const wellnessTips = document.getElementById('wellnessTips');
const wellnessModalClose = document.getElementById('wellnessModalClose');
const wellnessSkip = document.getElementById('wellnessSkip');
const wellnessDone = document.getElementById('wellnessDone');

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
    loadTaskData();
    loadCustomMusic();
    loadYoutubeMusic();
    initializeCollapsibleSections();
    
    // Sync music select dropdown with loaded settings
    setTimeout(() => {
        syncMusicSelectWithState();
    }, 100);
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

    // Collapsible settings sections
    const timerSettingsToggle = document.getElementById('timerSettingsToggle');
    const wellnessSettingsToggle = document.getElementById('wellnessSettingsToggle');
    
    if (timerSettingsToggle) timerSettingsToggle.addEventListener('click', () => toggleSettingsSection('timerSettings'));
    if (wellnessSettingsToggle) wellnessSettingsToggle.addEventListener('click', () => toggleSettingsSection('wellnessSettings'));

    // Task Management Event Listeners
    if (setTaskBtn) setTaskBtn.addEventListener('click', setCurrentTask);
    if (editTaskBtn) editTaskBtn.addEventListener('click', editCurrentTask);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearTaskHistory);
    if (currentTaskInput) {
        currentTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                setCurrentTask();
            }
        });
    }

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

    document.getElementById('musicSelect').addEventListener('change', (e) => {
        // Update the settings immediately
        settings.musicTrack = e.target.value;
        
        // If music is enabled and timer is running, switch tracks immediately
        if (settings.musicEnabled && timerState.isRunning) {
            stopMusic();
            // Use requestAnimationFrame for smoother transition
            requestAnimationFrame(() => {
                playMusic();
            });
        }
    });

    document.getElementById('taskManagementEnabled').addEventListener('change', (e) => {
        settings.taskManagementEnabled = e.target.checked;
        toggleTaskManagement();
    });

    // Custom Music Event Listeners
    if (musicUpload) {
        musicUpload.addEventListener('change', handleMusicUpload);
        
        // Drag and drop functionality
        const uploadArea = musicUpload.parentElement;
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            handleMusicFiles(files);
        });
    }

    // YouTube Music Event Listeners
    if (addYoutubeBtn) addYoutubeBtn.addEventListener('click', addYoutubeMusic);
    if (toggleYoutubeBtn) toggleYoutubeBtn.addEventListener('click', toggleYoutubePlayer);
    if (removeYoutubeBtn) removeYoutubeBtn.addEventListener('click', removeYoutubeMusic);
    if (youtubeUrl) {
        youtubeUrl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addYoutubeMusic();
            }
        });
    }

    // Wellness Event Listeners
    if (wellnessModalClose) wellnessModalClose.addEventListener('click', closeWellnessModal);
    if (wellnessSkip) wellnessSkip.addEventListener('click', closeWellnessModal);
    if (wellnessDone) wellnessDone.addEventListener('click', closeWellnessModal);
    
    // Close modal when clicking outside
    if (wellnessModal) {
        wellnessModal.addEventListener('click', (e) => {
            if (e.target === wellnessModal) {
                closeWellnessModal();
            }
        });
    }

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

    // Track session start time for task management
    if (settings.taskManagementEnabled && timerState.currentMode === 'work') {
        taskState.sessionStartTime = new Date();
    }

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

        // Save completed task to history if task management is enabled
        if (settings.taskManagementEnabled && taskState.currentTask && taskState.sessionStartTime) {
            const sessionDuration = Math.round((new Date() - taskState.sessionStartTime) / 1000 / 60);
            addTaskToHistory(taskState.currentTask, sessionDuration);
        }
        
        // Auto-switch to break
        if (timerState.completedSessions % settings.sessionsBeforeLongBreak === 0) {
            switchMode('long-break');
        } else {
            switchMode('break');
        }

        showNotification('🎉 Work session complete! Time for a break.');

        // Check for wellness reminders
        if (shouldShowWellnessReminder()) {
            setTimeout(() => showWellnessReminder(), 1000);
        }

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
    
    // Update the input fields in settings
    document.getElementById('workDuration').value = work;
    document.getElementById('breakDuration').value = shortBreak;
    document.getElementById('longBreakDuration').value = longBreak;

    // Immediately apply the preset values to the settings object
    settings.workDuration = work;
    settings.breakDuration = shortBreak;
    settings.longBreakDuration = longBreak;

    // Save the updated settings to localStorage
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));

    // If timer is running, reset it to apply new durations
    if (timerState.isRunning) {
        resetTimer();
    }

    // Update current timer based on current mode
    switch (timerState.currentMode) {
        case 'work':
            timerState.timeRemaining = settings.workDuration * 60;
            timerState.totalTime = settings.workDuration * 60;
            break;
        case 'break':
            timerState.timeRemaining = settings.breakDuration * 60;
            timerState.totalTime = settings.breakDuration * 60;
            break;
        case 'long-break':
            timerState.timeRemaining = settings.longBreakDuration * 60;
            timerState.totalTime = settings.longBreakDuration * 60;
            break;
    }

    // Update the display and progress ring immediately
    updateDisplay();
    updateProgressRing();

    showNotification(`✅ Preset applied instantly: ${work}/${shortBreak}/${longBreak} minutes`);
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
    settings.taskManagementEnabled = document.getElementById('taskManagementEnabled').checked;
    settings.eyeRestReminders = document.getElementById('eyeRestReminders').checked;
    settings.postureReminders = document.getElementById('postureReminders').checked;
    settings.hydrationReminders = document.getElementById('hydrationReminders').checked;
    settings.wellnessFrequency = parseInt(document.getElementById('wellnessFrequency').value);
    settings.wellnessReminderMode = document.getElementById('wellnessReminderMode').value;

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
    if (elem('taskManagementEnabled')) elem('taskManagementEnabled').checked = settings.taskManagementEnabled;
    if (elem('eyeRestReminders')) elem('eyeRestReminders').checked = settings.eyeRestReminders;
    if (elem('postureReminders')) elem('postureReminders').checked = settings.postureReminders;
    if (elem('hydrationReminders')) elem('hydrationReminders').checked = settings.hydrationReminders;
    if (elem('wellnessFrequency')) elem('wellnessFrequency').value = settings.wellnessFrequency;
    if (elem('wellnessReminderMode')) elem('wellnessReminderMode').value = settings.wellnessReminderMode;

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
        // Check if it's YouTube player
        if (settings.musicTrack === 'youtube') {
            if (!youtubeState.videoId) {
                showNotification('❌ No YouTube music added. Please add a YouTube link first.');
                return;
            }
            
            console.log('Starting YouTube music player');
            
            // Make sure player is visible
            youtubePlayerContainer.style.display = 'block';
            if (!youtubeState.isPlayerVisible) {
                youtubePlayerWrapper.classList.remove('collapsed');
                youtubeState.isPlayerVisible = true;
                toggleYoutubeBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                `;
                toggleYoutubeBtn.title = 'Hide Player';
                saveYoutubeMusic();
            }
            
            // Play YouTube video using API
            if (youtubeState.player && youtubeState.isReady) {
                youtubeState.player.playVideo();
                isPlayingMusic = true;
            } else if (youtubeState.player) {
                // Player exists but not ready, wait for it
                const checkReady = () => {
                    if (youtubeState.isReady) {
                        youtubeState.player.playVideo();
                        isPlayingMusic = true;
                    } else {
                        setTimeout(checkReady, 100);
                    }
                };
                checkReady();
            } else {
                // No player at all, show error
                showNotification('❌ YouTube player not available. Try refreshing the page.');
                return;
            }
            
            // Show music indicator for YouTube
            updateMusicIndicator(`🎵 ${youtubeState.title}`);
            return;
        }
        
        // Check if it's a custom track
        if (settings.musicTrack.startsWith('custom_')) {
            const trackId = settings.musicTrack;
            const customTrack = customMusicState.tracks.get(trackId);
            
            if (!customTrack) {
                console.log('Custom track not found:', trackId);
                return;
            }
            
            console.log(`Playing custom track: ${customTrack.name} at ${settings.volume}% volume`);
            
            // Create audio player with blob URL
            audioPlayer = new Audio();
            const blobUrl = URL.createObjectURL(customTrack.blob);
            audioPlayer.src = blobUrl;
            audioPlayer.volume = (settings.volume / 100) * 0.5;
            audioPlayer.loop = true;
            
            customMusicState.currentCustomTrack = blobUrl;
        } else {
            // Handle built-in tracks
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
        }
        
        // Add error handler
        audioPlayer.addEventListener('error', (e) => {
            console.log('Audio error:', e);
            
            const trackName = settings.musicTrack.startsWith('custom_') 
                ? customMusicState.tracks.get(settings.musicTrack)?.name || 'Custom track'
                : musicTracks[settings.musicTrack]?.description || 'Track';
            
            showNotification(`🎵 ${trackName} could not be played. Try another track!`);
            isPlayingMusic = false;
            
            // Remove the indicator since the track failed to load
            const indicator = document.getElementById('musicIndicator');
            if (indicator) {
                indicator.remove();
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

        // Show music indicator
        const trackName = settings.musicTrack.startsWith('custom_') 
            ? customMusicState.tracks.get(settings.musicTrack)?.name || 'Custom track'
            : musicTracks[settings.musicTrack]?.description || 'Track';
            
        updateMusicIndicator(`🎵 ${trackName}`);
    } catch (e) {
        console.log('Could not initialize music player:', e);
    }
}

function stopMusic() {
    // Stop YouTube player if it's currently selected
    if (settings.musicTrack === 'youtube' && youtubeState.player && youtubeState.isReady) {
        youtubeState.player.pauseVideo();
    }
    
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
    
    // Clean up custom track blob URL
    if (customMusicState.currentCustomTrack) {
        URL.revokeObjectURL(customMusicState.currentCustomTrack);
        customMusicState.currentCustomTrack = null;
    }
    
    isPlayingMusic = false;
    
    // Remove any existing music indicator
    const indicator = document.getElementById('musicIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Helper function to update music indicator
function updateMusicIndicator(text) {
    const existingIndicator = document.getElementById('musicIndicator');
    
    if (existingIndicator) {
        // Update existing indicator with smooth transition
        const span = existingIndicator.querySelector('span');
        if (span) {
            span.style.opacity = '0';
            setTimeout(() => {
                span.textContent = text;
                span.style.opacity = '1';
            }, 150);
        }
    } else {
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'music-indicator';
        indicator.id = 'musicIndicator';
        indicator.innerHTML = `<span>${text}</span>`;
        document.body.appendChild(indicator);
    }
}

// Helper function to sync music select dropdown with current state
function syncMusicSelectWithState() {
    const musicSelect = document.getElementById('musicSelect');
    if (musicSelect && settings.musicTrack) {
        musicSelect.value = settings.musicTrack;
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

// YouTube Player API initialization
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API ready');
    // API is ready, we can create players when needed
};

// Task Management Functions
function toggleTaskManagement() {
    if (settings.taskManagementEnabled) {
        taskContainer.style.display = 'block';
        taskHistoryContainer.style.display = 'block';
        updateTaskDisplay();
        renderTaskHistory();
    } else {
        taskContainer.style.display = 'none';
        taskHistoryContainer.style.display = 'none';
    }
}

function setCurrentTask() {
    const taskText = currentTaskInput.value.trim();
    if (!taskText) return;

    taskState.currentTask = taskText;
    currentTaskInput.value = '';
    updateTaskDisplay();
    saveTaskData();
    
    showNotification(`📝 Task set: ${taskText}`);
}

function editCurrentTask() {
    // Switch back to input mode with current task pre-filled
    currentTaskInput.value = taskState.currentTask;
    taskInputSection.style.display = 'block';
    currentTaskDisplay.style.display = 'none';
    
    // Focus the input for immediate editing
    setTimeout(() => {
        currentTaskInput.focus();
        currentTaskInput.select();
    }, 100);
}

function updateTaskDisplay() {
    if (taskState.currentTask) {
        // Show current task display, hide input section
        taskInputSection.style.display = 'none';
        currentTaskDisplay.style.display = 'flex';
        currentTaskText.textContent = taskState.currentTask;
    } else {
        // Show input section, hide current task display
        taskInputSection.style.display = 'block';
        currentTaskDisplay.style.display = 'none';
    }
}

function addTaskToHistory(taskText, duration) {
    const taskEntry = {
        id: Date.now(),
        task: taskText,
        completedAt: new Date().toISOString(),
        duration: duration,
        sessionType: 'work'
    };

    taskState.taskHistory.unshift(taskEntry);
    
    // Keep only last 50 tasks
    if (taskState.taskHistory.length > 50) {
        taskState.taskHistory = taskState.taskHistory.slice(0, 50);
    }

    renderTaskHistory();
    saveTaskData();
}

function renderTaskHistory() {
    if (!taskHistoryList) return;

    if (taskState.taskHistory.length === 0) {
        taskHistoryList.innerHTML = '<p class="no-tasks">No completed tasks yet. Start a Pomodoro session!</p>';
        return;
    }

    const historyHTML = taskState.taskHistory.map(task => {
        const date = new Date(task.completedAt);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString();
        
        return `
            <div class="task-history-item">
                <div class="task-history-text">${task.task}</div>
                <div class="task-history-time">${dateStr} ${timeStr}</div>
                <div class="task-history-duration">${task.duration}min</div>
            </div>
        `;
    }).join('');

    taskHistoryList.innerHTML = historyHTML;
}

function clearTaskHistory() {
    if (confirm('Are you sure you want to clear all task history?')) {
        taskState.taskHistory = [];
        renderTaskHistory();
        saveTaskData();
        showNotification('🗑️ Task history cleared');
    }
}

function saveTaskData() {
    localStorage.setItem('pomodoroTaskData', JSON.stringify(taskState));
}

function loadTaskData() {
    const saved = localStorage.getItem('pomodoroTaskData');
    if (saved) {
        const data = JSON.parse(saved);
        taskState.currentTask = data.currentTask || '';
        taskState.taskHistory = data.taskHistory || [];
    }
    
    // Initialize task management display based on settings
    toggleTaskManagement();
}

// Custom Music Functions
function handleMusicUpload(event) {
    const files = event.target.files;
    handleMusicFiles(files);
    // Clear the input so the same file can be uploaded again if needed
    event.target.value = '';
}

function handleMusicFiles(files) {
    if (!files || files.length === 0) return;
    
    const maxFileSize = 50 * 1024 * 1024; // 50MB limit
    const supportedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/m4a'];
    
    Array.from(files).forEach(file => {
        // Validate file type
        if (!supportedTypes.includes(file.type)) {
            showNotification(`❌ ${file.name}: Unsupported file type. Please use MP3, WAV, OGG, or M4A.`);
            return;
        }
        
        // Validate file size
        if (file.size > maxFileSize) {
            showNotification(`❌ ${file.name}: File too large. Maximum size is 50MB.`);
            return;
        }
        
        // Check if file already exists
        const existingTrack = Array.from(customMusicState.tracks.values())
            .find(track => track.name === file.name && track.size === file.size);
        
        if (existingTrack) {
            showNotification(`⚠️ ${file.name} already exists.`);
            return;
        }
        
        // Add the track
        addCustomTrack(file);
    });
}

function addCustomTrack(file) {
    const trackId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const trackData = {
        name: file.name,
        blob: file,
        size: file.size,
        addedAt: new Date().toISOString()
    };
    
    customMusicState.tracks.set(trackId, trackData);
    saveCustomMusic();
    renderCustomMusicList();
    updateMusicSelect();
    
    showNotification(`✅ Added: ${file.name}`);
}

function removeCustomTrack(trackId) {
    const track = customMusicState.tracks.get(trackId);
    if (!track) return;
    
    if (confirm(`Remove "${track.name}" from your music library?`)) {
        // Stop music if this track is currently playing
        if (settings.musicTrack === trackId && isPlayingMusic) {
            stopMusic();
        }
        
        // If this was the selected track, reset to default
        if (settings.musicTrack === trackId) {
            settings.musicTrack = 'lofi';
            document.getElementById('musicSelect').value = 'lofi';
        }
        
        customMusicState.tracks.delete(trackId);
        saveCustomMusic();
        renderCustomMusicList();
        updateMusicSelect();
        
        showNotification(`🗑️ Removed: ${track.name}`);
    }
}

function renderCustomMusicList() {
    if (!customMusicList) return;
    
    if (customMusicState.tracks.size === 0) {
        customMusicList.innerHTML = '';
        return;
    }
    
    const tracksHTML = Array.from(customMusicState.tracks.entries()).map(([trackId, track]) => {
        const sizeStr = formatFileSize(track.size);
        return `
            <div class="custom-music-item">
                <div class="custom-music-info">
                    <div class="custom-music-name">${track.name}</div>
                    <div class="custom-music-size">${sizeStr}</div>
                </div>
                <div class="custom-music-actions">
                    <button class="custom-music-btn delete" onclick="removeCustomTrack('${trackId}')" title="Remove">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    customMusicList.innerHTML = tracksHTML;
}

function updateMusicSelect() {
    if (!customMusicGroup) return;
    
    // Clear existing custom options
    customMusicGroup.innerHTML = '';
    
    if (customMusicState.tracks.size === 0) {
        customMusicGroup.style.display = 'none';
        return;
    }
    
    customMusicGroup.style.display = 'block';
    
    // Add custom tracks to select
    Array.from(customMusicState.tracks.entries()).forEach(([trackId, track]) => {
        const option = document.createElement('option');
        option.value = trackId;
        option.textContent = track.name;
        customMusicGroup.appendChild(option);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function saveCustomMusic() {
    // Convert Map to array for storage (since Maps don't serialize to JSON well)
    const tracksArray = Array.from(customMusicState.tracks.entries()).map(([id, track]) => {
        return {
            id,
            name: track.name,
            size: track.size,
            addedAt: track.addedAt,
            // Convert blob to base64 for storage
            data: null // We'll handle this with FileReader
        };
    });
    
    // Save track metadata (without blob data for now)
    const metadata = {
        tracks: tracksArray.map(t => ({ id: t.id, name: t.name, size: t.size, addedAt: t.addedAt }))
    };
    
    localStorage.setItem('pomodoroCustomMusic', JSON.stringify(metadata));
    
    // Store blobs in IndexedDB for better performance with large files
    saveCustomMusicBlobs();
}

function saveCustomMusicBlobs() {
    // For now, we'll keep blobs in memory only
    // In a production app, you'd want to use IndexedDB for persistent storage
    // This is a limitation of browser storage for large files
    console.log('Custom music blobs stored in memory (session only)');
}

function loadCustomMusic() {
    try {
        const saved = localStorage.getItem('pomodoroCustomMusic');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        
        // Note: We can only restore metadata, not the actual audio blobs
        // Users will need to re-upload their music each session
        // This is a limitation of browser storage for large files
        
        renderCustomMusicList();
        updateMusicSelect();
        
        if (data.tracks && data.tracks.length > 0) {
            showNotification('ℹ️ Custom music needs to be re-uploaded each session due to browser limitations.');
        }
    } catch (e) {
        console.log('Could not load custom music:', e);
    }
}

// Wellness Functions
function shouldShowWellnessReminder() {
    // Only show during breaks and if any wellness feature is enabled
    if (timerState.currentMode === 'work') return false;
    
    const hasWellnessEnabled = settings.eyeRestReminders || 
                              settings.postureReminders || 
                              settings.hydrationReminders;
    
    if (!hasWellnessEnabled) return false;
    
    // Show based on frequency setting
    return timerState.completedSessions % settings.wellnessFrequency === 0;
}

function showWellnessReminder() {
    const wellnessTypes = [];
    
    if (settings.eyeRestReminders) wellnessTypes.push('eye');
    if (settings.postureReminders) wellnessTypes.push('posture');
    if (settings.hydrationReminders) wellnessTypes.push('hydration');
    
    if (wellnessTypes.length === 0) return;
    
    let selectedTypes = [];
    
    switch (settings.wellnessReminderMode) {
        case 'all':
            selectedTypes = wellnessTypes;
            break;
        case 'cycle':
            // Cycle through types in order
            const cycleIndex = settings.wellnessReminderCycleIndex % wellnessTypes.length;
            selectedTypes = [wellnessTypes[cycleIndex]];
            settings.wellnessReminderCycleIndex = (settings.wellnessReminderCycleIndex + 1) % wellnessTypes.length;
            // Save the updated cycle index
            localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
            break;
        case 'random':
        default:
            // Randomly select one type
            selectedTypes = [wellnessTypes[Math.floor(Math.random() * wellnessTypes.length)]];
            break;
    }
    
    if (settings.wellnessReminderMode === 'all') {
        showCombinedWellnessReminder(selectedTypes);
    } else {
        showSingleWellnessReminder(selectedTypes[0]);
    }
}

function showSingleWellnessReminder(type) {
    const wellnessData = getWellnessData(type);
    
    // Update modal content
    wellnessModalTitle.textContent = wellnessData.title;
    wellnessIcon.textContent = wellnessData.icon;
    wellnessMessage.textContent = wellnessData.message;
    wellnessTips.innerHTML = `<ul>${wellnessData.tips.map(tip => `<li>${tip}</li>`).join('')}</ul>`;
    
    // Show modal
    wellnessModal.style.display = 'flex';
    
    // Auto-close after 30 seconds if user doesn't interact
    setTimeout(() => {
        if (wellnessModal.style.display === 'flex') {
            closeWellnessModal();
        }
    }, 30000);
}

function showCombinedWellnessReminder(types) {
    const allWellnessData = types.map(type => getWellnessData(type));
    
    // Combine all wellness types
    const combinedTitle = '🌟 Wellness Break - Multiple Reminders';
    const combinedIcon = '🌟';
    const combinedMessage = 'Time for a comprehensive wellness break! Here are some important reminders for your health:';
    
    // Combine all tips
    const allTips = [];
    allWellnessData.forEach(data => {
        allTips.push(`<strong>${data.title.replace(/[🌟👁️🧘💧]\s*/, '')}</strong>`);
        data.tips.forEach(tip => allTips.push(tip));
        allTips.push(''); // Add spacing
    });
    
    // Remove last empty item
    if (allTips[allTips.length - 1] === '') {
        allTips.pop();
    }
    
    // Update modal content
    wellnessModalTitle.textContent = combinedTitle;
    wellnessIcon.textContent = combinedIcon;
    wellnessMessage.textContent = combinedMessage;
    wellnessTips.innerHTML = `<ul>${allTips.map(tip => tip === '' ? '<br>' : `<li>${tip}</li>`).join('')}</ul>`;
    
    // Show modal
    wellnessModal.style.display = 'flex';
    
    // Auto-close after 45 seconds for combined reminders (more content)
    setTimeout(() => {
        if (wellnessModal.style.display === 'flex') {
            closeWellnessModal();
        }
    }, 45000);
}

function getWellnessData(type) {
    const wellnessContent = {
        eye: {
            title: '👁️ Eye Rest Break',
            icon: '👁️',
            message: 'Time to rest your eyes! Look away from your screen and focus on something 20 feet away for 20 seconds.',
            tips: [
                'Follow the 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds',
                'Blink frequently to keep your eyes moist',
                'Adjust screen brightness to match your surroundings',
                'Consider using blue light filters in the evening'
            ]
        },
        posture: {
            title: '🧘 Posture Check',
            icon: '🧘',
            message: 'Time for a posture check! Sit up straight, relax your shoulders, and align your head over your spine.',
            tips: [
                'Keep your feet flat on the floor',
                'Adjust your chair height so your elbows are at 90 degrees',
                'Position your monitor at eye level',
                'Take micro-breaks to stretch your neck and shoulders'
            ]
        },
        hydration: {
            title: '💧 Hydration Break',
            icon: '💧',
            message: 'Stay hydrated! Drink a glass of water to keep your body and mind functioning optimally.',
            tips: [
                'Aim for 8 glasses of water per day',
                'Keep a water bottle at your desk',
                'Herbal teas count towards your fluid intake',
                'Listen to your body - thirst is a late indicator of dehydration'
            ]
        }
    };
    
    return wellnessContent[type] || wellnessContent.eye;
}

function closeWellnessModal() {
    if (wellnessModal) {
        wellnessModal.style.display = 'none';
    }
}

// YouTube Music Functions
function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function addYoutubeMusic() {
    const url = youtubeUrl.value.trim();
    if (!url) {
        showNotification('❌ Please enter a YouTube URL');
        return;
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
        showNotification('❌ Invalid YouTube URL. Please check the link.');
        return;
    }

    // Store YouTube music data
    youtubeState.currentUrl = url;
    youtubeState.videoId = videoId;
    youtubeState.title = 'YouTube Music';
    youtubeState.isPlayerVisible = true;

    // Create YouTube player using API
    if (window.YT && window.YT.Player) {
        // Destroy existing player if it exists
        if (youtubeState.player) {
            youtubeState.player.destroy();
        }
        
        youtubeState.player = new YT.Player('youtubePlayer', {
            height: '200',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 0,
                'controls': 1,
                'rel': 0,
                'modestbranding': 1,
                'loop': 1,
                'playlist': videoId
            },
                events: {
                    'onReady': function(event) {
                        youtubeState.isReady = true;
                        console.log('YouTube player ready');
                        // Sync music select dropdown
                        syncMusicSelectWithState();
                    },
                'onStateChange': function(event) {
                    // Handle player state changes if needed
                }
            }
        });
    } else {
        // Fallback to iframe if API not loaded
        const iframe = document.createElement('iframe');
        iframe.id = 'youtubePlayer';
        iframe.width = '100%';
        iframe.height = '200';
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0&modestbranding=1`;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        
        const playerDiv = document.getElementById('youtubePlayer');
        if (playerDiv) {
            playerDiv.parentNode.replaceChild(iframe, playerDiv);
        }
    }
    
    youtubePlayerContainer.style.display = 'block';
    youtubePlayerWrapper.classList.remove('collapsed');
    youtubeTitle.textContent = youtubeState.title;
    
    // Show YouTube option in music select
    updateYoutubeMusicSelect();
    
    // Automatically select YouTube as the music track
    const musicSelect = document.getElementById('musicSelect');
    if (musicSelect) {
        musicSelect.value = 'youtube';
        settings.musicTrack = 'youtube';
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    
    // Clear input
    youtubeUrl.value = '';
    
    // Save to localStorage
    saveYoutubeMusic();
    
    showNotification('✅ YouTube music added and selected!');
}

function toggleYoutubePlayer() {
    youtubeState.isPlayerVisible = !youtubeState.isPlayerVisible;
    
    if (youtubeState.isPlayerVisible) {
        youtubePlayerWrapper.classList.remove('collapsed');
        toggleYoutubeBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;
        toggleYoutubeBtn.title = 'Hide Player';
    } else {
        youtubePlayerWrapper.classList.add('collapsed');
        toggleYoutubeBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
        toggleYoutubeBtn.title = 'Show Player';
    }
    
    saveYoutubeMusic();
}

function removeYoutubeMusic() {
    if (confirm('Remove YouTube music player?')) {
        // If YouTube is currently selected, switch to default
        if (settings.musicTrack === 'youtube') {
            settings.musicTrack = 'lofi';
            const musicSelect = document.getElementById('musicSelect');
            if (musicSelect) {
                musicSelect.value = 'lofi';
            }
            localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        }
        
        // Destroy YouTube player
        if (youtubeState.player) {
            youtubeState.player.destroy();
            youtubeState.player = null;
        }
        
        youtubeState.currentUrl = '';
        youtubeState.videoId = '';
        youtubeState.title = '';
        youtubeState.isPlayerVisible = true;
        youtubeState.isReady = false;
        
        youtubePlayerContainer.style.display = 'none';
        
        // Hide YouTube option in music select
        updateYoutubeMusicSelect();
        
        saveYoutubeMusic();
        showNotification('🗑️ YouTube music removed');
    }
}

function updateYoutubeMusicSelect() {
    if (!youtubeMusicGroup) return;
    
    if (youtubeState.videoId) {
        youtubeMusicGroup.style.display = 'block';
    } else {
        youtubeMusicGroup.style.display = 'none';
    }
}

function saveYoutubeMusic() {
    localStorage.setItem('pomodoroYoutubeMusic', JSON.stringify(youtubeState));
}

function loadYoutubeMusic() {
    try {
        const saved = localStorage.getItem('pomodoroYoutubeMusic');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        youtubeState.currentUrl = data.currentUrl || '';
        youtubeState.videoId = data.videoId || '';
        youtubeState.title = data.title || '';
        youtubeState.isPlayerVisible = data.isPlayerVisible !== undefined ? data.isPlayerVisible : true;
        
        if (youtubeState.videoId) {
            // Create YouTube player using API
            if (window.YT && window.YT.Player) {
                youtubeState.player = new YT.Player('youtubePlayer', {
                    height: '200',
                    width: '100%',
                    videoId: youtubeState.videoId,
                    playerVars: {
                        'autoplay': 0,
                        'controls': 1,
                        'rel': 0,
                        'modestbranding': 1,
                        'loop': 1,
                        'playlist': youtubeState.videoId
                    },
                    events: {
                        'onReady': function(event) {
                            youtubeState.isReady = true;
                            console.log('YouTube player ready (loaded from storage)');
                            // Update music select to reflect YouTube availability
                            syncMusicSelectWithState();
                        }
                    }
                });
            } else {
                // Fallback to iframe if API not loaded
                const iframe = document.createElement('iframe');
                iframe.id = 'youtubePlayer';
                iframe.width = '100%';
                iframe.height = '200';
                iframe.src = `https://www.youtube.com/embed/${youtubeState.videoId}?autoplay=0&controls=1&rel=0&modestbranding=1`;
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                
                const playerDiv = document.getElementById('youtubePlayer');
                if (playerDiv) {
                    playerDiv.parentNode.replaceChild(iframe, playerDiv);
                }
            }
            
            youtubePlayerContainer.style.display = 'block';
            youtubeTitle.textContent = youtubeState.title;
            
            // Show YouTube option in music select
            updateYoutubeMusicSelect();
            
            if (!youtubeState.isPlayerVisible) {
                youtubePlayerWrapper.classList.add('collapsed');
                toggleYoutubeBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                `;
                toggleYoutubeBtn.title = 'Show Player';
            }
        }
    } catch (e) {
        console.log('Could not load YouTube music:', e);
    }
}

// Collapsible Settings Functions
function initializeCollapsibleSections() {
    // Collapse timer settings and wellness features by default
    const timerSettingsContent = document.getElementById('timerSettingsContent');
    const timerSettingsToggle = document.getElementById('timerSettingsToggle');
    const wellnessSettingsContent = document.getElementById('wellnessSettingsContent');
    const wellnessSettingsToggle = document.getElementById('wellnessSettingsToggle');
    
    if (timerSettingsContent && timerSettingsToggle) {
        timerSettingsContent.classList.add('collapsed');
        timerSettingsToggle.classList.add('collapsed');
    }
    
    if (wellnessSettingsContent && wellnessSettingsToggle) {
        wellnessSettingsContent.classList.add('collapsed');
        wellnessSettingsToggle.classList.add('collapsed');
    }
}

function toggleSettingsSection(sectionName) {
    const content = document.getElementById(sectionName + 'Content');
    const toggle = document.getElementById(sectionName + 'Toggle');
    
    if (!content || !toggle) return;
    
    const isCollapsed = content.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Expand
        content.classList.remove('collapsed');
        toggle.classList.remove('collapsed');
    } else {
        // Collapse
        content.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
}
