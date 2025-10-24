# 🍅 Pomodoro Timer

A beautiful, feature-rich Pomodoro Timer application to boost your productivity and help you stay focused. Built with vanilla HTML, CSS, and JavaScript.

![Pomodoro Timer](https://img.shields.io/badge/Pomodoro-Timer-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

## ✨ Features

- **Beautiful Clock Visualization**: Circular progress ring that shows time remaining at a glance
- **Customizable Timers**: Adjust work, break, and long break durations to fit your workflow
- **Multiple Modes**: 
  - Work sessions (default: 25 minutes)
  - Short breaks (default: 5 minutes)
  - Long breaks (default: 15 minutes)
- **Smart Session Management**: Automatic switching between work and break modes
- **Audio Notifications**: Get notified when sessions complete
- **Background Music**: Optional background music to help you focus (with volume control)
- **Session Tracking**: Keep track of completed sessions and total focus time
- **Local Storage**: Your settings and stats persist across sessions
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Use spacebar to start/pause the timer
- **Browser Notifications**: Desktop notifications when timer completes (with permission)

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- That's it! No dependencies or build tools required.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jeevanbhatta/pomodoro.git
```

2. Navigate to the project directory:
```bash
cd pomodoro
```

3. Open `index.html` in your web browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Alternatively, you can use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server installed globally)
npx http-server

# Then open http://localhost:8000 in your browser
```

## 🎯 How to Use

### Basic Usage

1. **Start a Session**: Click the "Start" button or press the spacebar to begin your work session
2. **Pause**: Click "Pause" or press spacebar again to pause the timer
3. **Reset**: Click "Reset" to restart the current session
4. **Switch Modes**: Click on "Work", "Break", or "Long Break" buttons to switch between modes

### Customizing Settings

1. Click the "Settings" button to expand the settings panel
2. Adjust the durations for:
   - Work sessions (1-60 minutes)
   - Short breaks (1-30 minutes)
   - Long breaks (1-60 minutes)
   - Number of sessions before a long break (2-10 sessions)
3. Configure audio settings:
   - Enable/disable sound notifications
   - Enable/disable background music
   - Select music track (Lo-fi Beats, Nature Sounds, Ambient Music, Piano Melodies)
   - Adjust volume level
4. Click "Save Settings" to apply your changes

### Keyboard Shortcuts

- **Spacebar**: Start/Pause timer

## 🎨 Features in Detail

### Clock Visualization

The circular progress ring provides an intuitive visual representation of time remaining. The ring color changes based on the current mode:
- **Red**: Work session
- **Blue**: Short break
- **Green**: Long break

### Session Tracking

The app tracks your productivity with:
- **Completed Sessions**: Total number of work sessions completed
- **Total Focus Time**: Cumulative time spent in work sessions

All stats are saved locally and persist between sessions.

### Smart Automation

- After completing a work session, the timer automatically switches to break mode
- After the configured number of work sessions, a long break is triggered
- Sessions are counted automatically

### Music Integration

The music player feature provides background audio to help you focus. Choose from 11 carefully curated tracks:

**Lo-fi & Study Music:**
- **Lo-fi Study**: Relaxing lo-fi hip-hop instrumentals
- **Lo-fi Instrumental**: Pure instrumental lo-fi beats
- **Lo-fi Chill Hop**: Calm and peaceful chill hop
- **Study Focus**: Gentle instrumental music for concentration

**Nature & Ambient Sounds:**
- **Nature Walk**: Calming nature sounds and ambience
- **Ambient Beauty**: Atmospheric soundscapes for deep focus
- **Rain Sounds**: Soothing rain ambience
- **Sleepy Rain**: Gentle rain for relaxation
- **Forest Lullaby**: Peaceful forest sounds
- **Midnight Forest**: Deep forest ambience
- **Himalayan Flute**: Traditional flute melodies

**Recent Improvements:**
- ✅ Fixed music switching bug - tracks now change smoothly
- ✅ Better error handling for missing audio files
- ✅ Improved audio player cleanup and memory management
- ✅ Added support for additional music tracks
- ✅ Enhanced user feedback for track loading

**Adding Your Own Music:**
See `add-music.md` for detailed instructions on adding custom music tracks from free sources like Pixabay, YouTube Audio Library, and Freesound.

## 📱 Responsive Design

The app is fully responsive and works great on:
- Desktop computers (1920x1080 and above)
- Laptops (1366x768 and above)
- Tablets (768px and above)
- Mobile phones (320px and above)

## 🔒 Privacy

- All data is stored locally in your browser using LocalStorage
- No data is sent to external servers
- No tracking or analytics
- Your privacy is fully protected

## 🛠️ Technical Details

### Built With

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations and transitions
- **JavaScript (ES6+)**: Vanilla JavaScript, no frameworks
- **LocalStorage API**: For persistent data storage
- **Notifications API**: For desktop notifications
- **Web Audio API**: For sound effects

### Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

### File Structure

```
pomodoro/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # Application logic
├── songs/              # Music files directory (11 tracks)
│   ├── close-study-relax-chillhop-calm-study-lofi-123089.mp3
│   ├── forest-lullaby-110624.mp3
│   ├── himalayan-village-flute-251427.mp3
│   ├── lofi-instrumental-409202.mp3
│   ├── lofi-study-calm-peaceful-chill-hop-112191.mp3
│   ├── midnight-forest-184304.mp3
│   ├── nature-walk-124997.mp3
│   ├── perfect-beauty-191271.mp3
│   ├── rain-sounds.mp3
│   ├── sleepy-rain-116521.mp3
│   └── study-110111.mp3
├── add-music.md        # Guide for adding custom music
└── README.md          # Documentation
```

## 🎯 Pomodoro Technique

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. Here's how it works:

1. **Choose a task** you want to work on
2. **Set the timer** to 25 minutes (one "Pomodoro")
3. **Work on the task** until the timer rings
4. **Take a short break** (5 minutes)
5. **Every 4 Pomodoros**, take a longer break (15-30 minutes)

### Benefits

- ✅ Improved focus and concentration
- ✅ Reduced mental fatigue
- ✅ Better time management
- ✅ Increased productivity
- ✅ Reduced procrastination

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - feel free to use it for personal or commercial projects.

## 🙏 Acknowledgments

- Inspired by the Pomodoro Technique by Francesco Cirillo
- Font: [Poppins](https://fonts.google.com/specimen/Poppins) from Google Fonts
- Icons: Inline SVG icons

## 📧 Contact

Jeevan Bhatta - [@jeevanbhatta](https://github.com/jeevanbhatta)

Project Link: [https://github.com/jeevanbhatta/pomodoro](https://github.com/jeevanbhatta/pomodoro)

---

Made with ❤️ for productivity enthusiasts

**Happy Focusing! 🍅**
