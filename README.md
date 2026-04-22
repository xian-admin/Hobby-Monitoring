# Hobby Monitor 🎯

A sleek, cross-platform mobile application built with React Native and Expo to help you track your habits, monitor time spent on hobbies, and achieve your personal goals. 

Built with a focus on data privacy (100% offline local storage), smooth animations, and a modern dark-mode aesthetic.

## ✨ Features

- **Dashboard**: Quick-start timers, see today's activity, and get a high-level overview of your goal progress.
- **Hobby Management**: Create, edit, set colors, and categorize your tracked activities.
- **Timer & Sessions**: Accurately log your time using a live timer or by adding past sessions manually.
- **Goal Setting**: Set daily, weekly, or monthly targets (by duration or session count) and track your consistency.
- **Analytics & Insights**: Visualize your progress over time with a 7-day bar chart, a heatmap calendar, and a time-distribution breakdown.
- **Privacy First**: All data is stored locally on your device via `AsyncStorage` and can be exported cleanly at any time.

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) / [Expo SDK 54](https://expo.dev/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Data Persistence**: `@react-native-async-storage/async-storage`
- **Charts & Vis**: [`react-native-svg`](https://github.com/software-mansion/react-native-svg) custom charting
- **Icons**: `@expo/vector-icons` (Ionicons)

---

## 🚀 Getting Started

Follow these step-by-step instructions to get the project running on your local machine.

### Prerequisites

1. Install **Node.js** (LTS recommended) on your computer.
2. Install the **Expo Go** app on your physical iOS or Android device.

### 1. Clone the Repository
```bash
git clone <your-github-repo-url>
cd "Hobby Monitoring/hobby-monitor"
```

### 2. Install Dependencies
Install the required packages using npm:
```bash
npm install
```

### 3. Start the Development Server
You can start the server normally with:
```bash
npx expo start
```

**Network Issues? (Tunnel Mode)**
If your phone and your computer are on different WiFi networks (or your router has network isolation), the standard LAN connection won't work. Use tunnel mode to route the connection securely over the internet:
```bash
npm install -g @expo/ngrok@latest
npx expo start --tunnel
```

### 4. Run on Your Device
Once the server starts, it will generate a QR code in your terminal.
- **Android**: Open the **Expo Go** app and tap "Scan QR Code".
- **iOS**: Open the native **Camera** app, scan the QR code, and tap the prompt to open Expo Go.

---

## 📂 Project Structure

```text
hobby-monitor/
├── app/                  # Expo Router screens (Tabs, Modals, Layouts)
│   ├── _layout.tsx       # Root tab navigation wrapper
│   ├── index.tsx         # Dashboard screen
│   ├── hobbies/          # Hobby list and management
│   ├── timer/            # Live tracking and logging
│   ├── goals/            # Goal setting and tracking
│   └── analytics/        # Progress charts and heatmaps
├── src/
│   ├── hooks/            # Custom React hooks (useTimer, useTheme)
│   ├── stores/           # Zustand state (hobbyStore, timerStore, etc)
│   ├── theme/            # Shared design tokens (colors, fonts, spacing)
│   ├── types/            # TypeScript interfaces
│   └── utils/            # Helper functions for math, time, and storage
└── assets/               # Images, splash screens, and icons
```

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change. 

## 📄 License
This project is licensed under the MIT License.
