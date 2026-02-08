# 🌫️ FOG GRID: Browser-Based Distributed Computing System

![Project Status](https://img.shields.io/badge/Status-Hackathon%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20WebRTC%20%7C%20PeerJS-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> **A decentralized computing grid that turns smartphones and laptops into a unified supercomputer using nothing but a web browser.**

---

## 👨‍💻 Created By
**Priyanshu Soni** *B.Tech Computer Science Engineering*

---

## 📖 Project Overview
**Fog Grid** demonstrates the power of **Volunteer Computing** by creating a local mesh network over WiFi. It allows a "Host" device to split complex computational tasks—such as **Cryptographic Password Cracking**—and distribute them across multiple "Worker" devices (like phones or old tablets).

Unlike traditional grids that require software installation, **Fog Grid runs entirely in the browser** using **WebRTC**, making it instant, serverless, and platform-independent.

### 🚀 Key Features
* **Zero Installation:** Works instantly via a URL. No plugins or downloads required.
* **Serverless P2P Architecture:** Devices communicate directly using **WebRTC**, eliminating backend latency and costs.
* **Cross-Device Compatibility:** Seamlessly connects Android, iOS, Windows, and macOS devices.
* **Fault Tolerance:** Dynamically handles node dropouts without crashing the main host.
* **Real-Time Visualization:** Live monitoring of CPU load, active nodes, and hashing progress.

---

## ⚙️ Architecture & Tech Stack

The system follows a **Master-Slave (Star Topology)** architecture.

### **The Tech Stack**
* **Frontend:** React.js (Vite)
* **Networking:** WebRTC (via **PeerJS**) for direct P2P data channels.
* **Styling:** Tailwind CSS (Cybersecurity/Terminal Aesthetic).
* **Computation:** Pure JavaScript (Custom Heavy-Hashing Algorithms).

### **How It Works**
1.  **Host (Master):** Generates a session ID and splits the task (e.g., PIN range `0000-9999`) into chunks.
2.  **Worker (Slave):** Connects via Session ID, receives a chunk (e.g., `0000-2000`), and runs a heavy math loop.
3.  **Result:** Once the solution is found, the Worker sends it back to the Host instantly via the WebRTC data channel.

```mermaid
graph TD
    Host[💻 HOST (Laptop)] <==>|WebRTC Data Channel| Worker1[📱 WORKER 1]
    Host <==>|WebRTC Data Channel| Worker2[📱 WORKER 2]
    Host <==>|WebRTC Data Channel| Worker3[📱 WORKER 3]
